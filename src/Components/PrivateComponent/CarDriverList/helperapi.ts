import axios from "axios";
import { totalcardriverapi } from "../../../../environment/apimanager";
import { Get } from "../../../Common/HttpService";

export const totalcardriverUser = (value?: any, limit?: any, page?: any) => {
    return Get(`${totalcardriverapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}