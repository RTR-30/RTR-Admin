import axios from "axios";
import { ReferralAmount } from "../../../../environment/apimanager";

export const referralAmountService = (token: any) => {
    return axios.get(`${ReferralAmount}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const updateReferralAmountService = (payload: any, token: any) => {
    return axios.put(`${ReferralAmount}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}