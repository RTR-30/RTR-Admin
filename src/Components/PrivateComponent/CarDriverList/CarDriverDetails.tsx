import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { updatePartnerStatusService } from "./helperapi";

const CarDriverDetails = () => {
    const value = "Partner Details";
    const route = useRoute<any>();
    const { carDriver } = route.params || {};

    const [loader, setLoader] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<"SUSPEND" | "BLOCK">("SUSPEND");

    const [userInput, setUserInput] = useState<{
        status: string;
        suspended_until: string;
        reason: string;
    }>({
        status: "",
        suspended_until: "",
        reason: "",
    });

    const openStatusModal = (type: "SUSPEND" | "BLOCK") => {
        setModalType(type);
        setUserInput({
            status: type === "SUSPEND" ? "SUSPENDED" : "BLOCKED",
            suspended_until: "",
            reason: "",
        });
        setModalVisible(true);
    };

    const closeModal = () => {
        if (loader) return;
        setModalVisible(false);
        setDatePickerOpen(false);
        setUserInput({
            status: "",
            suspended_until: "",
            reason: "",
        });
    };

    const formatDisplayDate = (dateString: string) => {
        if (!dateString) return "Select Date";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleUpdateStatus = async () => {
        if (!userInput.reason.trim()) {
            showError("Please enter a reason");
            return;
        }

        if (modalType === "SUSPEND" && !userInput.suspended_until) {
            showError("Please select suspended until date");
            return;
        }

        try {
            setLoader(true);
            let payload: any = {};

            if (modalType === "SUSPEND") {
                payload = {
                    status: "SUSPENDED",
                    suspended_until: userInput.suspended_until,
                    reason: userInput.reason.trim(),
                };
            } else {
                payload = {
                    status: "BLOCKED",
                    reason: userInput.reason.trim(),
                };
            }

            const response = await updatePartnerStatusService(carDriver?.id, payload);

            if (response?.status === 200 || response?.status === 201) {
                showSuccess(
                    modalType === "SUSPEND"
                        ? "Driver suspended successfully"
                        : "Driver blocked successfully"
                );
                closeModal();
            } else {
                showError("Failed to update status");
            }
        } catch (error: any) {
            showError(error?.message || "Something went wrong");
        } finally {
            setLoader(false);
        }
    };

    const initials = (carDriver?.name || "D")
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Driver Profile & Operational Status" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Hero Profile Card */}
                <View style={styles.heroCard}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <Text style={styles.heroName}>{carDriver?.name || "Unnamed Driver"}</Text>
                    <View style={styles.heroBadgesRow}>
                        <View style={styles.idBadge}>
                            <Text style={styles.idBadgeText}>Driver ID: #{carDriver?.id ?? "-"}</Text>
                        </View>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleBadgeText}>Fleet Partner</Text>
                        </View>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Contact Details</Text>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconWrapper, { backgroundColor: "#DBEAFE" }]}>
                            <Ionicons name="call" size={16} color="#2563EB" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Phone Number</Text>
                            <Text style={styles.infoValue}>{carDriver?.mobileno || "Not provided"}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconWrapper, { backgroundColor: "#F3E8FF" }]}>
                            <Ionicons name="mail" size={16} color="#9333EA" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Email Address</Text>
                            <Text style={styles.infoValue}>{carDriver?.email || "Not provided"}</Text>
                        </View>
                    </View>
                </View>

                {/* Location & Field */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Address & Operating Field</Text>

                    <View style={styles.infoRow}>
                        <View style={[styles.infoIconWrapper, { backgroundColor: "#DCFCE7" }]}>
                            <Ionicons name="location" size={16} color="#16A34A" />
                        </View>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoLabel}>Residential Address</Text>
                            <Text style={styles.infoValue}>{carDriver?.address || "Not provided"}</Text>
                        </View>
                    </View>

                    {carDriver?.field ? (
                        <>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <View style={[styles.infoIconWrapper, { backgroundColor: "#FEF3C7" }]}>
                                    <Ionicons name="briefcase" size={16} color="#D97706" />
                                </View>
                                <View style={styles.infoTextContainer}>
                                    <Text style={styles.infoLabel}>Operating Field</Text>
                                    <Text style={styles.infoValue}>{carDriver.field}</Text>
                                </View>
                            </View>
                        </>
                    ) : null}
                </View>

                {/* Account Actions */}
                <View style={styles.actionsCard}>
                    <Text style={styles.sectionTitle}>Administrative Actions</Text>
                    <Text style={styles.actionsSubtitle}>
                        Suspend ride broadcasts or permanently blacklist driver access
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.suspendButton}
                            onPress={() => openStatusModal("SUSPEND")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="pause-circle-outline" size={18} color="#D97706" style={{ marginRight: 6 }} />
                            <Text style={styles.suspendButtonText}>Suspend Driver</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.blockButton}
                            onPress={() => openStatusModal("BLOCK")}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="ban-outline" size={18} color="#DC2626" style={{ marginRight: 6 }} />
                            <Text style={styles.blockButtonText}>Block Driver</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Status Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <Ionicons
                                    name={modalType === "SUSPEND" ? "pause-circle" : "ban"}
                                    size={22}
                                    color={modalType === "SUSPEND" ? "#D97706" : "#DC2626"}
                                    style={{ marginRight: 8 }}
                                />
                                <Text style={styles.modalTitle}>
                                    {modalType === "SUSPEND" ? "Suspend Driver" : "Block Driver"}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={closeModal} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalSubtitle}>
                            {modalType === "SUSPEND"
                                ? "Temporarily halt ride broadcasts to this driver until the selected date."
                                : "Permanently restrict driver access and revoke app login."}
                        </Text>

                        {/* Date Picker Button if Suspend */}
                        {modalType === "SUSPEND" && (
                            <View style={{ marginBottom: 14 }}>
                                <Text style={styles.modalInputLabel}>Suspended Until Date</Text>
                                <TouchableOpacity
                                    style={styles.datePickerButton}
                                    onPress={() => setDatePickerOpen(true)}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="calendar-outline" size={18} color="#64748B" style={{ marginRight: 8 }} />
                                    <Text
                                        style={[
                                            styles.datePickerText,
                                            userInput.suspended_until ? styles.datePickerTextActive : null,
                                        ]}
                                    >
                                        {formatDisplayDate(userInput.suspended_until)}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Reason Input */}
                        <Text style={styles.modalInputLabel}>Enforcement Reason</Text>
                        <TextInput
                            placeholder="Enter detailed reason for suspension or block..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            value={userInput.reason}
                            onChangeText={(text) => setUserInput({ ...userInput, reason: text })}
                            style={styles.reasonInput}
                        />

                        {/* Actions */}
                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={closeModal}
                                disabled={loader}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalConfirmButton,
                                    { backgroundColor: modalType === "SUSPEND" ? "#D97706" : "#DC2626" },
                                    loader && styles.modalConfirmButtonDisabled,
                                ]}
                                onPress={handleUpdateStatus}
                                disabled={loader}
                            >
                                {loader ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.modalConfirmText}>
                                        {modalType === "SUSPEND" ? "Confirm Suspension" : "Confirm Block"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Date Picker Component */}
            <DatePicker
                modal
                open={datePickerOpen}
                date={
                    userInput.suspended_until
                        ? new Date(userInput.suspended_until)
                        : new Date()
                }
                mode="date"
                minimumDate={new Date()}
                onConfirm={(date) => {
                    setDatePickerOpen(false);
                    setUserInput({
                        ...userInput,
                        suspended_until: date.toISOString(),
                    });
                }}
                onCancel={() => {
                    setDatePickerOpen(false);
                }}
            />
        </View>
    );
};

