import { Get, Put } from "../../../Common/HttpService";
import {
    PartnerBlackAndSuspendedApi,
    UserBlackAndSuspendedApi,
    totalcardriverapi,
    totalcarownerapi,
} from "../../../../environment/apimanager";

export const partnerBlackAndSuspendedServices = (page: any = 1, limit: any = 10, search: any = "") => {
    return Get(`${PartnerBlackAndSuspendedApi}?page=${page}&limit=${limit}&search=${search || ""}`, "rtrToken");
};

export const userBlackAndSuspendedServices = (page: any = 1, limit: any = 10, search: any = "") => {
    return Get(`${UserBlackAndSuspendedApi}?page=${page}&limit=${limit}&search=${search || ""}`, "rtrToken");
};

export const updatePartnerStatusService = (id: any, payload: any) => {
    return Put(`${totalcardriverapi}/${id}/status`, payload, "rtrToken");
};

export const updateUserStatusService = (id: any, payload: any) => {
    return Put(`${totalcarownerapi}/${id}/status`, payload, "rtrToken");
};