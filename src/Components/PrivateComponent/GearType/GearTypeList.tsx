import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    Switch,
    ActivityIndicator,
    FlatList,
    Modal
} from "react-native";
import Header from "../../../Common/PageHeader";
import { useNavigation } from "@react-navigation/native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeleteGearTypeService, GetGearTypeService, UpdateGearTypeService } from "./helper";

const GearTypeList = () => {
    const value = "Gear Type List";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(null);

    const [gearList, setGearList] = useState<any[]>([]);
    const [updateGear, setUpdateGear] = useState<any>({
        id: '',
        name: '',
        is_active: false
    })
    const [modalVisible, setModalVisible] = useState(false);

    const openUpdateModal = (item: any) => {
        setUpdateGear({
            id: item.id,
            name: item.name,
            is_active: item.is_active === 1,
        });

        setModalVisible(true);
    };

    const deleteGear = async (id: any, token: any) => {
        setLoading(true);
        try {
            const res = await DeleteGearTypeService(id, token);
            const { data: { message = "", success = false } } = res
            if (success === true) {
                showSuccess(message)
                fetchGearTypeList(token)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const updateGearTypes = async (data: any, token: any) => {
        setLoading(true);
        const payload = {
            name: data?.name,
            is_active: data?.is_active
        }
        try {
            const res = await UpdateGearTypeService(data?.id, payload, token);
            const { data: { message = "", success = false } } = res;

            if (success === true) {
                showSuccess(message)
                setModalVisible(false)
                fetchGearTypeList(token)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false)
        }
    }

    const fetchGearTypeList = async (token: any) => {
        setLoading(true);
        try {
            const res = await GetGearTypeService(token);
            const { data: { data = [], message = "", success = false } } = res
            if (success) {
                setGearList(data);
            } else {
                showError(message);
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
                fetchGearTypeList(token);
            }
        } catch (error) {
            showError(error);
        }
    }

    useEffect(() => {
        userStoredData()
    }, []);

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
                        <FlatList
                            data={gearList}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            removeClippedSubviews={false}
                            renderItem={({ item }) => (
                                <View
                                    style={{
                                        backgroundColor: "#fff",
                                        padding: 15,
                                        marginBottom: 10,
                                        borderRadius: 8,
                                        elevation: 2,
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <View style={{ width: '100%' }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
                                                {item.name}
                                            </Text>

                                            <Text style={{ color: item.is_active ? "green" : "red", fontWeight: "600" }}>
                                                {item.is_active ? "Active" : "Inactive"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={{ width: '100%', flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' }}>
                                        <View style={{ backgroundColor: "#2196F3", justifyContent: 'center', alignItems: 'center', width: '45%', borderRadius: '10%' }}>
                                            <TouchableOpacity onPress={() => openUpdateModal(item)} style={{ padding: 10, width: '100%' }}>
                                                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Update</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: '45%', borderRadius: '10%' }}>
                                            <TouchableOpacity onPress={() => deleteGear(item?.id, tokens)} style={{ padding: 10, width: '100%' }}>
                                                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Delete</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text
                                    style={{
                                        textAlign: "center",
                                        marginTop: 30,
                                        color: "#888",
                                    }}
                                >
                                    No Gear Types Found
                                </Text>
                            }
                        />
                    </View>

                </ScrollView>
            </View>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <View style={{ width: "90%", backgroundColor: "#fff", borderRadius: 10, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>
                            Update Gear Type
                        </Text>

                        <Text>Name</Text>
                        <TextInput
                            value={updateGear.name}
                            onChangeText={(text) =>
                                setUpdateGear({ ...updateGear, name: text })
                            }
                            placeholder="Enter Gear Name"
                            style={{
                                borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 5, marginBottom: 20
                            }}
                        />

                        <View
                            style={{
                                flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25
                            }}
                        >
                            <Text>Active</Text>

                            <Switch
                                value={updateGear.is_active}
                                onValueChange={(value) =>
                                    setUpdateGear({
                                        ...updateGear,
                                        is_active: value,
                                    })
                                }
                            />
                        </View>

                        <View
                            style={{
                                flexDirection: "row", justifyContent: "space-between",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#999", padding: 12, borderRadius: 8, width: "45%"
                                }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    backgroundColor: "#2196F3", padding: 12, borderRadius: 8, width: "45%",
                                }}
                                onPress={() => {
                                    updateGearTypes(updateGear, tokens)
                                }}
                            >
                                <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }} >
                                    Update
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    )
}

export default GearTypeList;