import {Box, Button, IconButton, Typography} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material"
import PropTypes from "prop-types";
import {useCallback} from "react"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '8px',
        padding: '4px 8px'
    },
    title: {
        fontWeight: 'bold',
        fontSize: '12px',
        whiteSpace: "nowrap",
    },
    value: {
        fontSize: "14px",
        whiteSpace: "nowrap",
    },
    close: {
        button: {
        },
        icon: {
            fontSize: "14px",
        },
    }
}

const MainFilterButtonView = ({color, fontColor, onClear, title, value, onClick}) => {

    const onClickClear = useCallback(e => {
        e.stopPropagation()
        onClear && onClear()
    })

    return (
        <Box style={{...styles.root,  background: color}}>
            <Button style={{flexGrow: 1}} onClick={onClick}>
                {title && <Typography style={{...styles.title, ...(fontColor ? {color: fontColor} : null)}}>{title}</Typography>}
                {value && <Typography style={{...styles.value, ...(fontColor ? {color: fontColor} : null)}}>{value}</Typography>}
            </Button>
            {onClear && (
                <IconButton style={styles.close.button} onClick={onClickClear}>
                    <CloseIcon style={styles.close.icon} />
                </IconButton>
            )}
        </Box>
    )

}
MainFilterButtonView.propTypes = {
    color: PropTypes.string,
    fontColor: PropTypes.string,
    onClear: PropTypes.func,
    onClick: PropTypes.func,
    title: PropTypes.string,
    value: PropTypes.string,
}
export default MainFilterButtonView