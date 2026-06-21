import axios from "axios";
import { createTripTypeApi, getTripTypeApi, createPaymentApi, getTripPaymentApi, UpdateTripPaymentApi } from "../../../../environment/apimanager";

export const createTripTypeService = (payload: any, token: any) => {
    return axios.post(`${createTripTypeApi}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
}

export const getTripTypesServices = (token: any) => {
    return axios.get(`${getTripTypeApi}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const createTripPaymentService = (payload: any, token: any) => {
    return axios.post(`${createPaymentApi}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const getTripPaymentServices = (token: any, TripDetails: any) => {
    return axios.get(`${getTripPaymentApi}${TripDetails?.id}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const updateTripPaymentService = (data: any, payload: any, token: any) => {
    return axios.put(`${UpdateTripPaymentApi}${data.id}`, payload, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}

export const tripTypeService = async (token: any) => {
    return axios.get(`${UpdateTripPaymentApi}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export const deletePaymentService = async (id:any, token: any) => {
    return axios.delete(`${UpdateTripPaymentApi}${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}