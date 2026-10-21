import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { createTripPaymentService, getTripTypesServices } from "./helperapi";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const CreatePayment = () => {
    const value = "Create Payment Rate";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [tripTypes, setTripTypes] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState<any>(null);

    const [tripPayment, setTripPayment] = useState({
        trip_type_id: "",
        hours: "",
        total_amount: "",
    });

    const handleTripTypes = async () => {
        setLoading(true);
        try {
            const res = await getTripTypesServices();
            const { success, message, data } = res?.data || {};

            if (success === true) {
                setTripTypes(data || []);
            } else {
                showError(message || "Failed to load trip types");
            }
        } catch (error) {
            showError("Failed to load trip types");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (item: any) => {
        setTripPayment((prev) => ({
            ...prev,
            trip_type_id: item.id,
        }));
        setSelectedTrip(item);
        setShowDropdown(false);
    };

    const handleCreatePayment = async () => {
        if (!tripPayment.trip_type_id || !tripPayment.hours || !tripPayment.total_amount) {
            showError("Please select trip type and enter duration & amount");
            return;
        }

        setSubmitting(true);
        const payload = {
            trip_type_id: Number(tripPayment.trip_type_id),
            hours: Number(tripPayment.hours),
            total_amount: Number(tripPayment.total_amount),
        };

        try {
            const res = await createTripPaymentService(payload);
            const { success, message } = res?.data || {};

            if (success === true) {
                showSuccess(message || "Payment rate created successfully");
                navigation.goBack();
            } else {
                showError(message || "Failed to create rate");
            }
        } catch (error) {
            showError("Failed to create payment rate");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        handleTripTypes();
    }, []);

    const hourlyRate =
        Number(tripPayment.hours) > 0 && Number(tripPayment.total_amount) > 0
            ? Math.round(Number(tripPayment.total_amount) / Number(tripPayment.hours))
            : null;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <Header value={value} subtitle="Configure Hourly Tariffs & Rates" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerIconWrapper}>
                        <Ionicons name="calculator-outline" size={24} color="#2563EB" />
                    </View>
                    <View style={styles.bannerTextWrapper}>
                        <Text style={styles.bannerTitle}>Tariff Tier Configuration</Text>
                        <Text style={styles.bannerSubtitle}>
                            Map fixed block durations and total fares to trip categories.
                        </Text>
                    </View>
                </View>

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Trip Type Selector */}
                    <Text style={styles.label}>Select Trip Category</Text>
                    {selectedTrip ? (
                        <View style={styles.selectedTripBox}>
                            <View style={styles.selectedTripInfo}>
                                <Ionicons name="checkmark-circle" size={18} color="#10B981" style={styles.checkIcon} />
                                <View>
                                    <Text style={styles.selectedTripTitle}>{selectedTrip.trip_type}</Text>
                                    <Text style={styles.selectedTripId}>Category ID: #{selectedTrip.id}</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedTrip(null);
                                    setTripPayment({ ...tripPayment, trip_type_id: "" });
                                }}
                                style={styles.changeTripButton}
                            >
                                <Text style={styles.changeTripText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={{ marginBottom: 16 }}>
                            <TouchableOpacity
                                style={styles.dropdownTrigger}
                                onPress={() => setShowDropdown(!showDropdown)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dropdownPlaceholder}>
                                    {loading ? "Loading categories..." : "Choose Trip Type"}
                                </Text>
                                <Ionicons
                                    name={showDropdown ? "chevron-up" : "chevron-down"}
                                    size={18}
                                    color="#64748B"
                                />
                            </TouchableOpacity>

                            {showDropdown && (
                                <View style={styles.dropdownList}>
                                    {tripTypes.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={styles.dropdownItem}
                                            onPress={() => handleSelect(item)}
                                        >
                                            <Ionicons name="navigate-outline" size={16} color="#0D9488" style={{ marginRight: 8 }} />
                                            <Text style={styles.dropdownItemText}>{item.trip_type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Hours & Amount */}
                    <View style={styles.twoColumnGrid}>
                        <View style={styles.columnHalf}>
                            <Text style={styles.label}>Duration (Hours)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="time-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="e.g. 4"
                                    placeholderTextColor="#94A3B8"
                                    value={tripPayment.hours}
                                    keyboardType="numeric"
                                    onChangeText={(text) => setTripPayment({ ...tripPayment, hours: text })}
                                    style={styles.textInput}
                                />
                            </View>
                        </View>

                        <View style={styles.columnHalf}>
                            <Text style={styles.label}>Total Fare (₹)</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="cash-outline" size={18} color="#64748B" style={styles.inputIcon} />
                                <TextInput
                                    placeholder="e.g. 600"
                                    placeholderTextColor="#94A3B8"
                                    value={tripPayment.total_amount}
                                    keyboardType="numeric"
                                    onChangeText={(text) => setTripPayment({ ...tripPayment, total_amount: text })}
                                    style={styles.textInput}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Rate Calculation Summary */}
                    {hourlyRate !== null ? (
                        <View style={styles.summaryCard}>
                            <Ionicons name="analytics-outline" size={18} color="#0284C7" style={{ marginRight: 8 }} />
                            <Text style={styles.summaryText}>
                                Effective Rate: <Text style={styles.summaryBold}>₹{hourlyRate}/hour</Text> ({tripPayment.hours} hrs for ₹{tripPayment.total_amount})
                            </Text>
                        </View>
                    ) : null}

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreatePayment}
                        disabled={submitting}
                        activeOpacity={0.8}
                        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    >
                        {submitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <View style={styles.buttonInner}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.btnIcon} />
                                <Text style={styles.submitButtonText}>Save Payment Rate</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default CreatePayment;

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
        backgroundColor: "#DBEAFE",
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
    dropdownTrigger: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 50,
    },
    dropdownPlaceholder: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
    },
    dropdownList: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginTop: 6,
        overflow: "hidden",
        ...SHADOWS.md,
    },
    dropdownItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderLight,
    },
    dropdownItemText: {
        fontSize: 14,
        color: COLORS.textMain,
        fontWeight: "600",
    },
    selectedTripBox: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#ECFDF5",
        borderWidth: 1.5,
        borderColor: "#A7F3D0",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    selectedTripInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    checkIcon: {
        marginRight: 8,
    },
    selectedTripTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#065F46",
    },
    selectedTripId: {
        fontSize: 11,
        color: "#047857",
        marginTop: 1,
    },
    changeTripButton: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    changeTripText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#059669",
    },
    twoColumnGrid: {
        flexDirection: "row",
        gap: 12,
    },
    columnHalf: {
        flex: 1,
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
    summaryCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9FF",
        borderWidth: 1,
        borderColor: "#BAE6FD",
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },
    summaryText: {
        fontSize: 12,
        color: "#0369A1",
    },
    summaryBold: {
        fontWeight: "800",
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
