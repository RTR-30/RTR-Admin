import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity
} from "react-native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { referralAmountService, updateReferralAmountService } from "./helper";
import Header from "../../../Common/PageHeader";
import { COLORS } from "../../../utils/ColorCode";


const AppSettings = () => {
    const value = "AppSettings"
    const [loading, setLoading] = useState<boolean>(false);
    const [tokens, setTokens] = useState<any>(null);
    // const [referral, setRefferal] = useState<any>({});

    const [appSettingsData, setAppSettingsData] = useState<any>([])

    const updateReferralAmount = async () => {
        setLoading(true);

        const payload = {
            settings: appSettingsData,
        }
        
        try {
            const res = await updateReferralAmountService(payload, tokens)
            const { data: { data = {}, message = '', success } } = res;
            if (success === true) {
                fetchReferralAmount(tokens)
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const handleValueChange = (index: number, value: string) => {
        const updatedData = [...appSettingsData];
        updatedData[index].setting_value = value;
        setAppSettingsData(updatedData);
    };

    const fetchReferralAmount = async (token: any) => {
        setLoading(true);

        try {
            const res = await referralAmountService(token);
            const { data: { data = {}, message = '', success } } = res;

            if (success === true) {
                setAppSettingsData(res?.data?.data)
                // setRefferal(data)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            const storeData = JSON.parse(getDatas);

            const token = storeData?.token
            if (token) {
                setTokens(token);
                fetchReferralAmount(token)
            }
        } catch (error) {
            showError(error);
        }
    }

    useEffect(() => {
        fetchUserData()
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 15 }}>
                <FlatList
                    data={appSettingsData}
                    keyExtractor={(item, index) => index.toString()}
                    removeClippedSubviews={false}
                    renderItem={({ item, index }) => (
                        <View
                            style={{
                                marginBottom: 15,
                                backgroundColor: "#fff",
                                padding: 12,
                                borderRadius: 10,
                                elevation: 2,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#000",
                                    fontWeight: "bold",
                                    marginBottom: 8,
                                }}
                            >
                                {item.setting_key.replaceAll("_", " ")}
                            </Text>

                            <TextInput
                                value={item.setting_value}
                                keyboardType="numeric"
                                onChangeText={(text) =>
                                    handleValueChange(index, text)
                                }
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#ccc",
                                    borderRadius: 8,
                                    paddingHorizontal: 10,
                                    height: 45,
                                    color: "#000",
                                }}
                            />
                        </View>
                    )}
                    ListFooterComponent={
                        <TouchableOpacity
                            onPress={updateReferralAmount}
                            style={{
                                backgroundColor: COLORS.primary,
                                height: 50,
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: 10,
                                marginTop: 20,
                                marginBottom: 30,
                            }}
                        >
                            <Text
                                style={{
                                    color: "#fff",
                                    fontWeight: "bold",
                                }}
                            >
                                Update Settings
                            </Text>
                        </TouchableOpacity>
                    }
                />
            </View>
        </View>
    )
}

export default AppSettings;