import { WithdrawRequestApi, ApprovalApis, RejectApis } from "../../../../environment/apimanager";
import { Get, Post } from "../../../Common/HttpService";

export const WithdrawalRequestListService = (pageNumber: any = 1, limit: any = 20, search: any = "") => {
    return Get(`${WithdrawRequestApi}&page=${pageNumber}&limit=${limit}&search=${search ?? ""}`, "rtrToken")
}

export const ApproveService = (payload: any) => {
    return Post(`${ApprovalApis}`, payload, "rtrToken")
}

export const RejectService = (payload: any) => {
    return Post(`${RejectApis}`, payload, "rtrToken")
}