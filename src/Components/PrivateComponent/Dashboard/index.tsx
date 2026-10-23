import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

export interface MenuItem {
    title: string;
    category: string;
    icon: string;
    iconType: "ion" | "material";
    iconColor: string;
    iconBg: string;
    onPress: () => void;
    roleid?: (number | string)[];
    roleId?: (number | string)[];
}

const Dashboard = () => {
    const value = "Home";
    const navigation: any = useNavigation();

    const [currentUserRole, setCurrentUserRole] = useState<number | string | null>(null);
    const [roleLabel, setRoleLabel] = useState<string>("");
    const [loadingRole, setLoadingRole] = useState<boolean>(true);

    const loadUserRole = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            if (getDatas) {
                const storeData = JSON.parse(getDatas);
                const admin = storeData?.admin;

                // Support admin.roleid, admin.roleId, admin.role_id, admin.role, admin.role?.id
                const role =
                    admin?.roleid ??
                    admin?.roleId ??
                    admin?.role_id ??
                    (typeof admin?.role === "object" ? admin?.role?.id : admin?.role);

                if (role !== undefined && role !== null) {
                    setCurrentUserRole(role);
                }

                const label =
                    admin?.role_name ||
                    admin?.roleName ||
                    (typeof admin?.role === "object" ? admin?.role?.name : null) ||
                    (role !== undefined && role !== null ? `Role ID: ${role}` : "Live");
                setRoleLabel(label);
            }
        } catch (error) {
            console.error("Failed to load user role from storage:", error);
        } finally {
            setLoadingRole(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadUserRole();
        }, [])
    );

    const menuItems: MenuItem[] = [
        {
            title: "Car Owners",
            category: "User",
            icon: "car",
            iconType: "ion",
            iconColor: "#0284C7",
            iconBg: "#E0F2FE",
            onPress: () => navigation.navigate("CarOwner"),
            roleid: [1, 2],
        },
        {
            title: "Car Drivers",
            category: "Partner",
            icon: "car-sport",
            iconType: "ion",
            iconColor: "#2563EB",
            iconBg: "#DBEAFE",
            onPress: () => navigation.navigate("CarDriver"),
            roleid: [1, 3],
        },
        {
            title: "Approval List",
            category: "Verification",
            icon: "shield-checkmark",
            iconType: "ion",
            iconColor: "#059669",
            iconBg: "#D1FAE5",
            onPress: () => navigation.navigate("ApprovalList"),
            roleid: [1, 2],
        },
        {
            title: "Bookings",
            category: "Trips",
            icon: "book",
            iconType: "ion",
            iconColor: "#7C3AED",
            iconBg: "#EDE9FE",
            onPress: () => navigation.navigate("BookingList"),
            roleid: [1, 2, 3],
        },
        {
            title: "Block & Suspended",
            category: "Security",
            icon: "lock-closed",
            iconType: "ion",
            iconColor: "#DC2626",
            iconBg: "#FEE2E2",
            onPress: () => navigation.navigate("BlockAndSuspended"),
            roleid: [1],
        },
        {
            title: "Withdrawals",
            category: "Finance",
            icon: "wallet-sharp",
            iconType: "ion",
            iconColor: "#D97706",
            iconBg: "#FEF3C7",
            onPress: () => navigation.navigate("Withdrawal"),
            roleid: [1, 2],
        },
        {
            title: "Amount Declaration",
            category: "Pricing",
            icon: "payments",
            iconType: "material",
            iconColor: "#0D9488",
            iconBg: "#CCFBF1",
            onPress: () => navigation.navigate("AmountDeclearation"),
            roleid: [1],
        },
        {
            title: "Packages",
            category: "Plans",
            icon: "file-tray-full",
            iconType: "ion",
            iconColor: "#9333EA",
            iconBg: "#F3E8FF",
            onPress: () => navigation.navigate("PackageManagement"),
            roleid: [1],
        },
        {
            title: "Gear Types",
            category: "Vehicles",
            icon: "cog",
            iconType: "ion",
            iconColor: "#475569",
            iconBg: "#F1F5F9",
            onPress: () => navigation.navigate("GearType"),
            roleid: [1],
        },
        {
            title: "User Feedback",
            category: "Support",
            icon: "chatbox-ellipses",
            iconType: "ion",
            iconColor: "#E11D48",
            iconBg: "#FFE4E6",
            onPress: () => navigation.navigate("Feedback"),
            roleid: [1, 2, 3],
        },
        {
            title: "App Settings",
            category: "General",
            icon: "settings",
            iconType: "ion",
            iconColor: "#4B5563",
            iconBg: "#F3F4F6",
            onPress: () => navigation.navigate("AppSettings"),
            roleid: [1],
        },
        {
            title: "Version Control",
            category: "Release",
            icon: "rocket-sharp",
            iconType: "ion",
            iconColor: "#EA580C",
            iconBg: "#FFEDD5",
            onPress: () => navigation.navigate("AppVersionControl"),
            roleid: [1],
        },
        {
            title: "Terms & Conditions",
            category: "Legal",
            icon: "document-text",
            iconType: "ion",
            iconColor: "#0891B2",
            iconBg: "#CFFAFE",
            onPress: () => navigation.navigate("TermsAndConditions"),
            roleid: [1],
        },
        {
            title: "Role Management",
            category: "Security",
            icon: "shield-checkmark",
            iconType: "ion",
            iconColor: "#4F46E5",
            iconBg: "#EEF2FF",
            onPress: () => navigation.navigate("RoleManagement"),
            roleid: [1],
        },
        {
            title: "Admin Users",
            category: "Security",
            icon: "people",
            iconType: "ion",
            iconColor: "#059669",
            iconBg: "#D1FAE5",
            onPress: () => navigation.navigate("AdminManagement"),
            roleid: [1],
        },
        {
            title: "Contact Us",
            category: "Support",
            icon: "headset",
            iconType: "ion",
            iconColor: "#16A34A",
            iconBg: "#DCFCE7",
            onPress: () => navigation.navigate("ContactUs"),
            roleid: [1, 2, 3],
        },
    ];

    // Filter modules based on user's roleid
    const filteredMenuItems = menuItems.filter((item) => {
        const allowedRoles = item.roleid ?? item.roleId;

        // If no role restriction is defined on this menu item, show to all
        if (!allowedRoles || allowedRoles.length === 0) {
            return true;
        }

        // If no user role is stored in storage (e.g. dev preview before login), show all
        if (currentUserRole === null || currentUserRole === undefined) {
            return true;
        }

        const userRoles: (number | string)[] = Array.isArray(currentUserRole)
            ? currentUserRole
            : [currentUserRole];

        return allowedRoles.some((allowed) =>
            userRoles.some((userR) => {
                const userRNum = Number(userR);
                const allowedNum = Number(allowed);
                if (!isNaN(userRNum) && !isNaN(allowedNum)) {
                    return userRNum === allowedNum;
                }
                return String(userR).trim().toLowerCase() === String(allowed).trim().toLowerCase();
            })
        );
    });

    const renderIcon = (item: MenuItem) => {
        if (item.iconType === "material") {
            return (
                <MaterialIcons name={item.icon} size={26} color={item.iconColor} />
            );
        }
        return (
            <Ionicons name={item.icon} size={26} color={item.iconColor} />
        );
    };

    return (
        <View style={styles.container}>
            <Header value={value} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Overview Banner */}
                <View style={styles.banner}>
                    <View style={styles.bannerTextContainer}>
                        <Text style={styles.bannerGreeting}>Operations Command</Text>
                        <Text style={styles.bannerSubtitle}>
                            Manage drivers, owners, rides, and platform financials
                        </Text>
                    </View>
                    <View style={styles.bannerPill}>
                        <View style={styles.liveIndicator} />
                        <Text style={styles.bannerPillText}>
                            {roleLabel || "Live"}
                        </Text>
                    </View>
                </View>

                {/* Section Title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Management Modules</Text>
                    <Text style={styles.sectionCount}>
                        {filteredMenuItems.length} of {menuItems.length} modules
                    </Text>
                </View>

                {/* Grid or Empty State */}
                {loadingRole ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                ) : filteredMenuItems.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="lock-closed-outline" size={42} color={COLORS.textMuted} />
                        <Text style={styles.emptyTitle}>No Modules Available</Text>
                        <Text style={styles.emptySubtitle}>
                            Your role (ID: {currentUserRole ?? "None"}) does not have access permissions for any dashboard modules.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.gridContainer}>
                        {filteredMenuItems.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={item.onPress}
                                activeOpacity={0.75}
                                style={styles.card}
                            >
                                <View style={styles.cardTopRow}>
                                    <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
                                        {renderIcon(item)}
                                    </View>
                                    <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                                </View>

                                <View style={styles.cardInfo}>
                                    <Text style={styles.cardCategory}>{item.category.toUpperCase()}</Text>
                                    <Text style={styles.cardTitle} numberOfLines={2}>
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default Dashboard;

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
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    bannerTextContainer: {
        flex: 1,
        paddingRight: 10,
    },
    bannerGreeting: {
        fontSize: 18,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    bannerSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 4,
        lineHeight: 16,
    },
    bannerPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    liveIndicator: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: "#10B981",
        marginRight: 6,
    },
    bannerPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#065F46",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
        paddingHorizontal: 2,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        letterSpacing: 0.2,
    },
    sectionCount: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    loadingContainer: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 32,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        textAlign: "center",
        marginTop: 6,
        lineHeight: 18,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        width: "48%",
        minHeight: 126,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardTopRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    iconWrapper: {
        width: 46,
        height: 46,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    cardInfo: {
        marginTop: 10,
    },
    cardCategory: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.textMuted,
        letterSpacing: 0.6,
        marginBottom: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
        lineHeight: 18,
    },
});