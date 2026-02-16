import PropTypes from "prop-types"
import {useCallback, useEffect, useMemo, useRef, useState} from "react"
import _ from "ansuko"
import {Box,Typography,IconButton,Button} from "@mui/material"
import {Close as CloseIcon} from "@mui/icons-material";
import Permission from "./permission"
import {diff} from "deep-object-diff"
import UseApiManager from "@_manager/api.js"
import {useDialog} from "@team4am/fp-core"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
    },
    row: {
        display: "flex",
        flexDirection: "row",
        gap: "8px",
    },
    label: {
        width: "100px",
    },
    value: {
        flexGrow: 1,
    },
    permissions: {
        box: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            flexGrow: 1,
        }
    },
    button: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            justifyContent: 'center',
        },
        submit: {

        },
        reset: {

        },
    }
}

const DocumentsDirInfoView = ({data, onChange, onClose}) => {

    const getFileCount = useCallback(child => {
        if (!child) { return 0 }
        return _.size(child.files) + _.sum(_.values(child.children)?.map(c => getFileCount(c)))
    }, [])
    const getDirCount = useCallback(child => {
        if (!child) { return 0 }
        return _.size(child.children) + _.sum(_.values(child.children)?.map(c => getDirCount(c)))
    })
    const fileCount = useMemo(() => getFileCount(data), [data, getFileCount])
    const dirCount = useMemo(() => getDirCount(data), [data, getDirCount])
    const originalPermissionRef = useRef()
    const [permissions, setPermissions] = useState()
    const {Post} = UseApiManager()
    const edited = useMemo(() => {
        const d = diff(originalPermissionRef.current, permissions)
        console.log("[Diff change data]", d)
        return _.isEmpty(d) ? null : d
    }, [permissions])
    const {openAlert} = useDialog()
    const [loading, setLoading] = useState(false)

    const onSave = useCallback(() => {
        setLoading(true)

        const values = {...permissions}
        values.user_uid = _.omitBy(values.user_uid, v => v === 'delete')
        values.office_uid = _.omitBy(values.office_uid, v => v === 'delete')
        values.area_uid = _.omitBy(values.area_uid, v => v === 'delete')

        Post(`document/permission/${data.fullPath}`,  values)
            .then(onChange)
            .catch(e => {
                openAlert(e, "権限登録エラー")
            })
            .finally(() => setLoading(false))
    }, [permissions])

    const onReset = useCallback(() => {
        setPermissions(originalPermissionRef.current)
    }, [])

    useEffect(() => {
        originalPermissionRef.current = data?.permission ?? {}
        setPermissions(data?.permission ?? {})
    }, [data?.permission])


    return (
        <Box style={styles.root}>
            <Box style={{position: "absolute", top: "8px", right: "8px"}}>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>
            <Box style={styles.row}>
                <Typography style={styles.label}>フォルダ数</Typography>
                <Typography style={styles.value}>{(dirCount ?? 0).toLocaleString("ja")}</Typography>
            </Box>
            <Box style={styles.row}>
                <Typography style={styles.label}>ファイル数</Typography>
                <Typography style={styles.value}>{(fileCount ?? 0).toLocaleString("ja")}</Typography>
            </Box>
            <Box style={{...styles.row, flexGrow: 1, flexBasis: 0, overflowY: "auto"}}>
                <Typography style={styles.label}>権限</Typography>
                <Box style={styles.permissions.box}>
                    <Permission title="ユーザ" data={permissions?.user_uid ?? {}} type="users" onChange={user_uid => setPermissions(prev => ({...prev, user_uid}))} />
                    <Permission title="管理エリア" data={permissions?.area_uid ?? {}} type="areas" onChange={area_uid => setPermissions(prev => ({...prev, area_uid}))} />
                    <Permission title="所属事業所" data={permissions?.office_uid ?? {}} type="offices" onChange={office_uid => setPermissions(prev => ({...prev, office_uid}))} />
                </Box>
            </Box>
            <Box style={styles.button.box}>
                <Button disabled={!edited} variant="contained" style={styles.button.submit} onClick={onSave}>変更を保存</Button>
                <Button disabled={!edited} variant="contained" style={styles.button.reset} onClick={onReset} color="secondary">変更をリセット</Button>
            </Box>
            {loading && (<Box style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 3, background: "#eee"}} />)}
        </Box>
    )

}

DocumentsDirInfoView.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
}
export default DocumentsDirInfoView