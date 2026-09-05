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
import { useNavigation } from "@react-navigation/native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";
import { CreateFeedbackService } from "./helper";

const CreateFeedback = () => {
    const value = "Create Feedback";
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

    const [feedback, setFeedback] = useState<any>({
        name: '',
        targetType: '',
        sentiment: ''
    })

    const createFeedback = async () => {
        if(feedback?.name === "" || feedback?.targetType === "" || feedback?.sentiment === ""){
            return showError("Need to set all data")
        }

        setLoading(true);
        const payload = {
            name: feedback?.name,
            targetType: feedback?.targetType,
            sentiment: feedback?.sentiment
        }
        try {
            const res = await CreateFeedbackService(payload, tokens);
            const { data: { success = false, message = "" } } = res;

            if(success === true){
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

                    <View style={{ width: "100%", padding: 5 }}>
                        {/* Feedback Name */}
                        <Text style={{ fontSize: 14, marginBottom: 8, color: "#000" }}>Feedback Tag Name</Text>

                        <TextInput
                            placeholder="Enter feedback name"
                            value={feedback.name}
                            onChangeText={(text) =>
                                setFeedback({ ...feedback, name: text })
                            }
                            style={{
                                borderWidth: 1,
                                borderColor: "#ccc",
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                height: 45,
                                marginBottom: 20,
                            }}
                            placeholderTextColor={"#000"}
                        />

                        {/* Target Type */}
                        <Text style={{ fontSize: 14, marginBottom: 8, color: "#000" }}>Target Type</Text>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 20, }}>
                            {targetType.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() =>
                                        setFeedback({
                                            ...feedback,
                                            targetType: item.value,
                                        })
                                    }
                                    style={{
                                        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
                                        borderColor:
                                            feedback.targetType === item.value
                                                ? COLORS.primary
                                                : "#ccc",
                                        backgroundColor:
                                            feedback.targetType === item.value
                                                ? COLORS.primary
                                                : "#fff",
                                        marginRight: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text
                                        style={{ color: feedback.targetType === item.value ? "#fff" : "#000", fontWeight: 'bold', fontSize: 13 }}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Sentiment */}
                        <Text style={{ fontSize: 14, marginBottom: 8, color: "#000" }}>Sentiment</Text>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 30 }}>
                            {sentiment.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() =>
                                        setFeedback({
                                            ...feedback,
                                            sentiment: item.value,
                                        })
                                    }
                                    style={{
                                        paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
                                        borderColor:
                                            feedback.sentiment === item.value
                                                ? COLORS.primary
                                                : "#ccc",
                                        backgroundColor:
                                            feedback.sentiment === item.value
                                                ? COLORS.primary
                                                : "#fff",
                                        marginRight: 10,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text
                                        style={{ color: feedback.sentiment === item.value ? "#fff" : "#000", fontWeight: 'bold', fontSize: 13 }}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={() => { createFeedback() }}
                            style={{
                                height: 48, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center", borderRadius: 8,
                            }}
                        >
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                                Create Feedback
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}

export default CreateFeedback;