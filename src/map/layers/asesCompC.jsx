import {useCallback, useContext, useEffect, useState} from "react"
import {useEve} from "react-eve-hook"
import {AppDataContext,useMaplibre, OverwriteMode} from "@team4am/fp-core"
import _ from "ansuko"
import UseApiManager from "@_manager/api.js"
import {DispatchEvents} from "@_views/dispatch.js"
import dayjs from "dayjs"
import {standardLayerProps} from "@_map/layers/common.js"
import PropTypes from "prop-types"


const SourceName = "ases_comp_c"

export const LayerName = {
    Circle: {id: "ases-comp-c-circle-layer", at: 1},
}

const MapAsesCompCLayer = ({map, filter, visible, style, onClick, onInit}) => {

    const {state: appState } = useContext(AppDataContext)
    const evn = useEve()
    const {QueryVectorTileUrl} = UseApiManager()
    const [cacheBuster, setCacheBuster] = useState()
    const [url, setUrl] = useState()
    const {
        addVectorSource,
        zoomInterpolate,
        addLayer,
        addClickEvent,
        removes,
        setVisible,
        setFilter,
    } = useMaplibre()

    const loadUrl = useCallback(_.debounce(() => {
        let wheres = ["ases_comp = 'C'"]
        let isTarget= "TRUE"

        const columns = appState.columnDefs
            .filter(d => d.ag_grid !== false)
            .map(d => d.field)
        if (!columns.includes("the_geom") && !columns.includes("the_geom_webmercator")) {
            columns.push("the_geom_webmercator")
        }
        if (!columns.includes("fill_color")) {
            columns.push("fill_color")
        }
        if (!columns.includes("outline_color")) {
            columns.push("outline_color")
        }

        let isTargetCols = []
        if (!_.isEmpty(appState.user?.office_uid)) {
            isTargetCols.push(`properties->>'office_uid' = '${appState.user.office_uid}'`)
        }
        if (!_.isEmpty(isTargetCols)) {
            isTarget = isTargetCols.join(" OR ")
        }

        QueryVectorTileUrl(`
        SELECT
            ${columns.join(",\n")},
            ${isTarget} AS is_target
        FROM ${appState.env.CLIENT_VIEWS_TREE} AS t
        WHERE ${wheres.join(' AND ')}
        `).then(url => setUrl(`${url}?cache_buster=${cacheBuster}`))
    }, 100), [appState.user, cacheBuster, appState.env])

    const updateVisible = useCallback(() => {
        console.log("[AsesComp]", "update visible", visible)
        setVisible(map, LayerName, visible)
    }, [map, visible])

    const updateFilter = useCallback(() => {
        setFilter(map, LayerName, filter)
    }, [map, filter])

    const onLayerClick = useCallback((e) => {
        onClick && onClick(e.features[0].properties)
    }, [map, onClick])

    const initLayer = useCallback(() => {
        if (!map || !url) { return }
        console.log("[AsesComp]", "init layer started")
        addVectorSource(map, SourceName, url, OverwriteMode.Rewrite)
        addLayer(map, {
            id: LayerName.Circle.id,
            type: "circle",
            source: SourceName,
            sourceLayer: "layer0",
            paint: {
                circleColor: [
                    'case',
                    ['==', ['get', 'is_target'], true],
                    '#df4497',
                    '#b19e8e',
                ],
                circleOpacity: [
                    "case",
                    ["==", ["get", "is_target"], true], 0.8,
                    0.5
                ],
                circleRadius: zoomInterpolate({8:1,10:4,14:6,18:13}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1}),
            }
        }, OverwriteMode.Rewrite)

        addClickEvent(map, LayerName, onLayerClick)

        updateVisible()
        updateFilter()

        onInit && onInit()

    }, [map, url, onInit, updateVisible, updateFilter, cacheBuster])

    useEffect(() => {
        loadUrl()
    }, [appState.user, appState.columnDefs, cacheBuster])

    useEffect(() => {
        if (!map || !url) { return }

        const tm = setTimeout(initLayer, 100)

        return () => {
            clearTimeout(tm)
            removes(map, {sources: SourceName, layers: LayerName})
        }

    }, [map, url, style])

    useEffect(() => {
        updateFilter()
    }, [map, filter]);

    useEffect(() => {
        updateVisible()
    }, [map, visible])

    useEffect(() => {
        evn.on(DispatchEvents.MainMapRefreshTreeLayer, () => {
            removes(map, { sources: SourceName, layers: LayerName })
            setCacheBuster(dayjs().unix())
        })

        return () => {
            evn.off()
        }
    }, [url]);

    return null
}

MapAsesCompCLayer.propTypes = {
    ...standardLayerProps,
    filter: PropTypes.array,
}

export default MapAsesCompCLayer