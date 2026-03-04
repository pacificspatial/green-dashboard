import PropTypes from "prop-types"
import {useCallback, useEffect, useRef} from "react"
import * as Cesium from "cesium"

const CesiumTreeLayer = ({viewer, enable}) => {

    const tileset = useRef()

    const setColor = useCallback(() => {
        // Nothing to do.
    }, [])

    useEffect(() => {
        if (!viewer?.scene || tileset.current || !enable) {
            return
        }

        Cesium.IonResource.fromAssetId(4134997, {
            accessToken: import.meta.env.VITE_CESIUM_TREE_ACCESS_TOKEN,
        })
            .then(res => Cesium.Cesium3DTileset.fromUrl(res))
            .then(ts => {
                ts.style = new Cesium.Cesium3DTileStyle({
                     color: "color('rgb(23, 104, 69)')"  // 赤、透明度50%
                })
                tileset.current = ts
                viewer?.scene?.primitives.add(ts)

                setColor()
            })

        return () => {
            try {
                tileset.current ?? viewer?.scene?.primitives.remove(tileset.current)
            } catch{}
            tileset.current = null
        }

    }, [viewer]);

}
CesiumTreeLayer.propTypes = {
    viewer: PropTypes.object,
    enable: PropTypes.bool,
}

export default CesiumTreeLayer