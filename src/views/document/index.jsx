import {
    Box,
    Button,
    Divider,
    IconButton, ListItem, ListItemText, MenuItem, MenuList,
    Menu,
    Typography,
    Slide,
    Backdrop,
} from "@mui/material"
import {DataGrid, useGridApiRef} from "@mui/x-data-grid"
import { jaJP } from "@mui/x-data-grid/locales"
import React, {useCallback, useContext, useEffect, useMemo, useState} from "react"
import UseApiManager from "@_manager/api.js"
import HeaderView from "@_views/header/index.jsx"
import _ from "ansuko"
import "@cyntler/react-doc-viewer/dist/index.css";
import PropTypes from "prop-types"
import {
    Folder as FolderIcon,
    AudioFile as FileIcon,
    ArrowRight as ArrowRightIcon,
    Cached as CachedIcon,
    Error as InfoIcon,
} from "@mui/icons-material"
import dayjs from "dayjs"
import {useDropzone} from "react-dropzone"
import {
    useDialog,
    AppDataContext,
    EVENT_FINISH_JOB,
    useUploadQueue,
    DocumentDataContext,
    DocumentDataProvider,
} from "@team4am/fp-core"
import DirInfoView from "./dirInfo"
import {useEveListen} from "react-eve-hook"

let updateTimer = null

const styles = {
    root: {
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        position: "relative",
    },
    header: {
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0px 2px 2px 0px #bcbcbc',
            marginBottom: "8px",
            padding: '8px',
        },
        breadcrumbs: {
            box: {
                display: 'flex',
                alignItems: 'center',
            }
        },
        control: {
            root: {
                marginRight: '8px',
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
            },
            button: {

            },
        },
        readonly: {
            box: {
                background: '#636363',
                borderRadius: '8px',
                padding: '4px 8px',
                border: '1px solid #000',
            },
            text: {
                fontWeight: 'bold',
                color: "white",
            },
        }
    },
    box: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    grid: {
        root: {
            flexGrow: 1,
            position: "relative",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            width: "100%",
            minWidth: 0,
        },
        grid: {
            flexGrow: 1,
            minWidth: 0,
        },
        dropZone: {
            box: {
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: "rgba(255,255,255,0.56)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            },
            text: {

            },
        },
    },
    dirInfo: {
        root: {
            height: '100%',
            width: '400px',
            minWidth: '400px',
            borderLeft: '1px solid #000',
            boxShadow: 'inset 1px 2px 5px #333',
            padding: '1rem',
            background: '#eaeaea',
            borderTop: '1px solid #999',
            overflowY: 'auto',
        }
    }
}

