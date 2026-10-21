import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { deletePaymentService, getTripPaymentServices, updateTripPaymentService } from "./helperapi";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const UpdatePaymentList = () => {
    const route = useRoute();
    const { TripDetails }: any = route.params || {};
    const value = TripDetails?.trip_type ? `${TripDetails.trip_type}` : "Payment Rates";

    const [loading, setLoading] = useState<boolean>(false);
    const [updating, setUpdating] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    const [tripPayment, setTripPayment] = useState<any[]>([]);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    const [modalData, setModalData] = useState({
        hours: "",
        total_amount: "",
    });

    const openEditModal = (item: any) => {
        setSelectedPayment(item);
        setModalData({
            hours: String(item?.hours ?? ""),
            total_amount: String(item?.total_amount ?? ""),
        });
        setShowModal(true);
    };

    const confirmDelete = (id: any) => {
        Alert.alert(
            "Delete Rate Tier",
            "Are you sure you want to delete this payment rate tier?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => handleDelete(id),
                },
            ]
        );
    };

    const handleDelete = async (ids: any) => {
        setLoading(true);
        try {
            const res = await deletePaymentService(ids);
            const { success, message } = res?.data || {};
            if (success === true) {
                showSuccess(message || "Rate tier deleted");
                handleGetTripPayment();
            } else {
                showError(message || "Failed to delete rate tier");
            }
        } catch (error) {
            showError("Failed to delete rate tier");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!modalData.hours || !modalData.total_amount) {
            showError("Hours and total amount are required");
            return;
        }

        setUpdating(true);
        const payload = {
            tripTypeId: Number(selectedPayment.trip_type_id),
            hours: Number(modalData?.hours),
            totalAmount: Number(modalData?.total_amount),
        };

        try {
            const res = await updateTripPaymentService(selectedPayment, payload);
            const { success, message } = res?.data || {};

            if (success === true) {
                showSuccess(message || "Payment rate updated successfully");
                setShowModal(false);
                handleGetTripPayment();
            } else {
                showError(message || "Failed to update rate");
            }
        } catch (error) {
            showError("Failed to update rate");
        } finally {
            setUpdating(false);
        }
    };

    const handleGetTripPayment = async () => {
        setLoading(true);

        try {
            const res = await getTripPaymentServices(TripDetails);
            const { success, message, data } = res?.data || {};

            if (success === true) {
                setTripPayment(data || []);
            } else {
                showError(message || "Failed to load payment rates");
            }
        } catch (error) {
            showError("Failed to fetch rates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetTripPayment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderHeader = () => (
        <View style={styles.banner}>
            <View style={styles.bannerLeft}>
                <Text style={styles.bannerCategory}>{TripDetails?.trip_type || "Category"}</Text>
                <Text style={styles.bannerSubtitle}>Active Hourly Rates & Commission Splits</Text>
            </View>
            <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{tripPayment.length} Tiers</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Hourly Tariffs & Commission Splits" />

            <View style={styles.content}>
                {loading && tripPayment.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading payment rates...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={tripPayment}
                        keyExtractor={(item) => item.id.toString()}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                {/* Header */}
                                <View style={styles.cardHeader}>
                                    <View style={styles.hoursBadge}>
                                        <Ionicons name="time-outline" size={14} color="#0369A1" />
                                        <Text style={styles.hoursText}>{item?.hours} Hours Block</Text>
                                    </View>
                                    <View style={styles.fareContainer}>
                                        <Text style={styles.fareLabel}>Total Fare: </Text>
                                        <Text style={styles.fareAmount}>
                                            ₹{Number(item?.total_amount || 0).toLocaleString("en-IN")}
                                        </Text>
                                    </View>
                                </View>

                                {/* Breakdown Grid */}
                                <View style={styles.breakdownGrid}>
                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>Driver Payout</Text>
                                        <Text style={[styles.breakdownValue, { color: "#059669" }]}>
                                            ₹{Number(item?.driver_charge || 0).toLocaleString("en-IN")}
                                        </Text>
                                    </View>

                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>Platform Fee</Text>
                                        <Text style={[styles.breakdownValue, { color: "#2563EB" }]}>
                                            {item?.platform_fee}%
                                        </Text>
                                    </View>

                                    <View style={styles.breakdownItem}>
                                        <Text style={styles.breakdownLabel}>Applicable Tax</Text>
                                        <Text style={[styles.breakdownValue, { color: "#D97706" }]}>
                                            {item?.tax}%
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View style={styles.actionsRow}>
                                    <TouchableOpacity
                                        onPress={() => openEditModal(item)}
                                        style={styles.editButton}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="create-outline" size={15} color="#2563EB" style={styles.btnIcon} />
                                        <Text style={styles.editButtonText}>Edit Tier</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => confirmDelete(item?.id)}
                                        style={styles.deleteButton}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="trash-outline" size={15} color="#DC2626" style={styles.btnIcon} />
                                        <Text style={styles.deleteButtonText}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="cash-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Rate Tiers Found</Text>
                                <Text style={styles.emptySubtitle}>
                                    No payment tariffs configured for this trip type yet.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Edit Modal */}
            <Modal
                visible={showModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalBackdrop}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Payment Tier</Text>
                            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Duration (Hours)</Text>
                        <TextInput
                            value={modalData.hours}
                            onChangeText={(text) => setModalData({ ...modalData, hours: text })}
                            keyboardType="numeric"
                            placeholder="Hours"
                            placeholderTextColor="#94A3B8"
                            style={styles.modalInput}
                        />

                        <Text style={styles.modalLabel}>Total Fare Amount (₹)</Text>
                        <TextInput
                            value={modalData.total_amount}
                            onChangeText={(text) => setModalData({ ...modalData, total_amount: text })}
                            keyboardType="numeric"
                            placeholder="Amount in Rupees"
                            placeholderTextColor="#94A3B8"
                            style={styles.modalInput}
                        />

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setShowModal(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalSaveButton, updating && styles.modalSaveButtonDisabled]}
                                onPress={handleUpdate}
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

export default UpdatePaymentList;

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
        justifyContent: "space-between",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    bannerLeft: {
        flex: 1,
        paddingRight: 10,
    },
    bannerCategory: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    bannerSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    countBadge: {
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0369A1",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    hoursBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#BAE6FD",
    },
    hoursText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0369A1",
        marginLeft: 4,
    },
    fareContainer: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    fareLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    fareAmount: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    breakdownGrid: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        justifyContent: "space-between",
    },
    breakdownItem: {
        alignItems: "center",
        flex: 1,
    },
    breakdownLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: COLORS.textMuted,
        marginBottom: 4,
    },
    breakdownValue: {
        fontSize: 14,
        fontWeight: "700",
    },
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        paddingTop: 10,
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
        height: 48,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        fontSize: 15,
        color: COLORS.textMain,
        backgroundColor: "#F8FAFC",
        marginBottom: 16,
    },
    modalActionsRow: {
        flexDirection: "row",
        gap: 12,
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
