import axios from "axios";
import { totalbookinglistapi } from "../../../../environment/apimanager";
import { Get } from "../../../Common/HttpService";

export const totalbookinglist = (value?: any, limit?: any, page?: any) => {
    return Get(`${totalbookinglistapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}