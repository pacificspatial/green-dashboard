import React, {useCallback, useMemo} from "react"
import PropTypes from "prop-types"
import {AllCommunityModule, ModuleRegistry, themeBalham} from "ag-grid-community";
import {AllEnterpriseModule} from "ag-grid-enterprise";
import {AgGridReact} from "ag-grid-react"
import {Box, Typography} from "@mui/material"
import { LOCALE_JA } from "@team4am/fp-core"

ModuleRegistry.registerModules([
    AllCommunityModule,
    AllEnterpriseModule,
])
const styles = {
    root: {
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    }
}

const MainSummaryList = React.memo(({title, style, data, columnDefs, onReady}) => {

    const _styles = useMemo(() => ({...styles, ...style}), [])
    const onGridReady = useCallback(grid => {
        onReady?.(grid.api)
    }, [onReady])

    return (
        <Box style={_styles.root}>
            <Typography style={_styles.title}>{title}</Typography>
            <AgGridReact
                theme={themeBalham}
                columnDefs={columnDefs}
                rowData={data}
                onGridReady={onGridReady}
            />
        </Box>
    )

})

MainSummaryList.propTypes = {
    title: PropTypes.string,
    data: PropTypes.array,
    columnDefs: PropTypes.object,
    style: PropTypes.object,
    onReady: PropTypes.func,
}


export default MainSummaryList