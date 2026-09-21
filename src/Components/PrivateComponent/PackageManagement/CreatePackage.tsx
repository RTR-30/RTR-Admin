import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    Switch,
    ActivityIndicator
} from "react-native";
import Header from "../../../Common/PageHeader";
import { COLORS } from "../../../utils/ColorCode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { CreatePackageService } from "./helper";
import { useNavigation } from "@react-navigation/native";

const CreatePackage = () => {
    const value = "Create Package";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);

    const [createData, setCreateData] = useState<any>({
        name: "",
        amount: 0,
        validity_days: 0,
        description: [""],
        is_active: false
    })

    const validatePackage = () => {
        if (!createData.name.trim()) {
            showError("Package name is required");
            return false;
        }

        if (!createData.amount || Number(createData.amount) <= 0) {
            showError("Enter a valid amount");
            return false;
        }

        if (!createData.validity_days || Number(createData.validity_days) <= 0) {
            showError("Enter valid validity days");
            return false;
        }

        if (
            !createData.description.length ||
            createData.description.some((item: string) => item.trim() === "")
        ) {
            showError("Please enter all descriptions");
            return false;
        }

        return true;
    };

    const handleCreatePackage = async (data: any) => {
        if (!validatePackage()) return;

        setLoading(true);
        const payload = {
            name: data?.name,
            amount: Number(data?.amount),
            validity_days: Number(data?.validity_days),
            description: JSON.stringify(data?.description),
            is_active: data?.is_active
        }

        try {
            const res = await CreatePackageService(payload);
            const {data: {message = '', success = false}} = res;
            if(success){
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

    const handleDescriptionChange = (text: string, index: number) => {
        const updated = [...createData.description];
        updated[index] = text;

        setCreateData({
            ...createData,
            description: updated,
        });
    };

    const addDescription = () => {
        setCreateData({
            ...createData,
            description: [...createData.description, ""],
        });
    };

    const removeDescription = (index: number) => {
        const updated = createData.description.filter((_: any, i: any) => i !== index);

        setCreateData({
            ...createData,
            description: updated.length ? updated : [""], // Keep at least one input
        });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        padding: 10,
                        paddingBottom: 40,
                    }}
                >
                    {loading && (
                        <ActivityIndicator size="small" style={{ marginTop: 10 }} />
                    )}
                    <View style={{ width: '100%', padding: 5 }}>
                        <View style={{ marginTop: 2 }}>
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 12 }}>Package Name</Text>
                            <TextInput
                                placeholder="Enter Package Name"
                                placeholderTextColor="#999"
                                value={createData.name}
                                onChangeText={(text) =>
                                    setCreateData({ ...createData, name: text })
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
                                value={createData.amount}
                                onChangeText={(text) =>
                                    setCreateData({ ...createData, amount: text })
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
                                value={createData.validity_days}
                                onChangeText={(text) =>
                                    setCreateData({ ...createData, validity_days: text })
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
                                <Text style={{ fontSize: 16, color: "#333", }}>{createData.is_active ? "Active" : "Inactive"}</Text>

                                <Switch
                                    value={createData.is_active}
                                    onValueChange={(value) =>
                                        setCreateData({
                                            ...createData,
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

                            {createData.description.map((item: any, index: any) => (
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

                        <View style={{ marginTop: '10%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => handleCreatePackage(createData)} style={{ width: '70%', justifyContent: 'center', alignItems: 'center', backgroundColor: "green", padding: 10, borderRadius: 40 }}>
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Create Package</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default CreatePackage;