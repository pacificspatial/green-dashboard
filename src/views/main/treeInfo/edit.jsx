import { Backdrop, Box, Button, CircularProgress, List, Typography } from "@mui/material"
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import UseApiManager from "@_manager/api.js"
import { UseColumnDefs, MainDataContext, AppDataContext, useDialog } from "@team4am/fp-core"
import { useFormEditors} from "@team4am/fp-form"
import { TabPanelBase, useDataParser } from "@_views/main/treeInfo/common.jsx"
import _ from "ansuko"
import { eve, useEveListen } from "react-eve-hook"
import { DispatchEvents } from "@_views/dispatch.js"

const styles = {
    buttonBox: {
        padding: '8px',
        background: '#d4d4d4',
        boxShadow: '1px -1px 3px #999999',
        display: 'flex',
        justifyContent: 'end',
        gap: '8px',
    },
}

const TreeInfoEditView = () => {

    const { state: appState } = useContext(AppDataContext)
    const { state: mainState } = useContext(MainDataContext)
    const [loading, setLoading] = useState(false)
    const initialDataRef = useRef()
    const [treeData, setTreeData] = useState()
    const { GetFirst, PutOne } = UseApiManager()
    const { openAlert } = useDialog()
    const { dataParser } = useDataParser()
    const { getDefParameter, getValue } = UseColumnDefs("web")
    const formEditors = useFormEditors()
    const [saving, setSaving] = useState(false)

    const edited = useMemo(() => {
        return Object.fromEntries(appState.columnDefs
            .filter(colDef => {
                const editable = getDefParameter(colDef, treeData, "editable", "boolean", false)
                const hide = getDefParameter(colDef, treeData, "hide", "boolean", false)
                const visible = getDefParameter(colDef, treeData, "visible", "boolean", true)
                console.log("[TreeInfoEditor]", "filter", colDef.field, visible, editable, hide)
                if (!visible || !editable || hide) { return false }
                if (colDef.web !== false) { return true }
            }).map(colDef => {
                const sourceVal = getValue(colDef, initialDataRef.current)
                const dataVal = getValue(colDef, treeData)
                return _.isEqual(sourceVal, dataVal) ? null : [colDef.field, dataVal]
            }).filter(Boolean) ?? {})
    }, [treeData, appState.columnDefs])

    const loadTree = useCallback(() => {
        if (!mainState.infoTree) { return }
        setLoading(true)
        GetFirst("tree", { uid: mainState.infoTree.uid })
            .then(dataParser)
            .then(data => {
                initialDataRef.current = _.cloneDeep(data)
                setTreeData(data);
            })
            .catch(e => {
                openAlert(e, "樹木データ読込エラー")
            })
            .finally(() => setLoading(false))
    }, [mainState.infoTree])

    const onChangeData = useCallback(val => {
        setTreeData(prev => ({ ...prev, ...val }))
    }, [])

    const _onReset = useCallback(() => {
        setTreeData({ ...initialDataRef.current })
    }, [])

    const FormComponents = useMemo(() => {
        if (!appState.columnDefs || !treeData) { return null }
        return appState.columnDefs
            .filter(colDef => {
                const editable = getDefParameter(colDef, treeData, "editable", "boolean", false)
                const hide = getDefParameter(colDef, treeData, "hide", "boolean", false)
                const visible = getDefParameter(colDef, treeData, "visible", "boolean", true)
                console.log("[TreeInfoEditor]", "filter", colDef.field, visible, editable, hide)
                if (!visible || !editable || hide) { return false }
                if (colDef.web !== false) { return true }
            })
            .sort((v1, v2) => {
                const s1 = getDefParameter(v1, treeData, "sort", "number", 0)
                const s2 = getDefParameter(v2, treeData, "sort", "number", 0)
                return s1 - s2
            })
            .map(def => {
                let Comp
                const dataType = getDefParameter(def, treeData, "data_type", "string")
                const editor = getDefParameter(def, treeData, "editor", "string")
                if (editor && _.has(formEditors, editor)) {
                    Comp = formEditors[editor]
                } else if (dataType && _.has(formEditors, dataType)) {
                    Comp = formEditors[dataType]
                }
                console.log("[TreeInfoEditor]", "comp", def.field, Comp, editor, dataType)
                if (!Comp) { return null }
                return <Comp key={def.field} colDef={def} source={initialDataRef.current} data={treeData} env={appState.env} onChange={onChangeData} />
            }).filter(Boolean)
    }, [appState.columnDefs, treeData, appState.env])

    const _onSave = useCallback(() => {
        setSaving(true)
        PutOne("tree", edited, {
            params: {
                uid: initialDataRef.current.uid,
            }
        })
            .then(() => {
                eve(DispatchEvents.TreeInfoOnClickReload)
                _.waited(() => setSaving(false), 3)
            })
    }, [edited])

    useEffect(() => {
        loadTree()
    }, [mainState.infoTree]);


    useEveListen(DispatchEvents.TreeInfoOnClickReload, loadTree)

    useEffect(() => {
        console.log("[Update]", "edit data", edited)
    }, [edited]);

    return (
        <TabPanelBase title="編集">
            {FormComponents && (
                <Box style={{ flexGrow: 1, overflowY: "auto", flexBasis: 0 }}>
                    <List>
                        {FormComponents}
                    </List>
                </Box>
            )}
            {loading && (
                <Box style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Box style={{ display: "flex", flexDirection: "column" }}>
                        読込中...
                        <CircularProgress />
                    </Box>
                </Box>
            )}
            {!loading && !treeData && (
                <Box style={{ flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Box>データが見つかりません</Box>
                </Box>
            )}
            <Box style={styles.buttonBox}>
                <Button variant="contained" disabled={_.isEmpty(edited)} onClick={_onSave}>変更を保存</Button>
                <Button variant="contained" disabled={_.isEmpty(edited)} onClick={_onReset}>変更をリセット</Button>
            </Box>
            <Backdrop open={saving}>
                <Box style={{
                    width: "200px",
                    height: "200px",
                    background: "white",
                    borderRadius: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                }}>
                    <Typography>保存中</Typography>
                    <CircularProgress />
                </Box>
            </Backdrop>
        </TabPanelBase>
    )
}

export default TreeInfoEditView