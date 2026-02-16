import {Box, Button, IconButton, Typography} from "@mui/material"
import {AgGridReact} from "ag-grid-react";
import {AllCommunityModule, ModuleRegistry, themeBalham} from "ag-grid-community";
import {AllEnterpriseModule} from "ag-grid-enterprise";
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {Cached as CachedIcon, OpenInNew as OpenInNewIcon} from "@mui/icons-material"
import _ from "ansuko";
import {AppDataContext} from "@team4am/fp-core"
import UseApiManager from "@_manager/api.js";
import photosCellRenderer from "@_components/agGrid/cellRenderer/photos"
import HeaderView from "./header.jsx"
import { MainDataContext, UseAgGridManager, LOCALE_JA } from "@team4am/fp-core"
import {useEveListen} from "react-eve-hook"
import {DispatchEvents} from "@_views/dispatch.js"


ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
])

const styles = {
    root: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
    },
}

const MainListView = () => {

    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setFilterModel, setColumnState, setSelectedTrees, setInfoTree, setListHoverTree, setSelectState } = useContext(MainDataContext)
    const {PostRows, PostOne} = UseApiManager()
    const rootRef = useRef()
    const apiRef = useRef()
    const isUpdatingInternally = useRef(false) // 内部更新フラグ
    const [initialized, setInitialized] = useState()
    const { parseColumnDefs } = UseAgGridManager()
    const headerHeight = useMemo(() => 20, [])
    const localeText = useMemo(() => LOCALE_JA, [])
    const rowModelType = useMemo(() => "serverSide", [])
    const cellSelection = useMemo(() => false, [])
    const rowSelection = useMemo(() => ({mode: "multiRow", headerCheckbox: true}), [])
    const overlayLoadingTemplate = useMemo(() => '<span className="ag-overlay-loading-center">読込中...</span>', [])
    const [loadCount, setLoadCount] = useState(null)
    const [loading, setLoading] = useState(true)
    const [allCount, setAllCount] = useState()
    const components = useMemo(() => ({
        photosCellRenderer
    }), [])

    const sideBar = useMemo(() => ({
        toolPanels: [
            {
                id: "columns",
                labelDefault: "列選択",
                labelKey: "columns",
                iconKey: "columns",
                toolPanel: "agColumnsToolPanel",
                toolPanelParams: {
                    suppressRowGroups: true,
                    suppressValues: true,
                    suppressPivots: true,
                    suppressPivotMode: true,
                    suppressColumnFilter: true,
                    suppressColumnSelectAll: true,
                    suppressColumnExpandAll: true,
                },
            },
        ],
    }), [])

    const getRows = useCallback((req) => {
        setLoading(true)

        if (_.isNil(allCount)) {
            PostOne('sql', {q: `SELECT COUNT(1) FROM ${appState.env.CLIENT_VIEWS_TREE}`})
                .then(v => setAllCount(parseInt(v)))
        }

        PostRows("tree/grid", {...req.request}, {withCount: true})
            .then(([rowData, rowCount]) => {
                setLoading(false)
                if (rowCount === 0) {
                    req.success({
                        rowData: [],
                        rowCount: 0,
                    })
                } else {
                    setLoadCount(parseInt(rowCount))
                    req.success({
                        rowData,
                        rowCount,
                    })
                }
            })
            .catch(e => {
                console.error(e)
                req.fail(e)
            })
    }, [appState.env, allCount])
    const serverSideDatasource = useMemo(() => {
        return {getRows}
    }, [getRows])

    const onClickDetail = useCallback((params) => {
        setInfoTree(params.data)
    }, [])

    const detailCellRenderer = useCallback((params) => {
        if (!params.data) { return null }
        return (
            <IconButton onClick={() => onClickDetail(params)}>
                <OpenInNewIcon style={{fontSize: "14px"}} />
            </IconButton>
        )
    }, [])

    const columnDefs = useMemo(() => {
        if (!appState.columnDefs) { return }
        return [
            {
                width: 66,
                cellRenderer: detailCellRenderer,
            },
            ...parseColumnDefs(appState.columnDefs)
        ]
    }, [appState.columnDefs])

    const defaultColDef = useMemo(() => {
        return {
            floatingFilter: true,
            sortable: true,
        }
    }, [])

    const onResetColumnState = useCallback(() => {
        apiRef.current.resetColumnState()
    }, [])

    const _onGridReady = useCallback(grid => {
        apiRef.current = grid.api
        _.waited(() => setInitialized(true) )        
    }, [getRows])

    const _onFilterChanged = useCallback(() => {
        if (!apiRef.current || isUpdatingInternally.current) { return }
        setFilterModel(apiRef.current.getFilterModel())
    }, [setFilterModel])

    const _onColumnStateChanged = useCallback(() => {
        if (!apiRef.current || isUpdatingInternally.current) { return }
        setColumnState(apiRef.current.getColumnState())
    }, [setColumnState])

    const _onRowSelected = useCallback(() => {
        if (!apiRef.current || isUpdatingInternally.current) { return }
        setSelectState(apiRef.current.getServerSideSelectionState())
    }, [setSelectedTrees])

    const _onCellMouseOver = useCallback(_.debounce(e => {
        setListHoverTree(e.data)
    }, 100), [])

    const _onCellMouseOut = useCallback(_.debounce(e => {
        if (e.data.uid === mainState.listHoverTree?.uid) {
            setListHoverTree(null)
        }
    }, 100), [mainState.listHoverTree])

    const onDeselectAll = useCallback(() => {
        apiRef.current.deselectAll()
    }, [])

    const onRefreshAll = useCallback(() => {
        setAllCount(null)
        apiRef.current.refreshServerSide({purge: true})
    }, [])

    const onMouseLeave = useCallback(() => {
        setListHoverTree(null)
    }, [])


    useEveListen(DispatchEvents.MainMapRefreshTreeLayer, onRefreshAll)

    const getRowId = param => param.data?.uid

    useEffect(() => {
        if (!initialized || !apiRef.current) { return }
        isUpdatingInternally.current = true
        if (_.isEmpty(mainState.selectState)) {
            apiRef.current.deselectAll()
        } else {
            apiRef.current.forEachNode(node => {
                node.setSelected(mainState.selectState.toggledNodes.includes(node.data?.uid) !== mainState.selectState.selectAll)
            })
        }
        _.waited(() => isUpdatingInternally.current = false , 2)
    }, [initialized, mainState.selectState])

    useEffect(() => {
        if (!initialized || !apiRef.current) { return }
        isUpdatingInternally.current = true
        if (!_.isNil(mainState.filterModel)) {
            apiRef.current.setFilterModel(mainState.filterModel)
        } else {
            apiRef.current.setFilterModel(null)
        }
        _.waited(() => isUpdatingInternally.current = false, 2)
    }, [initialized, mainState.filterModel]);

    useEffect(() => {
        if (!initialized || !apiRef.current) { return }
        isUpdatingInternally.current = true
        if (!_.isNil(mainState.columnState)) {
            apiRef.current.applyColumnState(mainState.columnState)
        } else {
            apiRef.current.resetColumnState()
        }
        _.waited(() => isUpdatingInternally.current = false, 2)        
    }, [initialized, mainState.columnState])

    useEffect(() => { // 外部からはクリアしかない
        if (!initialized || !_.isEmpty(mainState.selectedRows)) { return }
        isUpdatingInternally.current = true
        apiRef.current.deselectAll()
        _.waited(() => isUpdatingInternally.current = false, 2)
    }, [initialized, mainState.selectedRows]);

    useEffect(() => {
        if (!rootRef.current) { return }

        rootRef.current.addEventListener("mouseleave", onMouseLeave)
        return () => {
            rootRef.current?.removeEventListener("mouseleave", onMouseLeave)
        }
    }, [])

    return (
        <Box style={styles.root} ref={rootRef}>
            <HeaderView
                loading={loading}
                allCount={allCount}
                loadCount={loadCount}
                onResetColumnState={onResetColumnState}
                onDeselectAll={onDeselectAll}
                onReload={onRefreshAll}
            />
            <AgGridReact
                theme={themeBalham}
                columnDefs={columnDefs}
                onGridReady={_onGridReady}
                onFilterChanged={_onFilterChanged}
                onSortChanged={_onColumnStateChanged}
                onColumnResized={_onColumnStateChanged}
                onColumnVisible={_onColumnStateChanged}
                onColumnMoved={_onColumnStateChanged}
                onRowSelected={_onRowSelected}
                onCellMouseOver={_onCellMouseOver}
                onCellMouseOut={_onCellMouseOut}
                defaultColDef={defaultColDef}
                headerHeight={headerHeight}
                localeText={localeText}
                rowModelType={rowModelType}
                serverSideDatasource={serverSideDatasource}
                getRowId={getRowId}
                overlayLoadingTemplate={overlayLoadingTemplate}
                cellSelection={cellSelection}
                rowSelection={rowSelection}
                sideBar={sideBar}
                components={components}
            />
        </Box>
    )
}

export default MainListView