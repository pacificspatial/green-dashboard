import {useContext, useMemo, useRef, useState} from "react";
import { MainDataContext, UseAuthManager, InfoTreeViewMode } from "@team4am/fp-core"
import {
    Backdrop,
    Box,
    CircularProgress,
    IconButton,
    Tabs,
    Tab,
    Typography,
    Divider,
    Drawer,
    Grow,
} from "@mui/material";
import {Rnd} from "react-rnd"
import {AppDataContext} from "@team4am/fp-core";
import DetailView from "./detail"
import EditView from "./edit"
import HeaderView from "./header"
import PropTypes from "prop-types";

const TabMode = {
    Detail: "detail",
    Map: "map",
    Edit: "edit",
    History: "history",
    Memo: "memo",
}

const TabName = {
    [TabMode.Detail]: "詳細",
    [TabMode.Map]: "地図",
    [TabMode.Edit]: "編集",
    [TabMode.History]: "履歴",
    [TabMode.Memo]: "会話メモ",
}

const TabVisible = {
    [TabMode.Detail]: true,
    [TabMode.Map]: false,
    [TabMode.Edit]: true,
    [TabMode.History]: false,
    [TabMode.Memo]: false,
}

export const TreeInfoViewFullscreen = () => {
    return (
        <Backdrop open={true} style={{zIndex: 3}}>
            <TreeInfoView style={{width: "90%", height: "90%", background: "white", borderRadius: "8px", overflow: "hidden"}} />
        </Backdrop>
    )
}

export const TreeInfoViewDialog = () => {
    const defaultWidth = useMemo(() => 800, [])
    const defaultHeight = useMemo(() => 600, [])
    const [dragging, setDragging] = useState(false)

    return (
        <Backdrop open={true} style={{zIndex: 3}}>
            <Box style={{width: "100%", height: "100%"}}>
                <Rnd
                    dragHandleClassName="tree-info-header"
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
                    <TreeInfoView  />
                </Rnd>
            </Box>
        </Backdrop>
    )
}

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    title: {
        box: {
            display: "flex",
            justifyContent: "space-between",
            padding: "0 8px",
            background: "#f0f0f0",
        },
        liner: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 8px",
            background: "#f0f0f0"
        },
        wrapped: {

        }
    }
}

const TreeInfoView = ({width, style}) => {

    const { state:appState} = useContext(AppDataContext)
    const { state:mainState, setInfoTree} = useContext(MainDataContext)
    const { hasPermission } = UseAuthManager()
    const containerRef = useRef()
    const tabs = useMemo(() => [
        TabVisible[TabMode.Detail] ? TabMode.Detail: null,
        TabVisible[TabMode.Map] ?TabMode.Map: null,
        TabVisible[TabMode.Edit] && hasPermission("data.write") ? TabMode.Edit : null,
        TabVisible[TabMode.History] ? TabMode.History : null,
        TabVisible[TabMode.Memo] ? TabMode.Memo: null,
    ].filter(Boolean), [appState.user])
    const [tab, setTab] = useState(0)
    const isLinerTitle = useMemo(() =>
        mainState.infoTreeViewMode === InfoTreeViewMode.Dialog ||
        mainState.infoTreeViewMode === InfoTreeViewMode.FullScreen
    , [mainState.infoTreeViewMode])

    return (
        <Box ref={containerRef} style={{width, ...style, ...styles.root}}>
            <HeaderView isLinear={isLinerTitle} />
            <Divider />
            <Box style={{flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden"}}>
                <Tabs value={tab} onChange={(_e, v) => setTab(v)} style={{background: "#e0e0e0"}}>
                    {tabs.map(t => <Tab key={t} label={TabName[t]} />)}
                </Tabs>
                {tabs[tab] === TabMode.Detail && <DetailView />}
                {tabs[tab] === TabMode.Edit && <EditView />}
            </Box>
        </Box>
    )
}
TreeInfoView.propTypes = {
    width: PropTypes.number,
    style: PropTypes.any,
}

export default TreeInfoView
