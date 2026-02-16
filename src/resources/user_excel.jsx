import {useCallback, useMemo} from "react";
import Exceljs from "exceljs"
import dayjs from "dayjs";
import {phoneNumberToITN, phoneNumberToJP} from "@_manager/util.jsx";
import _ from "ansuko";
import stringWidth from "string-width"
import PropTypes from "prop-types"

/* この仕様は横浜市独自なので個別管理 */

const UseUserExcel = ({user}) => {

    const excelCols = useMemo(() => {
        const val = [
            {header: "UID", key: "uid", width: 20},
            {header: "名前", key: "name", width: 20},
            {header: "メールアドレス", key: "email", width: 40},
            {header: "新しいパスワード", key: "new_password", width: 20},
            {header: "電話番号", key: "phone_number", width: 16},
            {header: "事務所", key: "office_name", width: 30},
            {header: "担当エリア", key: "area_names", width: 20},
            {header: "管理権限", type: "boolean", key: "admin", width: 10},
            {header: "Web権限", type: "readwrite", key: "web", width: 10},
            {header: "アプリ権限", type: "readwrite", key: "app", width: 10},
            {header: "エクスポート権限", type: "boolean", key: "export", width: 10},
            {header: "ユーザ管理権限", type: "boolean", key: "user", width: 10},
            {header: "削除", width: 10, key: "is_delete", type: "boolean"},
        ]

        // 管理権限がないなら管理権限は付与できない
        if (!user.permissions.includes("All")) {
            const idx = val.findIndex(c => c.key === "admin")
            if (idx > -1) val.splice(idx, 1)
        }

        return val
    }, [user])

    /**
     * index(0始まり)をExcelの列文字列に変換
     * @param index {number}
     * @returns {string|string}
     */
    const getColLetter = useCallback((index) =>
        index < 0 ? '' : `${getColLetter(Math.floor(index / 26) - 1)}${String.fromCharCode(65 + (index % 26))}`
        , [])

    const exportExcel = useCallback(async (data, offices, areas) => {
        console.log("[ExportExcel]", data, offices, areas, user)

        let thinStyle = {style: 'thin'}
        const thinBorder = {
            top:thinStyle, left:thinStyle, bottom:thinStyle, right:thinStyle
        }

        const typePattern = {
            boolean: [
                "有",
                "無"
            ],
            readwrite: [
                "閲覧",
                "編集",
                "無"
            ]
        }

        let colLength = Array(_.size(excelCols)).fill(0)


        const dataRows = data.map(row => {
            if (row.office_uid) {
                const office = offices.find(o => row.office_uid === o.uid)
                row.office_name = office?.name
            }
            if (row.area_uids) {
                const areaNames = areas.filter(a => row.area_uids.includes(a.uid)).map(a => a.name)
                row.area_names = areaNames.join(",")
            }
            row.phone_number = phoneNumberToJP(row.phone_number)
            row.admin = row.permissions.includes("All") ? "有": "無"
            if (row.permissions.includes("Web:Read")) { row.web = "閲覧" }
            else if (row.permissions.includes("Web:Write")) { row.web = "編集" }
            else { row.web = "無"}
            if (row.permissions.includes("App:Read")) { row.app = "閲覧"}
            else if (row.permissions.includes("App:Write")) {row.app = "編集"}
            else { row.app = "無"}
            row.export = row.permissions.includes("Data:Export") ? "有" : "無"
            row.user = row.permissions.includes("User:Admin") ? "有" : "無"
            row.is_delete = row.is_delete ? "削除" : ""
            return row
        })

        // workbookを作成
        const workbook = new Exceljs.Workbook()
        const dataSheet = workbook.addWorksheet("ユーザ一覧")

        // 1行目 key（非表示行）
        const keyRow = dataSheet.getRow(1)
        excelCols.forEach((col, i) => {
            const cell = keyRow.getCell(i + 1)
            cell.value = col.key
            cell.width = col.width
        })
        keyRow.hidden = true

        // 2行目 列名
        const nameRow = dataSheet.getRow(2)
        excelCols.forEach((col, i) => {
            const cell = nameRow.getCell(i + 1)
            cell.value = col.header
            cell.border = thinBorder
            console.log("[Header]", col.header, stringWidth(col.header))
            colLength[i] = _.max([colLength[i], stringWidth(col.header)])

            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: 'FFE0E0E0'},
            }
        })

        // 3行目以降、データ行
        dataRows.forEach((row, i) => {
            const dRow = dataSheet.getRow(3 + i)
            excelCols.forEach((col, j) => {
                const cell = dRow.getCell(j + 1)
                cell.value = row[col.key]
                if (row[col.key]) {
                    colLength[j] = _.max([colLength[j], stringWidth(row[col.key] ?? '')])
                }
                console.log("[Data]", col.header, row[col.key], stringWidth(row[col.key] ?? ''), colLength[j])
                cell.border = thinBorder
            })
        })

        // 制約の追加
        for(const i in excelCols) {
            const col = excelCols[i]
            if (!col.type) { continue }
            const pattern = typePattern[col.type]
            if (!pattern) { continue }
            const colStr = getColLetter(i)
            dataSheet.dataValidations.add(`${colStr}3:${colStr}${_.size(dataRows) + 1}`, {
                type: 'List',
                allowBlank: true,
                formulae: [`"${pattern.join(',')}"`],
                showErrorMessage: true,
                errorStyle: 'error',
                errorTitle: '権限設定エラー',
                error: "選択から選んでください",
            })
        }

        colLength.forEach((len, i) => {
            console.log("[Col]", "width", excelCols[i].header, len)
            dataSheet.getColumn(i + 1).width = len + 4
        })

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })

        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `ユーザエクスポート-${dayjs.tz().format("YYYY-MM-DD")}.xlsx`
        link.click()

        _.waited(() => window.URL.revokeObjectURL(url),2)
    }, [])

    const loadExcel = useCallback(async(buffer, offices, areas, user) => {

        console.log(buffer, offices, areas, user)

        const workbook = new Exceljs.Workbook()
        await workbook.xlsx.load(buffer)

        let dataSheet = workbook.worksheets.find(sheet => {
            const cellValue = sheet.getCell(1,1).value
            const val = cellValue?.toString()
            return val === "uid"
        })
        if (!dataSheet) {
            throw "対象のシートが見つかりません\nシートはユーザ情報の箇所だけ変更して他は変更しないでください"
        }

        const keyRow = dataSheet.getRow(1)
        const eCols = [...excelCols.map(c => c.key)]
        const colIdx = {}
        for(let i = 0; i < 100; i++) {
            const key = keyRow.getCell(i + 1).value?.toString()
            const eIdx = eCols.findIndex(k => k === key)
            if (eIdx < 0) { continue }
            colIdx[key] = i
            eCols.splice(eIdx, 1)
            if (_.isEmpty(eCols)) { break }
        }
        if (!_.isEmpty(eCols)) {
            throw `情報が欠損しています\n列は削除しないでください\n${eCols.join(",")}`
        }

        let emptyRowCount = 0
        const rows = []
        for(let r = 3; r < 20000; r++) {
            const row = dataSheet.getRow(r)
            let isNotEmpty = false
            const data = Object.fromEntries(Object.entries(colIdx).map(([key, c]) => {
                let v = row.getCell(c + 1).value
                if (!_.isNil(v)) { isNotEmpty = true }
                if (_.isEmpty(v?.toString()?.trim())) { v = null }
                return [key, v]
            }))
            data["_lineno"] = r
            if (isNotEmpty) {
                rows.push(data)
            } else {emptyRowCount++}

            if (emptyRowCount > 100) {
                break
            }
        }

        console.log(rows)

        const res = rows
            .map(row => {
                const d = {
                    uid: null,
                    permissions: [],
                    name: null,
                    email: null,
                    new_password: null,
                    phone_number: null,
                    office_uid: null,
                    area_uids: null,
                }
                d.uid = row.uid
                // 必須項目チェック
                const email = typeof row.email === "object" ? row.email.text : row.email

                if (_.isEmpty(row.name)) { throw `${row._lineno}行目:名前は必須です`}
                if (_.isEmpty(email)) { throw `${row._lineno}行目:メールアドレスは必須です`}
                d.name = row.name
                console.log("[UserExcel]", "import email", row, row.email)
                d.email = email
                if (row.new_password) {
                    if (_.size(row.new_password) < 6) { throw `${row._lineno}行目:パスワードが短すぎます\n[${row.name}]`}
                    if (_.size(row.new_password) > 4000) { throw `${row._lineno}行目::パスワードが長すぎます\n[${row.name}]`}
                    let match = 0
                    if (row.new_password.match(/[A-Z]/)) match++
                    if (row.new_password.match(/[a-z]/)) match++
                    if (row.new_password.match(/[0-9]/)) match++
                    if (row.new_password.match(/\$*.\[]\^{}\(\)?"!@#%&\/,><':;|_~`/)) match++
                    if (match > 3) {
                        throw `${row._lineno}行目:パスワードは英字(大文字小文字),数字,記号のうち3種類を含める必要があります\n[${row.name}]`
                    }
                }
                d.new_password = row.new_password
                // 権限文字列チェック
                if (
                    (row.admin ?? "無") === "無"
                    && (row.web ?? "無") === "無"
                    && (row.app ?? "無") === "無"
                ) { throw `${row._lineno}行目:Webかアプリログインできる権限を1つ設定してください\n[${row.name}]`}
                if (row.admin) {
                    switch(row.admin) {
                        case "有":
                            d.permissions.push("All")
                            break
                        case "無":
                            break
                        default:
                            throw `${row._lineno}行目:管理権限は「無」「有」のどちらかを入れてください(空欄の場合は「無」)\n[${row.name}]`
                    }
                }
                if (row.web) {
                    switch(row.web) {
                        case "閲覧":
                            d.permissions.push("Web:Read")
                            break
                        case "編集":
                            d.permissions.push("Web:Write")
                            break
                        case "無":
                            break
                        default:
                            throw `${row._lineno}行目:Web権限は「閲覧」「編集」「無」のどちらを入れてください(空欄は「無」)\n[${row.name}]`
                    }
                }
                if (row.app) {
                    switch(row.app) {
                        case "閲覧":
                            d.permissions.push("App:Read")
                            break
                        case "編集":
                            d.permissions.push("App:Write")
                            break
                        case "無":
                            break
                        default:
                            throw `${row._lineno}行目:アプリ権限は「閲覧」「編集」「無」のどちらを入れてください(空欄は「無」)\n[${row.name}]`
                    }
                }
                if (row.export) {
                    switch(row.export) {
                        case "有":
                            d.permissions.push("Data:Export")
                            break
                        case "無":
                            break
                        default:
                            throw `${row._lineno}行目:データエクスポート権限は「無」「有」のどちらかを入れてください(空欄の場合は「無」)\n[${row.name}]`
                    }
                }
                if (row.user) {
                    switch(row.user) {
                        case "有":
                            d.permissions.push("User:Admin")
                            break
                        case "無":
                            break
                        default:
                            throw `${row._lineno}行目:ユーザ管理権限は「無」「有」のどちらかを入れてください(空欄の場合は「無」)\n[${row.name}]`
                    }
                }
                if (row.phone_number) {
                    try {
                        d.phone_number = phoneNumberToITN(row.phone_number)
                    } catch {}
                    if (!d.phone_number) {
                        throw `${row._lineno}行目:電話番号が正しく有りません\n[${row.name}]`
                    }
                }
                if (row.office_name) {
                    d.office_uid = offices.find(o => o.name === row.office_name)?.uid
                    if (!d.office_uid) {
                        throw `${row._lineno}行目:事業所名が正しくないか未登録です\n[${row.name}]`
                    }
                }
                if (row.area_names) {
                    d.area_uids = row.area_names.replaceAll("、",",").splice(",").map(n => {
                        const m = areas.find(a => a.name === n.replaceAll("　", " ").trim())
                        if (!m) {
                            throw `${row._lineno}行目:区域名が正しくないか未登録です(${n})\n[${row.name}]`
                        }
                        return m.uid
                    })
                }
                if (row.is_delete && row.delete !== "削除") {
                    throw `${row._lineno}行目:削除には「削除」とだけいれてください(${row.delete}は無効です)\n[${row.name}]`
                }
                d.is_delete= !!row.is_delete
                return d
            })

        return res
    }, [])

    return {
        exportExcel,
        loadExcel,
    }
}
UseUserExcel.propTypes = {
    user: PropTypes.object.isRequired,
}

export default UseUserExcel