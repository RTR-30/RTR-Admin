import axios from "axios";
import { GearTypeApis } from "../../../../environment/apimanager";
import { Delete, Get, Post, Put } from "../../../Common/HttpService";

export const CreateGearTypeService = (payload: any) => {
    return Post(`${GearTypeApis}`, payload, "rtrToken") 
}

export const GetGearTypeService = () => {
    return Get(`${GearTypeApis}`, "rtrToken") 
}

export const UpdateGearTypeService = (id: any, payload: any) => {
    return Put(`${GearTypeApis}/${id}`, payload, "rtrToken") 
}

export const DeleteGearTypeService = (id: any) => {
    return Delete(`${GearTypeApis}/${id}`, "rtrToken") 
}