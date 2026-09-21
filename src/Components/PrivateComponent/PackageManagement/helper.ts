import { PackageApi } from "../../../../environment/apimanager";
import { Delete, Get, Post, Put } from "../../../Common/HttpService";

export const CreatePackageService = (payload: any) => {
    return Post(`${PackageApi}`, payload, "rtrToken") 
}

export const GetPackageListService = () => {
    return Get(`${PackageApi}`, "rtrToken") 
}

export const UpdatePackageService = (id: any, payload: any) => {
    return Put(`${PackageApi}/${id}`, payload, "rtrToken") 
}

export const DeletePackageService = (id: any) => {
    return Delete(`${PackageApi}/${id}`, "rtrToken") 
}