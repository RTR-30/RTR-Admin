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
    RefreshControl,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import {
    GetAdminUsersService,
    ReassignAdminRoleService,
    GetRolesService,
} from "./helper";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

export interface AdminUserItem {
    id: number | string;
    name: string;
    email: string;
    role_id?: number | string;
    roleid?: number | string;
    role?: {
        id?: number | string;
        name?: string;
        slug?: string;
    } | string;
    role_name?: string;
    roleName?: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: any;
}

interface RoleOption {
    id: number | string;
    name: string;
    slug?: string;
    description?: string;
}

const AdminList = () => {
    const value = "Admin Directory";
    const navigation: any = useNavigation();

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [adminList, setAdminList] = useState<AdminUserItem[]>([]);
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    // Reassign Role Modal
    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [updatingRole, setUpdatingRole] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<AdminUserItem | null>(null);
    const [newRoleId, setNewRoleId] = useState<number | string>("");

    // Details Modal
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [viewedAdmin, setViewedAdmin] = useState<AdminUserItem | null>(null);

    const fetchAdmins = async (isPullRefresh = false) => {
        if (isPullRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await GetAdminUsersService();
            const { data: { data = [], message = "", success = false } = {}, status } = res || {};

            let admins: AdminUserItem[] = [];
            if (Array.isArray(data)) {
                admins = data;
            } else if (Array.isArray(res?.data?.admins)) {
                admins = res.data.admins;
            } else if (Array.isArray(res?.data)) {
                admins = res.data;
            }

            if (success === true || status === 200 || admins.length >= 0) {
                setAdminList(admins);
            } else {
                showError(message || "Failed to fetch admin users");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to fetch admin users");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await GetRolesService();
            const data =
                res?.data?.data ||
                res?.data?.roles ||
                (Array.isArray(res?.data) ? res.data : []);
            if (Array.isArray(data)) {
                setRoles(data);
            }
        } catch (error) {
            console.log("Failed to load roles", error);
        }
    };

    useEffect(() => {
        fetchAdmins();
        fetchRoles();
    }, []);

    const openReassignModal = (item: AdminUserItem) => {
        setSelectedAdmin(item);
        const currentRoleId =
            item.role_id ??
            item.roleid ??
            (typeof item.role === "object" ? item.role?.id : item.role) ??
            "";
        setNewRoleId(currentRoleId);
        setRoleModalVisible(true);
    };

    const handleSaveReassignRole = async () => {
        if (!selectedAdmin) return;
        if (!newRoleId && newRoleId !== 0) {
            showError("Please select a new role");
            return;
        }

        setUpdatingRole(true);
        const payload = {
            role_id: Number(newRoleId) || newRoleId,
        };

        try {
            const res = await ReassignAdminRoleService(selectedAdmin.id, payload);
            const { data: { message = "", success = false } = {}, status } = res || {};

            if (success === true || status === 200 || status === 204) {
                showSuccess(message || "Admin role updated successfully");
                setRoleModalVisible(false);
                fetchAdmins();
            } else {
                showError(message || "Failed to update admin role");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to update admin role");
        } finally {
            setUpdatingRole(false);
        }
    };

    const getRoleName = (item: AdminUserItem): string => {
        if (typeof item.role === "object" && item.role?.name) {
            return item.role.name;
        }
        if (item.role_name || item.roleName) {
            return (item.role_name || item.roleName) as string;
        }
        const rId = item.role_id ?? item.roleid ?? (typeof item.role === "object" ? item.role?.id : item.role);
        const found = roles.find((r) => String(r.id) === String(rId));
        if (found && found.name) {
            return found.name;
        }
        return rId !== undefined && rId !== null ? `Role #${rId}` : "Standard Admin";
    };

    const filteredAdmins = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return adminList;

        return adminList.filter((item) => {
            const matchName = item.name?.toLowerCase().includes(query);
            const matchEmail = item.email?.toLowerCase().includes(query);
            const matchId = String(item.id).includes(query);
            const roleName = (getRoleName(item) || "").toLowerCase();
            const matchRole = roleName.includes(query);
            return matchName || matchEmail || matchId || matchRole;
        });
    }, [adminList, searchQuery, roles]);

    const renderAdminItem = ({ item }: { item: AdminUserItem }) => {
        const roleLabel = getRoleName(item);
        const roleIdVal = item.role_id ?? item.roleid ?? (typeof item.role === "object" ? item.role?.id : item.role);
        const isSuperAdmin = String(roleIdVal) === "1";

        return (
            <View style={styles.card}>
                <View style={styles.cardTopRow}>
                    <View style={styles.avatarWrap}>
                        <Text style={styles.avatarText}>
                            {item.name ? item.name.charAt(0).toUpperCase() : "A"}
                        </Text>
                    </View>

                    <View style={styles.userInfo}>
                        <View style={styles.userNameRow}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {item.name}
                            </Text>
                            <View style={styles.idChip}>
                                <Text style={styles.idChipText}>#{item.id}</Text>
                            </View>
                        </View>
                        <Text style={styles.userEmail} numberOfLines={1}>
                            {item.email}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardMiddleRow}>
                    <View
                        style={[
                            styles.roleBadge,
                            isSuperAdmin ? styles.superAdminBadge : styles.standardRoleBadge,
                        ]}
                    >
                        <Ionicons
                            name={isSuperAdmin ? "shield-checkmark" : "shield-outline"}
                            size={14}
                            color={isSuperAdmin ? "#DC2626" : "#059669"}
                            style={{ marginRight: 4 }}
                        />
                        <Text
                            style={[
                                styles.roleBadgeText,
                                isSuperAdmin ? styles.superAdminBadgeText : styles.standardRoleBadgeText,
                            ]}
                        >
                            {roleLabel}
                        </Text>
                    </View>

                    {item.created_at ? (
                        <Text style={styles.joinedText}>
                            Added {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={styles.detailBtn}
                        onPress={() => {
                            setViewedAdmin(item);
                            setDetailModalVisible(true);
                        }}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="eye-outline" size={16} color="#0284C7" />
                        <Text style={styles.detailBtnText}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.reassignBtn}
                        onPress={() => openReassignModal(item)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="swap-horizontal" size={16} color="#059669" />
                        <Text style={styles.reassignBtnText}>Reassign Role</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                value={value}
                subtitle="Admin Staff & RBAC Assignment"
            />

            <View style={styles.body}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={styles.searchBar}>
                        <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search admin by name, email or role..."
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

                {/* Meta Counter */}
                <View style={styles.metaRow}>
                    <Text style={styles.metaText}>
                        Showing <Text style={styles.metaBold}>{filteredAdmins.length}</Text> of{" "}
                        <Text style={styles.metaBold}>{adminList.length}</Text> Administrators
                    </Text>
                    <TouchableOpacity
                        onPress={() => fetchAdmins(false)}
                        style={styles.refreshIconBtn}
                        disabled={loading}
                    >
                        <Ionicons
                            name="refresh"
                            size={16}
                            color={loading ? "#CBD5E1" : "#059669"}
                        />
                    </TouchableOpacity>
                </View>

                {/* List View */}
                {loading && adminList.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#059669" />
                        <Text style={styles.loadingText}>Loading admin accounts...</Text>
                    </View>
                ) : filteredAdmins.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="people-outline" size={56} color="#CBD5E1" />
                        <Text style={styles.emptyTitle}>
                            {searchQuery ? "No matching admins found" : "No admin accounts found"}
                        </Text>
                        <Text style={styles.emptySubtitle}>
                            {searchQuery
                                ? `No administrators matched "${searchQuery}".`
                                : "Create staff administrator accounts to manage platform operations."}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity
                                style={styles.emptyBtn}
                                onPress={() => navigation.navigate("CreateAdmin")}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.emptyBtnText}>Create First Admin</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <FlatList
                        data={filteredAdmins}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderAdminItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => fetchAdmins(true)}
                                colors={["#059669"]}
                                tintColor="#059669"
                            />
                        }
                    />
                )}
            </View>

            {/* Reassign Role Modal */}
            <Modal
                visible={roleModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRoleModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <View style={styles.modalIconWrap}>
                                    <Ionicons name="shield-checkmark" size={18} color="#059669" />
                                </View>
                                <View>
                                    <Text style={styles.modalTitle}>Reassign Role</Text>
                                    <Text style={styles.modalSubtitle}>Change access level & permissions</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setRoleModalVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            {selectedAdmin && (
                                <View style={styles.targetAdminBanner}>
                                    <View style={styles.targetAvatar}>
                                        <Text style={styles.targetAvatarText}>
                                            {selectedAdmin.name ? selectedAdmin.name.charAt(0).toUpperCase() : "A"}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.targetName}>{selectedAdmin.name}</Text>
                                        <Text style={styles.targetEmail}>{selectedAdmin.email}</Text>
                                    </View>
                                </View>
                            )}

                            <Text style={styles.selectRoleLabel}>Select New Role:</Text>

                            {roles.length > 0 ? (
                                <View style={styles.modalRoleList}>
                                    {roles.map((r) => {
                                        const isSelected = String(newRoleId) === String(r.id);
                                        return (
                                            <TouchableOpacity
                                                key={String(r.id)}
                                                style={[
                                                    styles.modalRoleChoice,
                                                    isSelected && styles.modalRoleChoiceSelected,
                                                ]}
                                                onPress={() => setNewRoleId(r.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.modalRoleTop}>
                                                    <View style={styles.modalRoleLeft}>
                                                        <Ionicons
                                                            name={isSelected ? "radio-button-on" : "radio-button-off"}
                                                            size={18}
                                                            color={isSelected ? "#059669" : "#94A3B8"}
                                                            style={{ marginRight: 8 }}
                                                        />
                                                        <Text
                                                            style={[
                                                                styles.modalRoleName,
                                                                isSelected && styles.modalRoleNameSelected,
                                                            ]}
                                                        >
                                                            {r.name}
                                                        </Text>
                                                    </View>
                                                    <View
                                                        style={[
                                                            styles.modalRoleIdBadge,
                                                            isSelected && styles.modalRoleIdBadgeSelected,
                                                        ]}
                                                    >
                                                        <Text
                                                            style={[
                                                                styles.modalRoleIdText,
                                                                isSelected && styles.modalRoleIdTextSelected,
                                                            ]}
                                                        >
                                                            ID: {r.id}
                                                        </Text>
                                                    </View>
                                                </View>
                                                {r.description ? (
                                                    <Text style={styles.modalRoleDesc} numberOfLines={2}>
                                                        {r.description}
                                                    </Text>
                                                ) : null}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View style={styles.manualInputBox}>
                                    <TextInput
                                        placeholder="Enter new Role ID (e.g. 1, 2, 3)"
                                        placeholderTextColor="#94A3B8"
                                        value={String(newRoleId)}
                                        onChangeText={setNewRoleId}
                                        style={styles.manualInput}
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setRoleModalVisible(false)}
                                disabled={updatingRole}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.saveBtn, updatingRole && styles.saveBtnDisabled]}
                                onPress={handleSaveReassignRole}
                                disabled={updatingRole}
                                activeOpacity={0.8}
                            >
                                {updatingRole ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.saveBtnText}>Save Role</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* View Details Modal */}
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
                                    <Text style={styles.modalTitle}>Admin Details</Text>
                                    <Text style={styles.modalSubtitle}>Profile & authority scope</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setDetailModalVisible(false)}
                                style={styles.modalCloseBtn}
                            >
                                <Ionicons name="close" size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {viewedAdmin && (
                            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Admin ID</Text>
                                    <Text style={styles.detailValueBold}>#{viewedAdmin.id}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Full Name</Text>
                                    <Text style={styles.detailValueBold}>{viewedAdmin.name}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Email</Text>
                                    <Text style={styles.detailValue}>{viewedAdmin.email}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>Assigned Role</Text>
                                    <Text style={[styles.detailValueBold, { color: "#059669" }]}>
                                        {getRoleName(viewedAdmin)}
                                    </Text>
                                </View>

                                {viewedAdmin.created_at ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Created At</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(viewedAdmin.created_at).toLocaleString()}
                                        </Text>
                                    </View>
                                ) : null}

                                {viewedAdmin.updated_at ? (
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Updated At</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(viewedAdmin.updated_at).toLocaleString()}
                                        </Text>
                                    </View>
                                ) : null}
                            </ScrollView>
                        )}

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

