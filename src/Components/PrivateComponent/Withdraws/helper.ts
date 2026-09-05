import { WithdrawRequestApi, ApprovalApis, RejectApis } from "../../../../environment/apimanager";
import { Get, Post } from "../../../Common/HttpService";

export const WithdrawalRequestListService = (pageNumber: any, limit: any) => {
    return Get(`${WithdrawRequestApi}&page=${pageNumber}&limit=${limit}`, "rtrToken")
}

export const ApproveService = (payload: any) => {
    return Post(`${ApprovalApis}`, payload, "rtrToken")
}

export const RejectService = (payload: any) => {
    return Post(`${RejectApis}`, payload, "rtrToken")
}