import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react"
import {Box} from "@mui/material"
import maplibregl, {NavigationControl} from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import {MapStyleDefs} from "@_map/styles"
import axios from "axios"
import {waitAnimated} from "@_manager/util"
import PropTypes from "prop-types"
import DrawPolygon from "@_components/mapbox/draw_polygon"
import StyleSelector from "../styleSelector"
import MapTreeLayer from "@_map/mapbox/layers/tree"
import MapChiyodaTreeLayer from "@_map/mapbox/layers/chiyodaTree"
import MapDaimaruyuTreeLayer from "@_map/mapbox/layers/daimaruyuTree"
import MapTokyoTreeLayer from "@_map/mapbox/layers/tokyoTree"
import MapTokyo2TreeLayer from "@_map/mapbox/layers/tokyo2Tree"
import MapEvacuationLayer from "@_map/mapbox/layers/evacuation"
import LayerSelector from "../layerSelector"
import MapSunshineAreaLayer from "@_map/mapbox/layers/sunshineArea"
import MapMinatokuTreeLayer from "@_map/mapbox/layers/minatokuTree.jsx"
import { AppDataContext, MainDataContext, useMaplibre } from "@team4am/fp-core"

const MapLayer = {
    ChiyodaTree: "chiyoda_tree",
    DaimaruyuTree: "daimaruyu_tree",
    Tokyo2Tree: "tokyo2_tree",
    TokyoTree: "tokyo_tree",
    MinatokuTree: "minatoku_tree",
    Tree: "tree",
    Evacuation: "evacuation",
    SunShineArea: "sunshine_area",
}

const styles = {
    map: {
        position: 'absolute',
        inset: 0,
    }
}

