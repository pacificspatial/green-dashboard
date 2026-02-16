import { AgGridReact } from "ag-grid-react";
import { themeBalham } from "ag-grid-community";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useDialog, AppDataContext, LOCALE_JA, UseAuthManager, UseUserExcel } from "@team4am/fp-core"
import { UserDataContext } from "@_views/user/data/index.jsx";
import _ from "ansuko";
import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import UseApiManager from "@_manager/api.js";
import PhoneNumberEditor from "./phoneNumber"
import { DispatchEvents } from "@_views/dispatch.js";
import ColumnDefs from "./columns"
import { useEve } from "react-eve-hook";
import { toast } from "react-toastify"
import "./list.css"

// Get an instance of `PhoneNumberUtil`.

const styles = {
    root: {
        flexGrow: '1',
        display: 'flex',
        flexDirection: 'column',
    }
}


const MainUserList = () => {

    const { state: userState, setSelectedUsers } = useContext(UserDataContext)
    const { state: appState } = useContext(AppDataContext)
    const apiRef = useRef()
    const isUpdatingInternally = useRef()
    const [rowData, setRowData] = useState()
    const localeText = useMemo(() => LOCALE_JA, [])
    const headerHeight = useRef(30)
    const pagination = useMemo(() => true, [])
    const paginationAutoPageSize = useMemo(() => true, [])
    const initialData = useRef()
    const { hasPermission } = UseAuthManager()
    const { exportExcel, loadExcel } = UseUserExcel({ user: appState.user })
    const [loading, setLoading] = useState(false)

    const components = useMemo(() => ({
        phoneNumberEditor: PhoneNumberEditor,
    }), [])
    const evn = useEve()
    const selectionColumnDef = useMemo(() => ({
        sortable: false,
        resizable: false,
        width: 50,
        suppressHeaderMenuButton: true,
        pinned: "left",
    }), [])
    const { GetRows, PutRows } = UseApiManager()
    const { openConfirm, openAlert } = useDialog()

    const edited = useMemo(() => {
        const diff = rowData?.map(row => {
            const s = initialData.current.find(i => row.uid === i.uid)
            if (_.isNil(s)) { return { ...row, uid: null } }
            const d = _.omitBy(row, (v, k) => (
                _.has(s, k) && _.isEqual(s[k], v))
            )
            if (!_.isEmpty(d)) {
                return { ...d, uid: row.uid }
            }
            return null
        }).filter(Boolean)
        return diff
    }, [rowData])

    const defaultColDef = useMemo(() => ({
        floatingFilter: true,
        filter: true,
        sortable: true,
        editable: hasPermission("user.write"),
    }), [appState.user, hasPermission])

    const getRowStyle = useCallback(params => {
        if (params.data.is_delete) {
            return { background: "rgb(251,129,129)" }
        }
        return null
    }, [])

    const columnDefs = useMemo(() =>
        ColumnDefs(
            userState.permissions,
            userState.offices,
            userState.areas,
            appState.user,
        )
        , [userState.permissions, userState.offices, userState.areas, appState.user])

    const _onGridReady = useCallback(e => {
        apiRef.current = e.api
    }, [])

    const _onRowSelected = useCallback(() => {
        if (!apiRef.current || isUpdatingInternally.current) { return }
        setSelectedUsers(apiRef.current.getSelectedNodes().map(node => node.data))
    }, [])

    const _onCellValueChanged = useCallback((event) => {
        if (!apiRef.current) { return }
        const data = []
        apiRef.current.forEachNode(node => {
            data.push(node.data)
        })
        apiRef.current.redrawRows({ rowNodes: [event.node] })
        setRowData(data)
    }, [])

    const onResetColumnState = useCallback(() => {


        apiRef.current?.resetColumnState()
    }, [])

    const onLoad = useCallback(() => {
        GetRows("user/list")
            .then(res => {
                const rows = res.map(row => ({
                    ...row,
                    is_delete: false,
                    new_password: null,
                }))
                initialData.current = _.cloneDeep(rows)
                setRowData(rows)
            })
    }, [GetRows])

    const onAddNewUser = useCallback(() => {
        console.log("[List]", "received on add new user")
        let rowIndex = 0
        setRowData(prev => {
            if (_.isEmpty(_.last(prev))) {
                rowIndex = _.size(prev) - 1
                return prev
            }
            rowIndex = _.size(prev)
            return [...prev, {}]
        })
        _.waited(() => {
            if (!apiRef.current) { return }

            // ページサイズを取得
            const pageSize = apiRef.current.paginationGetPageSize()
            // 新しい行があるページを計算
            const targetPage = Math.floor(rowIndex / pageSize)

            // そのページに移動
            apiRef.current.paginationGoToPage(targetPage)
            apiRef.current.ensureIndexVisible(rowIndex)
            apiRef.current.setFocusedCell(rowIndex, 'name')
            apiRef.current.startEditingCell({
                rowIndex,
                colKey: 'name',
            })
        }, 2)
    }, [])

    const onResetRow = useCallback(() => {
        openConfirm("リセットすると現在の変更は破棄されます\n本当によろしいですか", {
            title: "リセット",
            onOk: () => {
                setRowData(initialData.current)
            }
        })
    }, [edited])

    const onSaveRow = useCallback(() => {
        setLoading(true)

        console.log("[User]", "edit save", edited)

        const counts = []
        const aCnt = _.size(edited.filter(e => _.isNil(e.uid) && !e.is_delete))
        const eCnt = _.size(edited.filter(e => !_.isNil(e.uid) && !e.is_delete))
        const dCnt = _.size(edited.filter(e => !_.isNil(e.uid) && e.is_delete))
        if (aCnt) counts.push(`追加: ${aCnt.toLocaleString()}件`)
        if (eCnt) counts.push(`変更: ${eCnt.toLocaleString()}件`)
        if (dCnt) counts.push(`削除: ${dCnt.toLocaleString()}件`)

        openConfirm(counts.join(","), {
            title: "変更の保存",
            onOk: () => {
                PutRows("user/bulk", edited)
                    .then(res => {
                        console.log("[User]", "bulk update", res)
                        toast.success("変更を保存しました")
                        onLoad()
                    })
                    .catch(e => {
                        console.error("[User]", "update error", e)
                        toast.error(`更新エラー`)
                    })
                    .finally(() => setLoading(false))
            },
            onCancel: () => {
                setLoading(false)
            }
        })




    }, [rowData, edited])

    const onExport = useCallback(() => {
        exportExcel(rowData, userState.offices, userState.areas, appState.user)
            .then()
    }, [rowData, userState.offices, userState.areas, appState.user])

    const onUploaded = useCallback(params => {
        setLoading(true)
        loadExcel(params.data, userState.offices, userState.areas, appState.user)
            .then(setRowData)
            .catch(e => {
                openAlert(e, { title: "読み込みエラー" })
            })
            .finally(() => setLoading(false))
    }, [userState.offices, userState.areas, appState.user])

    useEffect(() => {
        if (!apiRef.current) { return }
        isUpdatingInternally.current = true
        if (_.isEmpty(userState.selectedUsers)) {
            apiRef.current.deselectAll()
        } else {
            const uids = userState.selectedUsers.map(u => u.uid)
            apiRef.current.forEachNode(node => {
                node.setSelected(uids.includes(node.data.uid))
            })
        }
        _.waited(() => isUpdatingInternally.current = false, 2)
    }, [userState.selectedUsers]);

    useEffect(() => {
        evn.on(DispatchEvents.UserClickOnAddNewUser, onAddNewUser)
        evn.on(DispatchEvents.UserClickOnExport, onExport)
        evn.on(DispatchEvents.UserUploadedExcel, onUploaded)
        return () => evn.off()
    }, [rowData]);

    useEffect(() => {
        onLoad()
    }, []);

    return (
        <Box style={styles.root}>
            <Box style={{ display: "flex", flexDirection: "row", justifyContent: "end", marginBottom: "8px", gap: "16px" }}>
                {hasPermission("user.write") && (<>
                    <Button size="small" variant="contained" style={{ background: "#6ae" }} disabled={_.isEmpty(edited)} onClick={onSaveRow}>変更を保存</Button>
                    <Button size="small" variant="contained" style={{ background: "#cc3" }} disabled={_.isEmpty(edited)} onClick={onResetRow}>変更をリセット</Button>
                </>)}
                <Button size="small" onClick={onResetColumnState} variant="outlined">列初期化</Button>
            </Box>
            {columnDefs && (<AgGridReact
                theme={themeBalham}
                columnDefs={columnDefs}
                selectionColumnDef={selectionColumnDef}
                rowData={rowData}
                onGridReady={_onGridReady}
                pagination={pagination}
                paginationAutoPageSize={paginationAutoPageSize}
                onRowSelected={_onRowSelected}
                onCellValueChanged={_onCellValueChanged}
                defaultColDef={defaultColDef}
                headerHeight={headerHeight.current}
                getRowStyle={getRowStyle}
                localeText={localeText}
                components={components}
            />)}
            {!columnDefs && (
                <Box>
                    <CircularProgress />
                </Box>
            )}
            <Backdrop open={loading} style={{ zIndex: 3 }}>
                <CircularProgress />
            </Backdrop>
        </Box>
    )

}

export default MainUserList