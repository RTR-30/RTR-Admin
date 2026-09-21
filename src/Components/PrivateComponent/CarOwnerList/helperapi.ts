import axios from "axios";
import { totalcarownerapi } from "../../../../environment/apimanager";
import { Get } from "../../../Common/HttpService";

export const totalcarownerUser = (value?: any, limit?: any, page?: any) => {
    return Get(`${totalcarownerapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}