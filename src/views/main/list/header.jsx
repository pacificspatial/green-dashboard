import {Box, Button, IconButton, Typography} from "@mui/material"
import {BeatLoader} from "react-spinners"
import {useCallback, useContext, useEffect, useRef} from "react"
import {MainDataContext} from "@team4am/fp-core"
import PropTypes from "prop-types"
import _ from "ansuko"
import {Cached as CachedIcon} from "@mui/icons-material"

const styles = {
    root: {
        margin: '4px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    count: {
        root: {
            display: "flex",
            flexDirection: "row",
            gap: "8px",
            alignItems: "center",
            marginLeft: "8px",
        },
        box: {
            display: "flex",
            flexDirection: "row",
            gap: "4px",
            alignItems: "center",
        },
        label: {
            fontSize: '14px',
            fontWeight: 'bold'
        },
        value: {
            fontSize: '14px',
        }
    },
    button: {
        root: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "4px",
            marginRight: "8px",
        },
    }
}

const MainListHeaderView = (
    {

        allCount,
        loadCount,
        loading,
        onResetColumnState,
        onReload,
        onDeselectAll,
    }) => {

    const { state:mainState, setListHoverTree } = useContext(MainDataContext)

    const controlRef = useRef()

    const onEnterControl = useCallback(() => {
        setListHoverTree(null)
    }, [])

    useEffect(() => {
        controlRef.current.addEventListener("mouseenter", onEnterControl)
        controlRef.current.addEventListener("mousemove", onEnterControl)

        return () => {
            controlRef.current?.removeEventListener("mouseenter", onEnterControl)
            controlRef.current?.removeEventListener("mousemove", onEnterControl)
        }
    }, []);

    return (
            <Box style={styles.root} ref={controlRef}>
                <Box style={styles.count.root}>
                    {loading && <Box style={styles.count.box}><BeatLoader style={styles.count.loading} size={10} color="#99c" /></Box>}
                    {!loading && (
                        <>
                            <Box style={styles.count.box}>
                                <Typography style={styles.count.label}>登録数:</Typography>
                                <Typography style={styles.count.value}>{allCount?.toLocaleString() ?? "--"}</Typography>
                                </Box>
                            {allCount !== loadCount && (<Box style={styles.count.box}>
                                <Typography style={styles.count.label}>抽出数:</Typography>
                                <Typography style={styles.count.value}>{loadCount?.toLocaleString() ?? "--"}</Typography>
                            </Box>)}
                        </>
                    )}
                </Box>
                <Box style={styles.button.root}>
                    <Button style={{height: "28px"}} size="small" variant="outlined" disabled={!_.size(mainState.selectedTrees)} onClick={onDeselectAll}>全選択解除</Button>
                    <Button style={{height: "28px", width: "80px"}} size="small" variant="outlined" onClick={onResetColumnState}>列初期化</Button>
                    <IconButton size="small" onClick={onReload}><CachedIcon style={{fontSize: "20px"}} /></IconButton>
                </Box>
            </Box>
    )
}
MainListHeaderView.propTypes = {
    loading: PropTypes.bool,
    allCount: PropTypes.number,
    loadCount: PropTypes.number,
    onResetColumnState: PropTypes.func,
    onReload: PropTypes.func,
    onDeselectAll: PropTypes.func,
}
export default MainListHeaderView