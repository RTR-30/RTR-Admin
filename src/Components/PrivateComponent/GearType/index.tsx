import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const GearType = () => {
    const value = "Gear Types";
    const navigation: any = useNavigation();

    const gearOptions = [
        {
            title: "Create Gear Type",
            subtitle: "Define new transmission variants (Manual, Automatic, EV, Hybrid)",
            icon: "add-circle",
            iconColor: "#0284C7",
            iconBg: "#E0F2FE",
            tag: "New Setup",
            tagBg: "#F0F9FF",
            tagColor: "#0369A1",
            onPress: () => navigation.navigate("CreateGearType"),
        },
        {
            title: "Gear Types List",
            subtitle: "Browse, toggle active status, edit or delete configured transmissions",
            icon: "cog",
            iconColor: "#7C3AED",
            iconBg: "#EDE9FE",
            tag: "Inventory",
            tagBg: "#F5F3FF",
            tagColor: "#6D28D9",
            onPress: () => navigation.navigate("GearTypeList"),
        },
    ];

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Vehicle Transmission Settings" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Transmission Configurations</Text>
                    <Text style={styles.sectionDesc}>
                        Manage available gear types used when matching drivers to vehicles
                    </Text>
                </View>

                {gearOptions.map((item, index) => (
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

export default GearType;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    sectionDesc: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginTop: 4,
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
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    actionText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.primary,
        marginRight: 6,
    },
});