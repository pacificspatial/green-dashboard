import PropTypes from "prop-types"
import { useCallback, useContext, useEffect, useState } from "react"
import _ from "ansuko"
import { useEve } from "react-eve-hook"
import dayjs from "dayjs";
import { standardLayerProps } from "./common"
import { AppDataContext, UseApiManager, useMaplibre, OverwriteMode } from "@team4am/fp-core"

const SourceName = "chiyoda-tree"

export const LayerName = {
    Circle: { id: "chiyoda-tree-circle-layer", at: 2 },
    Buffer: { id: "chiyoda-tree-buffer-layer", at: 1 },
}

const MapChiyodaTreeLayer = ({ map, filter, visible, style, onClick, onInit }) => {

    const { state: appState } = useContext(AppDataContext)
    const evn = useEve()
    const [url, setUrl] = useState()
    const [cacheBuster, setCacheBuster] = useState(dayjs().unix())
    const { QueryVectorTileUrl } = UseApiManager()
    const {
        addVectorSource,
        zoomInterpolate,
        addLayer,
        addClickEvent,
        removes,
        setVisible,
        setFilter,
    } = useMaplibre()

    useEffect(() => {
        loadUrl()
    }, [appState.user, appState.columnDefs, cacheBuster])

    const loadUrl = useCallback(_.debounce(() => {
        let wheres = ["TRUE"]
        let values = []

        wheres.push(`properties->>'office_uid' = 'C99L-AATQ-F47T-E9S9'`)

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

        QueryVectorTileUrl(`
        SELECT
            ${columns.join(",\n")},
            TRUE AS is_target
        FROM ${appState.env.CLIENT_VIEWS_TREE} AS t
        WHERE ${wheres.join(' AND ')}
        `, values).then(url => setUrl(`${url}?cache_buster=${cacheBuster}`))
    }, 100), [appState.user, cacheBuster, appState.env])

    const initLayer = useCallback(() => {
        console.log("[Tree]", "init layer", map, url)
        if (!map || !url) { return }

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
                    '#539e3e',
                    '#b19e8e',
                ],
                circleOpacity: [
                    "case",
                    ["==", ["get", "is_target"], true], 0.8,
                    0.5
                ],
                circleRadius: zoomInterpolate({ 8: 1, 10: 3, 14: 5, 18: 11 }),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({ 8: 0, 10: 0.1, 14: 0.5, 18: 1 }),
            }
        }, OverwriteMode.Rewrite)
        addLayer(map, {
            id: LayerName.Buffer.id,
            type: "circle",
            source: SourceName,
            sourceLayer: "layer0",
            paint: {
                circleColor: "#ffffff",
                circleOpacity: 0.01,
                circleRadius: zoomInterpolate({ 8: 1, 10: 8, 14: 10, 18: 16 }),
            }
        }, OverwriteMode.Rewrite)

        addClickEvent(map, LayerName, onLayerClick)

        updateVisible()
        updateFilter()

        onInit && onInit()

    }, [map, url, onInit, filter, cacheBuster])

    useEffect(() => {
        if (!map || !url) { return }

        const tm = setTimeout(initLayer, 100)

        return () => {
            clearTimeout(tm)
            removes(map, { sources: SourceName, layers: LayerName })
        }

    }, [map, url, style])

    const onLayerClick = useCallback((e) => {
        onClick && onClick(e.features[0].properties)
    }, [map, onClick])

    const updateVisible = useCallback(() => {
        setVisible(map, LayerName, visible)
    }, [map, visible])

    const updateFilter = useCallback(() => {
        console.log("[TreeLayer]", "update filter", filter)
        setFilter(map, LayerName, filter)
    }, [map, filter])

    useEffect(() => {
        updateFilter()
    }, [map, filter])

    useEffect(() => {
        updateVisible()
    }, [map, visible])

    useEffect(() => {
        return () => {
            evn.off()
        }
    }, [url])

    return null
}

MapChiyodaTreeLayer.propTypes = {
    ...standardLayerProps,
    filter: PropTypes.array,
    onClick: PropTypes.func,
}

export default MapChiyodaTreeLayer
