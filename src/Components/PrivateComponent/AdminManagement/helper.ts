import { AdminUsersApi, CreateAdminApi, ReassignAdminRoleApi } from "../../../../environment/apimanager";
import { Get, Post, Put } from "../../../Common/HttpService";
import { GetRolesService } from "../RoleManagement/helper";

export interface CreateAdminPayload {
    name: string;
    email: string;
    password: string;
    role_id: number | string;
}

export interface ReassignRolePayload {
    role_id: number | string;
}

export const GetAdminUsersService = () => {
    return Get(`${AdminUsersApi}`, "rtrToken");
};

export const CreateAdminService = (payload: CreateAdminPayload) => {
    return Post(`${CreateAdminApi}`, payload, "rtrToken");
};

export const ReassignAdminRoleService = (id: number | string, payload: ReassignRolePayload) => {
    return Put(ReassignAdminRoleApi(id), payload, "rtrToken");
};

export { GetRolesService };