const ProjectMapMapboxView = ({data, onChange}) => {

    const { state:appState } = useContext(AppDataContext)
    const { state:mainState } = useContext(MainDataContext)
    const initializing = useRef(false)
    const boundsInitialized = useRef(false)
    const isUpdatigInternally = useRef(false)
    const mapRef = useRef()
    const drawRef = useRef()
    const [map, setMap] = useState()
    const [styleKey, setStyleKey] = useState(Object.values(MapStyleDefs).find(s => s.default).key)
    const [style, setStyle] = useState()
    const {_m} = useMaplibre(true)
    const [initializedLayers, setInitializedLayers] = useState([])
    const [visibleLayers, setVisibleLayers] = useState([])
    const layersConfig = useMemo(() => {
        if (!appState.user) { return null }
        let layers = []
        switch(appState.user.office_uid) {
            case "C99L-AATQ-F47T-E9S9": // 千代田
                layers = [
                    {name: "千代田区樹木", key: MapLayer.ChiyodaTree},
                    {name: "東京都樹木", key: MapLayer.Tokyo2Tree},
                ]
                break
            case "CECZ-7464-MVP9-999A":
                layers = [
                    {name: "大丸有樹木", key: MapLayer.ChiyodaTree},
                    {name: "東京都樹木", key: MapLayer.Tokyo2Tree},
                ]
                break
            case "CHGE-W6CH-TJL4-QV7N":
                layers = [
                    {name: "港区樹木", key: MapLayer.MinatokuTree},
                    {name: "東京都樹木", key: MapLayer.Tokyo2Tree},
                ]
                break
            case "":
                layers = [
                    {name: "東京都樹木", key: MapLayer.TokyoTree},
                ]
                break
            default:
                layers = [
                    {name: "全樹木", key: MapLayer.Tree},
                    {name: "千代田区樹木", key: MapLayer.ChiyodaTree},
                    {name: "大丸有樹木", key: MapLayer.DaimaruyuTree},
                    {name: "東京都樹木", key: MapLayer.TokyoTree},
                ]
                break
        }
        layers.push("divider")
        layers.push({name: "避難場所・地点", key: MapLayer.Evacuation})
        layers.push({name: "日照地図", key: MapLayer.SunShineArea})
        return layers
    }, [appState.user])

    const onClick = useCallback(e => {
        console.log(e)
    }, [])

    const initMap = useCallback(() => {
        console.log("[ProjectMap]", "init map", style, initializing.current)
        if (!style) { return }
        console.log("[ProjectMap]", "start maplibre gl", map, style, initializing.current)

        if (map) {
            map.setStyle(style)
            initializing.current = false
            return
        }
        let center = [
            mainState.project.longitude,
            mainState.project.latitude,
        ]
        const zoom = 17
        const mapOptions = {
            container: mapRef.current,
            center,
            zoom,
            style,
            localIdeographFontFamily: "'Noto Sans JP', 'Roboto'",
        }

        console.log("[ProjectMap]", "load maplibre gl", mapOptions)
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
                },
            }),
            "top-right",
        )

        m.addControl(
            new NavigationControl({
                visualizePitch: true,
                showZoom: true,
            }),
            "top-left",
        )

        m.on("click", onClick)

        m.on("error", e => {
            console.error("[ProjectMap]", "initial error", e)
        })

        m.on("load", async () => {
            console.log("[ProjectMap]", "loaded maplibre gl")
            setMap(m)
            waitAnimated(() => {
                initializing.current = false
            }, 1)
        })
    }, [map, style, mainState.project])

    const onInitLayer = useCallback(l => {
        setInitializedLayers(prev => {
            const set = new Set(prev)
            set.add(l)
            return Array.from(set)
        })
    }, [])

    useEffect(() => {
        if (!map || !mainState.project?.geojson || boundsInitialized.current) { return }
        boundsInitialized.current = true

        const geojson = mainState.project.geojson
        isUpdatigInternally.current = true
    }, [map, mainState.project?.geojson]);

    useEffect(() => {
        if (!styleKey) { return }
        axios.get(`/resources/map_style/${styleKey}.json5`)
            .then(res => {
                const styleJson = JSON.stringify(res.data)
                    .replace('{{API_ENDPOINT}}', appState.env.CLIENT_MAP_TILE_ENDPOINT)
                const s = _m(JSON.parse(styleJson))
                console.log("[ProjectMap]", "loaded style", s)
                setStyle(s)
            })
    }, [styleKey])

    useEffect(() => {
        console.log("[ProjectMap]", "init map", style, initializing.current)
        if (!style || initializing.current) { return }
        initializing.current = true
        initMap()
    }, [style, initMap])

    useEffect(() => {
        if (!map || !drawRef.current) { return }
        console.log("[useEffect]", "draw event set listener")

    }, [map]);

    useEffect(() => {
        setVisibleLayers(layersConfig?.filter(v => v.defaultVisible).map(v => v.key) ?? [])
    }, [layersConfig])

    return (
        <Box style={styles.map} ref={mapRef}>
            <DrawPolygon
                map={map}
                style={styles}
                styleKey={styleKey}
                geojson={data?.geojson}
                onChange={onChange}
                disable={false}
            />
            <StyleSelector onSelect={setStyleKey} style={{bottom: "3rem", right: "1rem"}} styleKey={styleKey} />
            <LayerSelector onChange={setVisibleLayers} style={{bottom: "6rem", right: "1rem"}} layersConfig={layersConfig} visibleLayers={visibleLayers} />
            <MapTreeLayer map={map} visible={visibleLayers.includes(MapLayer.Tree)} style={style} onInit={() => onInitLayer(MapLayer.Tree)} />
            <MapChiyodaTreeLayer map={map} visible={visibleLayers.includes(MapLayer.ChiyodaTree)} style={style} onInit={() => onInitLayer(MapLayer.ChiyodaTree)} />
            <MapDaimaruyuTreeLayer map={map} visible={visibleLayers.includes(MapLayer.DaimaruyuTree)} style={style} onInit={() => onInitLayer(MapLayer.DaimaruyuTree)} />
            <MapTokyoTreeLayer map={map} visible={visibleLayers.includes(MapLayer.TokyoTree)} style={style} onInit={() => onInitLayer(MapLayer.TokyoTree)} />
            <MapTokyo2TreeLayer map={map} visible={visibleLayers.includes(MapLayer.Tokyo2Tree)} style={style} onInit={() => onInitLayer(MapLayer.Tokyo2Tree)} />
            <MapMinatokuTreeLayer map={map} visible={visibleLayers.includes(MapLayer.MinatokuTree)} style={style} onInit={() => onInitLayer(MapLayer.MinatokuTree)} />
            <MapSunshineAreaLayer map={map} visible={visibleLayers.includes(MapLayer.SunShineArea)} style={style} onInit={() => onInitLayer(MapLayer.SunShineArea)} />
            <MapEvacuationLayer map={map} visible={visibleLayers.includes(MapLayer.Evacuation)} style={style} onInit={() => onInitLayer(MapLayer.Evacuation)} />

        </Box>
    )

}
ProjectMapMapboxView.propTypes = {
    onChange: PropTypes.func
}

export default ProjectMapMapboxView