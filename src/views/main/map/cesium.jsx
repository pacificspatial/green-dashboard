import {useCallback, useContext, useEffect, useRef} from "react"
import {Box} from "@mui/material"
import "cesium/Build/Cesium/Widgets/widgets.css"
import * as Cesium from "cesium"
import PropTypes from "prop-types"
import {useCesium,StandardCesiumAssetLayer as AssetLayer} from "@team4am/fp-core"
import MinatokuLayer from "@_map/cesiumLayer/minatoku"
import TreeLayer from "@_map/cesiumLayer/tree"
import {AppDataContext} from "@team4am/fp-core"
import {MAP_CENTER_LOCAL_STORAGE_KEY} from "@_views/main/map/mapbox"
import _ from "ansuko"

Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE"
window.CESIUM_BASE_URL = "./cesium/"

const basemapDef =  {
    id: "echigokyuryo_dem_with_ellipsoidal_height_v2",
    name: "地形",
    type: "basemap",
    index: 1,
    asset_id: 770371,
    access_token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5N2UyMjcwOS00MDY1LTQxYjEtYjZjMy00YTU0ZTg5MmViYWQiLCJpZCI6ODAzMDYsImlhdCI6MTY0Mjc0ODI2MX0.dkwAL1CcljUV7NA7fDbhXXnmyZQU_c-G5zRx8PtEcxE",
    version: "2023/10/4",
}


const MainCesiumMapView = ({}) => {

    const mapRef = useRef()
    const { state: appState } = useContext(AppDataContext)

    const onFeatureClick = useCallback(e => {
        console.log(e)
    }, [])

    const { viewer, zoomToHeight } = useCesium({
        mapRef,
        basemapDef,
        onFeatureClick
    })

    const initLayer = useCallback(() => {
        if (!viewer) { return }
        console.log("Init Layer function")
    })

    useEffect(() => {
        if (!viewer) { return }


        let center = [
            _.toNumber(appState.env.CLIENT_MAP_CENTER_LONGITUDE),
            _.toNumber(appState.env.CLIENT_MAP_CENTER_LATITUDE),
        ]
        const lCenter = localStorage.getItem(MAP_CENTER_LOCAL_STORAGE_KEY)
        let height = 600.0
        if (lCenter) {
            center = (JSON.parse(lCenter)).center.map(l => _.toNumber(l))
            height = zoomToHeight(_.toNumber(JSON.parse(lCenter).zoom), center[1])
        }
        console.log("[Cesium]", "center", center, height)
        const destination = Cesium.Cartesian3.fromDegrees(center[0], center[1], height)
        const orientation = {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
        }

        viewer.camera.setView({
            destination,
            orientation,
            mapProjection: new Cesium.WebMercatorProjection(),
        })
        viewer.scene.mode = Cesium.SceneMode.SCENE3D

        initLayer()
    }, [viewer, appState.env])



    return (
        <Box ref={mapRef} style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0}}>
            <AssetLayer viewer={viewer} opacity={0.5}  assetId={3984926} accessToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZWQ1ODBmOC1mZTUxLTQ1YjYtOWJmYi1lYWQwNmYyYjkzMTAiLCJpZCI6Nzc3MjAsImlhdCI6MTY0MDUxODAyMH0.zWLiXFgaGXueoHP0tzeDXwp3ys7dqSDqu2l3SlB80PY" />
            <TreeLayer viewer={viewer} enable={true} />
            <MinatokuLayer viewer={viewer} enable={true} />
        </Box>
    )

}

MainCesiumMapView.propTypes = {
    loadingSelected: PropTypes.bool.isRequired,
}

export default MainCesiumMapView