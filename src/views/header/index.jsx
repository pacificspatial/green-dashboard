import PropTypes from "prop-types";
import {
    Box,
    Button, Divider,
    IconButton,
    ListItemIcon,
    styled,
    ToggleButton,
    Typography,
    Menu, MenuItem,
} from "@mui/material";
import {useCallback, useContext, useMemo, useRef, useState} from "react";
import {useDialog} from "@team4am/fp-core";
import {
    Menu as MenuIcon,
    AccountCircle as AccountCircleIcon,
    VpnKey as VpnKeyIcon,
    Logout as LogoutIcon,
    ClearAll as ClearCacheIcon,
} from "@mui/icons-material"
import {eve} from "react-eve-hook"
import {DispatchEvents} from "@_views/dispatch.js"
import {AppDataContext} from "@team4am/fp-core"
import {AppMode} from "@team4am/fp-core"
import {useFieldPointApp} from "@team4am/fp-core"
import {waitAnimated} from "@_manager/util.jsx"
import ChangePassword from "@_views/header/changePassword.jsx"


export const styles = {
    root: {
        background: `#${import.meta.env.VITE_DEFAULT_SECONDARY_COLOR}`,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center",
        padding: '8px 1rem',
    },
    title: {
        color: "white",
        fontWeight: "bold",
        fontSize: "24px",
    },
    subTitle: {
        marginLeft: "1rem",
        fontWeight: "bold",
        color: "white",
    },
    modeTitle: {
        color: `#${import.meta.env.VITE_DEFAULT_PRIMARY_COLOR}`,
        fontWeight: 'bold',
        fontSize: '21px',
        textShadow: `
            rgb(255, 255, 255) 1px 1px 0px, 
            rgb(255, 255, 255) -1px -1px 0px, 
            rgb(255, 255, 255) -1px 1px 0px, 
            rgb(255, 255, 255) 1px -1px 0px, 
            rgb(255, 255, 255) 0px 1px 0px, 
            rgb(255, 255, 255) 0px -1px 0px, 
            rgb(255, 255, 255) -1px 0px 0px, 
            rgb(255, 255, 255) 1px 0px 0px`,
    },
    menuBox: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "1rem",
    },
    menuButton: {
        borderColor: 'white',
        color: '#333',
        background: '#eeeeee8c',
        margin: '0',
        padding: '4px 8px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
    },
    button: {
        borderColor: 'white',
        color: '#333',
        background: '#EEE',
        margin: '0px',
        padding: '4px 8px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
    },
    toggleBase: {
        borderColor: 'white',
        borderWidth: "1px",
        color: '#333',
        background: '#eeeeee70',
        margin: 0,
    },
    userMenu: {
        root: {
            "& .MuiList-root": {
                paddingTop: 0,
            }
        },
        profile: {
            box: {
                padding: '8px 32px',
                background: '#666',
                marginBottom: '8px',
            },
            name: {
                text: {
                    fontSize: '14px',
                    textAlign: 'center',
                    color: '#f0f0f0',
                    fontWeight: 'bold',
                },
                text2: {
                    fontSize: '12px',
                    marginTop: '4px',
                    color: '#eee',
                    textAlign: 'center',
                }
            }
        }
    }
}

