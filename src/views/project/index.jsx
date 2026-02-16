import PropTypes from "prop-types"
import {useCallback, useContext, useEffect, useMemo, useRef, useState} from "react"
import {Box} from "@mui/material"
import {Cancel as CloseIcon} from "@mui/icons-material"
import _ from "ansuko"
import HeaderView, {HeaderButton} from "@_views/header"
import AddressView from "./address"
import AreaView from "./area"
import FigureView from "./figure"
import CalcedView from "./calced"
import MapView from "./map"
import MapInitialView from "./mapInitial"
import {baseGradient, deleteGradient, hoverDeleteGradient} from "@_views/project/common"
import {eve} from "react-eve-hook"
import {DISPATCH_SUBMIT_RESPONSE} from "@_src/dispatcher.js"
import {useDialog} from "@_components/dialog.jsx"
import LoadingView from "@_views/loading.jsx"
import { AppDataContext, EVENT_RESET_DATA, MainDataContext, UseApiManager, UseExcel } from "@team4am/fp-core"

const styles = {
    root: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: baseGradient,
        padding: "16px 32px",
        gap: "1rem",
    },
    box: {
        display: 'flex',
        flexDirection: 'row',
        gap: '1rem',
        flexGrow: 1,
    },
    inputBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '300px'
    },
    excelProgress: {
        width: "300px",
        height: "200px",
        background: "white",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
    },
}

