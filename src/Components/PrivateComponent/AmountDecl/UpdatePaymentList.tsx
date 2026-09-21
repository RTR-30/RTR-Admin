import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList
} from "react-native";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { deletePaymentService, getTripPaymentServices, updateTripPaymentService } from "./helperapi";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdatePaymentList = () => {
    const value = "Update Payment";
    const navigation: any = useNavigation();
    const route = useRoute();
    const { TripDetails }: any = route.params || {};
    const [loading, setLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    const [tripPayment, setTripPayment] = useState<any>([]);

    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const [modalData, setModalData] = useState({
        hours: "",
        total_amount: ""
    });


    const handleDelete = async (ids: any) => {
        setLoading(true);
        try {
            const res = await deletePaymentService(ids)
            const { success, message } = res?.data;
            if (success === true) {
                showSuccess(message)
                handleGetTripPayment();
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setLoading(true);
        const payload = {
            "tripTypeId": Number(selectedPayment.trip_type_id),
            "hours": Number(modalData?.hours),
            "totalAmount": Number(modalData?.total_amount),
        }

        try {
            const res = await updateTripPaymentService(selectedPayment, payload);

            const { success, message, data } = res?.data;

            if (success === true) {
                showSuccess(message);
                handleGetTripPayment();
                setShowModal(false);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleGetTripPayment = async () => {
        setLoading(true);

        try {
            const res = await getTripPaymentServices(TripDetails);
            const { success, message, data } = res?.data;

            if (success === true) {
                showSuccess(message);
                setTripPayment(data);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const renderData = (item: any) => {
        
        return (
            <View
                style={{
                    marginBottom: 30,
                    backgroundColor: "white",
                    padding: 10,
                    borderWidth: 0.5,
                    borderColor: "black",
                    borderRadius: 10
                }}
            >
                <Text
                    style={{
                        textAlign: "center",
                        fontWeight: "500",
                        color: "#5a639c",
                        fontSize: 20
                    }}
                >
                    {item?.trip_type}
                </Text>

                <View style={{ width: "100%", flexDirection: "row", marginTop: 10 }}>
                    <View style={{ width: "80%" }}>
                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "bold",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                Total Hours
                            </Text>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "500",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                : {Number(item?.hours)}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "bold",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                Total Driver Charge
                            </Text>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "500",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                : {item?.driver_charge}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "bold",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                Total Amount
                            </Text>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "500",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                : {item?.total_amount}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "bold",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                Total Tax
                            </Text>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "500",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                : {item?.tax}%
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", width: "100%" }}>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "bold",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                Platform fees
                            </Text>
                            <Text
                                style={{
                                    width: "50%",
                                    fontWeight: "500",
                                    color: "black",
                                    fontSize: 14
                                }}
                            >
                                : {item?.platform_fee}%
                            </Text>
                        </View>

                    </View>

                    <View
                        style={{
                            width: "20%",
                            justifyContent: "center",
                            alignItems: "center"
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedPayment(item);
                                setModalData({
                                    hours: String(item?.hours),
                                    total_amount: String(item?.total_amount)
                                });
                                openModal();
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    fontWeight: "500",
                                    color: "blue",
                                    fontSize: 20
                                }}
                            >
                                EDIT
                            </Text>
                        </TouchableOpacity>


                        <TouchableOpacity
                            style={{ marginTop: 20 }}
                            onPress={() => {
                                handleDelete(item?.id)
                            }}
                        >
                            <Text
                                style={{
                                    textAlign: "center",
                                    fontWeight: "500",
                                    color: "red",
                                    fontSize: 20
                                }}
                            >
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    useEffect(() => {
        handleGetTripPayment();
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            {loading && (
                <View
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <ActivityIndicator size="small" style={{ marginTop: 10 }} />
                </View>
            )}

            <View style={{ flex: 9, padding: 10 }}>
                <FlatList
                    data={tripPayment}
                    keyExtractor={(item: any) => item.id.toString()}
                    removeClippedSubviews={false}
                    renderItem={({ item }: any) => renderData(item)}
                />
            </View>

            {/* ================= MODAL ================= */}
            {showModal && (
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <View
                        style={{
                            width: "90%",
                            backgroundColor: "white",
                            padding: 20,
                            borderRadius: 10
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: "bold",
                                color: "#333",
                                textAlign: "center"
                            }}
                        >
                            Edit Payment
                        </Text>

                        {/* Hours */}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>Hours</Text>
                            <TextInput
                                placeholder="Enter Total Hours"
                                value={modalData.hours}
                                onChangeText={(text) =>
                                    setModalData({ ...modalData, hours: text })
                                }
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#aaa",
                                    marginTop: 10,
                                    padding: 10,
                                    borderRadius: 8
                                }}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Total Amount */}
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>Total Amount</Text>
                            <TextInput
                                placeholder="Enter Total Amount"
                                value={modalData.total_amount}
                                onChangeText={(text) =>
                                    setModalData({ ...modalData, total_amount: text })
                                }
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#aaa",
                                    marginTop: 10,
                                    padding: 10,
                                    borderRadius: 8
                                }}
                                keyboardType="numeric"
                            />
                        </View>

                        {/* Buttons */}
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 20
                            }}
                        >
                            <TouchableOpacity
                                onPress={closeModal}
                                style={{
                                    backgroundColor: "grey",
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 8
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() =>
                                    handleUpdate()
                                }
                                style={{
                                    backgroundColor: "#5a639c",
                                    paddingVertical: 10,
                                    paddingHorizontal: 20,
                                    borderRadius: 8
                                }}
                            >
                                <Text style={{ color: "white", fontSize: 16 }}>
                                    Update
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default UpdatePaymentList;
