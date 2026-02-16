import {Backdrop,Box,FormControl,InputLabel,OutlinedInput,Button,Typography, FormHelperText,IconButton} from "@mui/material"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {Close as CloseIcon} from "@mui/icons-material"
import {updatePassword, reauthenticateWithCredential, EmailAuthProvider, getAuth} from "firebase/auth"
import _ from "ansuko"
import PropTypes from "prop-types"
import {useDialog} from "@team4am/fp-core"
import {waitAnimated} from "@_manager/util.jsx"
import { AppDataContext } from "@team4am/fp-core"

const styles = {
    root: {
        zIndex: 6,
    },
    box: {
        position: "relative",
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        gap: '1rem',
        padding: '16px 32px',
        borderRadius: '8px',
        boxShadow: '1px 1px 8px #000',
    },
    close: {
        button: {
            position: 'absolute',
            top: '8px',
            right: '8px',
        },
        icon: {

        },
    },
    title: {
        marginBottom: "4px",
    },
    input: {
        box: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            width: '300px',
        },
        form: {

        },
        label: {
            '&.MuiInputLabel-shrink': {
                background: "white",
                padding: "0 8px",
            },
        },
        value: {

        },
    },
    buttons: {
        box: {

        },
        submit: {

        },
        cancel: {

        },
    },
    success: {
        box: {
            background: 'white',
            padding: '16px',
            border: '1px solid #000',
            borderRadius: '8px',
            boxShadow: '1px 1px 8px #000',
        },
        text: {
            fontSize: '14px',
        },
    }
}

