import axios from "axios";
import { FeedbackApis } from "../../../../environment/apimanager";

export const CreateFeedbackService = (payload: any, token: any) => {
    return axios.post(`${FeedbackApis}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const GetFeedbackService = (token: any) => {
    return axios.get(`${FeedbackApis}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const UpdateFeedbackService = (id: any, payload: any, token: any) => {
    return axios.put(`${FeedbackApis}/${id}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}

export const DeleteFeedbackService = (id: any, token: any) => {
    return axios.delete(`${FeedbackApis}/${id}`,{
        headers: {
            Authorization: `Bearer ${token}`,
        }
    }) 
}