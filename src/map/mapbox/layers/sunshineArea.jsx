import {useCallback, useContext, useEffect, useState} from "react"
import _ from "ansuko"
import dayjs from "dayjs";
import {standardLayerProps} from "./common"
import { UseApiManager, AppDataContext, useMaplibre, OverwriteMode } from "@team4am/fp-core"

const SourceName = "sunshine_area"

export const LayerName = {
    Fill: {id: "sunshine_area-fill-layer", at: 2},
}

const MapSunshineAreaLayer = ({map, visible, style, onInit}) => {

    const { state: appState } = useContext(AppDataContext)
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
        SELECT the_geom_webmercator, is_over_2hours
        FROM ${appState.env.CLIENT_TABLES_SUNSHINE_TIME_POLYGON}
        `).then(setUrl)
    }, 100), [appState.user, cacheBuster, appState.env])

    const initLayer = useCallback(() => {
        console.log("[Tree]", "init layer", map, url)
        if (!map || !url) { return }

        addVectorSource(map, SourceName, url, OverwriteMode.Rewrite)
        addLayer(map, {
            id: LayerName.Fill.id,
            type: "fill",
            source: SourceName,
            sourceLayer: "layer0",
            paint: {
                fillColor: ["case",
                    ["==", ["get", "is_over_2hours"], true], '#d5c575',
                    "#333333"
                ],
                fillOpacity: 0.5,
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

MapSunshineAreaLayer.propTypes = {
    ...standardLayerProps,
}

export default MapSunshineAreaLayer
