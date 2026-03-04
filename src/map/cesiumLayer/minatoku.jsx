import PropTypes from "prop-types"
import {useCallback, useEffect, useRef} from "react"
import * as Cesium from "cesium"

const CesiumMinatokuLayer = ({viewer, enable}) => {

    const tileset = useRef()

    const setColor = useCallback(() => {
        // Nothing to do.
    }, [])

    useEffect(() => {
        if (!viewer?.scene || tileset.current || !enable) {
            return
        }

        Cesium.IonResource.fromAssetId(4194528, {
            accessToken: import.meta.env.VITE_CESIUM_MINATO_ACCESS_TOKEN,
        })
            .then(res => Cesium.Cesium3DTileset.fromUrl(res))
            .then(ts => {
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
CesiumMinatokuLayer.propTypes = {
    viewer: PropTypes.object,
    enable: PropTypes.bool,
}

export default CesiumMinatokuLayer