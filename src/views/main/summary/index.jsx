import PropTypes from "prop-types"
import {Backdrop, Box, Button, IconButton, Typography} from "@mui/material"
import {Close as CloseIcon} from "@mui/icons-material"
import {Rnd} from "react-rnd"
import {useCallback, useContext, useMemo, useRef, useState} from "react"
import UseApiManager from "@_manager/api.js"
import UseAsesComp from "./asesComp"
import SummaryList from "./list"
import {AppDataContext} from "@team4am/fp-core"


const styles = {
    box: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    },
    header: {
        box: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        title: {
            marginLeft: "1rem",
        },
        close: {
            button: {
                marginRight: "1rem",
            },
            icon: {

            },
        },
    },
}

const MainSummaryView = ({open, onClose}) => {
    const defaultWidth = useMemo(() => 800, [])
    const defaultHeight = useMemo(() => 600, [])
    const [dragging, setDragging] = useState(false)
    const { GetRows } = UseApiManager()
    const apiRef = useRef()
    const {data, columnDefs} = UseAsesComp()
    const { state:appState } = useContext(AppDataContext)

    const notice = useMemo(() => {
        if (!appState.user) { return }
        if (appState.user.office_uid === 'C99L-AATQ-F47T-E9S9') {
            return '評価ランクCの種別幹周リスト'
        } else {
            return '種別幹周リスト'
        }
    }, [appState.user])

    const onExportExcel = useCallback(() => {
        apiRef.current?.exportDataAsExcel()
    }, [])

    const onReady = useCallback(api => {
        apiRef.current = api
    }, [])

    return (
        <Backdrop open={open} style={{zIndex: 4}}>
            <Box style={{width: "100%", height: "100%"}}>
                <Rnd
                    dragHandleClassName="summary-header"
                    onDragStart={() => setDragging(true)}
                    onDragStop={() => setDragging(false)}
                    minWidth={600}
                    minHeight={500}
                    bounds="window"
                    default={{
                        x: (window.innerWidth / 2) - (defaultWidth / 2),
                        y: (window.innerHeight/ 2) - (defaultHeight/ 2),
                        width: defaultWidth,
                        height: defaultHeight,
                    }}
                    style={{
                        background: "white",
                        borderRadius: "12px",
                        overflow: "hidden",
                        cursor: dragging ? "grabbing": "grab"
                    }}
                >
                    <Box style={styles.box}>
                        <Box className="summary-header" style={styles.header.box}>
                            <Typography style={styles.header.title}>集計表({notice})</Typography>
                            <Box>
                                <Box style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "8px"}}>
                                    <Button style={{height: "30px"}} size="small" variant="outlined" onClick={onExportExcel}>Excel出力</Button>
                                    <IconButton style={styles.header.close.button} onClick={onClose}>
                                        <CloseIcon style={styles.header.close.icon} />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                        <SummaryList data={data} columnDefs={columnDefs} onReady={onReady} />
                    </Box>
                </Rnd>
            </Box>
        </Backdrop>
    )

}
MainSummaryView.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
}

export default MainSummaryView