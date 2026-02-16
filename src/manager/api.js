import _ from "ansuko";
import {useCallback, useContext} from "react"
import { AppDataContext, UseApiPrivateManager } from "@team4am/fp-core"

const UseApiManager = () => {

    const {state:appState} = useContext(AppDataContext)

    const {
        Req: ReqPrivate,
        GetToken: GetTokenPrivate,
    } = UseApiPrivateManager(appState.env)

    const GetToken = GetTokenPrivate

    const Req = ReqPrivate

    const First = useCallback(async (method, path, options) =>
        _.first(await Req(method, path, options)), [Req])

    const One = useCallback(async (method, path, options) => {
        const row = await First(method, path, options)
        if (_.isEmpty(row)) { return null }
        return row[_.first(Object.keys(row))]
    }, [First])

    const Get = useCallback((path, params, options) =>
        Req("get", path, {...options, params}), [Req])

    const Post = useCallback((path, data, options) =>
        Req("post", path, {...options, data}), [Req])

    const Put = useCallback((path, data, options) =>
        Req("put", path, {...options, data}), [Req])

    const Delete = useCallback((path, data, options) =>
        Req("delete", path, {...options, data}), [Req])

    const GetFirst = useCallback((path, params, options) =>
        First("get", path, {...options, params}), [First])

    const PostFirst = useCallback((path, data, options) =>
        First("post", path, {...options, data}), [First])

    const PutFirst = useCallback((path, data, options) =>
        First("put", path, {...options, data}), [First])

    const DeleteFirst = useCallback((path, data, options) =>
        First("delete", path, {...options, data}), [First])

    const GetOne = useCallback((path, params, options) =>
        One("get", path, {...options, params}), [One])

    const PostOne = useCallback((path, data, options) =>
        One("post", path, {...options, data}), [One])

    const PutOne = useCallback((path, data, options) =>
        One("put", path, {...options, data}), [Put])

    const DeleteOne = useCallback((path, data, options) =>
        One("delete", path, {...options, data}), [One])

    const QueryVectorTileUrl = useCallback(async (sql, values = null) => {
        const row = await PostFirst("map", {sql, values})
        return row.url
    }, [PostFirst])

    const QueryVectorTileLayerId = useCallback(async (sql, values = null) => {
        const row = await QueryVectorTileUrl("map", {sql, values})
        return row.layerId
    }, [QueryVectorTileUrl])

    const UploadFile = useCallback(async (path, file, data, options, responseRow = false) => {
        const formData = new FormData()
        formData.append("file", file)
        if(data) {
            Object.entries(data).forEach(([k, v]) => formData.append(k, v))
        }

        let size = 0;
        for(const e of formData.entries()) {
            size += e[0].length;
            if (e[1] instanceof Blob) size += e[1].size;
            else size += e[1].length;
        }

        const res = await PostFirst(path, formData, {
            ...options,
            headers: {
                "Content-Type": "multipart/form-data",
                "Content-Length": size,
            },
            transformRequest: null,
            disableSign: true,
        })
        return responseRow ? res : res?.rows
    })

    const UploadDataURI = useCallback(async (path, dataUri, contentType, responseRaw = false) => {
        const formData = new FormData()
        formData.append("image", dataUri.startsWith("data:image") ? dataUri: `data/image/jpeg;base64,${dataUri}`)
        formData.append("content-type", contentType)

        const res = await PostFirst(path, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            disableSign: false,
        })
        return responseRaw ? res : res.filePath
    }, [PostFirst])

    const Rows = Req
    const GetRows = Get
    const PostRows = Post
    const PutRows = Put
    const DeleteRows = Delete

    return {
        Req,
        First, One,
        Get, GetFirst, GetOne,
        Post, PostFirst, PostOne,
        Put, PutFirst, PutOne,
        Delete, DeleteFirst, DeleteOne,
        QueryVectorTileUrl,
        QueryVectorTileLayerId,
        UploadFile, UploadDataURI,
        Rows, GetRows, PostRows, PutRows, DeleteRows,
    }

}

export default UseApiManager
