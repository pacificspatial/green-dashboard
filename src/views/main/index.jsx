import {Backdrop, Box, Button, ToggleButton, ToggleButtonGroup} from "@mui/material"
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import HeaderView, {StyledToggleButton, styles as headerStyles} from "../header"
import MapboxMapView from "./map/mapbox"
import CesiumMapView from "./map/cesium"
import FilterView from "./filter"
import ListView from "./list"
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import {DragHandle as DragHandleIcon,} from "@mui/icons-material"
import _ from "ansuko";
import { MainDataContext, MainDataProvider, InfoTreeViewMode, UseAuthManager } from "@team4am/fp-core"
import UserView from "@_views/user/index.jsx";
import {DispatchEvents} from "@_views/dispatch.js";
import { useEve } from "react-eve-hook";
import TreeInfoView, {TreeInfoViewDialog, TreeInfoViewFullscreen} from "@_views/main/treeInfo"
import UseApiManager from "@_manager/api.js"
import ExportExcelButton from "@_views/header/buttons/exportExcel.jsx"
import SummaryView from "./summary"


export const ViewMode = {
    Map: "map",
    List: "list",
}

export const ScreenMode = {
    Vertical: "vertical",
    Horizontal: "horizontal",
}

const MapMode = {
    Mapbox: "mapbox",
    Cesium: "cesium",
}