const MainHeaderView = ({
    children,
}) => {
    const { openConfirm } = useDialog()
    const { logout, reloadConfig } = useFieldPointApp()
    const { state: appState } = useContext(AppDataContext)
    const userButtonRef = useRef()
    const [openUserMenu, setOpenUserMenu] = useState(false)
    const [openChangePassword, setOpenChangePassword] = useState(false)
    const title = useMemo(() => {
        if (appState.appMode === AppMode.Main) {
            return "地図表示"
        } else if (appState.appMode == AppMode.Documents) {
            return "集約・文書検索"
        }
        return null
    }, [appState.appMode])

    const onLogout = useCallback(() => {
        setOpenUserMenu(false)
        openConfirm("本当にログアウトしますか", {
            title: "ログアウト",
            onOk: logout,
        })
    }, [])

    const onChangePassword = useCallback(() => {
        setOpenUserMenu(false)
        waitAnimated(() => setOpenChangePassword(true), 1)
    }, [])


    const onUserMenuClicked = useCallback((e,v) => {
        console.log(e.target.value, v)
        setOpenUserMenu(false)
    }, [])

    const onClearCache = useCallback(() => {
        localStorage.clear()
        reloadConfig()
    })

    return (
        <Box style={styles.root}>
            <Box style={{display: "flex", flexDirection: "row", gap: "8px", alignItems: "center"}}>
                <IconButton onClick={() => eve(DispatchEvents.MainToggleDrawer)}><MenuIcon style={{color: "white"}} /></IconButton>
                <Box style={{display: "flex", alignItems: "center", gap: "8px"}}>
                    <Typography style={styles.title}>{import.meta.env.VITE_PROJECT_NAME}</Typography>
                    <Typography style={{color: "#eee", fontSize: "12px"}}>({import.meta.env.VITE_APP_VERSION})</Typography>
                    <Typography style={styles.subTitle}>- {title} -</Typography>
                </Box>
            </Box>
            <Box style={styles.menuBox}>
                {children}
                <Button ref={userButtonRef} style={{...styles.menuButton, border: "1px solid white"}} onClick={() => setOpenUserMenu(true)}>
                    <AccountCircleIcon size={14} style={{color:"#144a92"}} />
                    <Typography style={{fontSize: "12px"}}>設定</Typography>
                </Button>
            </Box>
            <Menu
                open={openUserMenu}
                anchorEl={userButtonRef.current}
                onClose={() => setOpenUserMenu(false)} sx={styles.userMenu.root}
                onClick={onUserMenuClicked}
            >
                <Box style={styles.userMenu.profile.box}>
                    <Box>
                        <Typography style={styles.userMenu.profile.name.text}>{appState.user?.name ?? appState.user?.email ?? "不明ユーザ"}</Typography>
                    </Box>
                    <Box>
                        <Typography style={styles.userMenu.profile.name.text2}>でログイン中</Typography>
                    </Box>
                </Box>
                <MenuItem onClick={onChangePassword}>
                    <ListItemIcon><VpnKeyIcon /></ListItemIcon>
                    パスワード変更
                </MenuItem>
                <MenuItem onClick={onClearCache}>
                    <ListItemIcon><ClearCacheIcon /></ListItemIcon>
                    キャッシュの消去
                </MenuItem>
                <Divider />
                <MenuItem onClick={onLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    ログアウト
                </MenuItem>
            </Menu>
            <ChangePassword open={openChangePassword} onClose={() => setOpenChangePassword(false)}/>
        </Box>
    )

}

MainHeaderView.propTypes = {
    viewMode: PropTypes.string,
    onUserAdmin: PropTypes.func,
    onChangeViewMode: PropTypes.func,
    children: PropTypes.element,
    drawerItems: PropTypes.element,
}

export default MainHeaderView

export const StyledToggleButton = styled(ToggleButton)`
  && {
    padding: 12px 24px;
    border: 2px solid white;
    border-radius: 8px;
    background-color: ${props => props.selected ? 'white' : 'rgba(255, 255, 255, 0.5)'};
    color: ${props => props.selected ? '#333' : 'white'};
    font-size: 16px;
    font-weight: 500;
    transition: all 0.3s ease;
    margin: 4px;
    
    &.Mui-selected {
      background-color: white;
      color: #333;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.9);
      }
    }
    
    &:not(.Mui-selected) {
      background-color: rgba(255, 255, 255, 0.5);
      color: white;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.7);
      }
    }
    
    &:hover {
      transform: translateY(-1px);
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:focus-visible {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }
  }
`