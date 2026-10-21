import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    Switch,
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { DeleteGearTypeService, GetGearTypeService, UpdateGearTypeService } from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const GearTypeList = () => {
    const value = "Gear Types";
    const [loading, setLoading] = useState(false);
    const [gearList, setGearList] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [updateGear, setUpdateGear] = useState<{
        id: any;
        name: string;
        is_active: boolean;
    }>({
        id: "",
        name: "",
        is_active: false,
    });

    const openUpdateModal = (item: any) => {
        setUpdateGear({
            id: item.id,
            name: item.name,
            is_active: item.is_active === 1 || item.is_active === true,
        });
        setModalVisible(true);
    };

    const confirmDelete = (id: any, name: string) => {
        Alert.alert(
            "Delete Gear Type",
            `Are you sure you want to delete "${name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteGear(id),
                },
            ]
        );
    };

    const deleteGear = async (id: any) => {
        setLoading(true);
        try {
            const res = await DeleteGearTypeService(id);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success === true) {
                showSuccess(message || "Gear type deleted");
                fetchGearTypeList();
            } else {
                showError(message || "Failed to delete gear type");
            }
        } catch (error) {
            showError("Failed to delete gear type");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateGearType = async () => {
        if (!updateGear.name.trim()) {
            showError("Gear type name cannot be empty");
            return;
        }

        setUpdating(true);
        const payload = {
            name: updateGear.name.trim(),
            is_active: updateGear.is_active ? 1 : 0,
        };

        try {
            const res = await UpdateGearTypeService(updateGear.id, payload);
            const { data: { message = "", success = false } = {} } = res || {};

            if (success === true) {
                showSuccess(message || "Gear type updated");
                setModalVisible(false);
                fetchGearTypeList();
            } else {
                showError(message || "Failed to update gear type");
            }
        } catch (error) {
            showError("Failed to update gear type");
        } finally {
            setUpdating(false);
        }
    };

    const fetchGearTypeList = async () => {
        setLoading(true);
        try {
            const res = await GetGearTypeService();
            const { data: { data = [], message = "", success = false } = {} } = res || {};
            if (success) {
                setGearList(data);
            } else {
                showError(message || "Failed to fetch gear types");
            }
        } catch (error) {
            showError("Failed to fetch gear types");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGearTypeList();
    }, []);

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Available Vehicle Transmissions" />

            <View style={styles.content}>
                {loading && gearList.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading gear types...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={gearList}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        removeClippedSubviews={false}
                        renderItem={({ item }) => {
                            const isActive = item.is_active === 1 || item.is_active === true;
                            return (
                                <View style={styles.card}>
                                    <View style={styles.cardTopRow}>
                                        <View style={styles.titleRow}>
                                            <View style={styles.gearIconWrapper}>
                                                <Ionicons name="cog" size={18} color="#0284C7" />
                                            </View>
                                            <Text style={styles.gearName}>{item.name}</Text>
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

                                    <View style={styles.actionsRow}>
                                        <TouchableOpacity
                                            onPress={() => openUpdateModal(item)}
                                            style={styles.editButton}
                                            activeOpacity={0.8}
                                        >
                                            <Ionicons name="create-outline" size={15} color="#2563EB" style={styles.btnIcon} />
                                            <Text style={styles.editButtonText}>Edit</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => confirmDelete(item?.id, item.name)}
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
                                <Ionicons name="cog-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Gear Types Found</Text>
                                <Text style={styles.emptySubtitle}>
                                    You have not created any transmission types yet.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>

            {/* Update Modal */}
            <Modal
                visible={modalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Gear Type</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            >
                                <Ionicons name="close" size={22} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Gear Type Name</Text>
                        <TextInput
                            value={updateGear.name}
                            onChangeText={(text) => setUpdateGear({ ...updateGear, name: text })}
                            placeholder="Enter transmission name"
                            placeholderTextColor="#94A3B8"
                            style={styles.modalInput}
                        />

                        <View style={styles.switchRow}>
                            <View>
                                <Text style={styles.switchLabel}>Active Status</Text>
                                <Text style={styles.switchSubLabel}>
                                    Visible to drivers and users in mobile apps
                                </Text>
                            </View>
                            <Switch
                                value={updateGear.is_active}
                                onValueChange={(val) => setUpdateGear({ ...updateGear, is_active: val })}
                                trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
                                thumbColor={updateGear.is_active ? "#10B981" : "#F8FAFC"}
                            />
                        </View>

                        <View style={styles.modalActionsRow}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalSaveButton, updating && styles.modalSaveButtonDisabled]}
                                onPress={handleUpdateGearType}
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
                </View>
            </Modal>
        </View>
    );
};

export default GearTypeList;

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
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    gearIconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#E0F2FE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    gearName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
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
    actionsRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
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
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        marginBottom: 20,
    },
    switchLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    switchSubLabel: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
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