import {Backdrop, Box, Button, Typography} from "@mui/material";
import MainView from "@_views/main/index.jsx";
import DocumentsView from "@_views/document"
import { PhotoProvider} from "react-photo-view"
import "react-photo-view/dist/react-photo-view.css"
import {useCallback, useContext, useMemo, useState} from "react"
import {AppDataContext} from "@team4am/fp-core"
import {AppMode} from "@team4am/fp-core"
import DrawerView from "./drawer"
import {useEveListen} from "react-eve-hook"
import {DispatchEvents} from "@_views/dispatch.js"
import {UploadQueueProvider as DocumentUploadQueueProvider} from "@team4am/fp-core"
import UploadProgress from "./uploadProgress"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'row'
    },
    box: {
        flexGrow: 1,
        position: "relative",
    }
}

const ViewMode = {
    Main: "main",
    Documents: "documents",
}

const RootView = () => (
    <DocumentUploadQueueProvider>
        <PhotoProvider>
            <RootViewContent />
        </PhotoProvider>
    </DocumentUploadQueueProvider>
)

const RootViewContent = () => {

    const { state: appState } = useContext(AppDataContext)
    const [openDrawer, setOpenDrawer] = useState(false)
    const drawerWidth = useMemo(() => 240, [])

    const onCloseDrawer = useCallback(() => setOpenDrawer(false) , [])

    useEveListen(DispatchEvents.MainToggleDrawer, () => setOpenDrawer(prev => !prev))

    return (
        <Box style={styles.root}>
            <DrawerView width={drawerWidth} open={openDrawer} onClose={onCloseDrawer} />
            <Box
                style={styles.box}
                sx={{
                    transition: (theme) => theme.transitions.create("margin", {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    marginLeft: 0,
                    ...(openDrawer && {
                        transition: (theme) => theme.transitions.create("margin", {
                            easing: theme.transitions.easing.easeOut,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                            marginLeft: `${drawerWidth}px`
                    }
                    )
                }}
            >
                {appState.appMode === AppMode.Main ? <MainView /> : null}
                {appState.appMode === AppMode.Documents ? <DocumentsView /> : null}
            </Box>
            <UploadProgress />
        </Box>
    )

}

export default RootView
