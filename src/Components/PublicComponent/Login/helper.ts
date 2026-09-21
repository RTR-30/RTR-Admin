import {Auth} from "../../../../environment/apimanager";
import { withoutTokenPost } from "../../../Common/HttpService";

export const loginService = (payload: any) => {
    return withoutTokenPost(`${Auth.login}`, payload);
}