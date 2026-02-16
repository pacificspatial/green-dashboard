import PropTypes from "prop-types"
import {
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Divider,
    List,
    ListItem,
    ListItemButton,
    Popover,
    Typography
} from "@mui/material"
import {useCallback, useContext, useMemo, useRef, useState} from "react"
import {DispatchEvents} from "@_views/dispatch.js"
import { AppDataContext, MainDataContext, UseAuthManager, UseAgGridManager } from "@team4am/fp-core"
import _ from "ansuko"
import UseApiManager from "@_manager/api.js"
import {toast} from "react-toastify"

export const ExportType = {
    All: "all",
    Filtered: "condition",
    Selected: "selected",
}

const ExportTypeIndex = [
    ExportType.All,
    ExportType.Filtered,
    ExportType.Selected,
]

const baseStyles = {
    root: {

    },
    downloadProgress: {
        root: {
            width: '200px',
            height: '200px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: '#eee',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px',
            borderRadius: '8px',
            boxShadow: '1px 1px 8px #000',
        },
        title: {

        },
        progress: {
            box: {

            },
            label: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -70%)'
            },
        },
        cancelButton: {

        },
    }
}

const MainHeaderExportExcelButton = ({styles}) => {

    const _styles = useMemo(() => _.merge(baseStyles, styles), [styles])
    const { state: mainState } = useContext(MainDataContext)
    const { state: appState } = useContext(AppDataContext)
    const { hasPermission} = UseAuthManager()
    const buttonRef = useRef()
    const [openPopover, setOpenPopover] = useState()
    const { exportExcel } = UseAgGridManager(true)
    const { Post } = UseApiManager()
    const [downloadRate, setDownloadRate] = useState()
    const [exportStatus, setExportStatus] = useState()
    const downloadCancelToken = useRef()
    const selectItems = useMemo(() => {
        const items = []
        if (!_.isEmpty(mainState.filterModel)) {
            items.push(ExportType.Filtered)
        }
        if (!_.isEmpty(mainState.selectedTrees)) {
            items.push(ExportType.Selected)
        }
        return items
    }, [mainState.filterModel, mainState.selectedTrees])

    const onExportExcel = useCallback(() => {
        if (_.isEmpty(selectItems)) {
            onClickListItem({target:{dataset:{index: ExportType.All}}}).then()
        } else {
            setOpenPopover(true)
        }
    }, [selectItems])

    const onClosePopover = useCallback(() => {
        setOpenPopover(false)
    }, [])

    const downloadData = useCallback(async (filterModel = null) => {
        setExportStatus("ダウンロード中")
        const limit = 1000
        let count = null
        let startRow = 0
        let endRow = 0
        let rows = []
        setDownloadRate(0)
        do {
            startRow = endRow
            endRow += limit
            const data = {
                startRow,
                endRow,
                filterModel,
            }
            const abortController = new AbortController()
            const res = await Post('tree/grid', data, {withCount: true, signal: abortController.signal})
            console.log("[Export]", "download size", _.size(res), startRow, endRow, count, downloadCancelToken.current)
            console.log(res)
            if (_.size(res) !== 2) {
                break
            }
            rows = rows.concat(res[0])
            count = res[1]
            setDownloadRate(endRow / count)
            console.log(_.size(rows), startRow, endRow, count, endRow < count)
       } while(endRow < count)

        setDownloadRate(1)
        return rows
    }, [])

    const onExportCancel = useCallback(() => {
        downloadCancelToken.current?.abort()
    }, [])

    const onClickListItem = useCallback( async (e) => {
//        eve(DispatchEvents.MainOnClickExcelExport, {type: e.target.dataset.index})
        setOpenPopover(false)
        if (downloadCancelToken.current) { return }
        downloadCancelToken.current = new AbortController()

        try {
            let data
            // TODO: キャンセルされたときの処理
            switch (e.target.dataset.index) {
                case ExportType.All:
//                    toast.info("抽出結果のデータをエクスポートします", {position: "top-right", autoClose: 1500})
                    data = await downloadData()
                    break
                case ExportType.Filtered:
                    data = await downloadData(mainState.filterModel)
                    break
                case ExportType.Selected:
                    data = await downloadData({uid: {filterType: "set", values: mainState.selectedTrees.map(t => t.uid)}})
                    break
                default:
                    toast.error(`未定義のエクスポートタイプです ${e.target.dataset.index}`, {position: "top-right", autoClose: 1500})
                    downloadCancelToken.current = null
                    setExportStatus(null)
                    return
            }
            if (!_.isEmpty(data)) {
                setExportStatus("Excel生成中")
                await _.waited(async () => {
                    await exportExcel(appState.columnDefs, data, { signal: downloadCancelToken.signal })
                }, 3)
            }
        } catch(e) {
            console.error("[ExportExcel]", "error", e)
        } finally {
            setExportStatus(null)
            downloadCancelToken.current = null
        }
    }, [mainState.filterModel, appState.columnDefs, mainState.selectedTrees])

    if(!hasPermission("export")) { return null }

    return (
        <>
            <Button
                style={styles.menuButton}
                variant="outlined"
                size="small"
                ref={buttonRef}
                onClick={onExportExcel}
            >
                <img alt="excel" src="/resources/img/icon_excel.svg" />EXCEL出力
            </Button>
            <Popover
                open={openPopover}
                anchorEl={buttonRef.current}
                onClose={onClosePopover}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <List dense="dense" style={{float: "none"}}>
                    <ListItem>
                        <ListItemButton onClick={onClickListItem} data-index={ExportType.All}>全ての行</ListItemButton>
                    </ListItem>
                    <Divider />
                    {selectItems.includes(ExportType.Filtered) && (
                        <ListItem>
                            <ListItemButton onClick={onClickListItem} data-index={ExportType.Filtered}>フィルター適用</ListItemButton>
                        </ListItem>
                    )}
                    {selectItems.includes(ExportType.Selected) && (
                        <ListItem>
                            <ListItemButton onClick={onClickListItem} data-index={ExportType.Selected}>選択適用</ListItemButton>
                        </ListItem>
                    )}
                </List>
            </Popover>
            <Backdrop open={!!exportStatus} style={{zIndex: 3}}>
                <Box style={_styles.downloadProgress.root}>
                    <Typography>{exportStatus}</Typography>
                    <Box style={{flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <CircularProgress variant="determinate" value={downloadRate * 100} size={80} />
                        <Typography style={_styles.downloadProgress.progress.label}>{Math.floor(downloadRate * 100)}%</Typography>
                    </Box>
                    <Box>
                        <Button variant="outlined" onClick={onExportCancel}>中止</Button>
                    </Box>
                </Box>
            </Backdrop>
        </>
    )

}
MainHeaderExportExcelButton.propTypes = {
    styles: PropTypes.object
}

export default MainHeaderExportExcelButton