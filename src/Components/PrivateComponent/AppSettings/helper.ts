import { AppsettingsApi } from "../../../../environment/apimanager";
import { Get, Put } from "../../../Common/HttpService";

export const referralAmountService = () => {
    return Get(`${AppsettingsApi}`, "rtrToken")
}

export const updateReferralAmountService = (payload: any) => {
    return Put(`${AppsettingsApi}`, payload, "rtrToken")
}