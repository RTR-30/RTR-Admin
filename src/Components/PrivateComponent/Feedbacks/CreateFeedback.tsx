import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { CreateFeedbackService } from "./helper";

const CreateFeedback = () => {
    const value = "Create Feedback Tag";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);

    const targetType = [
        { key: "Customer / User", value: "user", icon: "person-outline" },
        { key: "Fleet Driver", value: "driver", icon: "car-sport-outline" },
    ];

    const sentiment = [
        { key: "Positive", value: "positive", color: "#10B981", bg: "#ECFDF5", icon: "happy-outline" },
        { key: "Neutral", value: "neutral", color: "#F59E0B", bg: "#FFFBEB", icon: "remove-circle-outline" },
        { key: "Negative", value: "negative", color: "#EF4444", bg: "#FEF2F2", icon: "sad-outline" },
    ];

    const [feedback, setFeedback] = useState({
        name: "",
        targetType: "user",
        sentiment: "positive",
    });

    const handleCreateFeedback = async () => {
        if (!feedback.name.trim()) {
            return showError("Please enter feedback tag name");
        }

        setLoading(true);
        const payload = {
            name: feedback.name.trim(),
            targetType: feedback.targetType,
            sentiment: feedback.sentiment,
        };

        try {
            const res = await CreateFeedbackService(payload);
            const { data: { success = false, message = "" } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Feedback tag created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create feedback tag");
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Add Trip Rating Preset Tag" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="chatbox-ellipses-outline" size={24} color="#E11D48" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Feedback Preset Tags</Text>
                        <Text style={styles.bannerSubtitle}>
                            Shown to customers and drivers after ride completion for one-tap feedback.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Tag Name */}
                    <Text style={styles.label}>Tag Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="pricetag-outline" size={18} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. Great conversation, Clean car, Safe driver"
                            placeholderTextColor="#94A3B8"
                            value={feedback.name}
                            onChangeText={(text) => setFeedback({ ...feedback, name: text })}
                            style={styles.textInput}
                        />
                    </View>

                    {/* Target Audience */}
                    <Text style={styles.label}>Target Audience</Text>
                    <View style={styles.targetsRow}>
                        {targetType.map((item) => {
                            const isSelected = feedback.targetType === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => setFeedback({ ...feedback, targetType: item.value })}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.targetButton,
                                        isSelected && styles.targetButtonSelected,
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={18}
                                        color={isSelected ? "#FFFFFF" : "#64748B"}
                                        style={styles.btnIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.targetButtonText,
                                            isSelected && styles.targetButtonTextSelected,
                                        ]}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Sentiment */}
                    <Text style={styles.label}>Sentiment Category</Text>
                    <View style={styles.sentimentsRow}>
                        {sentiment.map((item) => {
                            const isSelected = feedback.sentiment === item.value;
                            return (
                                <TouchableOpacity
                                    key={item.value}
                                    onPress={() => setFeedback({ ...feedback, sentiment: item.value })}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.sentimentButton,
                                        { backgroundColor: isSelected ? item.color : item.bg },
                                        isSelected && styles.sentimentButtonSelected,
                                    ]}
                                >
                                    <Ionicons
                                        name={item.icon}
                                        size={18}
                                        color={isSelected ? "#FFFFFF" : item.color}
                                        style={styles.btnIcon}
                                    />
                                    <Text
                                        style={[
                                            styles.sentimentButtonText,
                                            { color: isSelected ? "#FFFFFF" : item.color },
                                        ]}
                                    >
                                        {item.key}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreateFeedback}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.submitButtonText}>Create Feedback Tag</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateFeedback;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    banner: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    bannerIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#FFE4E6",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    bannerTextWrapper: {
        flex: 1,
    },
    bannerTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    bannerSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
        lineHeight: 16,
    },
    formCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    label: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 18,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    targetsRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 18,
    },
    targetButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 44,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    targetButtonSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    targetButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    targetButtonTextSelected: {
        color: "#FFFFFF",
        fontWeight: "700",
    },
    sentimentsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    sentimentButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },
    sentimentButtonSelected: {
        ...SHADOWS.sm,
    },
    sentimentButtonText: {
        fontSize: 12,
        fontWeight: "700",
    },
    btnIcon: {
        marginRight: 6,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        ...SHADOWS.sm,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
});