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
import { CreateGearTypeService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const CreateGearType = () => {
    const value = "Create Gear Type";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [gearType, setGearType] = useState<{ name: string }>({
        name: "",
    });

    const handleCreateGearType = async () => {
        if (!gearType.name.trim()) {
            showError("Please enter gear type name");
            return;
        }

        setLoading(true);
        const payload = {
            name: gearType.name.trim(),
            is_active: true,
        };

        try {
            const res = await CreateGearTypeService(payload);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success) {
                showSuccess(message || "Gear type created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create gear type");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to create gear type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Add New Transmission Specification" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Info Card */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="information-circle-outline" size={24} color="#0284C7" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Transmission Mapping</Text>
                        <Text style={styles.bannerSubtitle}>
                            Gear types allow users to filter drivers who have verified experience operating that transmission.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.fieldLabel}>Gear Type Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="cog-outline" size={18} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. Manual, Automatic, Electric (EV)"
                            placeholderTextColor="#94A3B8"
                            value={gearType.name}
                            onChangeText={(text) => setGearType({ name: text })}
                            style={styles.textInput}
                            autoCapitalize="words"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleCreateGearType}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                                <Text style={styles.submitButtonText}>Create Gear Type</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreateGearType;

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
        backgroundColor: "#E0F2FE",
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
    fieldLabel: {
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
        marginBottom: 20,
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
    buttonIcon: {
        marginRight: 6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
});