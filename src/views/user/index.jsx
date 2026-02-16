import {Backdrop, Box, Button, CircularProgress, Divider, IconButton, Typography} from "@mui/material";
import {AgGridReact} from "ag-grid-react";
import {UserDataContext, UserDataProvider} from "@_views/user/data/index.jsx";
import HeaderView from "./header"
import ListView from "./list"
import { Resizable } from "re-resizable";
import {useCallback, useContext, useEffect, useState} from "react";
import UseApiManager from "@_manager/api.js";
import {useDropzone} from "react-dropzone";
import {Close as CloseIcon} from "@mui/icons-material"
import {eve, useEve} from "react-eve-hook";
import {DispatchEvents} from "@_views/dispatch.js";
import _ from "ansuko";
import {useDialog} from "@team4am/fp-core";

const styles = {
    root: {
        background: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '1px 1px 8px #000',
        position: "relative",
    },
    contentBox: {
        display: 'flex',
        flexDirection: 'column',
        margin: "8px",
        width: "calc(100% - 16px)",
        height: "calc(100% - 16px)",
        gap: "8px",
    },
    drop: {
        root: {
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: '#ffffff87',
            zIndex: '3',
            display: 'flex',
            flexDirection: 'column',
        },
        closeButton: {
            background: 'white',
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translate(-50%)',
            color: '#f34c4c',
            borderColor: '#f00',
        },
        label: {
            box: {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                boxShadow: '1px 1px 8px #333',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
            },
            text1: {
                fontSize: "14px",
                color: "black",
            },
            text2: {
                marginTop: "4px",
                fontSize: "12px",
                color: "#333",
            },
        },
    }
}


const UserViewContent = () => {

    const { state: userState, setPermissions, setOffices, setAreas } = useContext(UserDataContext)
    const { GetRows } = UseApiManager()
    const [importMode, setImportMode] = useState(false)
    const evn = useEve()
    const { openAlert} = useDialog()

    const onDrop = useCallback(acceptedFiles => {
        setImportMode(false)
        if (_.size(acceptedFiles) > 1) {
            return openAlert("アップロードするファイルは1つだけです", {title: "アップロードエラー"})
        }
        const file = _.first(acceptedFiles)
        if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
            return openAlert("アップロードできるはExcelファイル(xlsx)のみです", {title: "アップロードエラー"})
        }
        if (file.size < 1000) {
            return openAlert("アップロードされたファイルは正しくないです", {title: "アップロードエラー"})
        }

        const reader = new FileReader()
        reader.onabort = () => openAlert("読み込みに失敗しました", {title: "アップロードエラー"})
        reader.onerror = e => openAlert(`読み込みエラー ${e.message}`, {title: "アップロードエラー"})
        reader.onload = () => {
            eve(DispatchEvents.UserUploadedExcel, {data: reader.result})
        }
        reader.readAsArrayBuffer(file)

    }, [])

    const { getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
    })

    useEffect(() => {
        GetRows("system/permissions").then(setPermissions)
        GetRows("system/offices", {"geom": false}).then(setOffices)
        GetRows("system/areas", {"geom": false}).then(setAreas)
    }, []);


    useEffect(() => {
        evn.on(DispatchEvents.UserClickOnImport, () => {
            console.log("import")
            setImportMode(true)
        })
    }, [])

    if (!userState.permissions) {
        return <CircularProgress />
    }

    return (
        <Resizable defaultSize={{position: "relative", width: "800px", height: "600px"}} style={styles.root}>
            <Box style={styles.contentBox}>
                <HeaderView />
                <Divider />
                <ListView />
            </Box>
            {importMode && (
                <Box
                    {...getRootProps()}
                    style={styles.drop.root}
                >
                    <input {...getInputProps()} />
                    {
                        isDragActive ? (
                            <Box style={styles.drop.label.box}>
                                <Typography style={styles.drop.label.text1}>ここにファイルをドロップ</Typography>
                            </Box>
                        ) : (
                            <Box style={styles.drop.label.box}>
                                <Typography style={styles.drop.label.text1}>ここにファイルをドロップするか、<br />クリックしてファイルを選択してください</Typography>
                                <Typography style={styles.drop.label.text2}>アップロードするファイルは、事前にエクスポートしたファイルのみ有効です。<br />他のファイルをアップロードした場合正しく動作しなかったりユーザ情報が破損するおそれがあります</Typography>
                            </Box>
                        )
                    }
                    <Button style={styles.drop.closeButton} variant="outlined">アップロード中止</Button>
                </Box>
            )}
        </Resizable>
    )
}


const UserView = () => (
    <UserDataProvider>
        <UserViewContent />
    </UserDataProvider>
)

export default UserView