import axios from "axios";
import { createTripTypeApi, getTripTypeApi, createPaymentApi, getTripPaymentApi, UpdateTripPaymentApi } from "../../../../environment/apimanager";
import { Delete, Get, Post, Put } from "../../../Common/HttpService";

export const createTripTypeService = (payload: any) => {
    return Post(`${createTripTypeApi}`, payload, "rtrToken")
}

export const getTripTypesServices = () => {
    return Get(`${getTripTypeApi}`, "rtrToken")
}

export const createTripPaymentService = (payload: any) => {
    return Post(`${createPaymentApi}`, payload, "rtrToken")
}

export const getTripPaymentServices = (TripDetails: any) => {
    return Get(`${getTripPaymentApi}${TripDetails?.id}`, "rtrToken")
}

export const updateTripPaymentService = (data: any, payload: any) => {
    return Put(`${UpdateTripPaymentApi}${data.id}`, payload, "rtrToken")
}

export const tripTypeService = async () => {
    return Get(`${UpdateTripPaymentApi}`, "rtrToken");
}

export const deletePaymentService = async (id:any) => {
    return Delete(`${UpdateTripPaymentApi}${id}`, "rtrToken");
}