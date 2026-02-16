import {Backdrop, Box, Button, CircularProgress, Typography} from "@mui/material"
import {baseGradient} from "@_views/project/common.jsx"
import PropTypes from "prop-types"

const styles = {
    root: {
    },
    box: {
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '1px 1px 3px #000',
        backgroundImage: baseGradient,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '1rem',
        minWidth: '200px',
    },
    text: {
        fontSize: "15px",
        color: "white",
        fontWeight: "bold",
        textAlign: 'center',
    },
    progress: {
        color: "rgba(228,228,228,0.71)",
    },
    button: {
        '& .MuiButton-outlined': {
            borderColor: 'white',
        }
    }

}

const LoadingView = ({open, message, onCancel, zIndex, cancelText}) => {

    return (
        <Backdrop open={open} style={{zIndex, ...styles.root}}>
            <Box style={styles.box}>
                {message && (<Typography style={styles.text}>{message}</Typography>)}
                <CircularProgress style={styles.progress} size={40} />
                {onCancel && (<Button sx={{borderColor: "white", color: "white"}} variant="outlined" onClick={onCancel}>{cancelText ?? "中止"}</Button>)}
            </Box>
        </Backdrop>
    )
}
LoadingView.propTypes = {
    open: PropTypes.bool,
    message: PropTypes.string,
    onCancel: PropTypes.func,
    cancelText: PropTypes.string,
    zIndex: PropTypes.number,
}

export default LoadingView;