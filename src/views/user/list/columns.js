import React from "react"
import _ from "ansuko";
import {AsYouType} from "libphonenumber-js";
import PropTypes from "prop-types";

const reservedKeys = ["id", "grant", "name", "group", "groupName", "level", "description"]


const UserListColumNDefs = (permissions, offices, areas, user) => {
    if (!permissions || !offices || !areas) { return null }

    const includePermission = (id, params) => {
        if (_.isEmpty(permissions)) { return false }
        const currentKeys = permissions.filter(p => params.data.permissions?.includes(p.id)).map(p =>
            _.pickBy(p, (v, k) => Boolean(v) && !reservedKeys.includes(k))
        ).reduce((acc, cur) =>
                _.mergeWith(acc, cur, (a, b) => {
                    if (a === true || b === true) { return true }
                    if (a === "read" || b === "read") { return "read"}
                    return false
                })
            , {})

        const targetKeys = _.pickBy(permissions.find(p => p.id === id), (v, k) => Boolean(v) && !reservedKeys.includes(k))
        for(const key of Object.keys(targetKeys)) {
            const t = targetKeys[key]
            const c = currentKeys[key]
            if (!c) { return false }
            if (t === true && c === "read") { return false }
        }
        return true
    }

    const disablePermission = (id, params) => {
        if (!includePermission(id, params)) { return false }
        return !params.data.permissions?.includes(id)
    }

    const togglePermissionCheck = (id, params) => {
        if (params.data.permissions?.includes(id)) {
            params.data.permissions = params.data.permissions?.filter(p => p !== id) ?? []
        } else if(!_.isNil(params.data.permissions)) {
            params.data.permissions.push(id)
        } else {
            params.data.permissions = [id]
        }
        return true
    }

    const getOfficeName = (params) => {
        if (_.isEmpty(offices)) { return null }
        return offices.find(o => o.uid === params.value)?.name
    }

    const getAreaNames = (params) => {
        if (_.isEmpty(areas)) { return null }
        return areas.filter(a => params.value?.includes(a.uid)).map(a => a.name).join(",")
    }

    const children = []
    for(const permission of permissions) {
        if (!permission.grant?.some(e => user.permissions?.includes(e))) { continue }

        const item = {
            headerName: permission.groupName ?? permission.name,
            cellDataType: "boolean",
            width: 70,
            valueGetter: params => includePermission(permission.id, params),
            valueSetter: params => togglePermissionCheck(permission.id, params),
            cellStyle: params => {
                if (disablePermission(permission.id, params)) {
                    return {
                        opacity: 0.5,
                        filter: 'grayscale(100%)',
                    }
                }
                return null
            }
        }
        if (!permission.group) {
            children.push(item)
        } else {
            const idx = children.findIndex(c => c.headerName === permission.group)
            if (idx === -1) {
                children.push({
                    headerName: permission.group,
                    children: [item]
                })
            } else {
                children[idx].children.push(item)
            }
        }
    }

    return [
        {
            field: "is_delete",
            headerName: "削除",
            cellRenderer: "agCheckboxCellRenderer",
            cellEditor: "agCheckboxCellEditor",
            cellClass: "delete-checkbox-cell",
            pinned: "left",
            width: 70,
            editable: true,
        },
        {
            field: "name",
            headerName: "名前",
            filter: "agTextColumnFilter",
            pinned: "left",
        },
        {
            field: "uid",
            headerName: "UID",
            filter: "agTextColumnFilter",
            editable: false,
            valueFormatter: params =>
                params.value ?? "新規登録",
            cellStyle: params =>
                _.isNil(params.value) ? {
                    opacity: 0.3,
                    color: "#333",
                } : null,
        },
        {
            field: "email",
            headerName: "メールアドレス",
            filter: "agTextColumnFilter",
        },
        {
            field: "new_password",
            headerName: "新しいパスワード",
            filter: "agTextColumnFilter",
        },
        {
            field: "phone_number",
            headerName: "電話番号",
            filter: "agTextColumnFilter",
            cellEditor: "phoneNumberEditor",
            valueFormatter: params => {
                if(!params.value)  {return null }
                return (new AsYouType("JP").input(params.value)).replace("+81 ", "0").replaceAll(" ", "-")
            },
        },
        {
            field: "office_uid",
            headerName: "所属",
            cellEditor: 'agSelectCellEditor',
            valueFormatter: getOfficeName,
            cellEditorParams: {
                values: offices.map(o => o.uid),
                formatValue: value =>
                    offices.find(o => o.uid === value)?.name
            }
        },
        {
            field: "area_uids",
            headerName: "担当エリア",
            valueFormatter: getAreaNames
        },
        {
            headerName: "権限",
            children,
        }
    ]
}

export default UserListColumNDefs