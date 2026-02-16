import {useEffect, useMemo} from "react";
import {useDialog, AppDataContext} from "@team4am/fp-core";
import _ from "ansuko";
import {Box,Button,Typography,CircularProgress} from "@mui/material";
import RootView from "@_views/index.jsx";
import AuthView from "@_views/auth.jsx";
import LoginView from "@_views/login.jsx";
import PropTypes from "prop-types";
import UseApiManager from "./manager/api.js";
import {
    FieldPointApp,
    AppError,
    AppStatus,
    useFieldPointApp,
    UseAuthManager
} from "@team4am/fp-core"

const StatusMessage = {
    [AppStatus.Loading]: "起動中...",
    [AppStatus.ConfigLoading]: "設定読み込み中...",
}
const ErrorMessage = {
    [AppError.LoginError]: "ログインに失敗しました",
    [AppError.UserLoadError]: "ユーザ情報取得に失敗しました",
    [AppError.EnvLoadError]: "設定読込に失敗しました",
    [AppError.ColumnDefsLoadError]: "設定情報読込に失敗しました",
}

const styles = {
    progress: {
        root: {
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#d5d5d5',
        },
        box: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            alignItems: 'center',
        },
        text: {

        },
        button: {

        },
        circular: {

        },
    },
}

const AppContent = () => {

    const { status, error, logout } = useFieldPointApp()
    const { openAlert } = useDialog()

    const message = useMemo(() => StatusMessage[status], [status])

    useEffect(() => {
        if (!error) { return }
        const msg = ErrorMessage[error]
        openAlert(msg ?? "不明なエラー", {onOk: logout,})
    }, [error]);

    if (_.isNil(status)) {
        return <RootView />
    }
    if (status === AppStatus.RequireLogin) {
        return <LoginView />
    }
    if (status === AppStatus.RequireAuth) {
        return <AuthView />
    }

    return <ProgressView message={message} onLogout={logout} />
}


const App = () => (
    <FieldPointApp>
        <AppContent />
    </FieldPointApp>
)

export default App

const ProgressView = ({message, error, onLogout}) => {

    const { openConfirm } = useDialog()
    const {logout} = useFieldPointApp()

    const onCancelConfirm = () => {
        openConfirm("中止すると、ログアウトします\n本当によろしいですか", {
            onOk: () => {
                localStorage.clear()
                logout()
                window.reload()
            },
        })
    }

    useEffect(() => {

    }, [error])

    return (
        <Box style={styles.progress.root}>
            <Box style={styles.progress.box}>
                <Typography style={styles.progress.text}>{message ?? "読み込み中..."}</Typography>
                <CircularProgress style={styles.progress.circular} />
                <Button variant="outlined" style={styles.progress.button} onClick={onCancelConfirm}>処理を中止</Button>
            </Box>
        </Box>
    )
}
ProgressView.propTypes = {
    message: PropTypes.string,
    error: PropTypes.string,
    onLogout: PropTypes.func,
}