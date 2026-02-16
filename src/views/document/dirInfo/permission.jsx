import PropTypes from "prop-types"
import {useCallback, useContext, useMemo} from "react"
import {DocumentDataContext} from "@team4am/fp-core"
import _ from "ansuko"
import {Box, MenuItem, Select, Typography, FormControl, InputLabel} from "@mui/material"

const styles = {
    root: {
        background: 'white',
        padding: '8px',
        border: '1px solid #000',
        boxShadow: 'inset 1px 1px 3px #807e7e',
    },
    title: {
        background: '#eee',
        padding: '4px',
        marginTop: '-2px',
        fontWeight: 'bold',
        borderRadius: '4px',
        marginBottom: '8px',
    },
    box: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    row: {
        box: {
            display: 'flex',
            alignItems: 'center',
        },
        name: {
            flexGrow: '1',
        },
        grant: {
            width: "80px",
        }
    },
    add: {
        box: {
            width: "100%",
        }
    }
}

const DocumentDirInfoPermission = ({data, type, onChange, title}) => {

    const { state:docState } = useContext(DocumentDataContext)
    const ignores = useMemo(() =>
            docState[type]?.filter(u => !Object.keys(data ?? {}).includes(u.uid))
        , [data, docState])

    const onChangeRole = useCallback((uid, role) => {
        onChange({
            ...data,
            [uid]: role,
        })
    }, [data])

    if (_.isEmpty(docState[type])) { return null}

    return (
        <Box style={styles.root}>
            <Typography style={styles.title}>許可{title}リスト</Typography>
            <Box style={styles.box}>
                {Object.entries(data).map(([uid, role]) => {
                    const value = docState[type]?.find(u => u.uid === uid)
                    if (!value) { return null }
                    return (
                        <Box key={uid} style={styles.row.box}>
                            <Typography style={styles.row.name}>{value.name}</Typography>
                            <FormControl>
                                {!role && <InputLabel shrink={false}>権限</InputLabel>}
                                <Select style={styles.row.grant} size="small" value={role} onChange={e => onChangeRole(uid, e.target.value)}>
                                    <MenuItem value="delete" style={{color: "#f66"}}>削除</MenuItem>
                                    <MenuItem value="read">閲覧</MenuItem>
                                    <MenuItem value="write">書込</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>
                    )
                })}
                {!_.isEmpty(ignores) && (
                    <Box>
                        <FormControl style={styles.add.box}>
                            <InputLabel shrink={false}>{title}追加</InputLabel>
                            <Select size="small" value={null} onChange={e => {
                                onChange({
                                    ...data,
                                    [e.target.value]: null,
                                })
                            }}>
                                {ignores.map(u => (
                                    <MenuItem value={u.uid} key={u.uid}>{u.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Box>
        </Box>
    )
}

DocumentDirInfoPermission.propTypes = {
    data: PropTypes.object,
    dataKey: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    master: PropTypes.array,
    onChange: PropTypes.func,
    title: PropTypes.string,
}

export default DocumentDirInfoPermission