import axios from "axios";
import { totalcarownerapi } from "../../../../environment/apimanager";
import { Get, Put } from "../../../Common/HttpService";

export const totalcarownerUser = (value?: any, limit?: any, page?: any) => {
    return Get(`${totalcarownerapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}

export const updateUserStatusService = (id: any, payload: any) => {
    return Put(`${totalcarownerapi}/${id}/status`, payload, "rtrToken")
}