export default AdminList;

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
        backgroundColor: "#059669",
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
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    avatarWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: "800",
        color: "#065F46",
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        flex: 1,
    },
    idChip: {
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    idChipText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
    },
    userEmail: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    cardMiddleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#F8FAFC",
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    standardRoleBadge: {
        backgroundColor: "#ECFDF5",
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    superAdminBadge: {
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    roleBadgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    standardRoleBadgeText: {
        color: "#065F46",
    },
    superAdminBadgeText: {
        color: "#991B1B",
    },
    joinedText: {
        fontSize: 11,
        color: COLORS.textMuted,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 10,
    },
    detailBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 36,
        borderRadius: 10,
        backgroundColor: "#E0F2FE",
        gap: 6,
    },
    detailBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#0369A1",
    },
    reassignBtn: {
        flex: 1.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 36,
        borderRadius: 10,
        backgroundColor: "#D1FAE5",
        gap: 6,
    },
    reassignBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#047857",
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
        backgroundColor: "#059669",
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
        backgroundColor: "#D1FAE5",
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
    targetAdminBanner: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    targetAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },
    targetAvatarText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#065F46",
    },
    targetName: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    targetEmail: {
        fontSize: 11,
        color: COLORS.textSecondary,
    },
    selectRoleLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 8,
    },
    modalRoleList: {
        gap: 8,
    },
    modalRoleChoice: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1.5,
        borderColor: COLORS.border,
        borderRadius: 12,
        padding: 12,
    },
    modalRoleChoiceSelected: {
        backgroundColor: "#ECFDF5",
        borderColor: "#10B981",
    },
    modalRoleTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalRoleLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    modalRoleName: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textMain,
    },
    modalRoleNameSelected: {
        fontWeight: "700",
        color: "#065F46",
    },
    modalRoleIdBadge: {
        backgroundColor: "#E2E8F0",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    modalRoleIdBadgeSelected: {
        backgroundColor: "#DCFCE7",
    },
    modalRoleIdText: {
        fontSize: 10,
        fontWeight: "700",
        color: "#64748B",
    },
    modalRoleIdTextSelected: {
        color: "#047857",
    },
    modalRoleDesc: {
        fontSize: 11,
        color: COLORS.textSecondary,
        marginTop: 4,
        marginLeft: 26,
    },
    manualInputBox: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
    },
    manualInput: {
        flex: 1,
        fontSize: 13,
        color: COLORS.textMain,
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
        backgroundColor: "#059669",
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#FFFFFF",
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
