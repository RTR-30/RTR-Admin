import { FeedbackApis } from "../../../../environment/apimanager";
import { Delete, Get, Post, Put } from "../../../Common/HttpService";

export const CreateFeedbackService = (payload: any) => {
    return Post(`${FeedbackApis}`, payload, "rtrToken") 
}

export const GetFeedbackService = () => {
    return Get(`${FeedbackApis}`, "rtrToken") 
}

export const UpdateFeedbackService = (id: any, payload: any) => {
    return Put(`${FeedbackApis}/${id}`, payload, "rtrToken") 
}

export const DeleteFeedbackService = (id: any) => {
    return Delete(`${FeedbackApis}/${id}`, "rtrToken") 
}