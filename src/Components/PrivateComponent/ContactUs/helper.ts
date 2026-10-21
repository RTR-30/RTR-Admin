import { AdminContactUsApi, ContentContactUsApi } from "../../../../environment/apimanager";
import { Get, Post, Put } from "../../../Common/HttpService";

export const getContactUsService = (appType: string = "user") => {
    return Get(`${ContentContactUsApi}?app_type=${appType}`, "NoToken");
};

export const updateContactUsService = async (payload: any) => {
    try {
        const res = await Put(AdminContactUsApi, payload, "rtrToken");
        if (res?.status === 200 || res?.status === 201 || res?.data?.success) {
            return res;
        }
        return await Put(ContentContactUsApi, payload, "rtrToken");
    } catch {
        return await Put(ContentContactUsApi, payload, "rtrToken");
    }
};

export const createContactUsService = (payload: any) => {
    return Post(AdminContactUsApi, payload, "rtrToken");
};
