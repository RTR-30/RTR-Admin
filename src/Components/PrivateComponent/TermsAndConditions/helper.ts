import { TermsApi } from "../../../../environment/apimanager";
import { Get, Post, Put } from "../../../Common/HttpService";

export const getTermsService = (appType: string = "user") => {
    return Get(`${TermsApi}?app_type=${appType}`, "rtrToken");
};

export const updateTermsService = (payload: any) => {
    return Put(`${TermsApi}`, payload, "rtrToken");
};

export const createTermsService = (payload: any) => {
    return Post(`${TermsApi}`, payload, "rtrToken");
};
