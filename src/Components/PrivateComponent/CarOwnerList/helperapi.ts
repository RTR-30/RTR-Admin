import axios from "axios";
import { totalcarownerapi } from "../../../../environment/apimanager";

export const totalcarownerUser = (value?: any, limit?: any, page?: any, tokens?: any) => {
    return axios.get(`${totalcarownerapi}`, {
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