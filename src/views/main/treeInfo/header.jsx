import {Box, IconButton, Typography} from "@mui/material";
import {useContext, useMemo} from "react";
import _ from "ansuko";
import { MainDataContext, InfoTreeViewMode } from "@team4am/fp-core"
import PropTypes from "prop-types"
import {
    SystemUpdateAlt as SystemUpdateAltIcon,
    SettingsOverscan as SettingsOverscanIcon,
    OpenInBrowser as OpenInBrowserIcon,
    Close as CloseIcon,
    Cached as CachedIcon,
} from "@mui/icons-material"
import {DispatchEvents} from "@_views/dispatch.js"
import {eve} from "react-eve-hook"


// linear wrapped 共通スタイル
const commonStyles = {
    root: {
        display: "flex",
        justifyContent: "space-between",
        padding: "0 8px",
        background: "#f0f0f0",
    },
    label: {
        tree_name: {
            fontSize: "14px",
            fontWeight: "bold",
        },
        tree_id: {
            color: "#333",
        },
        tree_uid: {
            fontSize: "11px",
            color: "#999",
        },
    },
    control: {
        root: {
            display: "flex",
            flexDirection: "row",
        },
        box: {
            margin: "8px",
            border: "1px solid #999",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "row",
        },
        divider: {
            width: "0.5px",
            background: "black",
        },
        button: {
            width: "40px",
        }
    }
}
// linear用差分スタイル
const linearStyles = {
    root: {
        flexDirection: "row",
        alignItems: "center",
    },
    label: {
        box: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
        },
        tree_id: {
            fontSize: "12px",
        },
    },
}
// wrapped用共通スタイル
const wrappedStyles = {
    root: {
        flexDirection: "column",
        alignItems: "end",
    },
    label: {
        box: {
            width: "100%",
            paddingLeft: "8px",
            marginBottom: "8px",
        },
        tree_id: {
            fontSize: "14px",
        },
    },
}

const TreeInfoHeaderView = ({isLinear}) => {
    const { setInfoTree } = useContext(MainDataContext)
    const styles = useMemo(() => _.merge(_.cloneDeep(commonStyles), {...(isLinear ? linearStyles : wrappedStyles)}) , [])

    return (
        <Box style={styles.root}>
            {isLinear && <TreeBasicInfo styles={styles} />}
            <Box style={styles.control.root}>
                <ViewController styles={styles} />
                <IconButton onClick={() => eve(DispatchEvents.TreeInfoOnClickReload)}><CachedIcon /></IconButton>
                <IconButton onClick={() => setInfoTree(null)}><CloseIcon /></IconButton>
            </Box>
            {!isLinear && <TreeBasicInfo styles={styles} />}
        </Box>
    )
}
TreeInfoHeaderView.propTypes = {
    isLinear: PropTypes.bool.isRequired,
}
export default TreeInfoHeaderView

const TreeBasicInfo = ({styles}) => {
    const { state: mainState} = useContext(MainDataContext)
    return (
        <Box style={styles.label.box}>
            <Typography style={{...styles.label.tree_name, color: mainState.infoTree?.name ? "#339": "#666"}}>{mainState.infoTree?.name ?? "種名なし"}</Typography>
            {mainState.infoTree?.tree_id && (<Typography style={styles.label.tree_id}>{mainState.infoTree.tree_id}</Typography>)}
            <Typography style={styles.label.tree_uid}>{mainState.infoTree?.uid ?? "新規"}</Typography>
        </Box>
    )
}
TreeBasicInfo.propTypes = {
    styles: PropTypes.object,
}

const ViewController = ({styles}) => {
    const { state:mainState, setInfoTreeViewMode} = useContext(MainDataContext)

    return (
        <Box style={styles.control.box}>
            <IconButton
                style={styles.control.button}
                size="small"
                disabled={mainState.infoTreeViewMode === InfoTreeViewMode.Left}
                onClick={() => setInfoTreeViewMode(InfoTreeViewMode.Left)}
            >
                <SystemUpdateAltIcon style={{transform: "rotate(90deg)"}} />
            </IconButton>
            <Box style={styles.control.divider} />
            <IconButton
                style={styles.control.button}
                size="small"
                disabled={mainState.infoTreeViewMode === InfoTreeViewMode.Right}
                onClick={() => setInfoTreeViewMode(InfoTreeViewMode.Right)}
            >
                <SystemUpdateAltIcon style={{transform: "rotate(-90deg)"}} />
            </IconButton>
            <Box style={styles.control.divider} />
            <IconButton
                style={styles.control.button}
                size="small"
                disabled={mainState.infoTreeViewMode === InfoTreeViewMode.FullScreen}
                onClick={() => setInfoTreeViewMode(InfoTreeViewMode.FullScreen)}
            >
                <SettingsOverscanIcon />
            </IconButton>
            <Box style={styles.control.divider} />
            <IconButton
                style={styles.control.button}
                size="small"
                disabled={mainState.infoTreeViewMode === InfoTreeViewMode.Dialog}
                onClick={() => setInfoTreeViewMode(InfoTreeViewMode.Dialog)}
            >
                <OpenInBrowserIcon /></IconButton>
        </Box>
    )
}
ViewController.propTypes = {
    styles: PropTypes.object,
}