import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { GetAdminUsersService } from "./helper";

const AdminManagement = () => {
    const value = "Admin Management";
    const navigation: any = useNavigation();

    const [adminCount, setAdminCount] = useState<number | null>(null);
    const [loadingCount, setLoadingCount] = useState(false);

    const loadAdminCount = async () => {
        setLoadingCount(true);
        try {
            const res = await GetAdminUsersService();
            const data =
                res?.data?.data ||
                res?.data?.admins ||
                (Array.isArray(res?.data) ? res.data : []);
            if (Array.isArray(data)) {
                setAdminCount(data.length);
            }
        } catch (error) {
            console.log("Failed to load admin count", error);
        } finally {
            setLoadingCount(false);
        }
    };

    useEffect(() => {
        loadAdminCount();
    }, []);

    const adminOptions = [
        {
            title: "Create Admin Account",
            subtitle: "Provision team members with email credentials and assign operational roles",
            icon: "person-add",
            iconColor: "#059669",
            iconBg: "#D1FAE5",
            tag: "New Account",
            tagBg: "#ECFDF5",
            tagColor: "#047857",
            onPress: () => navigation.navigate("CreateAdmin"),
        },
        {
            title: "Admin Directory",
            subtitle: "Browse all authenticated administrative accounts and reassign access roles",
            icon: "people",
            iconColor: "#2563EB",
            iconBg: "#DBEAFE",
            tag: "Staff Team",
            tagBg: "#EFF6FF",
            tagColor: "#1D4ED8",
            onPress: () => navigation.navigate("AdminList"),
        },
    ];

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Administrative Accounts & Access Roles" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* System Overview Card */}
                <View style={styles.banner}>
                    <View style={styles.bannerTop}>
                        <View style={styles.bannerIconWrapper}>
                            <Ionicons name="shield-checkmark" size={24} color="#059669" />
                        </View>
                        <View style={styles.bannerPill}>
                            <View style={styles.activeDot} />
                            <Text style={styles.bannerPillText}>Command Center</Text>
                        </View>
                    </View>
                    <Text style={styles.bannerTitle}>Admin User Management</Text>
                    <Text style={styles.bannerDesc}>
                        Delegate operational roles to your management team. Assign and reassign
                        privileges to ensure staff have appropriate access boundaries.
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>ACTIVE ADMINISTRATORS</Text>
                            {loadingCount ? (
                                <ActivityIndicator size="small" color="#059669" style={{ marginTop: 4 }} />
                            ) : (
                                <Text style={styles.statValue}>{adminCount !== null ? adminCount : "—"}</Text>
                            )}
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>GOVERNANCE</Text>
                            <Text style={styles.statValueSecondary}>Role-Based</Text>
                        </View>
                    </View>
                </View>

                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Account Operations</Text>
                    <Text style={styles.sectionDesc}>
                        Select an action below to manage team member accounts
                    </Text>
                </View>

                {/* Option Cards */}
                {adminOptions.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={item.onPress}
                        activeOpacity={0.75}
                        style={styles.card}
                    >
                        <View style={styles.cardTop}>
                            <View style={[styles.iconWrapper, { backgroundColor: item.iconBg }]}>
                                <Ionicons name={item.icon} size={24} color={item.iconColor} />
                            </View>
                            <View style={[styles.badge, { backgroundColor: item.tagBg }]}>
                                <Text style={[styles.badgeText, { color: item.tagColor }]}>
                                    {item.tag}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
                        </View>

                        <View style={styles.cardFooter}>
                            <Text style={styles.actionText}>Open Module</Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default AdminManagement;

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
        borderRadius: 18,
        padding: 18,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    bannerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    bannerIconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
    },
    bannerPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ECFDF5",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#A7F3D0",
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10B981",
        marginRight: 6,
    },
    bannerPillText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#065F46",
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
        marginBottom: 4,
    },
    bannerDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: "row",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    statBox: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: COLORS.textMuted,
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 18,
        fontWeight: "800",
        color: "#059669",
        marginTop: 2,
    },
    statValueSecondary: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 28,
        backgroundColor: COLORS.border,
        marginHorizontal: 12,
    },
    sectionHeader: {
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    sectionDesc: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    iconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
    },
    cardContent: {
        marginBottom: 14,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 12,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        paddingTop: 12,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.primary,
    },
});
