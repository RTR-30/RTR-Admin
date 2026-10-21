import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { showError, showSuccess } from "../../../Common/ToastMessage";
import { referralAmountService, updateReferralAmountService } from "./helper";
import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const AppSettings = () => {
    const value = "App Settings";
    const [loading, setLoading] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);
    const [appSettingsData, setAppSettingsData] = useState<any[]>([]);

    const updateReferralAmount = async () => {
        setUpdating(true);

        const payload = {
            settings: appSettingsData,
        };

        try {
            const res = await updateReferralAmountService(payload);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success === true) {
                fetchReferralAmount();
                showSuccess(message || "Settings updated successfully");
            } else {
                showError(message || "Failed to update settings");
            }
        } catch (error) {
            showError("Failed to update settings");
        } finally {
            setUpdating(false);
        }
    };

    const handleValueChange = (index: number, val: string) => {
        const updatedData = [...appSettingsData];
        updatedData[index].setting_value = val;
        setAppSettingsData(updatedData);
    };

    const fetchReferralAmount = async () => {
        setLoading(true);

        try {
            const res = await referralAmountService();
            const { data: { data = [], message = "", success = false } = {} } = res || {};

            if (success === true) {
                setAppSettingsData(data);
            } else {
                showError(message || "Failed to fetch settings");
            }
        } catch (error) {
            showError("Failed to load app settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReferralAmount();
    }, []);

    const formatSettingName = (key: string) => {
        if (!key) return "Configuration Setting";
        return key
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    const renderHeader = () => (
        <View style={styles.banner}>
            <View style={styles.bannerIconWrapper}>
                <Ionicons name="options-outline" size={24} color="#0284C7" />
            </View>
            <View style={styles.bannerTextWrapper}>
                <Text style={styles.bannerTitle}>Platform Parameters</Text>
                <Text style={styles.bannerSubtitle}>
                    Modify global referral payouts, reward amounts, and system defaults.
                </Text>
            </View>
        </View>
    );

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="settings-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Settings Found</Text>
                <Text style={styles.emptySubtitle}>There are currently no configurable system parameters.</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Global System Variables & Thresholds" />

            <View style={styles.content}>
                {loading && appSettingsData.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading platform settings...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={appSettingsData}
                        keyExtractor={(item, index) => item?.setting_key || index.toString()}
                        removeClippedSubviews={false}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={renderEmpty}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item, index }) => (
                            <View style={styles.settingCard}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.keyIconWrapper}>
                                        <Ionicons name="key-outline" size={16} color={COLORS.primary} />
                                    </View>
                                    <View style={styles.keyInfo}>
                                        <Text style={styles.settingKeyText}>
                                            {formatSettingName(item?.setting_key)}
                                        </Text>
                                        <Text style={styles.rawKeyText}>Key: {item?.setting_key}</Text>
                                    </View>
                                </View>

                                <View style={styles.inputWrapper}>
                                    <TextInput
                                        value={String(item?.setting_value ?? "")}
                                        keyboardType="numeric"
                                        onChangeText={(text) => handleValueChange(index, text)}
                                        style={styles.textInput}
                                        placeholder="0"
                                        placeholderTextColor="#94A3B8"
                                    />
                                    <View style={styles.valueBadge}>
                                        <Text style={styles.valueBadgeText}>Value</Text>
                                    </View>
                                </View>
                            </View>
                        )}
                        ListFooterComponent={
                            appSettingsData.length > 0 ? (
                                <TouchableOpacity
                                    onPress={updateReferralAmount}
                                    disabled={updating}
                                    activeOpacity={0.8}
                                    style={[styles.saveButton, updating && styles.saveButtonDisabled]}
                                >
                                    {updating ? (
                                        <ActivityIndicator size="small" color="#FFFFFF" />
                                    ) : (
                                        <View style={styles.buttonInner}>
                                            <Ionicons name="save-outline" size={18} color="#FFFFFF" style={styles.saveIcon} />
                                            <Text style={styles.saveButtonText}>Save All Settings</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default AppSettings;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
    },
    listContent: {
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
    settingCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    keyIconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    keyInfo: {
        flex: 1,
    },
    settingKeyText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    rawKeyText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 1,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 46,
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    valueBadge: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    valueBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    saveButton: {
        backgroundColor: COLORS.primary,
        height: 50,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 14,
        marginBottom: 20,
        ...SHADOWS.md,
    },
    saveButtonDisabled: {
        opacity: 0.7,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    saveIcon: {
        marginRight: 8,
    },
    saveButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    centerLoader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    loaderText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 10,
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textMuted,
        textAlign: "center",
        marginTop: 6,
    },
});