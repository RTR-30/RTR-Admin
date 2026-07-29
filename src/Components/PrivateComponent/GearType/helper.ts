import axios from "axios";
import { GearTypeApis } from "../../../../environment/apimanager";

export const CreateGearTypeService = (payload: any, token: any) => {
    return axios.post(`${GearTypeApis}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const GetGearTypeService = (token: any) => {
    return axios.get(`${GearTypeApis}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const UpdateGearTypeService = (id: any, payload: any, token: any) => {
    return axios.put(`${GearTypeApis}/${id}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const DeleteGearTypeService = (id: any, token: any) => {
    return axios.delete(`${GearTypeApis}/${id}`,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}