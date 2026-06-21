import axios from "axios";
import { approvalsubmitend, submitapprovalapi, totalapprovedapi, totalcarownerapi } from "../../../../environment/apimanager";

export const totalapprovalList = (value?: any, limit?: any, page?: any, tokens?: any) => {
    return axios.get(`${totalapprovedapi}`, {
        params:{
            search: value,
            limit:limit,
            page:page
        },
        headers: {
            Authorization: `Bearer ${tokens}`,
        }
    })
}

export const submitApprovalService = (payload: any, tokens?: any) => {
    return axios.patch(`${submitapprovalapi}${payload}${approvalsubmitend}`, {
        headers: {
            Authorization: `Bearer ${tokens}`,
        }
    })
}