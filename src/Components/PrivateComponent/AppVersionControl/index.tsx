import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { appVersionServices, updateAppVersionServices } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const AppVersionControl = () => {
    const value = "Version Control";

    const [loading, setLoading] = useState<boolean>(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [appVersion, setAppVersions] = useState<any[]>([]);

    const fetchAppVersions = async () => {
        setLoading(true);

        try {
            const res = await appVersionServices();
            const { data: { data = [], success = false, message = "" } = {} } = res || {};

            if (success === true) {
                setAppVersions(data);
            } else {
                showError(message || "Failed to fetch app versions");
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (
        id: number,
        field: "latest_version" | "min_required_version",
        val: string
    ) => {
        setAppVersions((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [field]: val,
                      }
                    : item
            )
        );
    };

    const handleUpdate = async (item: any) => {
        if (!item.latest_version?.trim()) {
            showError("Please enter latest version");
            return;
        }

        if (!item.min_required_version?.trim()) {
            showError("Please enter minimum required version");
            return;
        }

        try {
            setUpdatingId(item.id);

            const payload = {
                latest_version: item.latest_version.trim(),
                min_required_version: item.min_required_version.trim(),
                force_update: false,
                update_url: null,
                message: null,
            };

            const res = await updateAppVersionServices(payload, item.id);
            const { data: { success = false, message = "" } = {} } = res || {};

            if (success) {
                showSuccess(message || "Version updated successfully");
                fetchAppVersions();
            } else {
                showError(message || "Version update failed");
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setUpdatingId(null);
        }
    };

    const renderHeader = () => (
        <View style={styles.banner}>
            <View style={styles.bannerIconWrapper}>
                <Ionicons name="rocket-outline" size={24} color="#EA580C" />
            </View>
            <View style={styles.bannerTextWrapper}>
                <Text style={styles.bannerTitle}>Client Deployment Rules</Text>
                <Text style={styles.bannerSubtitle}>
                    Control forced update triggers and minimum supported builds for mobile apps.
                </Text>
            </View>
        </View>
    );

    const renderList = ({ item }: { item: any }) => {
        const isAndroid = (item?.platform || "").toLowerCase().includes("android");
        const isUpdating = updatingId === item.id;

        return (
            <View style={styles.card}>
                {/* Header Row */}
                <View style={styles.cardHeader}>
                    <View
                        style={[
                            styles.platformIconWrapper,
                            { backgroundColor: isAndroid ? "#ECFDF5" : "#F1F5F9" },
                        ]}
                    >
                        <Ionicons
                            name={isAndroid ? "logo-android" : "logo-apple"}
                            size={20}
                            color={isAndroid ? "#10B981" : "#0F172A"}
                        />
                    </View>

                    <View style={styles.titleInfo}>
                        <Text style={styles.title}>
                            {item.app_type} App
                        </Text>
                        <Text style={styles.platformSubtitle}>{item.platform}</Text>
                    </View>

                    <View style={styles.platformBadge}>
                        <Text style={styles.platformBadgeText}>{item.platform?.toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Latest Version */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Latest Store Version (Current)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="sparkles-outline" size={16} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            value={item.latest_version}
                            onChangeText={(text) => handleChange(item.id, "latest_version", text)}
                            placeholder="e.g. 1.2.0"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Minimum Version */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Minimum Required Version (Floor)</Text>
                    <View style={styles.inputWrapper}>
                        <Ionicons name="shield-outline" size={16} color="#64748B" style={styles.inputIcon} />
                        <TextInput
                            value={item.min_required_version}
                            onChangeText={(text) => handleChange(item.id, "min_required_version", text)}
                            placeholder="e.g. 1.0.0"
                            placeholderTextColor="#94A3B8"
                            style={styles.input}
                            keyboardType="decimal-pad"
                        />
                    </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                    style={[styles.updateButton, isUpdating && styles.updateButtonDisabled]}
                    onPress={() => handleUpdate(item)}
                    disabled={isUpdating}
                    activeOpacity={0.8}
                >
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <View style={styles.buttonInner}>
                            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={styles.updateIcon} />
                            <Text style={styles.updateButtonText}>Save Version Policy</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    useEffect(() => {
        fetchAppVersions();
    }, []);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Mobile App Release Policies" />

            <View style={styles.content}>
                {loading && appVersion.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading app versions...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={appVersion}
                        renderItem={renderList}
                        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                        removeClippedSubviews={false}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cube-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Version Records</Text>
                                <Text style={styles.emptySubtitle}>No mobile application records found.</Text>
                            </View>
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

export default AppVersionControl;

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
        backgroundColor: "#FFEDD5",
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
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    platformIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    titleInfo: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        textTransform: "capitalize",
    },
    platformSubtitle: {
        fontSize: 12,
        color: COLORS.textMuted,
        textTransform: "capitalize",
        marginTop: 2,
    },
    platformBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    platformBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 12,
    },
    inputContainer: {
        marginBottom: 12,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 46,
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    updateButton: {
        height: 46,
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 8,
        ...SHADOWS.sm,
    },
    updateButtonDisabled: {
        opacity: 0.7,
    },
    buttonInner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    updateIcon: {
        marginRight: 6,
    },
    updateButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
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