import { useUploadQueue }  from "@team4am/fp-core"
import _ from "ansuko"
import {
    Box,
    Typography,
    CircularProgress,
    Divider,
    IconButton,
    Tooltip,
    Button
} from "@mui/material"
import {Rnd} from "react-rnd"
import TreeInfoView from "@_views/main/treeInfo/index.jsx"
import {useCallback, useMemo, useState} from "react"
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    WatchLater as WatchLaterIcon,
    Delete as DeleteIcon,
    DoDisturbAlt as DoDisturbAltIcon,
} from "@mui/icons-material"
import PropTypes from "prop-types"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    title: {
        box: {
            background: '#535353',
            color: 'white',
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        text: {
            fontSize: '14px',
            fontWeight: 'bold',
        },
        button: {
            close: {
                background: '#1dc0c5',
                height: '28px',
                fontSize: '10px',
                whiteSpace: 'nowrap',
                color: '#413a68',
                fontWeight: 'bold',
            }
        }
    },
    progress: {
        root: {
            flexGrow: '1',
            flexBasis: '0',
            overflowY: 'auto',
            padding: "8px 16px",
        },
        box: {
            display: "flex",
            flexDirection: 'row',
            minHeight: '33px',
        },
        icon: {
            width: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            flexGrow: '1',
        },
        waiting: {
            color: "#999",
        },
        progress: {
            color: "#66f",
        },
        response_wait: {
            color: "#6e6",
        },
        success: {
            color: "#6e6",
        },
        error: {
            color: "#e66",
        },
        delete: {
            color: "#f66",
        }
    }
}

const DocumentsUploadProgressView = () => {

    const {statuses, cancelUpload, clearAllQueue, clearFinishQueue} = useUploadQueue()
    const [dragging, setDragging] = useState(true)
    const defaultWidth = useMemo(() => 300, [])
    const defaultHeight = useMemo(() => 400, [])
    const defaultX = useMemo(() => window.innerWidth - defaultWidth - 32, [defaultWidth])
    const defaultY = useMemo(() => window.innerHeight - defaultHeight - 32, [defaultHeight])

    const isUploading = useMemo(() =>
        !_.isEmpty(Object.values(statuses ?? {}).filter(s => ["waiting","running","uploading"].includes(s.status)))
        , [statuses])
    const isFinished = useCallback(() =>
            !_.isEmpty(Object.values(statuses ?? {}).filter(s => ["done","error","cancelled"].includes(s.status)))
    , [statuses])

    const onCancelJob = useCallback(uid => {
        cancelUpload(uid)
    }, [cancelUpload])

    if (_.isEmpty(statuses)) {
        return null
    }

    return (
        <Rnd
            dragHandleClassName="upload-queue-header"
            minWidth={200}
            minHeight={200}
            bounds="window"
            onDragStart={() => setDragging(true)}
            onDragStop={() => setDragging(false)}
            default={{
                x: defaultX,
                y: defaultY,
                width: defaultWidth,
                height: defaultHeight,
            }}
            style={{
                zIndex: 8,
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #000",
                boxShadow: "1px 1px 8px #000",
                cursor: dragging ? "grabbing": "grab"
            }}
        >
            <Box style={styles.root}>
                <Box style={styles.title.box} className="upload-queue-header">
                    <Typography style={styles.title.text}>アップロード進捗</Typography>
                    <Box style={{display: "flex", flexDirection: "row", gap: "8px"}}>
                        {isUploading && (
                            <Button onClick={clearAllQueue} variant="contained" style={{height: "28px", fontSize: "10px", whiteSpace: "nowrap"}}>全てキャンセル</Button>
                        )}
                        {isUploading && isFinished && (
                            <Button onClick={clearFinishQueue} variant="contained" style={{height: "28px",fontSize: "10px", whiteSpace: "nowrap"}}>完了をクリア</Button>
                        )}
                        {!isUploading && (
                            <Button onClick={clearAllQueue} variant="contained" style={styles.title.button.close}>閉じる</Button>
                        )}
                    </Box>
                </Box>
                <Box style={styles.progress.root}>
                {Object.entries(statuses).map(([key, value]) => {
                    return (
                        <Box key={key} >
                            <Box style={styles.progress.box}>
                                <Typography style={styles.progress.title}>{value.name}</Typography>
                                <Box style={styles.progress.icon}>
                                   <ProgressIcon status={value} onCancel={() => onCancelJob(key)} />
                                </Box>
                            </Box>
                            <Divider />
                        </Box>
                    )
                })}
                </Box>
            </Box>
        </Rnd>


    )

}
export default DocumentsUploadProgressView

const ProgressIcon = ({status, onCancel}) => {

    const [cancelActive, setCancelActive] = useState(false)

    const onMouseEnter = useCallback(() => {
        if(!["done", "error", "cancelled"].includes(status.status)) {
            setCancelActive(true)
        }
    }, [status.status])

    return (
        <Box style={{display: "flex", alignItems: "center", justifyContent: "center"}} onMouseEnter={onMouseEnter} onMouseLeave={() => setCancelActive(false)}>
            {cancelActive && (
                <Box onMouseLeave={() => setCancelActive(false)}>
                    <DeleteIcon size={20} onClick={onCancel} style={styles.progress.delete} />
                </Box>
            )}
            {!cancelActive && status.status === "waiting" && (
                <Box>
                    <Tooltip title="待機中">
                        <WatchLaterIcon style={styles.progress.waiting} size={20} />
                    </Tooltip>
                </Box>
            )}
            {!cancelActive && status.status === "running" && (
                <Box>
                    <CircularProgress enableTrackSlot style={styles.progress.progress} size={20} />
                </Box>
            )}
            {!cancelActive && status.status === "uploading" && (
                <Box>
                    <CircularProgress enableTrackSlot variant="determinate" style={styles.progress.progress} size={20} value={Math.round(status.progress * 100)} />
                </Box>
            )}
            {!cancelActive && status.status === "response_wait" && (
                <Box>
                    <CircularProgress style={styles.progress.response_wait} size={20} p />
                </Box>
            )}
            {!cancelActive && status.status === "done" && (
                <CheckCircleIcon style={styles.progress.success} size={20} />
            )}
            {!cancelActive && status.status === "error" && (
                <CancelIcon style={styles.progress.error} size={20} />
            )}
            {!cancelActive && status.status === "cancelled" && (
                <DoDisturbAltIcon size={20} />
            )}
        </Box>
    )

}
ProgressIcon.propTypes = {
    status: PropTypes.object,
    onCancel: PropTypes.func,
}