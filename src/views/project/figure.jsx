import {Box,Typography,InputAdornment} from "@mui/material"
import {BaseTextField, commonPropTypes, NumberTextField, SectionLabel} from "@_views/project/common.jsx"
import {useMemo} from "react"
import _ from "ansuko"
import {toNumber} from "@_manager/util"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1rem',
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    row: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        box: {
            height: '40px',
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'center',
            flexDirection: 'column',
        },
        text1: {
            marginLeft: '1rem',
            color: 'white',
            fontSize: '15px',
        },
        text2: {
            marginLeft: '1.5rem',
            color: 'white',
            fontSize: '12px'
        },
    },
    input: {
        width: "140px",
        '& .MuiInputBase-input': {
            textAlign: 'right',
        }
    },
}

const ProjectFigureView = ({data, onChange}) => {

    const siteArea = useMemo(() => toNumber(data?.site_area) ?? toNumber(data?.calced_site_area), [data])

    return (
        <Box sx={styles.root}>
            <SectionLabel text="面積入力" />
            <Box sx={styles.box}>
                <Box sx={styles.row}>
                    <Box sx={styles.label.box}><Typography sx={styles.label.text1}>①敷地面積</Typography></Box>
                    <BaseTextField
                        inputProps={{
                            inputMode: "none",
                        }}
                        sx={styles.input}
                        disabled={true}
                        value={siteArea}
                        endAdornment={<InputAdornment position="end">㎡</InputAdornment>}
                    />
                </Box>
                <Box sx={styles.row}>
                    <Box sx={styles.label.box}>
                        <Typography sx={styles.label.text1}>②緑地面積</Typography>
                        <Typography sx={styles.label.text2}>(地盤上 残留緑地)</Typography>
                    </Box>
                    <NumberTextField
                        value={data?.sfc_green_area_remaining}
                        onChange={e => onChange({sfc_green_area_remaining: e.target.value})}
                        unit="㎡"
                    />
                </Box>
                <Box sx={styles.row}>
                    <Box sx={styles.label.box}>
                        <Typography sx={styles.label.text1}>③緑地面積</Typography>
                        <Typography sx={styles.label.text2}>(地盤上 計画緑地)</Typography>
                    </Box>
                    <NumberTextField
                        value={data?.sfc_green_area_planned}
                        onChange={e => onChange({sfc_green_area_planned: e.target.value})}
                        unit="㎡"
                    />
                </Box>
                <Box sx={styles.row}>
                    <Box sx={styles.label.box}>
                        <Typography sx={styles.label.text1}>④緑地面積</Typography>
                        <Typography sx={styles.label.text2}>(屋上 計画緑地)</Typography>
                    </Box>
                    <NumberTextField
                        value={data?.rf_green_area_planned}
                        onChange={e => onChange({rf_green_area_planned: e.target.value})}
                        unit="㎡"
                    />
                </Box>
            </Box>
        </Box>
    )

}

ProjectFigureView.propTypes = commonPropTypes

export default ProjectFigureView