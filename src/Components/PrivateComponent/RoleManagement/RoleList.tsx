import React, { useEffect, useState, useMemo } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    TextInput,
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
    RefreshControl,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import {
    DeleteRoleService,
    GetRolesService,
    GetSingleRoleService,
    UpdateRoleService,
} from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

export interface RoleItem {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

const RoleList = () => {
    const value = "Roles Directory";
    const navigation: any = useNavigation();

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [roleList, setRoleList] = useState<RoleItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Update Modal State
    const [updateModalVisible, setUpdateModalVisible] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [updateForm, setUpdateForm] = useState<{
        id: number | string;
        name: string;
        slug: string;
        description: string;
    }>({
        id: "",
        name: "",
        slug: "",
        description: "",
    });

    // Details Modal State (Get single role)
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);

    const fetchRoles = async (isPullRefresh = false) => {
        if (isPullRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await GetRolesService();
            const { data: { data = [], message = "", success = false } = {}, status } = res || {};

            let roles: RoleItem[] = [];
            if (Array.isArray(data)) {
                roles = data;
            } else if (Array.isArray(res?.data?.roles)) {
                roles = res.data.roles;
            } else if (Array.isArray(res?.data)) {
                roles = res.data;
            }

            if (success === true || status === 200 || roles.length >= 0) {
                setRoleList(roles);
            } else {
                showError(message || "Failed to fetch roles");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to fetch roles");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    // Fetch single role API curl test / inspection
    const handleViewDetails = async (item: RoleItem) => {
        setSelectedRole(item);
        setDetailModalVisible(true);
        setDetailLoading(true);

        try {
            const res = await GetSingleRoleService(item.id);
            const { data: { data = null, success = false } = {}, status } = res || {};
            const single = data || (res?.data && typeof res.data === "object" && !Array.isArray(res.data) ? res.data : null);

            if (single) {
                setSelectedRole((prev) => ({ ...prev, ...single }));
            }
        } catch (error) {
            // Keep preview with current item
            console.log("Single role fetch fallback to existing data", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const openUpdateModal = (item: RoleItem) => {
        setUpdateForm({
            id: item.id,
            name: item.name || "",
            slug: item.slug || "",
            description: item.description || "",
        });
        setUpdateModalVisible(true);
    };

    const handleUpdateRole = async () => {
        const trimmedName = updateForm.name.trim();
        const trimmedDesc = updateForm.description.trim();

        if (!trimmedName) {
            showError("Role name cannot be empty");
            return;
        }

        setUpdating(true);
        const payload = {
            name: trimmedName,
            description: trimmedDesc,
        };

        try {
            const res = await UpdateRoleService(updateForm.id, payload);
            const { data: { message = "", success = false } = {}, status } = res || {};

            if (success === true || status === 200 || status === 204) {
                showSuccess(message || "Role updated successfully");
                setUpdateModalVisible(false);
                fetchRoles();
            } else {
                showError(message || "Failed to update role");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to update role");
        } finally {
            setUpdating(false);
        }
    };

    const confirmDelete = (item: RoleItem) => {
        // Prevent accidental deletion of primary superadmin role 1
        const isSuperAdmin = String(item.id) === "1" || String(item.slug).toLowerCase() === "super_admin";

        Alert.alert(
            "Delete Role",
            isSuperAdmin
                ? `Role "${item.name}" (ID 1) is a primary system role. Deleting it may impact system permissions. Do you really wish to proceed?`
                : `Are you sure you want to permanently delete "${item.name}"? Users with this role will lose associated permissions.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => deleteRole(item.id),
                },
            ]
        );
    };

    const deleteRole = async (id: number | string) => {
        setLoading(true);
        try {
            const res = await DeleteRoleService(id);
            const { data: { message = "", success = false } = {}, status } = res || {};

            if (success === true || status === 200 || status === 204) {
                showSuccess(message || "Role deleted successfully");
                fetchRoles();
            } else {
                showError(message || "Failed to delete role");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to delete role");
        } finally {
            setLoading(false);
        }
    };

    const filteredRoles = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return roleList;

        return roleList.filter((item) => {
            const matchName = item.name?.toLowerCase().includes(query);
            const matchSlug = item.slug?.toLowerCase().includes(query);
            const matchDesc = item.description?.toLowerCase().includes(query);
            const matchId = String(item.id).includes(query);
            return matchName || matchSlug || matchDesc || matchId;
        });
    }, [roleList, searchQuery]);

    const renderRoleItem = ({ item }: { item: RoleItem }) => {
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                        <View style={styles.idBadge}>
                            <Text style={styles.idBadgeText}>#{item.id}</Text>
                        </View>
                        <Text style={styles.roleName} numberOfLines={1}>
                            {item.name}
                        </Text>
                    </View>
                    {item.slug ? (
                        <View style={styles.slugBadge}>
                            <Text style={styles.slugBadgeText} numberOfLines={1}>
                                {item.slug}
                            </Text>
                        </View>
                    ) : null}
                </View>

                {item.description ? (
                    <Text style={styles.roleDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                ) : (
                    <Text style={styles.noDescription}>No description provided.</Text>
                )}

                <View style={styles.cardFooter}>
                    <View style={styles.timestamps}>
                        {item.created_at ? (
                            <Text style={styles.timestampText}>
                                Created: {new Date(item.created_at).toLocaleDateString()}
                            </Text>
                        ) : null}
                    </View>

                    <View style={styles.actionButtons}>
                        {/* View single role details */}
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.viewBtn]}
                            onPress={() => handleViewDetails(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="eye-outline" size={16} color="#0284C7" />
                        </TouchableOpacity>

                        {/* Edit Role */}
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.editBtn]}
                            onPress={() => openUpdateModal(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="create-outline" size={16} color="#4F46E5" />
                        </TouchableOpacity>

                        {/* Delete Role */}
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.deleteBtn]}
                            onPress={() => confirmDelete(item)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="trash-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                value={value}
                subtitle="System Roles & Access Management"
            />

            <View style={styles.body}>
                {/* Search and Filter Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search roles by name, slug or ID..."
                            placeholderTextColor="#94A3B8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            clearButtonMode="while-editing"
                        />
                        {searchQuery ? (
                            <TouchableOpacity onPress={() => setSearchQuery("")}>
                                <Ionicons name="close-circle" size={18} color="#94A3B8" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                {/* Counter & Status */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                        Showing <Text style={styles.metaBold}>{filteredRoles.length}</Text> of{" "}
                        <Text style={styles.metaBold}>{roleList.length}</Text> Roles
                    </Text>
                    <TouchableOpacity
                        onPress={() => fetchRoles(false)}
                        style={styles.refreshIconBtn}
                        disabled={loading}
                    >
                        <Ionicons
                            name="refresh"
                            size={16}
                            color={loading ? "#CBD5E1" : "#4F46E5"}
                        />
                    </TouchableOpacity>
                </View>

                {/* List Content */}
                {loading && roleList.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#4F46E5" />
                        <Text style={styles.loadingText}>Loading system roles...</Text>
                    </View>
                ) : filteredRoles.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="shield-outline" size={56} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? "No matching roles found" : "No roles created yet"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? `No roles matched "${searchQuery}". Try a different keyword.`
                                : "Create administrative roles to delegate dashboard access and privileges."}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate("CreateRole")}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.emptyBtnText}>Create First Role</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={filteredRoles}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderRoleItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchRoles(true)}
                                colors={["#4F46E5"]}
                                tintColor="#4F46E5"
                            />
                        }
                    />
                )}
            </View>

            {/* Update Role Modal */}
            <Modal
                visible={updateModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setUpdateModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <View style={styles.modalIconWrap}>
                                    <Ionicons name="create" size={18} color="#4F46E5" />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Update Role</Text>
                                    <Text style={styles.modalSubtitle}>Edit role details & privileges</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setUpdateModalVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {/* Role ID & Slug Info */}
                            <View style={styles.modalInfoBanner}>
                                <View style={styles.modalInfoItem}>
                                    <Text style={styles.modalInfoLabel}>Role ID</Text>
                                    <Text style={styles.modalInfoVal}>#{updateForm.id}</Text>
                                </View>
                                {updateForm.slug ? (
                                    <View style={styles.modalInfoItem}>
                                        <Text style={styles.modalInfoLabel}>Slug (Fixed)</Text>
                                        <Text style={[styles.modalInfoVal, styles.modalInfoSlug]}>
                                            {updateForm.slug}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Name Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Role Name</Text>
                                <TextInput
                                    placeholder="Enter role name"
                                    placeholderTextColor="#94A3B8"
                                    value={updateForm.name}
                                    onChangeText={(text) =>
                                        setUpdateForm((prev) => ({ ...prev, name: text }))
                                    }
                                    style={styles.modalInput}
                                />
                            </View>

                            {/* Description Input */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.fieldLabel}>Description</Text>
                                <TextInput
                                    placeholder="Enter role description"
                                    placeholderTextColor="#94A3B8"
                                    value={updateForm.description}
                                    onChangeText={(text) =>
                                        setUpdateForm((prev) => ({ ...prev, description: text }))
                                    }
                                    style={[styles.modalInput, styles.modalTextArea]}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setUpdateModalVisible(false)}
                                disabled={updating}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, updating && styles.saveBtnDisabled]}
                                onPress={handleUpdateRole}
                                disabled={updating}
                                activeOpacity={0.8}
                            >
                                {updating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Changes</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* View Details Modal (GET single role) */}
            <Modal
                visible={detailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <View style={[styles.modalIconWrap, { backgroundColor: "#E0F2FE" }]}>
                                    <Ionicons name="information-circle" size={20} color="#0284C7" />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Role Details</Text>
                                    <Text style={styles.modalSubtitle}>System metadata & configuration</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDetailModalVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {detailLoading ? (
                            <View style={styles.detailLoader}>
                                <ActivityIndicator size="small" color="#4F46E5" />
                                <Text style={styles.loadingText}>Fetching role specifications...</Text>
                            </View>
                        ) : selectedRole ? (
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Identifier</Text>
                                    <Text style={styles.detailValueBold}>Role #{selectedRole.id}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Name</Text>
                                    <Text style={styles.detailValueBold}>{selectedRole.name}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Slug</Text>
                                    <View style={styles.slugBadge}>
                                        <Text style={styles.slugBadgeText}>
                                            {selectedRole.slug || "N/A"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.detailRow, { flexDirection: "column", alignItems: "flex-start" }]}>
                                    <Text style={styles.detailLabel}>Description</Text>
                                    <Text style={[styles.detailValue, { marginTop: 4 }]}>
                                        {selectedRole.description || "No description specified."}
                                    </Text>
                                </View>

                                {selectedRole.created_at ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Created At</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(selectedRole.created_at).toLocaleString()}
                                        </Text>
                                    </View>
                                ) : null}

                                {selectedRole.updated_at ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Updated At</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(selectedRole.updated_at).toLocaleString()}
                                        </Text>
                                    </View>
                                ) : null}
                            </ScrollView>
                        ) : null}

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { flex: 1 }]}
                                onPress={() => setDetailModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default RoleList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    body: {
        flex: 1,
    },
    headerAddBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4F46E5",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        gap: 4,
    },
    headerAddBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 12,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 44,
        ...SHADOWS.sm,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textMain,
    },
    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
    metaText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    metaBold: {
        fontWeight: "700",
        color: COLORS.textMain,
    },
    refreshIconBtn: {
        padding: 4,
    },
    listContent: {
        padding: 16,
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
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: 8,
    },
    idBadge: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 8,
    },
    idBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#64748B",
    },
    roleName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
    },
    slugBadge: {
        backgroundColor: "#EEF2FF",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#C7D2FE",
    },
    slugBadgeText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#4F46E5",
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    },
    roleDescription: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 12,
    },
    noDescription: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontStyle: "italic",
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 10,
    },
    timestamps: {
        flex: 1,
    },
    timestampText: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    actionButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    actionBtn: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    viewBtn: {
        backgroundColor: "#E0F2FE",
    },
    editBtn: {
        backgroundColor: "#EEF2FF",
    },
    deleteBtn: {
        backgroundColor: "#FEE2E2",
    },
    centerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        marginTop: 40,
    },
    loadingText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 14,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginTop: 6,
        lineHeight: 18,
    },
    emptyBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#4F46E5",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginTop: 16,
        gap: 6,
        ...SHADOWS.sm,
    },
    emptyBtnText: {
        color: "#FFFFFF",
        fontWeight: "700",
        fontSize: 13,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 18,
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        width: "100%",
        maxHeight: "85%",
        overflow: "hidden",
        ...SHADOWS.md,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    modalTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    modalIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#EEF2FF",
        alignItems: "center",
        justifyContent: "center",
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalSubtitle: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    modalCloseBtn: {
        padding: 4,
    },
    modalBody: {
        padding: 16,
    },
    modalInfoBanner: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        gap: 16,
    },
    modalInfoItem: {
        flex: 1,
    },
    modalInfoLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    modalInfoVal: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalInfoSlug: {
        fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
        color: "#4F46E5",
    },
    inputGroup: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 6,
    },
    modalInput: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        fontSize: 13,
        color: COLORS.textMain,
    },
    modalTextArea: {
        height: 80,
        paddingTop: 10,
    },
    modalFooter: {
        flexDirection: "row",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        gap: 10,
    },
    cancelBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F1F5F9",
    },
    cancelBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#64748B",
    },
    saveBtn: {
        flex: 2,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#4F46E5",
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
    },
    detailLoader: {
        padding: 30,
        alignItems: "center",
        justifyContent: "center",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F8FAFC",
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
        fontWeight: "600",
    },
    detailValue: {
        fontSize: 13,
        color: COLORS.textMain,
    },
    detailValueBold: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.textMain,
    },
});