const DocumentsViewContent = () => {

    const { state: docState, setPaths, setOffices, setAreas, setUsers } = useContext(DocumentDataContext)
    const { state: appState } = useContext(AppDataContext)
    const [tree, setTree] = useState()
    const { GetOne, Post, UploadFile, DeleteOne, GetRows } = UseApiManager()
    const dataGridApiRef = useGridApiRef()
    const { openAlert, openConfirm, openInput } = useDialog()
    const [dirInfo, setDirInfo] = useState()
    const [contextMenu, setContextMenu] = useState()
    const { addUploadQueue, statuses:uploadStatuses } = useUploadQueue()
    const [loading, setLoading] = useState(false)

    const current = useMemo(() => {
        if (!tree) { return null }
        let c = tree
        for(const p of docState.paths) {
            if (!p) { continue }
            c = c.children[p]
        }
        return c
    }, [tree, docState.paths])

    const loadTree = useCallback(() => {
        setLoading(true)
        _.waited(() => {
            GetOne("document/tree")
                .then(res => {
                    setTree(res)
                })
                .finally(() => setLoading(false))
        })
    }, [])

    const onDrop = useCallback(async (files) => {
        const basePath = docState.paths.join("/")
        addUploadQueue(basePath, files)
    }, [loadTree, docState.paths])

    const {getRootProps, getInputProps, isDragActive, open: openFilePicker} = useDropzone({onDrop, noClick: true, disabled: current?.user_permission === "read"})

    const onDirInfo = useCallback(row => {
        console.log(row)
    }, [])

    const onNewFolderSubmit = useCallback(name => {
        Post(['document/mkdir', ...(current?.breadcrumbs?.paths ?? [])].filter(Boolean).join("/"), {name})
            .then(loadTree)
    }, [current])

    const onNewFolder = useCallback(() => {
        openInput("新しいフォルダ", {
            message: "新しいフォルダの名前を入力してください",
            onOk: onNewFolderSubmit,
        }).open()
    }, [current])

    const openFile = useCallback((fullPath) => {
        setLoading(true)
        GetOne(`document/link/${fullPath}`)
            .then(url => window.open(url, "_blank"))
            .catch(e => {
                openAlert(e, {title: "ファイルが開けません"})
            })
            .finally(() => setLoading(false))
    }, [])

    const onCellDoubleClick = useCallback((params) => {
        if (params.row.fullPath.endsWith("/")) {
            setPaths(params.row.breadcrumbs.paths)
        }
    }, [])

    const onCellClick = useCallback((params, e) => {
        console.log(e, params)
    })

    const onContextMenu = useCallback(({row}, e) => {
        e.preventDefault()

        setContextMenu(contextMenu === null ? {
            mouseX: e.clientX + 2,
            mouseY: e.clientY - 6,
            row,
        } : null)
    })

    const columns = useMemo(() => [
        {
            headerName: "",
            width: 60,
            renderCell: params => {
                if (params.row.fullPath.endsWith("/")) { // ディレクトリ
                    return <IconButton onClick={() => setPaths(params.row.breadcrumbs.paths)}><FolderIcon /></IconButton>
                }
                return <IconButton onClick={() => openFile(params.row.fullPath)}><FileIcon /></IconButton>
            }
        },
        {
            field: "name",
            headerName: "名称",
            minWidth: 300,
            sortable: true,
            renderCell: (params) => {
                return (
                    <Box style={{width: "100%", height: "100%", display: "flex", alignItems: "center"}} onContextMenu={e => onContextMenu(params, e)}>
                        <Typography style={{fontSize: "14px"}}>{params.value}</Typography>
                    </Box>
                )
            }
        },
        {
            field: "size",
            headerName: "サイズ",
            minWidth: 100,
            align: 'right',
            sortable: true,
            valueFormatter: value => {
                if (!value) return "---"
                if (value > 1000000000) {
                    return (value / 1000000000).toFixed(1) + "GB"
                }
                if (value > 1000000) {
                    return (value / 1000000).toFixed(1) + "MB"
                }
                if (value > 1000) {
                    return Math.ceil(value / 1000) + "KB"
                }
                return value + "B"
            }
        },
        {
            field: "createdAt",
            headerName: "更新日",
            minWidth: 400,
            sortable: true,
            valueFormatter: value => {
                const d = dayjs.unix(value)
                if (d.isValid()) { return d.format("YYYY/MM/DD HH:mm:ss")}
                return "----"
            }
        }
    ], [onContextMenu, onDirInfo])

    const rows = useMemo(() => {
        if (!current?.children) return null
        const dirs = Object.values(current.children)
        dirs.forEach(v => {
            v.id = `${v.breadcrumbs?.paths?.join("/") ?? ''}/${v.fullPath}`
        })
        const files = (current.files ?? []).map(v => ({...v, id: v.fullPath}))
        const res =  [...files, ...dirs].filter(Boolean)
        console.log("[Documents]", "refresh rows", res)
        return res
    }, [current])


    const onOpenMenu = useCallback(() => {
        const fullPath = contextMenu?.row?.fullPath
        const paths = contextMenu?.row?.breadcrumbs?.paths
        setContextMenu(null)
        if (!fullPath || !paths) { return }
        if (fullPath.endsWith("/")) {
            setPaths(paths)
        } else {
            openFile(fullPath)
        }
    }, [contextMenu?.row])

    const onDeleteMenu = useCallback(() => {
        const row = _.cloneDeep(contextMenu.row)
        setContextMenu(null)
        if (row.contentType) {
            openConfirm(`${row.name}を本当に削除しますか`, {
                title: "ファイルの削除",
                onOk: () => {
                    setLoading(true)
                    DeleteOne('document/file', {
                        path: row.fullPath,
                    })
                        .then(loadTree)
                        .catch(e => {
                            openAlert(e, {title: "ファイル削除エラー"})
                        })
                        .finally(() => setLoading(false))
                }
            })
        } else {
            const existsChild = _.size(row.files) || _.size(row.children)
            openConfirm(`${row.name}を本当に削除しますか${existsChild ? '\n中のディレクトリやファイルも削除されます' : ''}`, {
                title: "フォルダの削除",
                onOk: () => {
                    setLoading(true)
                    DeleteOne('document/dir', {
                        path: row.fullPath,
                        recursive: true,
                    })
                        .then(loadTree)
                        .catch(e => {
                            openAlert(e, {title: "フォルダ削除エラー"})
                        })
                        .finally(() => setLoading(false))
                },
            })
        }
    }, [contextMenu?.row])

    const onDirInfoMenu = useCallback(() => {
        const row = _.cloneDeep(contextMenu.row)
        setContextMenu(null)
        setDirInfo(row)
    }, [contextMenu?.row])

    const onChangeDirInfo = useCallback(() => {
        setDirInfo(null)
        loadTree()
    }, [])

    useEffect(() => {
        loadTree()
    }, []);

    useEffect(() => {
        console.log("[Documents]", "tree", tree)
    }, [tree]);

    useEffect(() => {
        console.log("[UploadStatues]", "changed", uploadStatuses)
    }, [uploadStatuses])

    useEveListen(EVENT_FINISH_JOB, () => {
        clearTimeout(updateTimer)
        updateTimer = setTimeout(() => {
            loadTree()
        }, 1000)
    })

    useEffect(() => {
        if (appState.user?.permissions.includes("All")) {
            GetRows("system/offices").then(setOffices)
            GetRows("system/areas").then(setAreas)
            GetRows("user/list").then(setUsers)
        }
    }, [appState.user])

    return (
        <Box style={styles.root}>
            <HeaderView />
            <Box style={styles.box}>
                <Box style={styles.header.root}>
                    <Box style={styles.header.breadcrumbs.box}>
                        <ArrowRightIcon />
                        <Button onClick={() => setPaths([])}>集約・文書</Button>
                        {current?.breadcrumbs?.names.map((name, i)=> {
                            return (
                                <>
                                    <ArrowRightIcon />
                                    <Button
                                        key={`breadcrumbs_${i}`}
                                        onClick={() => setPaths(current.breadcrumbs.paths.slice(0, i + 1))}
                                    >{name}</Button>
                                </>
                            )
                        })}
                    </Box>
                    {current?.user_permission !== "read" && (<Box style={styles.header.control.root}>
                        <Button variant="contained" size="small" onClick={() => openFilePicker()}>ファイルアップロード</Button>
                        <Button variant="contained" size="small" onClick={onNewFolder}>フォルダ作成</Button>
                        <IconButton onClick={loadTree}><CachedIcon /></IconButton>
                    </Box>)}
                    {current?.user_permission === "read" && (<Box style={styles.header.readonly.box}><Typography style={styles.header.readonly.text}>このフォルダは閲覧のみ</Typography></Box>)}
                </Box>
                <Box style={styles.grid.root}>
                    <Box {...getRootProps()} style={{flexGrow: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0}}>
                        <input {...getInputProps()} />
                        <DataGrid
                            style={{height: '100%', width: '100%'}}
                            apiRef={dataGridApiRef}
                            columns={columns}
                            rows={rows ?? []}
                            noRowsOverlay={() => null}
                            sx={{
                                border: 0,
                                '& .MuiDataGrid-cell': {
                                    userSelect: "none",
                                },
                                '& .MuiDataGrid-virtualScrollerContent': {
                                    flexBasis: 'auto !important',
                                },
                            }}
                            onCellDoubleClick={onCellDoubleClick}
                            onCellClick={onCellClick}
                            localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
                        />
                        {isDragActive && (
                            <Box style={styles.grid.dropZone.box}>
                                <Typography style={styles.grid.dropZone.text}>ここにファイルをドロップしてアップロード</Typography>
                            </Box>
                        )}
                        {loading && (
                            <Box style={{padding: "10px 20px", border: "1px solid #000", position :"absolute", top: "50%", left: "50%", transform:"translate(-50%,-50%)", zIndex: 5, background: "white"}}>
                                <Typography>読み込み中...</Typography>
                            </Box>
                        )}
                        <Menu
                            open={contextMenu}
                            dense
                            onClose={() => setContextMenu(null)}
                            anchorReference="anchorPosition"
                            anchorPosition={
                                contextMenu ? {
                                    top: contextMenu.mouseY,
                                    left: contextMenu.mouseX,
                                }: undefined
                            }
                        >
                            {contextMenu?.row.fullPath.endsWith("/") && (<MenuItem onClick={onOpenMenu}>開く</MenuItem>)}
                            {!contextMenu?.row.fullPath.endsWith("/") && (<MenuItem onClick={onOpenMenu}>開く・ダウンロード</MenuItem>)}
                            {appState.user?.permissions?.includes("All") && contextMenu?.row.fullPath.endsWith("/") && (<MenuItem onClick={onDirInfoMenu}>フォルダ詳細・権限設定</MenuItem>)}
                            {(current?.user_permission !== "read" && contextMenu?.row.user_permission !== "read") && (<>
                                <Divider />
                                <MenuItem onClick={onDeleteMenu} style={{color: "red"}}>削除</MenuItem>
                            </>)}
                        </Menu>
                    </Box>
                    <Box style={{position: "absolute", top: 0, bottom: 0, right: 0, zIndex: 1}}>
                        <Slide direction="left" in={!!dirInfo} timeout={{enter: 300, exit: 300}}>
                            <Box style={{...styles.dirInfo.root, display: dirInfo ? "block" : "none", flexShrink: 0}}>
                                <DirInfoView data={dirInfo} onChange={onChangeDirInfo} onClose={() => setDirInfo(null)} />
                            </Box>
                        </Slide>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}



const DocumentContextMenu = React.memo(() => {

    return (
        <MenuList dense>
            <MenuItem>
                <ListItem>
                    <ListItemText>名前の変更</ListItemText>
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText>削除</ListItemText>
                </ListItem>
            </MenuItem>
        </MenuList>
    )

})
DocumentContextMenu.propTypes = {
    item: PropTypes.object,
}

const DocumentsView = () => {
    return (
        <DocumentDataProvider>
            <DocumentsViewContent />
        </DocumentDataProvider>
    )
}
export default DocumentsView