const styles = {
    ...headerStyles,
    root: {
        height: "100%",
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        position: "relative",
    },
    contentBox: {
        flexGrow: 1,
    },
    dragHandle: {
        fontSize: "18px",
        color: "#999",
    },
    dragHandleBox: {
        background: "#ccc",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    mapModeSelect: {
        group: {
            position: 'absolute',
            bottom: '2.5rem',
            right: '1rem',
            zIndex: 3,
            background: 'white',
        },
        button: {

        },
    }
}

const MainView = () => {
    return (
        <MainDataProvider>
            <MainViewContent />
        </MainDataProvider>
    )
}

const TreeInfoViewMode = {
    Left: "left",
    Right: "right",
    Dialog: "dialog",
    FullScreen: "fullscreen",
}

const MainViewContent = () => {

    const { state:mainState, setListHoverTree, setSelectedTrees, setFilterModel} = useContext(MainDataContext)
    const [viewMode, setViewMode] = useState([ViewMode.Map, ViewMode.List])
    const [screenMode, setScreenMode] = useState(ScreenMode.Vertical)
    const [mapMode, setMapMode] = useState(MapMode.Mapbox)
    const [openUserAdmin, setOpenUserAdmin] = useState(false)
    const [openSummary, setOpenSummary] = useState(false)
    const [loadingSelected, setLoadingSelected] = useState(false)
    const { PostRows } = UseApiManager()
    const mainRef = useRef()
    const evn = useEve()

    const { hasPermission } = UseAuthManager()

    const onMouseLeave = useCallback(() => {
        setListHoverTree(null)
    }, [])

    const updateSelectedTrees = useCallback(() => {
        if (!mainState.selectState) { setSelectedTrees([]) }
        console.log("[Main]", "update selected trees", mainState.selectState, mainState.filterModel)
        setLoadingSelected(true)
        PostRows('tree/basic', {filterModel: mainState.filterModel})
            .then(rows => {
                setSelectedTrees(rows.filter(r =>
                    mainState.selectState?.toggledNodes.includes(r.uid) !== mainState.selectState?.selectAll
                ))
            })
            .finally(() => setLoadingSelected(false))
    }, [mainState.selectState, mainState.filterModel])

    const onClearConditions = useCallback(() => setFilterModel(null), [])

    const onChangeScreenMode = useCallback((_e, v) => setScreenMode(v), [])

    const onUserAdmin = useCallback(() => setOpenUserAdmin(true), [])

    const onOpenSummary = useCallback(() => setOpenSummary(true), [])

    const onCloseSummary = useCallback(() => setOpenSummary(false) , [])

    useEffect(() => {
        evn.on(DispatchEvents.UserClickOnClose, () => setOpenUserAdmin(false))
        mainRef.current.addEventListener("mouseleave", onMouseLeave)
        window.addEventListener("mouseleave", onMouseLeave)
        return () => {
            evn.off()
            mainRef.current?.removeEventListener("mouseleave", onMouseLeave)
            window.removeEventListener("mouseleave", onMouseLeave)
        }
    }, []);

    useEffect(() => {
        console.log("[Main]", "change info tree", mainState.infoTree)
    }, [mainState.infoTree]);

    useEffect(() => {
        updateSelectedTrees()
    }, [mainState.selectState, mainState.filterModel])


    return (
        <>
            <PanelGroup style={{width: "100%", height: "100%", display: "flex", flexDirection: "row"}} direction="horizontal">
                {mainState.infoTreeViewMode === InfoTreeViewMode.Left && mainState.infoTree && <TreeInfoView width={mainState.infoTreeViewWidth} />}
                <Box style={styles.root} ref={mainRef}>
                    <HeaderView>
                        <Button
                            style={styles.menuButton}
                            variant="outlined"
                            size="small"
                            onClick={onOpenSummary}
                        >
                            集計表
                        </Button>
                        <ExportExcelButton styles={headerStyles} />
                        <Button
                            onClick={onClearConditions}
                            style={styles.menuButton}
                            variant="outlined"
                            size="small"
                            disabled={_.isEmpty(mainState.filterModel)}
                        >
                            <img alt="clear" src="/resources/img/icon_condition_clear.svg" />条件クリア
                        </Button>
                        <ToggleButtonGroup
                            value={viewMode}
                            size="small"
                            onChange={(_e, v) => setViewMode(v)}
                            style={{height: "36px"}}>
                            <ToggleButton
                                style={{
                                    ...styles.toggleBase,
                                    borderRadius: "10px 0 0 10px",
                                    padding: "0 16px",
                                    ...(viewMode.includes(ViewMode.Map) ? {background: "#7febe785"}: null)
                                }}
                                value={ViewMode.Map}
                                size="small"
                            >地図</ToggleButton>
                            <ToggleButton
                                style={{
                                    ...styles.toggleBase,
                                    borderRadius: "0 10px 10px 0",
                                    padding: "0 16px",
                                    ...(viewMode.includes(ViewMode.List) ? {background: "#7febe785"}: null)
                                }}
                                value={ViewMode.List}
                                size="small"
                            >リスト</ToggleButton>
                        </ToggleButtonGroup>
                        <ToggleButtonGroup
                            style={{opacity: _.size(viewMode) === 1 ? 0.3: 1, height: "36px"}}
                            size="small"
                            exclusive
                            onChange={onChangeScreenMode}>
                            <StyledToggleButton
                                style={{
                                    ...styles.toggleBase,
                                    borderRadius: "10px 0 0 10px",
                                    ...(screenMode === ScreenMode.Vertical ? {background: "#7febe785"} : null)
                                }}
                                value={ScreenMode.Vertical}
                                size="small">
                                <img alt="vertical" src="/resources/img/icon_screen_vertical.svg" style={{width: "24px"}} />
                            </StyledToggleButton>
                            <StyledToggleButton
                                style={{
                                    ...styles.toggleBase,
                                    borderRadius: "0 10px 10px 0",
                                    ...(screenMode === ScreenMode.Horizontal ? {background: "#7febe785"} : null)
                                }}
                                value={ScreenMode.Horizontal}
                                size="small">
                                <img alt="horizontal" src="/resources/img/icon_screen_horizontal.svg" style={{width: "24px"}} />
                            </StyledToggleButton>
                        </ToggleButtonGroup>
                        {hasPermission("user.read") && (String(import.meta.env.VITE_ACTIVE_USER_ADMIN).toLowerCase() === "true") && (
                            <Button
                                onClick={onUserAdmin}
                                style={styles.menuButton}
                                variant="outlined" size="small">
                                <img alt="user" src="/resources/img/icon_user_admin.svg" />ユーザ管理
                            </Button>
                        )}
                    </HeaderView>
                    <FilterView loadingSelected={loadingSelected} />
                    <PanelGroup style={styles.contentBox} direction={screenMode}>
                        {viewMode.includes(ViewMode.Map) && (
                            <Panel style={{position: "relative"}}>
                                {mapMode === MapMode.Mapbox && <MapboxMapView loadingSelected={loadingSelected} />}
                                {mapMode === MapMode.Cesium && <CesiumMapView loadingSelected={loadingSelected} />}
                                <ToggleButtonGroup style={styles.mapModeSelect.group} exclusive value={mapMode} onChange={(_e, v) => setMapMode(v)}>
                                    <ToggleButton value={MapMode.Mapbox} size="small" style={styles.mapModeSelect.button}>2D</ToggleButton>
                                    <ToggleButton value={MapMode.Cesium} size="small" style={styles.mapModeSelect.button}>3D</ToggleButton>
                                </ToggleButtonGroup>
                            </Panel>)
                        }
                        {_.size(viewMode) > 1 && (
                            <PanelResizeHandle
                                style={{...styles.dragHandleBox,}}>
                                <DragHandleIcon
                                    size="small"
                                    style={{
                                        ...styles.dragHandle,
                                        transform: `rotate(${screenMode === ScreenMode.Vertical ? '0deg': '90deg'})`
                                    }}
                                />
                            </PanelResizeHandle>
                        )}
                        {viewMode.includes(ViewMode.List) && (<Panel style={{position: "relative"}}><ListView /></Panel>)}
                    </PanelGroup>
                </Box>
                {mainState.infoTreeViewMode === InfoTreeViewMode.Right && mainState.infoTree && <TreeInfoView width={mainState.infoTreeViewWidth} />}
            </PanelGroup>
            <Backdrop open={openUserAdmin} style={{zIndex: 3}}>
                <UserView />
            </Backdrop>
            {mainState.infoTreeViewMode === InfoTreeViewMode.Dialog && mainState.infoTree && <TreeInfoViewDialog />}
            {mainState.infoTreeViewMode === InfoTreeViewMode.FullScreen && mainState.infoTree && (
                <TreeInfoViewFullscreen />
            )}
            <SummaryView open={openSummary} onClose={onCloseSummary} />
        </>
)


}

export default MainView