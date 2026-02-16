import {useContext, useMemo, useState} from "react"
import {AppDataContext} from "@team4am/fp-core"
import {useEveListen} from "react-eve-hook"
import {DispatchEvents} from "@_views/dispatch.js"
import _ from "ansuko"
import {Backdrop, Box, IconButton} from "@mui/material"
import {Close as CloseIcon} from "@mui/icons-material"

const styles = {
    root: {
        width: '90%',
        height: '90%',
        overflow: 'hidden',
        position: 'relative',
        background: '#333333fa',
        borderRadius: '16px',
        boxShadow: '1px 1px 8px #000',
    },
    close: {
        button: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'white',
            boxShadow: '1px 1px 3px #000',
        }
    }
}

const MainPhotoPreview = () => {

    const { state:appState} = useContext(AppDataContext)
    const [photos, setPhotos] = useState()
    const [index, setIndex] = useState()
    const [path, setPath] = useState()
    const [transX, setTransX] = useState(0)
    const [transY , setTransY] = useState(0)
    const [scale, setScale] = useState(1)
    const transform = useMemo(() =>
        `translate(calc(-50% - ${transX}px), calc(-50% - ${transY}px))`
        , [transX, transY])

    useEveListen(DispatchEvents.OnPhotoPreview, data => {
        setPhotos(_.castArray(data.photos ?? []))
        setIndex(data.index ?? 0)
        setPath(data.path)
    })

    const onClosePreview = () => {
        setPhotos(null)
        setIndex(null)
        setPath(null)
    }

    return (
        <Backdrop open={!_.isEmpty(photos) || !_.isEmpty(path)} style={{zIndex: 5}}>
            <IconButton style={styles.close.button} onClick={onClosePreview}><CloseIcon /></IconButton>
            {!_.isEmpty(photos) && (
                <Box style={{width: "90%", height: "90%", display: "flex", flexDirection: "column", padding: "8px", background: "#333"}}>
                    <Box style={{flexGrow: 1, position: "relative", background: "#000", overflow: "hidden"}}>
                        <img src={`${appState.env.CLIENT_PHOTO_ENDPOINT}/${path}/org/${photos[index]}`} style={{position: "absolute", left: "50%", right: "50%", transform}} />
                    </Box>
                    {_.size(photos) > 1 && (
                    <Box>
                    {photos.map((p, i) => (
                        <img key={`image-${i}`} src={`${appState.env.CLIENT_PHOTO_ENDPOINT}/${path}/thumb/${p}}`} onClick={() => setIndex(i)} />
                    ))}
                    </Box>
                )}
                </Box>)}
        </Backdrop>
    )
}

export default MainPhotoPreview