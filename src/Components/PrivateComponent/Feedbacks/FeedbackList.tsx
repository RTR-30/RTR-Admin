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
import { DeleteFeedbackService, GetFeedbackService, UpdateFeedbackService } from "./helper";

const FeedbackList = () => {
    const value = "Feedback List";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [tokens, setTokens] = useState(null);

    const targetType = [
        { key: "User", value: 'user' },
        { key: "Driver", value: 'driver' }
    ]

    const sentiment = [
        { key: "Positive", value: 'positive' },
        { key: "Neutral", value: 'neutral' },
        { key: "Negative", value: 'negative' }
    ]

    const [feedBackList, setFeedbackList] = useState<any[]>([]);
    const [Feedback, setFeedback] = useState<any>({
        id: '',
        name: "",
        target_type: "",
        sentiment: "",
    })
    const [modalVisible, setModalVisible] = useState(false);

    const openUpdateModal = (item: any) => {
        setFeedback({
            id: item.id,
            name: item.name,
            target_type: item.target_type,
            sentiment: item.sentiment
        });

        setModalVisible(true);
    };

    const deleteFeedback = async (id: any, token: any) => {
        setLoading(true);
        try {
            const res = await DeleteFeedbackService(id, token);
            const { data: { message = "", success = false } } = res
            if (success === true) {
                showSuccess(message)
                fetchFeedbackList(token)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const updateFeedback = async (data: any, token: any) => {
        setLoading(true);
        const payload = {
            name: Feedback.name,
            target_type: Feedback.target_type,
            sentiment: Feedback.sentiment,
            is_active: 1
        }
        try {
            const res = await UpdateFeedbackService(data?.id, payload, token);
            const { data: { message = "", success = false } } = res;

            if (success === true) {
                showSuccess(message)
                setModalVisible(false)
                fetchFeedbackList(token)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false)
        }
    }

    const fetchFeedbackList = async (token: any) => {
        setLoading(true);
        try {
            const res = await GetFeedbackService(token);
            const { data: { data = [], message = "", success = false } } = res
            if (success) {
                setFeedbackList(data);
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
                fetchFeedbackList(token);
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
                        padding: 5,
                        paddingBottom: 40,
                    }}
                >
                    {loading && (
                        <ActivityIndicator size="small" style={{ marginTop: 10 }} />
                    )}
                    <View style={{ width: '100%', padding: 5 }}>
                        <FlatList
                            data={feedBackList}
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

                                        <Text style={{ fontSize: 16, fontWeight: "600", color: "#000", marginVertical: 10 }}>
                                            Name: {item.name}
                                        </Text>

                                        <Text style={{ fontSize: 16, color: "#000", fontWeight: "600", marginVertical: 10 }}>
                                            Target Type: {item.target_type}
                                        </Text>

                                        <Text style={{ fontSize: 16, color: item.sentiment === "positive" ? "green" : item.sentiment === "negative" ? "red" : "#FF8F00", fontWeight: "600", marginVertical: 10 }}>
                                            Sentiment: {item.sentiment}
                                        </Text>

                                    </View>

                                    <View style={{ width: '100%', flexDirection: 'row', marginTop: 10, justifyContent: 'space-around' }}>
                                        <View style={{ backgroundColor: "#2196F3", justifyContent: 'center', alignItems: 'center', width: '45%', borderRadius: '10%' }}>
                                            <TouchableOpacity onPress={() => openUpdateModal(item)} style={{ padding: 10, width: '100%' }}>
                                                <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Update</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={{ backgroundColor: 'red', justifyContent: 'center', alignItems: 'center', width: '45%', borderRadius: '10%' }}>
                                            <TouchableOpacity onPress={() => deleteFeedback(item?.id, tokens)} style={{ padding: 10, width: '100%' }}>
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
                                    No Feedback Tag Found
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
                            Update Feedback
                        </Text>

                        <Text>Feedback Tag Name</Text>

                        <TextInput
                            value={Feedback.name}
                            onChangeText={(text) =>
                                setFeedback({ ...Feedback, name: text })
                            }
                            placeholder="Enter feedback tag"
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                marginTop: 8,
                                marginBottom: 20,
                                height: 45,
                            }}
                        />

                        <Text style={{ marginBottom: 10 }}>Target Type</Text>

                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                marginBottom: 20,
                            }}
                        >
                            {targetType.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() =>
                                        setFeedback({
                                            ...Feedback,
                                            target_type: item.value,
                                        })
                                    }
                                    style={{
                                        paddingHorizontal: 18,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor:
                                            Feedback.target_type === item.value
                                                ? "#2196F3"
                                                : "#ccc",
                                        backgroundColor:
                                            Feedback.target_type === item.value
                                                ? "#2196F3"
                                                : "#fff",
                                        marginRight: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                Feedback.target_type === item.value
                                                    ? "#fff"
                                                    : "#000",
                                        }}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={{ marginBottom: 10 }}>Sentiment</Text>

                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                marginBottom: 25,
                            }}
                        >
                            {sentiment.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() =>
                                        setFeedback({
                                            ...Feedback,
                                            sentiment: item.value,
                                        })
                                    }
                                    style={{
                                        paddingHorizontal: 18,
                                        paddingVertical: 10,
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor:
                                            Feedback.sentiment === item.value
                                                ? "#2196F3"
                                                : "#ccc",
                                        backgroundColor:
                                            Feedback.sentiment === item.value
                                                ? "#2196F3"
                                                : "#fff",
                                        marginRight: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color:
                                                Feedback.sentiment === item.value
                                                    ? "#fff"
                                                    : "#000",
                                        }}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
                                    updateFeedback(Feedback, tokens)
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

export default FeedbackList;