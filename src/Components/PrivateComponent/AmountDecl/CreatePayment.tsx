import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    TextInput
} from "react-native";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { createTripPaymentService, getTripTypesServices } from "./helperapi";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";

const CreatePayment = () => {
    const value = "Create Payment";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(null);

    const [tripTypes, setTripTypes] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState("");
    const [tripPayment, setTripPayment] = useState({
        trip_type_id: "",
        hours: "",
        total_amount: "",
        driver_charge: "",
        tax: "",
        platformfees: ""
    })

    const handleTripTypes = async (tokens: any) => {
        setLoading(true);
        const token = tokens
        try {
            const res = await getTripTypesServices(token);
            const { success, message, data } = res?.data;

            if (success === true) {
                showSuccess(message);
                setTripTypes(data);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (items: any) => {
        setTripPayment((prev: any) => ({
            ...prev,
            trip_type_id: items.id
        }));
        setSelectedTrip(items.trip_type);
        setShowDropdown(false);
    };

    const handleCreatePayment = async (datas: any) => {
        if (
            !datas.trip_type_id ||
            !datas.hours ||
            !datas.total_amount ||
            !datas.driver_charge
        ) {
            showError("All fields are required");
            return;
        }
        setLoading(true);
        const token = tokens;
        const payload = {
            tripTypeId: Number(datas.trip_type_id),
            hours: Number(datas.hours),
            totalAmount: Number(datas.total_amount),
            driverCharge: Number(datas.driver_charge),
            tax: datas.tax ? Number(datas.tax) : null,
            platformFee: datas.platformfees ? Number(datas.platformfees) : null
        }
        
        try {
            const res = await createTripPaymentService(payload, token);
            
            const { success, message } = res?.data;
            if (success === true) {
                showSuccess(message)
                navigation.goBack();
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const userStoredData = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            const storeData = JSON.parse(getDatas);
            
            const token = storeData?.token
            if (token) {
                setTokens(token);
                handleTripTypes(token);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    }

    useEffect(() => {
        userStoredData();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Header value={value} />

            <View style={{ padding: 20 }}>

                {selectedTrip === "" ? (
                    <>
                        {/* Label */}
                        <Text style={{ marginBottom: 10, fontSize: 16 }}>
                            Select Trip Type
                        </Text>

                        {/* Main Dropdown Button */}
                        <TouchableOpacity
                            style={{
                                borderWidth: 1,
                                borderColor: "#aaa",
                                padding: 12,
                                borderRadius: 6,
                                backgroundColor: "#f9f9f9"
                            }}
                            onPress={() => setShowDropdown(!showDropdown)}
                        >
                            <Text style={{ color: selectedTrip ? "#000" : "#888" }}>
                                {selectedTrip || "Choose Trip Type"}
                            </Text>
                        </TouchableOpacity>

                        {/* Loader */}
                        {loading && (
                            <ActivityIndicator size="small" style={{ marginTop: 10 }} />
                        )}

                        {/* Dropdown List */}
                        {showDropdown && !loading && (
                            <View
                                style={{
                                    marginTop: 5,
                                    borderWidth: 1,
                                    borderColor: "#aaa",
                                    borderRadius: 6,
                                    backgroundColor: "#fff",
                                    maxHeight: 150
                                }}
                            >
                                <FlatList
                                    data={tripTypes}
                                    keyExtractor={(item: any) => item.id.toString()}
                                    removeClippedSubviews={false}
                                    renderItem={({ item }: any) => (
                                        <TouchableOpacity
                                            style={{
                                                padding: 12,
                                                borderBottomWidth: 1,
                                                borderBottomColor: "#eee"
                                            }}
                                            onPress={() =>
                                                handleSelect(item)
                                            }
                                        >
                                            <Text style={{ fontSize: 15 }}>
                                                {item.trip_type}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <View style={{ marginTop: 10 }}>
                            <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 20, textAlign:'center' }}>Selected Trip - {selectedTrip}</Text>
                        </View>

                        <View>
                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    Enter Hours
                                </Text>

                                <TextInput
                                    placeholder="Enter Hours"
                                    value={tripPayment.hours.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text: any) =>
                                        setTripPayment({ ...tripPayment, hours: text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#000",
                                        padding: 10,
                                        borderRadius: 5,
                                        color: 'black',
                                        marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    Enter Driver Charge
                                </Text>

                                <TextInput
                                    placeholder="Enter Driver Charge"
                                    value={tripPayment.driver_charge.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text: any) =>
                                        setTripPayment({ ...tripPayment, driver_charge: text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#000",
                                        padding: 10,
                                        borderRadius: 5,
                                        color: 'black',
                                        marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    Enter Total Amount
                                </Text>

                                <TextInput
                                    placeholder="Enter Total Amount"
                                    value={tripPayment.total_amount.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text: any) =>
                                        setTripPayment({ ...tripPayment, total_amount: text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#000",
                                        padding: 10,
                                        borderRadius: 5,
                                        color: 'black',
                                        marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    Enter Tax % (optional)
                                </Text>

                                <TextInput
                                    placeholder="Enter Tax"
                                    value={tripPayment.tax.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text: any) =>
                                        setTripPayment({ ...tripPayment, tax: text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#000",
                                        padding: 10,
                                        borderRadius: 5,
                                        color: 'black',
                                        marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginVertical: 10 }}>
                                <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                                    Enter platform fees % (optional)
                                </Text>

                                <TextInput
                                    placeholder="Enter platformfees"
                                    value={tripPayment.platformfees.toString()}
                                    keyboardType="numeric"
                                    onChangeText={(text: any) =>
                                        setTripPayment({ ...tripPayment, platformfees: text })
                                    }
                                    style={{
                                        borderWidth: 1,
                                        borderColor: "#000",
                                        padding: 10,
                                        borderRadius: 5,
                                        color: 'black',
                                        marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginTop: '30%' }}>
                                <TouchableOpacity
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        height: 50,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: 20,
                                        marginTop: 30
                                    }}
                                onPress={() => handleCreatePayment(tripPayment)}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                                        Create Payment
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}

            </View>
        </View>
    );
};

export default CreatePayment;
