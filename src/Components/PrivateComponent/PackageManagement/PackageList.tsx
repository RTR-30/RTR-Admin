import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    FlatList,
    Modal,
    TextInput,
    Switch,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import {
    DeletePackageService,
    GetPackageListService,
    UpdatePackageService,
} from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const PackageList = () => {
    const value = "Package Directory";

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateShow, setUpdateShow] = useState(false);
    const [packageData, setPackageData] = useState<any[]>([]);
    const [selectedId, setSelectedId] = useState<any>(null);

    const [updateData, setUpdateData] = useState<{
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
        is_active: false,
    });

    const openUpdateShow = (item: any) => {
        setSelectedId(item.id);
        setUpdateData({
            name: item.name || "",
            amount: String(item.amount || ""),
            validity_days: String(item.validity_days || ""),
            description: Array.isArray(item.description) && item.description.length ? item.description : [""],
            is_active: item.is_active === true || item.is_active === 1,
        });
        setUpdateShow(true);
    };

    const closeUpdateShow = () => {
        setUpdateShow(false);
    };

    const validatePackage = () => {
        if (!updateData.name.trim()) {
            showError("Package name is required");
            return false;
        }

        if (!updateData.amount || Number(updateData.amount) <= 0) {
            showError("Enter a valid amount");
            return false;
        }

        if (!updateData.validity_days || Number(updateData.validity_days) <= 0) {
            showError("Enter valid validity days");
            return false;
        }

        if (
            !updateData.description.length ||
            updateData.description.some((item: string) => item.trim() === "")
        ) {
            showError("Please enter all descriptions");
            return false;
        }

        return true;
    };

    const handleUpdatePackage = async () => {
        if (!validatePackage()) return;

        setUpdating(true);
        const payload = {
            name: updateData.name.trim(),
            amount: Number(updateData.amount),
            validity_days: Number(updateData.validity_days),
            description: JSON.stringify(updateData.description.map((d) => d.trim())),
            is_active: updateData.is_active,
        };

        try {
            const res = await UpdatePackageService(selectedId, payload);
            const { data: { message = "", success = false } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Package updated successfully");
                closeUpdateShow();
                fetchPackageList();
            } else {
                showError(message || "Failed to update package");
            }
        } catch (error: any) {
            showError("Failed to update package");
        } finally {
            setUpdating(false);
        }
    };

    const confirmDelete = (id: any, name: string) => {
        Alert.alert(
            "Delete Package",
            `Are you sure you want to delete "${name}"? This plan will no longer be available to drivers.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deletePackage(id),
                },
            ]
        );
    };

    const deletePackage = async (id: any) => {
        setLoading(true);
        try {
            const res = await DeletePackageService(id);
            const { data: { message = "", success = false } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Package deleted");
                fetchPackageList();
            } else {
                showError(message || "Failed to delete package");
            }
        } catch (error: any) {
            showError("Failed to delete package");
        } finally {
            setLoading(false);
        }
    };

    const fetchPackageList = async () => {
        setLoading(true);
        try {
            const res = await GetPackageListService();
            const { data: { data = [], message = "", success = false } = {} } = res || {};

            if (success === true) {
                const formattedData = data.map((item: any) => ({
                    ...item,
                    description: (() => {
                        try {
                            return typeof item.description === "string"
                                ? JSON.parse(item.description)
                                : item.description;
                        } catch {
                            return [item.description];
                        }
                    })(),
                    is_active: item.is_active === 1 || item.is_active === true,
                }));

                setPackageData(formattedData);
            } else {
                showError(message || "Failed to load packages");
            }
        } catch (error: any) {
            showError("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const handleDescriptionChange = (text: string, index: number) => {
        const updated = [...updateData.description];
        updated[index] = text;
        setUpdateData({
            ...updateData,
            description: updated,
        });
    };

    const addDescription = () => {
        setUpdateData({
            ...updateData,
            description: [...updateData.description, ""],
        });
    };

    const removeDescription = (index: number) => {
        const updated = updateData.description.filter((_, i) => i !== index);
        setUpdateData({
            ...updateData,
            description: updated.length ? updated : [""],
        });
    };

    useEffect(() => {
        fetchPackageList();
    }, []);

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Driver Membership Plans & Tariffs" />

            <View style={styles.content}>
                {loading && packageData.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading membership packages...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={packageData}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        renderItem={({ item }) => {
                            const isActive = item.is_active === true;
                            return (
                                <View style={styles.card}>
                                    {/* Header Row */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.planInfo}>
                                            <Text style={styles.planName}>{item.name}</Text>
                                            <View style={styles.validityBadge}>
                                                <Ionicons name="calendar-outline" size={12} color="#0284C7" />
                                                <Text style={styles.validityText}>{item.validity_days} Days</Text>
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                styles.statusBadge,
                                                { backgroundColor: isActive ? "#ECFDF5" : "#F1F5F9" },
                                            ]}
                                        >
                                            <View
                                                style={[
                                                    styles.statusDot,
                                                    { backgroundColor: isActive ? "#10B981" : "#94A3B8" },
                                                ]}
                                            />
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: isActive ? "#065F46" : "#64748B" },
                                                ]}
                                            >
                                                {isActive ? "Active" : "Inactive"}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Price Tag */}
                                    <View style={styles.priceContainer}>
                                        <Text style={styles.priceSymbol}>₹</Text>
                                        <Text style={styles.priceAmount}>
                                            {Number(item.amount || 0).toLocaleString("en-IN")}
                                        </Text>
                                        <Text style={styles.pricePeriod}>/ {item.validity_days} days</Text>
                                    </View>

                                    {/* Descriptions */}
                                    {Array.isArray(item.description) && item.description.length > 0 ? (
                                        <View style={styles.perksContainer}>
                                            {item.description.map((desc: string, idx: number) => (
                                                <View key={idx} style={styles.perkRow}>
                                                    <Ionicons name="checkmark-circle" size={15} color="#10B981" style={styles.perkIcon} />
                                                    <Text style={styles.perkText}>{desc}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    ) : null}

                                    {/* Actions */}
                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            onPress={() => openUpdateShow(item)}
                                            style={styles.editButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="create-outline" size={15} color="#2563EB" style={styles.btnIcon} />
                                            <Text style={styles.editButtonText}>Edit Plan</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => confirmDelete(item.id, item.name)}
                                            style={styles.deleteButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="trash-outline" size={15} color="#DC2626" style={styles.btnIcon} />
                                            <Text style={styles.deleteButtonText}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="pricetags-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Packages Found</Text>
                                <Text style={styles.emptySubtitle}>
                                    Create a membership package to make plans available to fleet partners.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Edit Modal */}
            <Modal
                visible={updateShow}
                animationType="fade"
                transparent={true}
                onRequestClose={closeUpdateShow}
            >
                <KeyboardAvoidingView
                    style={styles.modalBackdrop}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Package</Text>
                            <TouchableOpacity onPress={closeUpdateShow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
                            <Text style={styles.modalLabel}>Package Name</Text>
                            <TextInput
                                value={updateData.name}
                                onChangeText={(text) => setUpdateData({ ...updateData, name: text })}
                                placeholder="Enter package name"
                                placeholderTextColor="#94A3B8"
                                style={styles.modalInput}
                            />

                            <View style={styles.twoColumnGrid}>
                                <View style={styles.columnHalf}>
                                    <Text style={styles.modalLabel}>Amount (₹)</Text>
                                    <TextInput
                                        value={updateData.amount}
                                        onChangeText={(text) => setUpdateData({ ...updateData, amount: text })}
                                        keyboardType="numeric"
                                        placeholder="Amount"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.modalInput}
                                    />
                                </View>

                                <View style={styles.columnHalf}>
                                    <Text style={styles.modalLabel}>Validity (Days)</Text>
                                    <TextInput
                                        value={updateData.validity_days}
                                        onChangeText={(text) => setUpdateData({ ...updateData, validity_days: text })}
                                        keyboardType="numeric"
                                        placeholder="Days"
                                        placeholderTextColor="#94A3B8"
                                        style={styles.modalInput}
                                    />
                                </View>
                            </View>

                            <View style={styles.switchRow}>
                                <View>
                                    <Text style={styles.switchTitle}>Active Status</Text>
                                    <Text style={styles.switchDesc}>Show in mobile apps</Text>
                                </View>
                                <Switch
                                    value={updateData.is_active}
                                    onValueChange={(val) => setUpdateData({ ...updateData, is_active: val })}
                                    trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                                    thumbColor={updateData.is_active ? "#10B981" : "#F8FAFC"}
                                />
                            </View>

                            <View style={styles.featuresHeader}>
                                <Text style={styles.modalLabel}>Features / Lines</Text>
                                <TouchableOpacity onPress={addDescription} style={styles.addLineButton}>
                                    <Ionicons name="add" size={14} color={COLORS.primary} />
                                    <Text style={styles.addLineButtonText}>Add Line</Text>
                                </TouchableOpacity>
                            </View>

                            {updateData.description.map((item, idx) => (
                                <View key={idx} style={styles.featureRow}>
                                    <TextInput
                                        value={item}
                                        onChangeText={(text) => handleDescriptionChange(text, idx)}
                                        placeholder={`Feature #${idx + 1}`}
                                        placeholderTextColor="#94A3B8"
                                        style={styles.modalFeatureInput}
                                    />
                                    {updateData.description.length > 1 ? (
                                        <TouchableOpacity
                                            onPress={() => removeDescription(idx)}
                                            style={styles.removeLineButton}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={closeUpdateShow}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalSaveButton, updating && styles.modalSaveButtonDisabled]}
                                onPress={handleUpdatePackage}
                                disabled={updating}
                            >
                                {updating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalSaveText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

export default PackageList;

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
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    planInfo: {
        flex: 1,
        paddingRight: 10,
    },
    planName: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
        marginBottom: 4,
    },
    validityBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    validityText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#0369A1",
        marginLeft: 4,
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 5,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
    },
    priceContainer: {
        flexDirection: "row",
        alignItems: "baseline",
        marginVertical: 10,
    },
    priceSymbol: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.primary,
        marginRight: 2,
    },
    priceAmount: {
        fontSize: 26,
        fontWeight: "900",
        color: COLORS.textMain,
    },
    pricePeriod: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginLeft: 6,
        fontWeight: "500",
    },
    perksContainer: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginVertical: 10,
    },
    perkRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    perkIcon: {
        marginRight: 8,
    },
    perkText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: "500",
        flex: 1,
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    editButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#EFF6FF",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#BFDBFE",
    },
    editButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2563EB",
    },
    deleteButton: {
        flex: 1,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#FEF2F2",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#DC2626",
    },
    btnIcon: {
        marginRight: 5,
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 20,
        ...SHADOWS.lg,
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    modalInput: {
        height: 46,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        color: COLORS.textMain,
        backgroundColor: "#F8FAFC",
        marginBottom: 12,
    },
    twoColumnGrid: {
        flexDirection: "row",
        gap: 10,
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
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    switchDesc: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    featuresHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
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
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    modalFeatureInput: {
        flex: 1,
        height: 42,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 8,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 10,
        fontSize: 13,
        color: COLORS.textMain,
    },
    removeLineButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
    modalActionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 14,
    },
    modalCancelButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: "#F1F5F9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748B",
    },
    modalSaveButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: COLORS.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    modalSaveButtonDisabled: {
        opacity: 0.7,
    },
    modalSaveText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});
