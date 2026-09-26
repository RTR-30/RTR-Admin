import axios from "axios";
import { totalcardriverapi } from "../../../../environment/apimanager";
import { Get, Put } from "../../../Common/HttpService";

export const totalcardriverUser = (value?: any, limit?: any, page?: any) => {
    return Get(`${totalcardriverapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}

export const updatePartnerStatusService = (id: any, payload: any) => {
    return Put(`${totalcardriverapi}/${id}/status`, payload, "rtrToken")
}