import PropTypes from "prop-types"
import {useCallback, useEffect, useRef} from "react"
import * as Cesium from "cesium"


const CesiumStandardAssetLayer = ({
  viewer,
  enable,
  assetId,
  accessToken,
  onLoadStart,
  onLoadFinish,
  onLoadProgress,
  onFeatureClick,
}) => {


    const tileset = useRef()
    const clickEventHandler = useRef()

    const onAllTilesLoaded = useCallback(() => {
        onLoadFinish && onLoadFinish(tileset.current)
    }, [onLoadFinish])

    const onTileLoad = useCallback(() => {
        onLoadStart && onLoadStart(tileset.current)
    }, [onLoadStart])

    const onTileLoadProgress = useCallback((requests, processing) => {
        onLoadProgress && onLoadProgress(tileset.current, {
            requests,
            processing,
        })
    }, [onLoadProgress])


    useEffect(() => {
        if (!viewer?.scene || !enable || !assetId || tileset.current) { return }

        let cancelled = false

        Cesium.IonResource.fromAssetId(assetId, {
            accessToken: accessToken ?? undefined
        })
            .then(url => Cesium.Cesium3DTileset.fromUrl(url))
            .then(ts => {
                if (!cancelled || viewer?.scene?.primitives) {

                    ts.allTilesLoaded.addEventListener(onAllTilesLoaded)
                    ts.tileLoad.addEventListener(onTileLoad)
                    ts.loadProgress.addEventListener(onTileLoadProgress)

                    viewer?.scene?.primitives?.add(ts)
                    tileset.current = ts
                }
            })

        return () => {
            cancelled = true
            try {
                if (tileset.current) {
                    tileset.current.allTilesLoaded.removeEventListener(onAllTilesLoaded)
                    tileset.current.tileLoad.removeEventListener(onTileLoad)
                    tileset.current.loadProgress.removeEventListener(onTileLoadProgress)
                    viewer?.scene?.primitives.remove(tileset.current)
                }
            } catch {}
            tileset.current = null
        }
    }, [viewer, enable, assetId, accessToken, onAllTilesLoaded, onTileLoad, onTileLoadProgress])

    useEffect(() => {
        if (!viewer?.scene || !enable || !onFeatureClick) {
            return
        }

        const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)

        handler.setInputAction(movement => {
            const pickedFeature = viewer.scene.pick(movement.position)
            if (Cesium.defined(pickedFeature) && pickedFeature.primitive === tileset.current) {
                onFeatureClick(pickedFeature)
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

        clickEventHandler.current = handler

        return () => {
            if (clickEventHandler.current) {
                clickEventHandler.current.destroy()
                clickEventHandler.current = null
            }
        }
    }, [viewer, enable, onFeatureClick])

    return null
}
CesiumStandardAssetLayer.propTypes = {
    viewer: PropTypes.any,
    enable: PropTypes.bool,
    assetId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    accessToken: PropTypes.string,
    onLoadStart: PropTypes.func,
    onLoadFinish: PropTypes.func,
    onLoadProgress: PropTypes.func,
    onFeatureClick: PropTypes.func,
}

export default CesiumStandardAssetLayer