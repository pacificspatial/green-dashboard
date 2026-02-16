
const useImageManager = () => {

    /**
     *
     * @param dataUri
     * @param widthOrBoxSize
     * @param height
     * @param isThumb
     * @return {Promise<String>}
     */
    const resize = (dataUri, widthOrBoxSize, height = null, isThumb = false) => {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")

                const scale = Math.min(widthOrBoxSize / img.width, (height ?? widthOrBoxSize) / img.height)
                if (isThumb && scale > 1.0) {
                    return String(dataUri)
                }
                canvas.width = img.width * scale
                canvas.height = img.height * scale
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                const uri = canvas.toDataURL("image/png")
                resolve(uri)
            }
            img.onerror = reject
            img.src = dataUri.startsWith('data:image') ? dataUri : `data:image/png;base64,${dataUri}`
        })
    }

    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader()
                reader.onload = () => {
                    resolve(reader.result)
                }
                reader.onerror = e => {
                    reject(e)
                }
                reader.readAsDataURL(blob)
            } catch(e) {
                reject(e.message)
            }
        })
    }

    return {
        resize,
        blobToBase64,
    }
}

export default useImageManager
