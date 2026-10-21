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

const PaymentMode = () => {
    const value = "Rate Matrix";
    const navigation: any = useNavigation();

    const paymentOptions = [
        {
            title: "Create Payment Rate",
            subtitle: "Map hourly durations, driver charges and fees to trip types",
            icon: "add-circle",
            iconColor: "#059669",
            iconBg: "#D1FAE5",
            tag: "New Rate",
            tagBg: "#ECFDF5",
            tagColor: "#065F46",
            onPress: () => navigation.navigate("CreatePayment"),
        },
        {
            title: "Update Payment Rates",
            subtitle: "Browse trip types to view, modify or delete existing fare schedules",
            icon: "create",
            iconColor: "#2563EB",
            iconBg: "#DBEAFE",
            tag: "Modify Rates",
            tagBg: "#EFF6FF",
            tagColor: "#1D4ED8",
            onPress: () => navigation.navigate("UpdatePayment"),
        },
    ];

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Manage Trip Pricing Schedules" />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Fare Configuration</Text>
                    <Text style={styles.sectionDesc}>
                        Define and adjust hourly tariffs, platform commissions, and taxes
                    </Text>
                </View>

                {paymentOptions.map((item, index) => (
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
                            <Text style={styles.actionText}>Open Rate Tool</Text>
                            <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

export default PaymentMode;

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