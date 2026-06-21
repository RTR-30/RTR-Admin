import axios from "axios";
import {Auth} from "../../../../environment/apimanager";

export const loginService = (payload: any) => {
    return axios.post(`${Auth.login}`, payload);
}