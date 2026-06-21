import axios from "axios";
import { totalcardriverapi } from "../../../../environment/apimanager";

export const totalcardriverUser = (value?: any, limit?: any, page?: any, tokens?: any) => {
    return axios.get(`${totalcardriverapi}`, {
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