const HeaderChangePasswordView = ({open, onClose}) => {

    const { state: appState } = useContext(AppDataContext)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [success, setSuccess] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isCurrentPasswordError, setIsCurrentPasswordError] = useState(null)
    const [isNewPasswordError, setIsNewPasswordError] = useState(null)
    const [isConfirmPasswordError, setIsConfirmPasswordError] = useState(null)
    const [isError, setIsError] = useState(null)
    const {openConfirm} = useDialog()
    const disabledSubmit = useMemo(() =>
        _.isEmpty(currentPassword)
            || _.isEmpty(newPassword)
            || _.isEmpty(confirmPassword)
            || newPassword !== confirmPassword
            || isCurrentPasswordError
            || isNewPasswordError
            || isConfirmPasswordError
    , [currentPassword, newPassword, confirmPassword, isCurrentPasswordError, isNewPasswordError, isConfirmPasswordError])


    const _onClose = useCallback(() => {
        if(loading) {
            return openConfirm("設定中です。本当に中止しますか\n新しいパスワードが反映済みの場合があります", {
                onOk: () => {
                    setLoading(false)
                    waitAnimated(() => _onClose(),1)
                },
            })
        }
        setIsCurrentPasswordError(null)
        setIsNewPasswordError(null)
        setIsConfirmPasswordError(null)
        setIsError(null)
        setNewPassword('')
        setCurrentPassword('')
        setConfirmPassword('')
        setLoading(false)
        onClose()
        waitAnimated(() => setSuccess(false),1)
    }, [loading])

    const onSubmit = useCallback(() => {
        setLoading(true)
        const user = getAuth().currentUser
        const credential = EmailAuthProvider.credential(
            user.email,
            currentPassword,
        )
        reauthenticateWithCredential(user, credential)
            .then(() => updatePassword(user, newPassword))
            .then(() => {
                setSuccess(true)
                setTimeout(_onClose, 3000)
            })
            .catch(e => {
                let currentError = null
                let newError = null
                let error = `不明なエラー(${e.code})`

                switch(e.code) {
                    case "auth/invalid-credential":
                        currentError = "パスワードが一致しません"
                        break
                    case "auth/invalid-email":
                    case "auth/invalid-confirm":
                        error = "無効なユーザです"
                        break
                    case "auth/invalid-password":
                        newError = "無効なパスワードです"
                        break
                    case "auth/wrong-password":
                        newError = "無効なパスワードです"
                        break
                    case "auth/user-not-found":
                        error = "ユーザが無効です"
                        break
                    case "auth/weak-password":
                        newError = "パスワードが簡単すぎます"
                        break
                    case "auth/too-many-requests":
                        error = "しばらく時間をおいてから再度ためしてください"
                        break
                    case "auth/network-request-failed":
                        error = "ネットワークエラー"
                        break
                    default:
                        break
                }
                if (currentError) {
                    setIsCurrentPasswordError(currentError)
                } else if (newError) {
                    setIsNewPasswordError(newError)
                } else {
                    setIsError(error)
                }
            })
            .finally(() => setLoading(false))
    }, [appState.user, currentPassword, newPassword])

    const _onCloseBackdrop = useCallback(() => {
        if (success) {
            _onClose()
        }
    }, [success])

    useEffect(() => {
        setIsCurrentPasswordError(null)
        setIsError(null)
    }, [currentPassword]);
    useEffect(() => {
        if (!_.isEmpty(newPassword)) {
            if (_.size(newPassword) < 6) {
                setIsNewPasswordError("6文字以上")
            }
            else if (!newPassword.match(/[!-\/:-@\[-`{-~0-9]/)) {
                setIsNewPasswordError("記号又は数字を1つ以上")
            }
            else {
                setIsNewPasswordError(null)
                if(!_.isEmpty(confirmPassword) && newPassword !== confirmPassword) {
                    setIsConfirmPasswordError("パスワード不一致")
                } else {
                    setIsConfirmPasswordError(null)
                }
            }
        } else {
            setIsNewPasswordError(null)
            setIsConfirmPasswordError(null)
            setIsError(null)
        }

    }, [newPassword, confirmPassword])

    return (
        <Backdrop open={open} sx={styles.root} onClick={_onCloseBackdrop}>
            {!success && (<Box sx={styles.box}>
                <IconButton sx={styles.close.button} onClick={_onClose}><CloseIcon sx={styles.close.icon} /></IconButton>
                <Typography style={styles.title}>パスワードの変更</Typography>
                <Box sx={styles.input.box}>
                    <FormControl sx={styles.input.form}>
                        <InputLabel sx={styles.input.label}>現在のパスワード</InputLabel>
                        <OutlinedInput
                            disabled={loading}
                            sx={styles.input.value}
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            error={!!isCurrentPasswordError}
                        />
                        <FormHelperText sx={styles.input.error} style={{color: "red"}}>{isCurrentPasswordError ?? " "}</FormHelperText>
                    </FormControl>
                    <FormControl sx={styles.input.form}>
                        <InputLabel sx={styles.input.label}>新しいパスワード</InputLabel>
                        <OutlinedInput
                            disabled={loading}
                            sx={styles.input.value}
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            error={!!isNewPasswordError}
                        />
                        <FormHelperText sx={styles.input.error} style={{color: "red"}}>{isNewPasswordError ?? " "}</FormHelperText>
                    </FormControl>
                    <FormControl sx={styles.input.form}>
                        <InputLabel sx={styles.input.label}>新しいパスワード再入力</InputLabel>
                        <OutlinedInput
                            disabled={loading}
                            sx={styles.input.value}
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            error={!!isConfirmPasswordError}
                        />
                        <FormHelperText style={{color: "red"}}>{isConfirmPasswordError ?? " "}</FormHelperText>
                    </FormControl>
                </Box>
                <Typography style={{color: "red"}}>{isError ?? " "}</Typography>
                <Box sx={styles.buttons.box}>
                    <Button sx={styles.buttons.submit} disabled={disabledSubmit} onClick={onSubmit}>パスワードを変更</Button>
                    <Button sx={styles.buttons.cancel} disabled={loading} onClick={_onClose}>キャンセル</Button>
                </Box>
            </Box>)}
            {success && (
                <Box sx={styles.success.box} onClick={_onClose}>
                    <Typography sx={styles.success.text}>パスワードを変更しました</Typography>
                </Box>
            )}
        </Backdrop>
    )
}
HeaderChangePasswordView.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
}

export default HeaderChangePasswordView