import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    FlatList,
    Modal,
    TextInput,
    Switch
} from "react-native";
import Header from "../../../Common/PageHeader";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { DeletePackageService, GetPackageListService, UpdatePackageService } from "./helper";
import { COLORS } from "../../../utils/ColorCode";

const PackageList = () => {
    const value = "Package List";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(null);

    const [updateShow, setUpdateShow] = useState(false);
    const [packageData, setPackageData] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<any>();
    const [updateData, setUpdateData] = useState<any>({
        name: "",
        amount: 0,
        validity_days: 0,
        description: [""],
        is_active: false
    })

    const openUpdateShow = (id: any) => {
        setSelectedId(id)
        setUpdateShow(true)
    }

    const closeUpdateShow = () => {
        setUpdateShow(false)
    }

    const validatePackage = () => {
        if (!updateData.name.trim()) {
            showError("Package name is required");
            return false;
        }

        if (!updateData.amount || Number(updateData.amount) <= 0) {
            showError("Enter a valid amount");
            return false;
        }

        if (!updateData.validity_days || Number(updateData.validity_days) <= 0) {
            showError("Enter valid validity days");
            return false;
        }

        if (
            !updateData.description.length ||
            updateData.description.some((item: string) => item.trim() === "")
        ) {
            showError("Please enter all descriptions");
            return false;
        }

        return true;
    };

    const UpdatePackageList = async (id: any, token: any) => {
        if (!validatePackage()) return;

        setLoading(true);
        const payload = {
            name: updateData?.name,
            amount: Number(updateData?.amount),
            validity_days: Number(updateData?.validity_days),
            description: JSON.stringify(updateData?.description),
            is_active: updateData?.is_active
        }
        try {
            const res = await UpdatePackageService(id, payload, token);
            const { data: { message = "", success = false } } = res

            if (success === true) {
                showSuccess(message)
                closeUpdateShow()
                fetchPackageList(token)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const DeletePackageList = async (id: any, usertoken: any) => {
        setLoading(true);
        try {
            const res = await DeletePackageService(id, usertoken)
            const { data: { message = "", success = false } } = res
            if (success === true) {
                showSuccess(message)
                fetchPackageList(usertoken)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchPackageList = async (usertoken: any) => {
        setLoading(true);
        try {
            const res = await GetPackageListService(usertoken);
            const { data: { data = [], message = "", success = false } } = res
            if (success === true) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    description: (() => {
                        try {
                            return JSON.parse(item.description);
                        } catch {
                            return [item.description];
                        }
                    })(),
                    is_active: item.is_active === 1,
                }));

                setPackageData(formattedData);
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
                fetchPackageList(token)
            }
        } catch (error) {
            showError(error);
        }
    }

    const handleDescriptionChange = (text: string, index: number) => {
        const updated = [...updateData.description];
        updated[index] = text;

        setUpdateData({
            ...updateData,
            description: updated,
        });
    };

    const addDescription = () => {
        setUpdateData({
            ...updateData,
            description: [...updateData.description, ""],
        });
    };

    const removeDescription = (index: number) => {
        const updated = updateData.description.filter((_: any, i: any) => i !== index);

        setUpdateData({
            ...updateData,
            description: updated.length ? updated : [""], // Keep at least one input
        });
    };

    useEffect(() => {
        userStoredData()
    }, [])

    return (
        <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
            <Header value={value} />

            <FlatList
                data={packageData}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ padding: 15 }}
                removeClippedSubviews={false}
                ListEmptyComponent={() => (
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 50,
                            color: "#888",
                        }}
                    >
                        No Packages Found
                    </Text>
                )}
                renderItem={({ item }) => (
                    <View
                        style={{
                            backgroundColor: "#FFF", padding: 15, borderRadius: 10, marginBottom: 15, elevation: 3,
                        }}
                    >
                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: "20%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>Name</Text>
                            </View>

                            <View style={{ width: "80%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: "#000" }}>{item.name}</Text>
                            </View>
                        </View>

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: "20%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>Amount</Text>
                            </View>

                            <View style={{ width: "80%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: '#000' }}>₹{item.amount}</Text>
                            </View>
                        </View>

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: "20%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>Validity</Text>
                            </View>

                            <View style={{ width: "80%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "700", color: '#000' }}>{item.validity_days} Days</Text>
                            </View>
                        </View>

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: "20%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>Description</Text>
                            </View>

                            <View style={{ width: "80%" }}>
                                {item.description?.map((desc: string, index: number) => (
                                    <Text style={{ marginTop: 2, fontSize: 13, fontWeight: "700", color: '#000' }} key={index}>• {desc}</Text>
                                ))}
                            </View>
                        </View>

                        <View style={{ width: '100%', flexDirection: 'row' }}>
                            <View style={{ width: "20%" }}>
                                <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.primary }}>Is Active</Text>
                            </View>

                            <View style={{ width: "80%" }}>
                                <Text style={{ color: item.is_active ? "green" : "red" }}>
                                    {item.is_active ? "Active" : "Inactive"}
                                </Text>
                            </View>
                        </View>


                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15, width: '100%', height: '20%' }}>
                            <TouchableOpacity
                                onPress={()=>openUpdateShow(item?.id)}
                                style={{
                                    backgroundColor: "#2196F3",
                                    borderRadius: 8,
                                    width: '46%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                            >
                                <Text style={{ color: "#FFF", textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Update</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: "red",
                                    borderRadius: 8,
                                    width: '46%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}
                                onPress={() => DeletePackageList(item.id, tokens)}
                            >
                                <Text style={{ color: "#FFF", textAlign: 'center', fontWeight: 'bold', fontSize: 15 }}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            <Modal
                visible={updateShow}
                animationType="slide"
                transparent
                onRequestClose={closeUpdateShow}
            >
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
                        <View style={{ width: '100%' }}>
                            <View style={{ marginTop: 2 }}>
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 12 }}>Package Name</Text>
                                <TextInput
                                    placeholder="Enter Package Name"
                                    placeholderTextColor="#999"
                                    value={updateData.name}
                                    onChangeText={(text) =>
                                        setUpdateData({ ...updateData, name: text })
                                    }
                                    style={{
                                        height: 50, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#F9FAFB",
                                        paddingHorizontal: 15, fontSize: 16, marginBottom: 18, marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginTop: 2 }}>
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 12 }}>Amount</Text>
                                <TextInput
                                    placeholder="Enter Amount"
                                    placeholderTextColor="#999"
                                    value={updateData.amount}
                                    onChangeText={(text) =>
                                        setUpdateData({ ...updateData, amount: text })
                                    }
                                    keyboardType="numeric"
                                    style={{
                                        height: 50, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#F9FAFB",
                                        paddingHorizontal: 15, fontSize: 16, marginBottom: 18, marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginTop: 2 }}>
                                <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 12 }}>Validity Days</Text>
                                <TextInput
                                    placeholder="Enter Validity Days"
                                    placeholderTextColor="#999"
                                    value={updateData.validity_days}
                                    onChangeText={(text) =>
                                        setUpdateData({ ...updateData, validity_days: text })
                                    }
                                    style={{
                                        height: 50, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#F9FAFB",
                                        paddingHorizontal: 15, fontSize: 16, marginBottom: 18, marginTop: 5
                                    }}
                                />
                            </View>

                            <View style={{ marginTop: 2 }}>
                                <Text style={{ color: COLORS.primary, fontWeight: "bold", fontSize: 12 }}>Is Active</Text>

                                <View
                                    style={{
                                        height: 50, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, backgroundColor: "#F9FAFB",
                                        paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between",
                                        alignItems: "center", marginBottom: 18,
                                    }}
                                >
                                    <Text style={{ fontSize: 16, color: "#333", }}>{updateData.is_active ? "Active" : "Inactive"}</Text>

                                    <Switch
                                        value={updateData.is_active}
                                        onValueChange={(value) =>
                                            setUpdateData({
                                                ...updateData,
                                                is_active: value,
                                            })
                                        }
                                        trackColor={{ false: "#D1D5DB", true: COLORS.primary }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                            </View>

                            <View style={{ marginTop: 2 }}>
                                <Text
                                    style={{
                                        color: COLORS.primary,
                                        fontWeight: "bold",
                                        fontSize: 12,
                                        marginBottom: 10,
                                    }}
                                >
                                    Description
                                </Text>

                                {updateData.description.map((item: any, index: any) => (
                                    <View
                                        key={index}
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginBottom: 12,
                                        }}
                                    >
                                        <TextInput
                                            placeholder={`Line ${index + 1}`}
                                            placeholderTextColor="#999"
                                            value={item}
                                            onChangeText={(text) => handleDescriptionChange(text, index)}
                                            style={{
                                                flex: 1,
                                                height: 50,
                                                borderWidth: 1,
                                                borderColor: "#E5E7EB",
                                                borderRadius: 12,
                                                backgroundColor: "#F9FAFB",
                                                paddingHorizontal: 15,
                                                fontSize: 16,
                                            }}
                                        />

                                        <TouchableOpacity
                                            onPress={() => removeDescription(index)}
                                            style={{
                                                marginLeft: 10,
                                                backgroundColor: "#EF4444",
                                                paddingHorizontal: 15,
                                                paddingVertical: 14,
                                                borderRadius: 10,
                                            }}
                                        >
                                            <Text style={{ color: "#fff", fontWeight: "bold" }}>-</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                <TouchableOpacity
                                    onPress={addDescription}
                                    style={{
                                        backgroundColor: COLORS.primary,
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        alignItems: "center",
                                        marginTop: 5,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "#fff",
                                            fontWeight: "bold",
                                            fontSize: 15,
                                        }}
                                    >
                                        + Add Line
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 20
                            }}
                        >
                            <TouchableOpacity
                                onPress={closeUpdateShow}
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
                                onPress={() => UpdatePackageList(selectedId, tokens)}
                                style={{
                                    backgroundColor: COLORS.primary,
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
            </Modal>
        </View>
    );
}

export default PackageList;