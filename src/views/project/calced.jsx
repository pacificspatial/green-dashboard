import {useEffect, useMemo} from "react"
import _ from "ansuko"
import {Box, Divider, Typography} from "@mui/material"
import {toNumber} from "@_manager/util"

const styles = {
    root: {
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        color: 'white',
        fontSize: '12px',
    },
    value: {
        box: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: "end",
            gap: "4px",
        },
        number: {
            color: "white",
            fontSize: '12px',
        },
        unit: {
            color: "white",
            fontSize: '12px',
        },
    },
    divider: {
        borderColor: "white",
    },
}

const ProjectCalcedView = ({data, onChange}) => {

    const calcedGreenArea = useMemo(() => {

        const sfcGreenAreaRemaining = toNumber(data?.sfc_green_area_remaining)
        const sfcGreenAreaPlanned = toNumber(data?.sfc_green_area_planned)
        const rfGreenAreaPlanned = toNumber(data?.rf_green_area_planned)

        if (!sfcGreenAreaPlanned || !sfcGreenAreaRemaining || !rfGreenAreaPlanned) { return null }
        return (sfcGreenAreaPlanned + sfcGreenAreaRemaining + rfGreenAreaPlanned).toFixed(1)
    }, [
        data?.sfc_green_area_remaining,
        data?.sfc_green_area_planned,
        data?.rf_green_area_planned
    ])

    const calcedGreenRate = useMemo(() => {
        const siteArea = toNumber(data?.site_area) ?? toNumber(data?.calced_site_area)
        if (!calcedGreenArea || !siteArea || siteArea <= 0) return null
        return (toNumber(calcedGreenArea) / siteArea * 100).toFixed(2)
    }, [
        calcedGreenArea,
        data?.site_area
    ])

    useEffect(() => {
        console.log("[ProjectCalced]", calcedGreenArea, calcedGreenRate, data)
    }, [calcedGreenArea, calcedGreenRate, data])

    return (
        <Box sx={styles.root}>
            <Box sx={styles.box}>
                <Typography sx={styles.label}>緑地面積合計 [ ②+③+④ ]</Typography>
                <Box sx={styles.value.box}>
                    <Typography sx={styles.value.number}>{calcedGreenArea?.toLocaleString() ?? "---"}</Typography>
                    <Typography sx={styles.value.unit}>㎡</Typography>
                </Box>
                <Divider sx={styles.divider} />
            </Box>
            <Box sx={styles.box}>
                <Typography sx={styles.label}>緑化率 [ (②+③+④)/① ]</Typography>
                <Box sx={styles.value.box}>
                    <Typography sx={styles.value.number}>{calcedGreenRate ?? "---"}</Typography>
                    <Typography sx={styles.value.unit}>％</Typography>
                </Box>
                <Divider sx={styles.divider} />
            </Box>
        </Box>
    )
}

export default ProjectCalcedView