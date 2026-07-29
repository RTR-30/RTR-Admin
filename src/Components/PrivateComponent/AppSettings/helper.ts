import axios from "axios";
import { AppsettingsApi } from "../../../../environment/apimanager";

export const referralAmountService = (token: any) => {
    return axios.get(`${AppsettingsApi}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const updateReferralAmountService = (payload: any, token: any) => {
    return axios.put(`${AppsettingsApi}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}