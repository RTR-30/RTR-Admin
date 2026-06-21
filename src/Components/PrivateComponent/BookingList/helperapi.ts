import axios from "axios";
import { totalbookinglistapi } from "../../../../environment/apimanager";

export const totalbookinglist = (value?: any, limit?: any, page?: any, tokens?: any) => {
    return axios.get(`${totalbookinglistapi}`, {
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