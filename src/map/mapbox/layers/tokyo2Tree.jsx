import {useCallback, useContext, useEffect, useState} from "react"
import _ from "ansuko"
import { AppDataContext, UseApiManager, useMaplibre, OverwriteMode } from "@team4am/fp-core"

const SourceName = "tokyo2-tree"

export const LayerName = {
    Circle: {id: "tokyo2-tree-circle-layer", at: 1},
}

const MapTokyo2TreeLayer = ({map, visible, style, onInit}) => {

    const { state: appState } = useContext(AppDataContext)
    const [url, setUrl] = useState()
    const { QueryVectorTileUrl } = UseApiManager()
    const {
        addVectorSource,
        zoomInterpolate,
        addLayer,
        removes,
        setVisible,
    } = useMaplibre()

    const loadUrl = useCallback(_.debounce(() => {
        QueryVectorTileUrl(`
        SELECT the_geom_webmercator
        FROM ${appState.env.CLIENT_VIEWS_TREE}
        WHERE properties->>'office_uid' = 'LX96-QCSS-TW4E-6HQ6'
        `).then(setUrl)
    }, 100), [appState.user, appState.env])

    const updateVisible = useCallback(() => {
        setVisible(map, LayerName, visible)
    }, [map, visible])

    const initLayer = useCallback(() => {
        if (!map || !url) { return }

        addVectorSource(map, SourceName, url, OverwriteMode.Rewrite)

        addLayer(map, {
            id: LayerName.Circle.id,
            type: "circle",
            source: SourceName,
            sourceLayer: "layer0",
            paint: {
                circleColor: "#333333",
                circleOpacity: 0.6,
                circleRadius: zoomInterpolate({8:0,10:2,14:3,18:9}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8:0,10:0.1,14:0.5,18:1})
            },
            layout: {
                visibility: visible,
            }
        }, OverwriteMode.Rewrite)

        updateVisible()

        onInit()

    }, [map, url, onInit])

    useEffect(() => {
        if (!map || !url) { return }

        const tm = setTimeout(initLayer, 100)

        return () => {
            clearTimeout(tm)
            removes(map, {sources: SourceName, layers: LayerName})
        }

    }, [map, url, style])

    useEffect(() => {
        loadUrl()
    }, [loadUrl])

    useEffect(() => {
        updateVisible()
    }, [visible]);

}

export default MapTokyo2TreeLayer