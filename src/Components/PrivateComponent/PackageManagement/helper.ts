import axios from "axios";
import { PackageApi } from "../../../../environment/apimanager";

export const CreatePackageService = (payload: any, token: any) => {
    return axios.post(`${PackageApi}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const GetPackageListService = (token: any) => {
    return axios.get(`${PackageApi}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const UpdatePackageService = (id: any, payload: any, token: any) => {
    return axios.put(`${PackageApi}/${id}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const DeletePackageService = (id: any, token: any) => {
    return axios.delete(`${PackageApi}/${id}`,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}