import {useState} from "react"
import {Box,ToggleButton,ToggleButtonGroup} from "@mui/material"
import MapboxView from "./mapbox"
import CesiumView from "./cesium"
import {commonPropTypes} from "@_views/project/common.jsx"

const MapMode = {
    Mapbox: "mapbox",
    Cesium: "cesium",
}

const styles = {
    root: {
        flexGrow: 1,
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        maxHeight: 'calc(100vh - 168px)',
    },
    toggle: {
        box: {
            position: "absolute",
            bottom: "2rem",
            left: "1rem",
            zIndex: 3,
            background: "white",
        },
        button: {

        },
    }
}

const ProjectMapView = ({data, onChange}) => {

    const [mapMode, setMapMode] = useState(MapMode.Mapbox)

    return (
        <Box sx={styles.root}>
            {mapMode === MapMode.Mapbox && (<MapboxView data={data} onChange={onChange} />)}
            {mapMode === MapMode.Cesium && (<CesiumView data={data} />)}
            <ToggleButtonGroup size="small" sx={styles.toggle.box} value={mapMode} exclusive onChange={(_x,v) => setMapMode(v)}>
                <ToggleButton size="small" sx={styles.toggle.button} value={MapMode.Mapbox} onClick={() => {setMapMode(MapMode.Mapbox)}}>2D</ToggleButton>
                <ToggleButton size="small" sx={styles.toggle.button} value={MapMode.Cesium} onClick={() => setMapMode(MapMode.Cesium)}>3D</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    )
}
ProjectMapView.propTypes = commonPropTypes

export default ProjectMapView