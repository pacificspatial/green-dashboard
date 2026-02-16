import PropTypes from "prop-types"
import {Box, Divider, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText} from "@mui/material"
import {ArrowBack, ArrowBack as ArrowBackIcon} from "@mui/icons-material"
import {useCallback, useContext} from "react"
import {useDialog, useFieldPointApp, AppDataContext, AppMode} from "@team4am/fp-core"

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
    },
    menu: {
        list: {

        },
        listItem: {

        },
        listItemButton: {

        },
    }
}

const AppDrawerView = ({width, open, onClose}) => {

    const { state: appState, setAppMode} = useContext(AppDataContext)
    const {logout} = useFieldPointApp()
    const {openConfirm} = useDialog()

    const onLogout = useCallback(() => {
        openConfirm("本当にログアウトしますか", {onOk: logout})
    }, [logout])

    return (
        <Drawer
            open={open}
            variant="persistent"
            anchor="left"
            sx={{
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: open ? width: 0,
                    boxSizing: "border-box",
                }
            }}
        >
            <Box style={styles.root}>
                <Box style={{display: "flex", flexDirection: "row", justifyContent: "end"}}>
                    <IconButton onClick={onClose}>
                        <ArrowBackIcon />
                    </IconButton>
                </Box>
                <Divider />
                <List style={styles.menu.list}>
                    <ListItem>
                        <ListItemButton onClick={() => setAppMode(AppMode.Main)}>樹木管理</ListItemButton>
                    </ListItem>
                    <ListItem>
                        <ListItemButton onClick={() => setAppMode(AppMode.Documents)}>文書管理</ListItemButton>
                    </ListItem>
                </List>
                {/*<Box style={{flexGrow: 1}} />*/}
                {/*<List style={styles.menu.list}>*/}
                {/*    <Divider />*/}
                {/*    <ListItem>*/}
                {/*        <ListItemButton>設定</ListItemButton>*/}
                {/*    </ListItem>*/}
                {/*    <ListItem>*/}
                {/*        <ListItemButton onClick={onLogout}>ログアウト</ListItemButton>*/}
                {/*    </ListItem>*/}
                {/*</List>*/}
            </Box>
        </Drawer>
    )
}
AppDrawerView.propTypes = {
    open: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    onClose: PropTypes.func,
}

export default AppDrawerView