export default CarDriverDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    heroCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        padding: 22,
        alignItems: "center",
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    avatarCircle: {
        width: 68,
        height: 68,
        borderRadius: 22,
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1E40AF",
    },
    heroName: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
        marginBottom: 8,
        textAlign: "center",
    },
    heroBadgesRow: {
        flexDirection: "row",
        gap: 8,
    },
    idBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    idBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#475569",
    },
    roleBadge: {
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    roleBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E40AF",
    },
    sectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: COLORS.textMain,
        marginBottom: 14,
        letterSpacing: 0.2,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        fontWeight: "600",
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
        color: COLORS.textMain,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 12,
    },
    actionsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    actionsSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 16,
        lineHeight: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        gap: 12,
    },
    suspendButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: "#FEF3C7",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    suspendButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#92400E",
    },
    blockButton: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        backgroundColor: "#FEE2E2",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    blockButtonText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#991B1B",
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
        marginBottom: 8,
    },
    modalTitleRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    modalSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 16,
        lineHeight: 16,
    },
    modalInputLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        height: 46,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        backgroundColor: "#F8FAFC",
    },
    datePickerText: {
        fontSize: 14,
        color: "#94A3B8",
    },
    datePickerTextActive: {
        color: COLORS.textMain,
        fontWeight: "600",
    },
    reasonInput: {
        minHeight: 80,
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: COLORS.textMain,
        backgroundColor: "#F8FAFC",
        textAlignVertical: "top",
        marginBottom: 18,
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
    modalConfirmButton: {
        flex: 1.5,
        height: 46,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    modalConfirmButtonDisabled: {
        opacity: 0.7,
    },
    modalConfirmText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FFFFFF",
    },
});