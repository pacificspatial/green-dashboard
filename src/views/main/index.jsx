import { useCallback, useContext, useEffect, useMemo, useState, useRef } from "react"
import { Box, IconButton } from "@mui/material"
import { DataGrid } from "@mui/x-data-grid"
import ProjectView from "@_views/project"
import _ from "ansuko"
import dayjs from "dayjs"
import { getAuth } from "firebase/auth"
import { ExitToApp as LogoutIcon } from "@mui/icons-material"
import { useEveListen } from "react-eve-hook"
import { DISPATCH_SUBMIT_RESPONSE } from "@_src/dispatcher"
import HeaderView, { HeaderButton } from "@_views/header"
import { baseGradient } from "@_views/project/common"
import { useDialog } from "@_components/dialog.jsx"
import { Cached as ReloadIcon } from "@mui/icons-material"
import LoadingView from "@_views/loading"
import { UseExcel, UseApiManager, MainDataProvider, AppDataContext, MainDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: baseGradient,
        padding: "16px 32px",
        gap: "1rem",
    },
    grid: {
        box: {
            flexGrow: 1,
            flexBasis: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: "white",
            borderRadius: "16px",
        },
        inner: {
            margin: "16px",
            height: "100%",
            position: "relative",
        },
        grid: {
            height: "100%",
            width: "100%",
            '& .MuiDataGrid-cell': {
                cursor: 'pointer',
                userSelect: "none",
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
                outline: 'none !important',
            },
            '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
                outline: 'none !important',
            },
            "& .MuiDataGrid-columnHeaders": {
                position: "sticky",
                top: 0,
                zIndex: 2,
                border: 0,
            },
            "& .MuiDataGrid-main": {
                overflow: "auto",
            },
        },
    },
    excelProgress: {
        width: "300px",
        height: "200px",
        background: "white",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
    },
    reload: {
        button: {
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: '11',
        },
        icon: {

        }
    }
}

const MainViewComponent = () => {

    const { GetRows } = UseApiManager()
    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setProject } = useContext(MainDataContext)
    const abortControllerRef = useRef()
    const [rows, setRows] = useState()
    const [excelExporting, setExcelExporting] = useState(false)
    const { openConfirm, openAlert } = useDialog()
    const [loading, setLoading] = useState(false)
    const { exportExcel } = UseExcel()

    const columns = useMemo(() => [
        { field: "uid", headerName: "UID", width: 200 },
        { field: "name", headerName: "プロジェクト名", width: 300 },
        {
            field: "created_at_unix", headerName: "登録日", width: 200, valueGetter: value => {
                if (!value) return ""
                return dayjs.unix(value).format("YYYY/MM/DD HH:mm:ss")
            }
        },
        {
            field: "updated_at_unix", headerName: "最終更新日", width: 200, valueGetter: value => {
                if (!value) return ""
                return dayjs.unix(value).format("YYYY/MM/DD HH:mm:ss")
            }
        },
    ], [])

    const onExcelExport = useCallback(async () => {
        setExcelExporting(true)
        if (abortControllerRef.current) {
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        const rows = await GetRows("green_infra/export_data", {
        }, {
            signal: abortControllerRef.current.signal,
        })
        if (!abortControllerRef.current) {
            return
        }

        exportExcel(rows, abortControllerRef.current.signal)
            .catch(e => {
                if (e.name === "AbortError") {
                    console.log("[Excel Export] Aborted")
                    return
                }
                openAlert(e, { title: "エクスポートエラー" })
            })
            .finally(() => {
                abortControllerRef.current = null
                setExcelExporting(false)
            })
    }, [appState.env])

    const loadData = useCallback(() => {
        setLoading(true)
        GetRows("green_infra/list")
            .then(rows => {
                setRows(rows.sort((v1, v2) => v2.updated_at_unix - v1.updated_at_unix))
            })
            .catch(e => {
                openAlert(e, { title: "読込エラー" })
            })
            .finally(() => setLoading(false))
    }, [GetRows])

    const onExportCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setExcelExporting(false)
    }, [])

    const onRowClick = useCallback(val => {
        console.log(val)
        setProject(val.row)
    })

    const onLogout = useCallback(() => {
        openConfirm("本当にログアウトしますか", {
            onOk: () => {
                getAuth().signOut().then()
            }
        })
    }, [])

    useEffect(() => {
        loadData()
    }, [])

    useEveListen(DISPATCH_SUBMIT_RESPONSE, loadData)

    if (!_.isNil(mainState.project)) {
        console.log("[Project Check]", mainState.project)
        return (<ProjectView onClose={() => setProject(null)} />)
    }
    
    return (
        <Box style={styles.root}>
            <HeaderView title="【算出】">
                <HeaderButton name="エクスポート" onClick={onExcelExport} />
                <HeaderButton name="新規プロジェクト" onClick={() => setProject({})} />
                <HeaderButton name="ログアウト" icon={<LogoutIcon />} onClick={onLogout} />
            </HeaderView>
            <Box style={styles.grid.box}>
                <Box sx={styles.grid.inner}>
                    <DataGrid
                        sx={styles.grid.grid}
                        rows={rows}
                        columns={columns}
                        loading={loading}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 20
                                },
                            },
                        }}
                        onRowClick={onRowClick}
                        disableRowSelectionOnClick={true}
                        disableColumnSelector={true}
                        disableColumnMenu={true}
                    />
                    <IconButton sx={styles.reload.button} disabled={loading} onClick={loadData}><ReloadIcon sx={styles.reload.icon} /></IconButton>
                </Box>
            </Box>
            <LoadingView open={excelExporting} message="エクスポート中..." onCancel={onExportCancel} />
        </Box>
    )
}

const MainView = () => (
    <MainDataProvider>
        <MainViewComponent />
    </MainDataProvider>
)

export default MainView