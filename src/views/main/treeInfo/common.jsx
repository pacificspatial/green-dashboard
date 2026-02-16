import {Box, Divider, Typography} from "@mui/material";
import PropTypes from "prop-types";
import {useCallback, useContext} from "react";
import {AppDataContext} from "@team4am/fp-core";

export const tabStyles = {
    base: {
        root: {
            overflow: "auto",
            position: "relative",
            flexGrow: 1,
            flexBasis: 0,
            display: "flex",
            flexDirection: "column",
        },
        contents: {
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
        }
    },
    root: {

    },
    header: {
        root: {

        },
        title: {

        },
    }
}

export const TabPanelHeader = ({title, style, children}) => (
    <Box style={{...tabStyles.header.root, ...style?.header.root}}>
        <Typography style={{...tabStyles.header.title, ...style?.header.title}}>{title}</Typography>
        {children}
    </Box>
)
TabPanelHeader.propTypes = {
    title: PropTypes.string.isRequired,
    style: PropTypes.object,
    children: PropTypes.node,
}

export const TabPanelBase = ({style, children}) => {
    return (
        <Box style={{...tabStyles.base.root, ...style?.base.root}}>
            <Box style={{...tabStyles.base.contents, ...style?.base.contents}}>
                {children}
            </Box>
        </Box>
    )
}
TabPanelBase.propTypes = {
    style: PropTypes.object,
    children: PropTypes.node.isRequired,
}

export const useDataParser = () => {

    const { state:appState} = useContext(AppDataContext)

    const dataParser = useCallback(async (data) => {
        const defs = appState.columnDefs.filter(d => d.web === true || d.web?.visible)

        console.log(defs)
        return data
    }, [appState.columnDefs])

    return {
        dataParser
    }
}