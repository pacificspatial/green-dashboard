import {useCallback, useContext, useEffect, useState} from "react"
import _ from "ansuko"
import dayjs from "dayjs"
import {standardLayerProps} from "./common"
import { AppDataContext, useMaplibre, OverwriteMode, UseApiManager } from "@team4am/fp-core"

const SourceName = "evacuation"

export const LayerName = {
    Circle: {id: "evacuation-circle-layer", at: 2},
}

const MapEvacuationLayer = ({map, visible, style, onInit}) => {

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

    const loadUrl = useCallback(_.debounce(() => {

        QueryVectorTileUrl(`
        SELECT the_geom_webmercator
        FROM ${appState.env.CLIENT_VIEWS_EVALUATION_LOCATION}
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
                circleColor: '#df44bb',
                circleOpacity: 0.5,
                circleRadius: zoomInterpolate({8:1,10:3,14:5,18:11}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1}),
            }
        }, OverwriteMode.Rewrite)

//        addClickEvent(map, LayerName, onLayerClick)

        updateVisible()

        onInit && onInit()

    }, [map, url, onInit, cacheBuster])

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
        updateVisible()
    }, [map, visible])


    return null
}

MapEvacuationLayer.propTypes = {
    ...standardLayerProps,
}

export default MapEvacuationLayer
