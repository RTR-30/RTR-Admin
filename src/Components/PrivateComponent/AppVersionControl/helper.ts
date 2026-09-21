import { Get, Put } from "../../../Common/HttpService";
import { AppVersionApi } from "../../../../environment/apimanager";

export const appVersionServices = () => {
    return Get(`${AppVersionApi}`, "rtrToken");
};

export const updateAppVersionServices = (data: any, id: any) => {
    return Put(`${AppVersionApi}/${id}`, data, "rtrToken");
}