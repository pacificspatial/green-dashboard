import React, {useCallback, useMemo, useReducer} from "react";
import reducer, {ActionType, LOCAL_STORAGE_KEY, LOCAL_STORAGE_PATTERN} from "./reducer"
import initialState from "./state"
import PropTypes from "prop-types";
import {decryptData} from "@team4am/fp-core"

export const UserDataContext = React.createContext()

export const UserDataProvider = ({children}) => {
    const [state, dispatch] = useReducer(reducer, initialState, state => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (!savedData) {
            // 過去バージョンのlocalStorageを消す
            const keys = []
            for (let i = 0; i < localStorage.length; i++) {
                if (localStorage.key(i).match(new RegExp(LOCAL_STORAGE_PATTERN))) {
                    keys.push(localStorage.key(i))
                }
            }
            for(const k of keys) {
                localStorage.removeItem(k)
            }
            return state
        }
        const savedState = (import.meta.env.DEV || import.meta.env.VITE_DEBUG) ? savedData : decryptData(savedData)
        return {
            ...state,
            ...(JSON.parse(savedState))
        }
    })

    const setSelectedUsers = useCallback(value => dispatch({type: ActionType.SetSelectedUsers, value}), [])

    const setPermissions = useCallback(value => dispatch({type: ActionType.SetPermissions, value}), [])

    const setOffices = useCallback(value => dispatch({type: ActionType.SetOffices, value}), [])

    const setAreas = useCallback(value => dispatch({type: ActionType.SetAreas, value}), [])

    const value = useMemo(() => ({
        state,
        setSelectedUsers,
        setPermissions,
        setOffices,
        setAreas,
    }), [
        state,
        setSelectedUsers,
        setPermissions,
        setOffices,
        setAreas,
    ])

    return <UserDataContext value={value}>{children}</UserDataContext>
}
UserDataProvider.propTypes = {
    children: PropTypes.node.isRequired,
}