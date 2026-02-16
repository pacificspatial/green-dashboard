import {
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Popover,
} from "@mui/material";
import { Layers as LayersIcon, Check as CheckIcon } from "@mui/icons-material"
import {useCallback, useContext, useMemo, useRef, useState} from "react"
import {MainMapLayerDefs, MapLayerMenuGroups} from "@_map/layers"
import _ from "ansuko";
import PropTypes from "prop-types";
import {AppDataContext} from "@team4am/fp-core"

const styles = {
    button: {
        position: 'absolute',
        zIndex: '1',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '1px 1px 8px #333',
    }
}

const LayerSelectorView = ({onChange, layers, style}) => {

    const ref = useRef()
    const {state:appState} = useContext(AppDataContext)
    const [open, setOpen] = useState(false)

    const layerDefs = useMemo(() => {
        const officeUid = appState.user?.office_uid
        if (!officeUid || !_.has(MainMapLayerDefs, officeUid)) { return MainMapLayerDefs.default}
        return MainMapLayerDefs[officeUid]
    }, [MainMapLayerDefs, appState.user])

    const layerItems = useMemo(() => {
        const groupItems = Object.keys(MapLayerMenuGroups)
            .sort((k1, k2) => MapLayerMenuGroups[k1].order - MapLayerMenuGroups[k2].order)
            .map(g => Object.keys(layerDefs)
                    .filter(k => layerDefs[k].menuGroup === g)
                    .map(k => ({...layerDefs[k], id: k}))
                    .sort((v1, v2) => (v1.menuOrder ?? v1.at) - (v2.menuOrder ?? v2.at))
            ).filter(e => !_.isEmpty(e))
        console.log("[LayerSelector]", "parse items", groupItems)
        return groupItems
    }, [layerDefs, MapLayerMenuGroups, appState.user])

    const onClose = useCallback(() => setOpen(false), [])

    const onClickLayer = useCallback((id) => {
        if (!layerDefs) { return }
        if (layers.includes(id)) {
            return onChange([...layers.filter(l => l !== id)])
        }
        const item = Object.entries(layerDefs).find(([k]) => k === id)[1]
        const group = MapLayerMenuGroups[item.menuGroup]
        if (group.multiSelect) {
            return onChange([...layers, id])
        }
        const groupKeys = Object.keys(layerDefs)
            .filter(k => layerDefs[k].menuGroup === item.menuGroup)
        const nLayers = layers.filter(l => !groupKeys.includes(l))
        return onChange([...nLayers, id])
    }, [layers, MapLayerMenuGroups, onChange, layerDefs])

    return (
        <>
            <IconButton ref={ref} style={{...style, ...styles.button}} onClick={() => setOpen(prev => !prev)}>
                <LayersIcon />
            </IconButton>
            <Popover
                anchorEl={ref.current}
                open={open}
                onClose={onClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
            >
                <List dense="dense" style={{float: "none"}}>
                    {layerItems.flatMap((items, i) => {
                        const m = []
                        items.map(item => {
                            m.push(
                                <ListItem key={item.id}>
                                    <ListItemButton onClick={() => onClickLayer(item.id)}>
                                        {layers.includes(item.id) && <ListItemIcon><CheckIcon /></ListItemIcon>}
                                        <ListItemText inset={!layers.includes(item.id)} primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            )
                        })
                        if (i !== _.size(layerItems) - 1) {
                            m.push(
                                <Divider />
                            )
                        }
                        return m
                    })}
                </List>
            </Popover>
        </>
    )
}

LayerSelectorView.propTypes = {
    layers: PropTypes.array,
    onChange: PropTypes.func,
    style: PropTypes.object,
}

export default LayerSelectorView
