import axios from "axios";
import { approvalsubmitend, submitapprovalapi, totalapprovedapi, totalcarownerapi } from "../../../../environment/apimanager";
import { Get, Patch } from "../../../Common/HttpService";

export const totalapprovalList = (value?: any, limit?: any, page?: any) => {
    // return axios.get(`${totalapprovedapi}`, {
    //     params:{
    //         search: value,
    //         limit:limit,
    //         page:page
    //     },
    //     headers: {
    //         Authorization: `Bearer ${tokens}`,
    //     }
    // })
    return Get(`${totalapprovedapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}

export const submitApprovalService = (payload: any) => {
    return Patch(`${submitapprovalapi}${payload}${approvalsubmitend}`, "rtrToken")
}