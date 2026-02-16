import {Box, Button, TextField} from "@mui/material"
import {BaseTextField, commonPropTypes, SectionLabel} from "@_views/project/common.jsx"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'row',
        gap: "2rem",
    },
    box: {
        display: 'flex',
        flexDirection: 'row',
    },
    label: {
        root: {
            height: "100% !important",
        },
    },
    value: {
        flexGrow: 1,
    },
}

const ProjectSummaryAddressView = ({data, onChange}) => {

    return (
        <Box sx={styles.root}>
            <Box style={{...styles.box, width: "27%", display: "flex", flexDirection: "row"}}>
                <SectionLabel text="プロジェクト名" sx={styles.label} />
                <BaseTextField
                    sx={styles.value}
                    value={data?.name}
                    onChange={e => onChange({name: e.target.value})}
                />
            </Box>
            <Box sx={{...styles.box, width: "27%", display: "flex", flexDirection: "row"}}>
                <SectionLabel text="施設名称" sx={styles.label} />
                <BaseTextField
                    sx={styles.value}
                    value={data?.facility_name}
                    onChange={e => onChange({facility_name: e.target.value})}
                />
            </Box>
            <Box sx={{...styles.box, flexGrow: 1, display: "flex", flexDirection: "row"}}>
                <SectionLabel text="所在地" sx={styles.label} />
                <BaseTextField
                    sx={styles.value}
                    value={data?.facility_address}
                    onChange={e => onChange({facility_address: e.target.value})}
                />
            </Box>
        </Box>
    )

}

ProjectSummaryAddressView.propTypes = commonPropTypes

export default ProjectSummaryAddressView