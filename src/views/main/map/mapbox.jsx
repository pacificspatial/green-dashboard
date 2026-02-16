import {Box, IconButton, Typography} from "@mui/material";
import maplibregl, {NavigationControl} from "maplibre-gl"
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {AppDataContext} from "@team4am/fp-core";
import * as turf from "@turf/turf"
import { MainMapLayerDefs } from "@_map/layers"
import { MapStyleDefs } from "@_map/styles"
import {boolIf} from "@_manager/util";
import { MainDataContext, useMaplibre } from "@team4am/fp-core"
import dayjs from "dayjs";
import axios from "axios";
import { MaplibreTerradrawControl } from '@watergis/maplibre-gl-terradraw'
import '@watergis/maplibre-gl-terradraw/dist/maplibre-gl-terradraw.css'
import "maplibre-gl/dist/maplibre-gl.css"
import _ from "ansuko";
import StyleSelectorView from "@_views/main/map/styleSelector";
import LayerSelectorView from "@_views/main/map/layerSelector";
import {DispatchEvents} from "@_views/dispatch.js";
import {eve, useEve} from "react-eve-hook";
import {Sync as SyncIcon} from "@mui/icons-material"
import PropTypes from "prop-types"
import {PuffLoader} from "react-spinners"

export const MAP_CENTER_LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}_map_center`

const styles = {
    button: {
        position: 'absolute',
        zIndex: '1',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '1px 1px 8px #333',
    },
    loading: {
        position: 'absolute',
        zIndex: '1',
        left: '1rem',
        bottom: '1rem',
    }
}

const MainMapboxMapView = ({loadingSelected}) => {

    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setListHoverTree, setInfoTree } = useContext(MainDataContext)
    const initializing = useRef()
    const mapRef = useRef()
    const mapDrawRef = useRef()
    const maplibreRef = useRef()
    const [mapInitialized, setMapInitialized] = useState()
    const [styleKey, setStyleKey] = useState(Object.values(MapStyleDefs).find(s => s.default).key)
    const [style, setStyle] = useState()
    const { _m, parseFilterModel} = useMaplibre(true)
    const [layerComponents, setLayerComponents] = useState()
    const [layerNames, setLayerNames] = useState([])
    const [layerVisible, setLayerVisible] = useState([])
    const [layerLoaded, setLayerLoaded] = useState(false)
    const [initLayers, setInitLayers] = useState([])
    const [layerFilter, setLayerFilter] = useState({})
    const layerDefs = useMemo(() => {
        const officeUid = appState.user?.office_uid
        if (!officeUid || !_.has(MainMapLayerDefs, officeUid)) { return MainMapLayerDefs.default}
        return MainMapLayerDefs[officeUid]
    }, [MainMapLayerDefs, appState.user])

    const evn = useEve()

    const initMap = useCallback( () => {
        if (!style) { return }

        setLayerLoaded(false)
        setInitLayers([])

        if (maplibreRef.current) {
//            console.log("[Map]", "new style", style)
            maplibreRef.current.setStyle(style)
            initializing.current = false
            return
//        } else {
//            console.log("[Map]", "init style", style)
        }

        let center = [
            appState.env.CLIENT_MAP_CENTER_LONGITUDE,
            appState.env.CLIENT_MAP_CENTER_LATITUDE
        ]
        let zoom = 14
        const lCenter = localStorage.getItem(MAP_CENTER_LOCAL_STORAGE_KEY)
        if (lCenter) {
            center = (JSON.parse(lCenter)).center.map(l => _.toNumber(l))
            zoom = parseInt((JSON.parse(lCenter)).zoom)
        }

        const mapOptions = {
            container: mapRef.current,
            center,
            zoom,
            style,
            localIdeographFontFamily: "'Noto Sans JP', 'Roboto'",
        }
//        console.log("[Map]", "map init", mapOptions)
        const m = new maplibregl.Map(mapOptions)

        m.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
                showUserLocation: true,
                showAccuracyCircle: true,
                fitBoundsOptions: {
                    maxZoom: 21,
                }
            }),
            "top-left",
        )

        const nav = new NavigationControl({
            visualizePitch: true,
            showZoom: true,
            showCompass: true,
        })
        m.addControl(nav, 'top-left')

        const draw = new MaplibreTerradrawControl({
            modes: ['render', 'polygon','rectangle','circle','select','delete-selection','delete'],
            open: true,
            modeConfig: {
                polygon: {
                    cursor: 'ポリゴンを描画',
                    cursors: {
                        start: 'クリックして描画開始',
                        drawing: '続けてクリック、ダブルクリックで完了',
                        close: 'クリックしてポリゴンを閉じる'
                    }
                },
                rectangle: {
                    cursor: '矩形を描画'
                },
                circle: {
                    cursor: '円を描画'
                },
                select: {
                    cursor: '図形を選択'
                },
                'delete-selection': {
                    cursor: '選択した図形を削除'
                },
                'delete': {
                    cursor: '図形を削除'
                }
            }
        });

        // エラーイベントリスナーを追加
        m.on('error', (e) => {
            console.error('MapLibre error:', e);
            console.error('Error type:', e.error?.name);
            console.error('Error message:', e.error?.message);
            console.error('Error stack:', e.error?.stack);
        });

        if (import.meta.env.VITE_ACTIVE_MAP_DRAW?.toLowerCase() !== "false") {
            m.addControl(draw, 'top-left');
            mapDrawRef.current = draw
        }

        m.on("moveend", () => {
            const lCenter = {
                center: [m.getCenter().lng, m.getCenter().lat],
                zoom: m.getZoom(),
            }
            localStorage.setItem(MAP_CENTER_LOCAL_STORAGE_KEY, JSON.stringify(lCenter))
        })

        m.once("load", async () => {
            maplibreRef.current = m
            initializing.current = false
            setMapInitialized(true)
        })

    }, [style, appState.env])

    const loadLayers = useCallback(async () => {
        if (!layerDefs) { return }
        const layerComps = {}
        const layerNames = []
        const visibles = []
        for(const name of Object.keys(layerDefs).sort((k1, k2) => {
            if (!layerDefs[k1].at || !layerDefs[k2].at) {return 0}
            if (!layerDefs[k1].at) {return 1}
            if (!layerDefs[k2].at) {return -1}
            return layerDefs[k1].at - layerDefs[k2].at
        })) {
            const def = layerDefs[name]
            const fileName = def.name ?? name
            const comp = (await import(`@_map/layers/${fileName}.jsx`))
            layerComps[name] = comp.default
            layerNames.push(comp.LayerName)
            if (boolIf(def.defaultVisible, true)) {
                visibles.push(name)
            }
        }
        setLayerNames(layerNames)
        setLayerComponents(layerComps)
        setLayerVisible(visibles)
    }, [layerDefs])

    const mapLayerClicked = useCallback((feature) => {
        setInfoTree(feature)
    }, [])

    const onFinishDraw = useCallback(_.debounce(() => {
        console.log("[Map]", "draw finish", mapDrawRef.current?.getFeatures().features)

    }, 100), [])
    const onDeleteDraw = onFinishDraw
    const onChangeDraw = useCallback((_id, type) => type === "delete" && onFinishDraw(), [])

    const onMoveSelectedTree = useCallback(() => {
//        console.log("[Map]", "on move selected trees", mainState.selectedTrees)
        if (_.isEmpty(mainState.selectedTrees)) { return }
        if (_.size(mainState.selectedTrees) === 1) {
            maplibreRef.current.flyTo({
                center: [_.first(mainState.selectedTrees).longitude, _.first(mainState.selectedTrees).latitude],
                zoom: 15,
            })
            return
        }

        const line = turf.lineString(
            mainState.selectedTrees
                .filter(t => t.latitude && t.longitude)
                .map(tree =>
                    [tree.longitude, tree.latitude]
                ))
        const bbox = turf.bbox(line)

        maplibreRef.current.fitBounds([
            [bbox[0], bbox[1]], // 南西角 [minLng, minLat]
            [bbox[2], bbox[3]]  // 北東角 [maxLng, maxLat]
        ], {
            padding: 50,
            maxZoom: 15
        });

    }, [mainState.selectedTrees])

    const onMouseEnter = useCallback(() => {
        setListHoverTree(null)
    }, [])

    useEffect(() => {
        if (!styleKey) { return }

        axios.get(`/resources/map_style/${styleKey}.json5`)
            .then(res => {
                let styleJson = JSON.stringify(res.data)
                    .replace('{{API_ENDPOINT}', appState.env.CLIENT_MAP_TILE_ENDPOINT)
                const s = _m(JSON.parse(styleJson))
                setStyle(s)
            })
    }, [styleKey]);

    useEffect(() => {
        if (!mainState.infoTree) { return }

        maplibreRef.current.flyTo({
            center: [mainState.infoTree.longitude, mainState.infoTree.latitude],
            zoom: 18,
        })

    }, [mainState.infoTree]);

    useEffect(() => {
//        console.log("[Map]", "update style", style, initializing.current)
        if (!style || initializing.current) { return }
        initializing.current = true
        initMap()
    }, [style]);

    useEffect(() => {
        loadLayers()
            .catch(e => {
                console.error("Layer load error", e)
            })

        return () => {
            maplibreRef.current?.remove()
            maplibreRef.current = null
            initializing.current = false
            setLayerComponents(null)
            setLayerNames(null)
            setMapInitialized(false)
        }
    }, []);

    useEffect(() => {
        evn.on(DispatchEvents.MainOnClickSelectTreeButton, onMoveSelectedTree)
        return () => evn.off()
    }, [mainState.selectedTrees]);

    useEffect(() => {
        if (!mapInitialized) { return }

        if (mapDrawRef.current) {
            mapDrawRef.current.on("change", onChangeDraw)
            mapDrawRef.current.on("finish", onFinishDraw)
            mapDrawRef.current.on("feature-deleted", onDeleteDraw)
        }

        return () => {
            try { mapDrawRef.current?.off("change", onChangeDraw)} catch {}
            try { mapDrawRef.current?.off("finish", onFinishDraw) } catch {}
            try { mapDrawRef.current?.off("feature-deleted", onDeleteDraw) } catch {}
        }

    }, [mapInitialized]);

    useEffect(() => {
        if (_.isEmpty(layerComponents) || _.isEmpty(layerNames)) { return }
        setLayerLoaded(true)
    }, [initLayers, layerNames, layerComponents])

    useEffect(() => {
        const filter = parseFilterModel(mainState.filterModel, appState.columnDefs)
        setLayerFilter(prev => {
            return {
                ...prev,
                tree: filter
            }
        })
    }, [mainState.filterModel])

    useEffect(() => {

        mapRef.current.addEventListener("mouseenter", onMouseEnter)

        return () => {
            mapRef.current?.removeEventListener("mouseenter", onMouseEnter)
        }
    }, [])


    return (
        <Box ref={mapRef} sx={{width: "100%", height: "100%"}}>
            {mapInitialized && layerComponents && Object.entries(layerComponents).map(([name, Layer]) => {
                const props = {}
                const def = layerDefs[name]
                props['map'] = maplibreRef.current
                props['visible'] = layerVisible.includes(name)
                props['onInit'] = () => setInitLayers(prev => Array.from((new Set(prev)).add(name)))
                props['style'] = styleKey
                if (def.onTouch) {
                    props['onClick'] = e => mapLayerClicked(e, def.onTouch)
                }
                if (def.filter && layerFilter[def.filter]) {
                    props['filter'] = layerFilter[def.filter]
                }
                if (def.selectedTrees) {
                    props['selectedTrees'] = mainState.selectedTrees
                }
                if (def.listHoverTree) {
                    props['listHoverTree'] = mainState.listHoverTree
                }

                return (
                    <Layer
                        key={name}
                        {...props}
                    />
                )
            })}
            <StyleSelectorView style={{top: "1rem", right: "1rem"}} styleKey={styleKey} onSelect={setStyleKey} />
            <LayerSelectorView style={{top: "4rem", right: "1rem"}} layers={layerVisible} onChange={setLayerVisible} />
            <IconButton style={{...styles.button, top: "7rem", right: "1rem"}} onClick={() => eve(DispatchEvents.MainMapRefreshTreeLayer)}><SyncIcon /></IconButton>
            {(loadingSelected || !layerLoaded) && <Box style={styles.loading}><PuffLoader color="#6699eeaa" /></Box>}
        </Box>
    )
}
MainMapboxMapView.propTypes = {
    loadingSelected: PropTypes.bool,
}

export default MainMapboxMapView