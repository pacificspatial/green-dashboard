import {useCallback, useEffect, useMemo} from "react"
import {standardLayerProps} from "@_map/layers/common.js"
import PropTypes from "prop-types"
import {useMaplibre, OverwriteMode} from "@team4am/fp-core"
import _ from "ansuko"

const SourceName = "list-hover-tree"

export const LayerName = {
    Circle: {id: "list-hover-tree-circle", at: 0},
}

const ListHoverTreeLayer = ({map, onInit, listHoverTree, visible, style}) => {

    const {
        addGeojsonSource,
        addLayer,
        zoomInterpolate,
        setVisible,
        removes,
        updateGeojsonSource,
    } = useMaplibre()

    const geojson = useMemo(() => {
        if(_.isEmpty(listHoverTree)) {
            return {
                type: "FeatureCollection",
                features: [
                    {type: "Feature", geometry: {type: "Point", coordinates: [0,0]}}
                ]
            }
        }
        return {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    properties: listHoverTree,
                    geometry: {
                        type: "Point",
                        coordinates: [listHoverTree.longitude, listHoverTree.latitude],
                    }
                }
            ]
        }
    }, [listHoverTree])

    const setLayerVisible = useCallback(() => {
        setVisible(map, LayerName, visible && listHoverTree)
    }, [map, listHoverTree, visible])

    const initLayer = useCallback(() => {
        if (!map) { return }

        addGeojsonSource(map, SourceName, geojson, OverwriteMode.Rewrite)
        addLayer(map, {
            id: LayerName.Circle.id,
            type: "circle",
            source: SourceName,
            paint: {
                circleColor: "#eeee33",
                circleOpacity: 1.0,
                circleRadius: zoomInterpolate({8: 6.01, 14: 8.02, 18:12.02}),
                circleStrokeColor: "#ffffff",
                circleStrokeWidth: zoomInterpolate({8: 0.1, 10: 0.2, 14:0.8, 18:1.0}),
            }
        }, OverwriteMode.Rewrite)
        setLayerVisible()
        onInit && onInit()
    }, [map, geojson, setLayerVisible, listHoverTree, visible])


    useEffect(() => {
        setLayerVisible()
    }, [visible, listHoverTree])

    useEffect(() => {
        const tm = setTimeout(initLayer, 500)

        return () => {
            clearTimeout(tm)
            removes(map, {sources: SourceName, layers: LayerName})
        }
    }, [map, style]);

    useEffect(() => {
        updateGeojsonSource(map, SourceName, geojson)
    }, [map, geojson])


    return null
}
ListHoverTreeLayer.propTypes = {
    ...standardLayerProps,
    listHoverTree: PropTypes.object,
}

export default ListHoverTreeLayer

