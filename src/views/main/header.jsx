import {Box,Typography,TextField,Button} from "@mui/material"
import {baseGradient, commonPropTypes, disableGradient, hoverGradient} from "@_views/project/common.jsx"
import {ExitToApp as LogoutIcon} from "@mui/icons-material"
import PropTypes from "prop-types"

const styles = {
    root: {
        background: 'white',
        marginBottom: "4px",
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: "8px 0",
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#255025',
        marginLeft: '1rem',
        whiteSpace: 'nowrap',
    },
    name: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            width: '50%',
            maxWidth: '500px',
            in: '8px 0px',
            margin: '8px 0',
        },
        label: {
            background: baseGradient,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 16px',
            fontSize: '14px',
            color: 'white',
            borderRadius: '4px 0 0 4px',
            whiteSpace: 'nowrap',
        },
        value: {
            flexGrow: 1,
            '& .MuiOutlinedInput-root': {
                borderRadius: '0 4px 4px 0',
            },
        },
    },
    buttons: {
        box: {
            marginRight: '1rem',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
        },
        button: {
            minWidth: "120px",
            color: "white",
            borderRadius: "16px",
            whiteSpace: 'nowrap',
            background: baseGradient,
            '&.Mui-disabled': {
                color: "#ddd",
                background: disableGradient,
            },
            '&:hover': {
                background: hoverGradient,
            },
            display: 'flex',
            flexDirection: 'row',
            gap: '4px'
        },
    },
}

const MainHeaderView = ({onNewProject, onLogout}) => {

    return (
        <Box sx={styles.root}>
            <Typography style={styles.title}>[算出]</Typography>
            <Box sx={styles.buttons.box}>
                <Button variant="contained" sx={styles.buttons.button} onClick={onNewProject}>新規プロジェクト登録</Button>
                <Button variant="contained" sx={styles.buttons.button} onClick={onLogout}><LogoutIcon />ログアウト</Button>
            </Box>
        </Box>
    )

}

MainHeaderView.propTypes = {
    ...commonPropTypes,
    onSave: PropTypes.func.isRequired,
    onReset: PropTypes.func,
}

export default MainHeaderView