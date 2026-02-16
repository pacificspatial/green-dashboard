import {Box,Typography,Divider} from "@mui/material"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import _ from "ansuko"
import {baseColor, commonPropTypes, NumberTextField} from "@_views/project/common.jsx"
import PropTypes from "prop-types"
import { MainDataContext} from "@team4am/fp-core"

const styles = {
    root: {

    },
    title: {
        box: {},
        text: {
            fontSize: '15px',
            fontWeight: 'bold',
        },
    },
    value: {
        box: {
            display: "flex",
            justifyContent: "end",
        },
        input: {
            width: "140px",
            '& .MuiInputBase-input': {
                textAlign: 'right',
            },
        },
    },
    calced: {
        box: {
            margin: "4px",
            display: 'flex',
            flexDirection: 'row',
        },
        text: {
            fontSize: '12px',
        },
        value: {
            fontSize: "12px",
            color: baseColor,
            margin: "0 4px",
        },
    },
    divider: {},
}

const AreaContent = ({name, data, field, unit, onChange, valueName}) => {

    const {state:mainState} = useContext(MainDataContext)
    const [value, setValue] = useState()
    const calcedValue = useMemo(() => {
        if (!_.has(data, `calced_${field}`)) { return "---" }
        const val = data[`calced_${field}`]
        return _.toNumber(val)?.toLocaleString("ja")
    }, [data, field])

    const _onChange = useCallback(() => {
        onChange({[field]: _.toNumber(value)})
    }, [value, onChange, field])

    const editedValue = useMemo(() => {
        const value1 = _.has(data, field) ? _.toNumber(data[field]) : null
        const value2 = _.has(data, `calced_${field}`) ? _.toNumber(data[`calced_${field}`]) : null
        console.log("[AreaContent]", "check user edited", field, value1, value2)
        if (!value1) { return false }
        if (!value2) { return false }
        return value1 !== value2
    }, [data, field])

    useEffect(() => {
        if (!field) { return }
        setValue(_.toNumber(data?.[field]))
    }, [data, field])

    return (
        <Box sx={styles.root}>
            <Box sx={styles.title.box}><Typography sx={styles.title.text}>{name}</Typography></Box>
            <Box sx={styles.value.box}>
                <NumberTextField
                    value={data?.[field]}
                    calced={calcedValue}
                    onChange={e => onChange({[field]: _.toNumber(e.target.value)})}
                    unit={unit}
                />
            </Box>
            <Box sx={styles.calced.box}>
                <Typography sx={styles.calced.text}>地図から計算した{valueName ?? name}は</Typography>
                <Typography sx={styles.calced.value}>{calcedValue}{unit}</Typography>
                <Typography sx={styles.calced.text}>です</Typography>
            </Box>
            <Divider sx={styles.divider} />
        </Box>
    )

}

AreaContent.propTypes = {
    ...commonPropTypes,
    name: PropTypes.string,
    field: PropTypes.string,
    unit: PropTypes.string,
    valueName: PropTypes.string,
}

export default AreaContent