const ProjectView = () => {

    const { state:appState} = useContext(AppDataContext)
    const { state:mainState, setProject } = useContext(MainDataContext)
    const [data, setData] = useState()
    const abortControllerRef = useRef(null)
    const {PutFirst,PostFirst,Delete} = UseApiManager()
    const [loading, setLoading] = useState(false)
    const [excelExporting, setExcelExporting] = useState(false)
    const {openAlert, openConfirm, openInput} = useDialog()
    const {GetRows} = UseApiManager()
    const {exportExcel} = UseExcel()

    const edited = useMemo(() => {
        if (_.isEmpty(mainState.project) && !_.isEmpty(data)) { return _.cloneDeep(data) }
        if (_.isEmpty(data)) { return null }

        const keys = [
            "geojson",
            "name", "facility_name", "facility_address",
            "site_area", "co2_absorption", "sunshine_area", "evaluation_distance",
            "sfc_green_area_remaining", "sfc_green_area_planned", "rf_green_area_planned",
        ]
        const e =  Object.fromEntries(keys.map(key =>
            !_.isEqual(mainState.project[key], data[key]) ? [key, data[key]] : null
        ).filter(Boolean))
        return _.isEmpty(e) ? null : e
    }, [mainState.project, data])

    const onExcelExport = useCallback(async () => {
        setExcelExporting(true)
        if (abortControllerRef.current) {
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        const rows = await GetRows(`green_infra/export_data`, {
            uid: data.uid,
        }, {
            signal: abortControllerRef.current.signal,
        })
        if (!abortControllerRef.current) {
            return
        }

        exportExcel(rows, abortControllerRef.current.signal, `緑の指標 ${data.name ?? "名称未設定"}プロジェクト エクスポート`)
            .catch(e => {
                if (e.code === "ERR_CANCELED" || e.code === "ERR_ABORTED") {
                    openAlert("キャンセルしました")
                } else {
                    openAlert(e, {title: "エクスポートに失敗しました"})
                }
            }).finally(() => {
                setExcelExporting(false)
                abortControllerRef.current = null
            })
    }, [appState.env, data])


    const onExportCancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        setExcelExporting(false)
    }, [])

    const onSave = useCallback(() => {
        setLoading(true)
        console.log("[Project]", "on save", data, edited)
        abortControllerRef.current?.abort()
        abortControllerRef.current = new AbortController()

        if (!data.site_area) {
            edited.site_area = data.calced_site_area
        }
        if (!data.co2_absorption) {
            edited.co2_absorption = data.calced_co2_absorption
        }
        if (!data.sunshine_area) {
            edited.sunshine_area = data.calced_sunshine_area
        }
        if (!data.evaluation_distance) {
            edited.evaluation_distance = data.calced_evaluation_distance
        }

        if (data.uid) {
            PutFirst("green_infra", {...edited, uid: data.uid}, {signal: abortControllerRef.current.signal})
                .then(() => {
                    setProject(null)
                    eve(DISPATCH_SUBMIT_RESPONSE, {message: "更新しました", color: "green"})
                })
                .catch(e => {
                    openAlert(e, {title: "更新に失敗しました"})
                })
                .finally(() => setLoading(false))
        } else {
            PostFirst("green_infra", data, {signal: abortControllerRef.current.signal})
                .then(() => {
                    setProject(null)
                    eve(DISPATCH_SUBMIT_RESPONSE, {message: "登録しました", color: "green"})
                })
                .catch(e => {
                    openAlert(e, {title: "登録に失敗しました"})
                })
                .finally(() => setLoading(false))
        }
    }, [data, edited])

    const onSaveCancel = useCallback(() => {
        abortControllerRef.current?.abort()
        setLoading(false)
    }, [])

    const _onChange = useCallback(val => {
        console.log("[Project]", "new data", val)
        setData(prev => ({...prev, ...val}))
    }, [])

    const onDelete = useCallback(() => {
        openConfirm("本当に削除しますか\nこの操作は取り消せません", {
            title: "プロジェクトの削除",
            onOk: () => {
                setLoading(true)
                abortControllerRef.current = new AbortController()
                Delete("green_infra/project", {
                    uid: data.uid
                }, {
                    signal: abortControllerRef.current.signal
                }).then(() => {
                    openAlert("削除しました", {
                        onOk: () => {
                            eve(DISPATCH_SUBMIT_RESPONSE, {message: "削除しました", color: "green"})
                            setProject(null)
                        }
                    })
                }).catch(e => {
                    console.log(e.code)
                    if (e.code === "ERR_CANCELED") {
                        openAlert("キャンセルしました")
                    } else {
                        openAlert(e, {title: "保存に失敗しました"})
                    }
                }).finally(() => {
                    setLoading(false)
                })
            }
        })
    }, [data])

    const onClose = useCallback(() => {
        if (edited) {
            openConfirm("変更は破棄されます\n本当に閉じますか", {
                onOk: () => setProject(null),
            })
        } else {
            setProject(null)
        }
    }, [edited])

    const onReset = useCallback(() => {
        setData(_.cloneDeep(mainState.project) ?? {})
        eve(EVENT_RESET_DATA)
        _.waited(() => {
            eve(EVENT_RESET_DATA)
        })
    }, [mainState.project])

    const onCopyProject = useCallback(() => {
        setProject({
            ...data,
            uid: undefined,
            name: `${data.name ?? "名称未設定"}のコピー`
        })
        eve(EVENT_RESET_DATA)
    }, [data])

    useEffect(() => {
        if (!mainState.project) {
            setData(null)
            return
        }
        setData(_.cloneDeep(mainState.project) ?? {})
    }, [mainState.project]);

    useEffect(() => {
    }, [edited, mainState.project])

    if (!mainState.project?.latitude || !mainState.project?.longitude) {
        return <MapInitialView />
    }

    return (
        <Box sx={styles.root}>
            <HeaderView title="【プロジェクト設定】">
                {data?.uid && (<HeaderButton variant="contained" disabled={edited} onClick={onExcelExport} name="エクスポート" />)}
                <HeaderButton name="変更を保存" disabled={!edited} onClick={onSave} />
                <HeaderButton name="編集をリセット" disabled={!edited} onClick={onReset} />
                <HeaderButton name="削除" onClick={onDelete} sx={{
                    background: deleteGradient,
                    '&:hover': {
                        background: hoverDeleteGradient,
                    }
                }} />
                <HeaderButton name={edited ? "キャンセル" : "閉じる"} icon={<CloseIcon />} onClick={onClose} />
            </HeaderView>
            <AddressView data={data} onChange={_onChange} />
            <Box style={styles.box}>
                <Box style={styles.inputBox}>
                    <AreaView data={data} onChange={_onChange} />
                    <FigureView data={data} onChange={_onChange} />
                    <CalcedView data={data} />
                </Box>
                <MapView data={data} onChange={_onChange} />
            </Box>
            <LoadingView open={loading} message="更新中..." onCancel={onSaveCancel} zIndex={3} />
            <LoadingView open={excelExporting} message="エクスポート中..." onCancel={onExportCancel} zIndex={3} />
        </Box>
    )

}

ProjectView.propTypes = {
    onChange: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired,
}

export default ProjectView