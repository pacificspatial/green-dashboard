import PropTypes from "prop-types"
import {useCallback, useContext, useEffect, useMemo, useState} from "react"
import {AppDataContext} from "@team4am/fp-core"
import _ from "ansuko"
import UseApiManager from "@_manager/api.js"

const UseAsesComp = () => {

    const { state: appState } = useContext(AppDataContext)
    const { GetRows } = UseApiManager()
    const [data, setData] = useState(null)

    const columnDefs = useMemo(() => {
        const cols = [
            {headerName: "路線", field: "route"},
            {headerName: "種名", field: "name"},
        ]
        const width = 90
        appState.env.CLIENT_SUMMARY_RANK_COMP.split(",").map(v => parseInt(v)).forEach((v, i, o) => {
            console.log(v, i, o)
            const field = `rank_${String.fromCharCode(97 + i)}`
            if (i === 0) {
                return cols.push({headerName: `${v - 1}cm以下`, field, width})
            } else if ((i + 1) === _.size(o)) {
                return cols.push({headerName: `${v}cm以上`, field, width})
            }
            cols.push({headerName: `${o[i - 1]}〜${v - 1}cm`, field, width})
        })
        cols.push({headerName: "小計", field: "rank_total", width})
        return cols
    }, [appState.env])

    const loadData = useCallback(async () => {
        if (!columnDefs) { return null }

        const rows = (await GetRows("tree/comp_rank"))
        console.log(columnDefs)
        for(const row of rows) {
            columnDefs
                .filter(v => v.field.startsWith("rank_"))
                .forEach(({field}) => {
                    row[field] = row[field] ?? 0
                })
        }
        if (!rows) { return null }
        setData(rows)
    }, [columnDefs])

    useEffect(() => {
        console.log("[AsesComp]", "initial load")
        if (!columnDefs) { return }
        loadData().then()
    }, [columnDefs]);

    return {
        columnDefs,
        data,
        loadData,
    }
}

export default UseAsesComp