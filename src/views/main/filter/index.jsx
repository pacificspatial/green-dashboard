import {Box, IconButton, Typography} from "@mui/material"
import {useCallback, useContext, useMemo} from "react"
import _ from "ansuko"
import ButtonView from "./button"
import {DispatchEvents} from "@_views/dispatch.js";
import {eve} from "react-eve-hook";
import PropTypes from "prop-types"
import {BeatLoader} from "react-spinners"
import { AppDataContext, MainDataContext, UseAgGridManager } from "@team4am/fp-core"

const styles = {
    root: {
        width: 'calc(100% - 16px)',
        overflow: 'auto hidden',
        height: '60px',
        display: 'flex',
        alignItems: 'center'
    },
    box: {
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        margin: '8px',
    },
    label: {
        fontWeight: "bold",
        fontSize: "14px",
        whiteSpace: "nowrap",
    },
    select: {
        box: {
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
    },
    filter: {
        box: {
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
        },
        filters: {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: "8px",
        }
    }
}

const MainFilterView = ({loadingSelected}) => {

    // 使用するstateの取得
    const { state: appState } = useContext(AppDataContext)
    const { state: mainState, setSelectState, setFilterModel } = useContext(MainDataContext)

    // Aggridマネージャ
    const { getFilterComponent } = UseAgGridManager()

    // AgGridマネージャの機能を使ってfilterのコンポーネントを生成
    const filterComponents = useMemo(() => {
        if (_.isEmpty(appState.columnDefs) || _.isEmpty(mainState.filterModel)) { return [] }
        return Object.entries(mainState.filterModel).map(([field, filter]) => {
            const colDef = appState.columnDefs.find(d => d.field === field)
            if (!colDef) { return null }
            return getFilterComponent({filter, colDef, onRemove: () => onClearFilter(field)})
        })
    }, [mainState.filterModel, appState.columnDefs])

    // 樹木をクリア
    const onClearSelectedTree = useCallback(() => {
        setSelectState(null)
    }, [])

    // フィルターをクリア
    const onClearFilter = useCallback((field) => {
        setFilterModel({..._.pickBy(mainState.filterModel, (_v, f) => f !== field)})
    }, [mainState.filterModel])

    const onSelectedTreesClicked = useCallback(() => {
        eve(DispatchEvents.MainOnClickSelectTreeButton)
    }, [])

    return (
        <Box style={styles.root}>
            <Box style={styles.box}>
                {/*選択樹木の表示*/}
                {!_.isEmpty(mainState.selectedTrees) && (
                    <Box style={styles.select.box}>
                        {loadingSelected && <BeatLoader size={10} color="#99c" />}
                        {!loadingSelected && (<>
                            <Typography style={styles.label}>選択：</Typography>
                            <ButtonView onClick={onSelectedTreesClicked} color="#69e" fontColor="black" onClear={onClearSelectedTree} value={`${_.size(mainState.selectedTrees)}本の樹木を選択中`} />
                        </>)}
                    </Box>
                )}
                {/*フィルターの表示*/}
                <Box style={styles.filter.box}>
                    <Typography style={styles.label}>フィルター：</Typography>
                    {!_.isEmpty(filterComponents) && (
                    <Box style={styles.filter.filters}>
                        {filterComponents}
                    </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )

}
MainFilterView.propTypes = {
    loadingSelected:PropTypes.bool,
}

export default MainFilterView

