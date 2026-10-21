import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { createTripTypeService } from "./helperapi";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const TripType = () => {
    const value = "Create Trip Type";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [tripTypes, setTripTypes] = useState<{
        tripType: string;
        description: { keyName: string; value: string }[];
    }>({
        tripType: "",
        description: [{ keyName: "des", value: "" }],
    });

    const addDescription = () => {
        setTripTypes({
            ...tripTypes,
            description: [...tripTypes.description, { keyName: "des", value: "" }],
        });
    };

    const removeDescription = (index: number) => {
        const updated = tripTypes.description.filter((_, i) => i !== index);
        setTripTypes({ ...tripTypes, description: updated.length ? updated : [{ keyName: "des", value: "" }] });
    };

    const updateDescription = (text: string, index: number) => {
        const updated = [...tripTypes.description];
        updated[index].value = text;
        setTripTypes({ ...tripTypes, description: updated });
    };

    const handleSubmit = async () => {
        if (!tripTypes.tripType.trim()) {
            return showError("Please enter trip type name");
        }

        const validDescriptions = tripTypes.description.filter((d) => d.value.trim() !== "");
        if (!validDescriptions.length) {
            return showError("Please enter at least one description or term");
        }

        setLoading(true);
        const payload = {
            tripType: tripTypes.tripType.trim(),
            description: JSON.stringify(validDescriptions),
        };

        try {
            const res = await createTripTypeService(payload);
            const { data: { success = false, message = "" } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Trip type created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create trip type");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to create trip type");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Ride Category & Booking Terms" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="navigate-outline" size={24} color="#0D9488" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Ride Classification</Text>
                        <Text style={styles.bannerSubtitle}>
                            Define categories like One-Way, Round-Trip, or Outstation with policy descriptions.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    <Text style={styles.label}>Trip Type Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="car-outline" size={18} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. Outstation Round Trip, Local Hourly"
                            placeholderTextColor="#94A3B8"
                            value={tripTypes.tripType}
                            onChangeText={(text) => setTripTypes({ ...tripTypes, tripType: text })}
                            style={styles.textInput}
                        />
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.descHeader}>
                        <Text style={styles.label}>Category Rules & Terms</Text>
                        <TouchableOpacity onPress={addDescription} style={styles.addLineButton}>
                            <Ionicons name="add" size={14} color={COLORS.primary} />
                            <Text style={styles.addLineButtonText}>Add Line</Text>
                        </TouchableOpacity>
                    </View>

                    {tripTypes.description.map((item, index) => (
                        <View key={index} style={styles.descRow}>
                            <View style={styles.descIndexBadge}>
                                <Text style={styles.descIndexText}>{index + 1}</Text>
                            </View>
                            <TextInput
                                placeholder={`Condition or guideline #${index + 1}`}
                                placeholderTextColor="#94A3B8"
                                value={item.value}
                                onChangeText={(text) => updateDescription(text, index)}
                                multiline
                                style={styles.descInput}
                            />
                            {tripTypes.description.length > 1 ? (
                                <TouchableOpacity
                                    onPress={() => removeDescription(index)}
                                    style={styles.removeLineButton}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.submitButtonText}>Create Trip Category</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default TripType;

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
        backgroundColor: "#CCFBF1",
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
        height: 48,
        marginBottom: 14,
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 14,
    },
    descHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    addLineButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    addLineButtonText: {
        fontSize: 11,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 2,
    },
    descRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    descIndexBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
        marginTop: 8,
    },
    descIndexText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#475569",
    },
    descInput: {
        flex: 1,
        minHeight: 60,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: COLORS.textMain,
        textAlignVertical: "top",
    },
    removeLineButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
        marginTop: 12,
    },
    submitButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
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
    btnIcon: {
        marginRight: 6,
    },
    submitButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
});
