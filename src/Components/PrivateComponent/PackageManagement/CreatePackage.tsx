import React, { useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    Switch,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { CreatePackageService } from "./helper";

const CreatePackage = () => {
    const value = "Create Package";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);

    const [createData, setCreateData] = useState<{
        name: string;
        amount: string;
        validity_days: string;
        description: string[];
        is_active: boolean;
    }>({
        name: "",
        amount: "",
        validity_days: "",
        description: [""],
        is_active: true,
    });

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
            showError("Please fill all description items");
            return false;
        }

        return true;
    };

    const handleCreatePackage = async () => {
        if (!validatePackage()) return;

        setLoading(true);
        const payload = {
            name: createData.name.trim(),
            amount: Number(createData.amount),
            validity_days: Number(createData.validity_days),
            description: JSON.stringify(createData.description.map((d) => d.trim())),
            is_active: createData.is_active,
        };

        try {
            const res = await CreatePackageService(payload);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success) {
                showSuccess(message || "Package created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create package");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to create package");
        } finally {
            setLoading(false);
        }
    };

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
        const updated = createData.description.filter((_, i) => i !== index);
        setCreateData({
            ...createData,
            description: updated.length ? updated : [""],
        });
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Driver Subscription & Prepaid Plans" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="sparkles-outline" size={24} color="#9333EA" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Commercial Membership Plan</Text>
                        <Text style={styles.bannerSubtitle}>
                            Drivers purchase this package to access premium ride dispatches and reduced platform commission.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Name */}
                    <Text style={styles.label}>Package Name</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="pricetag-outline" size={18} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            placeholder="e.g. Gold Fleet Partner, Monthly Pro Pass"
                            placeholderTextColor="#94A3B8"
                            value={createData.name}
                            onChangeText={(text) => setCreateData({ ...createData, name: text })}
                            style={styles.textInput}
                        />
                    </View>

                    {/* Amount & Validity Grid */}
                    <View style={styles.twoColumnGrid}>
                        <View style={styles.columnHalf}>
                            <Text style={styles.label}>Price (₹)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="cash-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="e.g. 999"
                                    placeholderTextColor="#94A3B8"
                                    value={createData.amount}
                                    onChangeText={(text) => setCreateData({ ...createData, amount: text })}
                                    keyboardType="numeric"
                                    style={styles.textInput}
                                />
                            </View>
                        </View>

                        <View style={styles.columnHalf}>
                            <Text style={styles.label}>Validity (Days)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="calendar-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="e.g. 30"
                                    placeholderTextColor="#94A3B8"
                                    value={createData.validity_days}
                                    onChangeText={(text) => setCreateData({ ...createData, validity_days: text })}
                                    keyboardType="numeric"
                                    style={styles.textInput}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Active Status Switch */}
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={styles.switchTitle}>Publish Immediately</Text>
                            <Text style={styles.switchDesc}>Make visible to drivers in the driver application</Text>
                        </View>
                        <Switch
                            value={createData.is_active}
                            onValueChange={(val) => setCreateData({ ...createData, is_active: val })}
                            trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                            thumbColor={createData.is_active ? "#10B981" : "#F8FAFC"}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Features / Description */}
                    <View style={styles.featuresHeader}>
                        <Text style={styles.label}>Plan Features & Inclusions</Text>
                        <TouchableOpacity onPress={addDescription} style={styles.addLineButton}>
                            <Ionicons name="add" size={16} color={COLORS.primary} />
                            <Text style={styles.addLineButtonText}>Add Line</Text>
                        </TouchableOpacity>
                    </View>

                    {createData.description.map((item, index) => (
                        <View key={index} style={styles.featureRow}>
                            <View style={styles.featureIndexBadge}>
                                <Text style={styles.featureIndexText}>{index + 1}</Text>
                            </View>
                            <TextInput
                                placeholder={`Feature #${index + 1} (e.g. 0% Commission on Outstation)`}
                                placeholderTextColor="#94A3B8"
                                value={item}
                                onChangeText={(text) => handleDescriptionChange(text, index)}
                                style={styles.featureInput}
                            />
                            {createData.description.length > 1 ? (
                                <TouchableOpacity
                                    onPress={() => removeDescription(index)}
                                    style={styles.removeLineButton}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    ))}

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreatePackage}
                        disabled={loading}
                        activeOpacity={0.8}
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.submitButtonText}>Create Package</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreatePackage;

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
        backgroundColor: "#F3E8FF",
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
        marginBottom: 16,
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
    twoColumnGrid: {
        flexDirection: "row",
        gap: 12,
    },
    columnHalf: {
        flex: 1,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 8,
        marginBottom: 12,
    },
    switchTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    switchDesc: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 14,
    },
    featuresHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    addLineButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEE2E2",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    addLineButtonText: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.primary,
        marginLeft: 4,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    featureIndexBadge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: "#E2E8F0",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 8,
    },
    featureIndexText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#475569",
    },
    featureInput: {
        flex: 1,
        height: 44,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 12,
        fontSize: 13,
        color: COLORS.textMain,
    },
    removeLineButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
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