import {Box, Button, IconButton, Typography} from "@mui/material";
import {Close as CloseIcon} from "@mui/icons-material"
import {useCallback, useMemo} from "react";
import {DispatchEvents} from "@_views/dispatch.js";
import { eve } from "react-eve-hook"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        box: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: '8px',
            alignItems: "center",
        },
        title: {
            fontWeight: "bold",
            fontSize: "18px",
        },
        closeButton: {

        },
        closeIcon: {
            fontSize: '28px',
        },
    },
    menu: {
        box: {
            padding: '8px',
            display: 'flex',
            flexDirection: 'row',
            gap: '8px',
        },
        button: {
            background: "#b2c193",
            color: "black",
        },
    }

}
const UserHeaderView = () => {

    const onNewUser = useCallback(() => {
        eve(DispatchEvents.UserClickOnAddNewUser)
    }, [])

    const onClose = useCallback(() => {
        eve(DispatchEvents.UserClickOnClose)
    }, [])

    return (
        <Box style={styles.root}>
            <Box style={styles.title.box}>
                <Typography style={styles.title.title}>ユーザ管理</Typography>
                <Box style={{display: "flex", flexDirection: "row", alignItems: "center", gap: "8px"}}>
                    <Button
                        style={styles.menu.button}
                        variant="contained"
                        onClick={() => eve(DispatchEvents.UserClickOnAddNewUser)}
                    >新規ユーザ登録</Button>
                    <Button
                        style={styles.menu.button}
                        variant="contained"
                        onClick={() => eve(DispatchEvents.UserClickOnImport)}
                    >インポート</Button>
                    <Button
                        style={styles.menu.button}
                        variant="contained"
                        onClick={() => eve(DispatchEvents.UserClickOnExport)}
                    >エクスポート</Button>
                    <IconButton
                        style={styles.title.closeButton}
                        onClick={() => eve(DispatchEvents.UserClickOnClose)}
                    >
                        <CloseIcon style={styles.title.closeIcon} />
                    </IconButton>
                </Box>
            </Box>
            <Box style={styles.menu.box}>
            </Box>
        </Box>
    )

}

export default UserHeaderView