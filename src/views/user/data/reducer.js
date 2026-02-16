import {encryptData} from "@team4am/fp-core"

export const LOCAL_STORAGE_KEY = `${import.meta.env.VITE_APP_NAME}_user_${import.meta.env.VITE_APP_VERSION}_data`
export const LOCAL_STORAGE_PATTERN = `^${import.meta.env.VITE_APP_NAME}_user_.+_data$`
export const ActionType = {
    SetSelectedUsers: "SET_SELECTED_USERS",
    SetPermissions: "SET_PERMISSIONS",
    SetOffices: "SET_OFFICES",
    SetAreas: "SET_AREAS",
}

const UserDataReducer = (state, action) => {

    switch(action.type) {
        case ActionType.SetSelectedUsers:
            state = {...state, selectedUsers: action.value}
            break
        case ActionType.SetPermissions:
            state = {...state, permissions: action.value}
            break
        case ActionType.SetOffices:
            state = {...state, offices: action.value}
            break
        case ActionType.SetAreas:
            state = {...state, areas: action.value}
            break
        default:
            return state
    }

    const saveState = JSON.stringify({
        ...state,
        //
        selectedUsers: null,
    })
    const storeData = (import.meta.env.DEV || import.meta.env.VITE_DEBUG) ? saveState : encryptData(saveState)
    localStorage.setItem(LOCAL_STORAGE_KEY, storeData)

    return state
}

export default UserDataReducer