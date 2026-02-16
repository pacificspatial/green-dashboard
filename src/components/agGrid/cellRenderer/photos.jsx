
import {
    Filter,
    Filter2,
    Filter3,
    Filter4,
    Filter5,
    Filter6,
    Filter7,
    Filter8,
    Filter9,
    Filter9Plus
} from "@mui/icons-material"
import {useCallback, useMemo} from "react"
import _ from "ansuko"
import {IconButton} from "@mui/material"
import {DispatchEvents} from "@_views/dispatch.js"
import {eve} from "react-eve-hook"
import {AppDataContext} from "@team4am/fp-core"

const ImageIcons = [
    Filter,
    Filter2,
    Filter3,
    Filter4,
    Filter5,
    Filter6,
    Filter7,
    Filter8,
    Filter9,
]
const OverImageIcon = Filter9Plus


const AgGridPhotosCellRenderer = (params) => {

    const Icon = useMemo(() => {
        if (_.size(params.value) > _.size(ImageIcons)) {
            return OverImageIcon
        }
        return ImageIcons[_.size(params.value) - 1]
    }, [])

    const onClick = useCallback(() => {
        eve(DispatchEvents.OnPhotoPreview, {photos:params.value, index:0})
    }, [params.value])

    if (_.isEmpty(params.value)) { return null }

    return <IconButton size="small" onClick={onClick}><Icon style={{fontSize: "18px"}}/></IconButton>

}

export default AgGridPhotosCellRenderer