import {Box, CircularProgress, List} from "@mui/material";
import {TabPanelBase, useDataParser} from "@_views/main/treeInfo/common.jsx";
import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import UseApiManager from "@_manager/api.js";
import {} from "@team4am/fp-core";
import { AppDataContext, useDialog, MainDataContext, UseColumnDefs } from "@team4am/fp-core"
import {useEveListen} from "react-eve-hook"
import {DispatchEvents} from "@_views/dispatch.js"
import { useFormDisplays as useFormViews } from "@team4am/fp-form"
import _ from "ansuko"

const TreeInfoDetailView = () => {

    const { state: appState } = useContext(AppDataContext)
    const { state: mainState} = useContext(MainDataContext)
    const [loading, setLoading] = useState(true)
    const [treeData, setTreeData] = useState()
    const {GetFirst} = UseApiManager()
    const {openAlert} = useDialog()
    const {dataParser} = useDataParser()
    const { getDefParameter } = UseColumnDefs("web")
    const formViews = useFormViews()

    const loadTree = useCallback(() => {
        if (!mainState.infoTree) { return }
        setLoading(true)
        GetFirst(`tree`, {uid: mainState.infoTree.uid})
            .then(dataParser)
            .then(setTreeData)
            .catch(e => {
                openAlert(e, "樹木データ読込エラー")
            })
            .finally(() => setLoading(false))
    }, [mainState.infoTree])

    const FormComponents = useMemo(() => {
        if (!appState.columnDefs || !treeData) { return null }
        return appState.columnDefs
            .filter(d => {
                const visible = getDefParameter(d, treeData, "visible", "boolean", false)
                if (!visible) { return false }
                if (d.web === true ) { return true }
                if (d.hide || d.web.hide) { return false }
                return true
            })
            .sort((v1, v2) => {
                let s1 = v1.web.sort ?? v1.ag_grid?.sort
                let s2 = v2.web.sort ?? v1.ag_grid?.sort
                if (_.isNil(s1) && _.isNil(s2)) {return 0}
                if (_.isNil(s1)) { return -1 }
                if (_.isNil(s2)) { return 1 }
                return s1 - s2
            })
            .map(def => {
                if (def.hide || def.web.hide || def.web === false || def.web?.visible === false) { return null }
                if (!_.has(formViews, def.data_type)) { return null }
                const Comp = formViews[def.data_type]
                return <Comp key={def.field} colDef={def} data={treeData} env={appState.env} />
            })
            .filter(Boolean)
    }, [appState.columnDefs, treeData, appState.env])

    useEffect(() => {
        loadTree()
    }, [mainState.infoTree]);

    useEveListen(DispatchEvents.TreeInfoOnClickReload, loadTree)

    return (
        <TabPanelBase title="詳細">
            {FormComponents && (
                <List>
                    {FormComponents}
                </List>
            )}
            {!treeData && loading && (
                <Box style={{flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Box style={{display: "flex", flexDirection: "column"}}>
                        読込中...
                        <CircularProgress />
                    </Box>
                </Box>
            )}
            {!treeData && (
                <Box style={{flexGrow: 1, display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Box>データが見つかりません</Box>
                </Box>
            )}
        </TabPanelBase>
    )
}


export default TreeInfoDetailView