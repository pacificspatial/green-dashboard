import PropTypes from "prop-types"
import {useCallback, useContext, useEffect, useState} from "react"
import _ from "ansuko"
import dayjs from "dayjs"
import {standardLayerProps} from "./common"
import { UseApiManager, AppDataContext, useMaplibre, OverwriteMode } from "@team4am/fp-core"

const SourceName = "tree"

export const LayerName = {
    Circle: {id: "tree-circle-layer", at: 2},
    Buffer: {id: "tree-buffer-layer", at: 1},
}

const MapTreeLayer = ({map, filter, visible, style, onInit}) => {

    const { state: appState } = useContext(AppDataContext)
//    const evn = useEve()
    const [url, setUrl] = useState()
    const [cacheBuster, setCacheBuster] = useState(dayjs().unix())
    const { QueryVectorTileUrl } = UseApiManager()
    const {
        addVectorSource,
        zoomInterpolate,
        addLayer,
        removes,
        setVisible,
        setFilter,
    } = useMaplibre()

    const updateVisible = useCallback(() => {
        setVisible(map, LayerName, visible)
    }, [map, visible])

    const updateFilter = useCallback(() => {
        console.log("[TreeLayer]", "update filter", filter)
        setFilter(map, LayerName, filter)
    }, [map, filter])


    const loadUrl = useCallback(_.debounce(() => {

        QueryVectorTileUrl(`
        SELECT the_geom_webmercator
        FROM ${appState.env.CLIENT_VIEWS_TREE}
        `).then(url => setUrl(`${url}?cache_buster=${cacheBuster}`))
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
                circleColor: '#539e3e',
                circleOpacity: 0.5,
                circleRadius: zoomInterpolate({8:1,10:3,14:5,18:11}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1}),
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
                circleRadius: zoomInterpolate({8:1,10:8,14:10,18:16}),
            }
        }, OverwriteMode.Rewrite)

//        addClickEvent(map, LayerName, onLayerClick)

        updateVisible()
        updateFilter()

        onInit && onInit()

    }, [map, url, onInit, filter, cacheBuster])

    useEffect(() => {
        loadUrl()
    }, [])

    useEffect(() => {
        if (!map || !url) { return }

        const tm = setTimeout(initLayer, 100)

        return () => {
            clearTimeout(tm)
            removes(map,{sources: SourceName, layers: LayerName})
        }

    }, [map, url, style])


    useEffect(() => {
        updateFilter()
    }, [map, filter])

    useEffect(() => {
        updateVisible()
    }, [map, visible])


    return null
}

MapTreeLayer.propTypes = {
    ...standardLayerProps,
    filter: PropTypes.array,
    onClick: PropTypes.func,
}

export default MapTreeLayer
