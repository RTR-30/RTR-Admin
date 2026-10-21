import { AutoCloseingApi, NotAcceptBookingList } from "../../../../environment/apimanager";
import { Get } from "../../../Common/HttpService";

// export const totalbookinglist = (value?: any, limit?: any, page?: any) => {
//     return Get(`${totalbookinglistapi}?search=${value}&limit=${limit}&page=${page}`, "rtrToken")
// }

export const AutoCloseBookingsService = (limit?: any, page?: any) => {
    return Get(`${AutoCloseingApi}?limit=${limit}&page=${page}`, "rtrToken")
}

export const NotAcceptBookingListService = (color?: any, value?: any, limit?: any, page?: any) => {
    return Get(`${NotAcceptBookingList}?color=${color}&search=${value}&limit=${limit}&page=${page}`, "rtrToken")
}
