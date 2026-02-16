import { Box } from "@mui/material"
import { commonPropTypes } from "@_views/project/common.jsx"
import Content from "./content"
import { useContext, useEffect } from "react"
import * as turf from "@turf/turf"
import { MainDataContext, UseApiManager } from "@team4am/fp-core"

const styles = {
    root: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        background: '#f2f2f2',
        padding: '16px',
        borderRadius: '16px',
    },
}

const ProjectSummaryAreaView = ({ data, onChange }) => {

    const { state: mainState } = useContext(MainDataContext)
    const { PostOne, PostFirst } = UseApiManager()

    useEffect(() => {
        console.log("[Project]", "area", "polygon", data?.geojson)
        if (!data?.geojson) {
            onChange({
                calced_site_area: null,
                calced_co2_absorption: null,
                calced_sunshine_area: null,
                calced_evaluation_distance: null,
            })
            return
        }

        const calced_site_area = turf.area(data.geojson)

        Promise.all([
            PostOne("green_infra/co2_absorption", { geojson: data.geojson }),
            PostOne("green_infra/sunshine_area", { geojson: data.geojson }),
            PostFirst("green_infra/nearest_evaluation", { geojson: data.geojson }),
        ]).then(([calced_co2_absorption, calced_sunshine_area, evaluation]) => {
            const calced_evaluation_distance = evaluation?.length
            console.log("Load area data", calced_site_area, calced_co2_absorption, calced_sunshine_area, calced_evaluation_distance, onChange)
            onChange({
                calced_site_area: Math.round(calced_site_area),
                calced_co2_absorption: Math.round(calced_co2_absorption * 1000) / 1000,
                calced_sunshine_area: Math.round(calced_sunshine_area),
                calced_evaluation_distance: Math.round(calced_evaluation_distance),
            })
        }).catch(e => {
            console.error(e)
        })

    }, [
        data?.geojson,
    ])

    return (
        <Box sx={styles.root}>
            <Content
                name="敷地面積"
                data={data}
                field="site_area"
                valueName="面積"
                unit="㎡"
                onChange={onChange}
            />
            <Content
                name="CO2吸収量"
                data={data}
                field="co2_absorption"
                unit="kg/㎡"
                onChange={onChange}
            />
            <Content
                name="日照面積 [ 日照時間2時間以上 ]"
                data={data}
                valueName="日照面積"
                field="sunshine_area"
                unit="㎡"
                onChange={onChange} />
            <Content
                name="避難所・避難場所からの距離"
                data={data}
                valueName="避難所"
                unit="ｍ"
                field="evaluation_distance"
                onChange={onChange} />
        </Box>
    )

}

ProjectSummaryAreaView.propTypes = commonPropTypes

export default ProjectSummaryAreaView