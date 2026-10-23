import { RolesApi } from "../../../../environment/apimanager";
import { Delete, Get, Post, Put } from "../../../Common/HttpService";

export interface RolePayload {
    name: string;
    slug: string;
    description: string;
}

export interface UpdateRolePayload {
    name: string;
    description: string;
    slug?: string;
}

export const CreateRoleService = (payload: RolePayload) => {
    return Post(`${RolesApi}`, payload, "rtrToken");
};

export const GetRolesService = () => {
    return Get(`${RolesApi}`, "rtrToken");
};

export const GetSingleRoleService = (id: number | string) => {
    return Get(`${RolesApi}/${id}`, "rtrToken");
};

export const UpdateRoleService = (id: number | string, payload: UpdateRolePayload) => {
    return Put(`${RolesApi}/${id}`, payload, "rtrToken");
};

export const DeleteRoleService = (id: number | string) => {
    return Delete(`${RolesApi}/${id}`, "rtrToken");
};
