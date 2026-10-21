import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError } from "../../../Common/ToastMessage";
import { getTripTypesServices } from "./helperapi";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const UpdatePayment = () => {
    const value = "Update Payment Rates";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    const [tripTypes, setTripTypes] = useState<any[]>([]);

    const handleTripTypes = async () => {
        setLoading(true);
        try {
            const res = await getTripTypesServices();
            const { success, message, data } = res?.data || {};

            if (success === true) {
                setTripTypes(data || []);
            } else {
                showError(message || "Failed to load trip categories");
            }
        } catch (error) {
            showError("Failed to fetch trip categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleTripTypes();
    }, []);

    const renderHeader = () => (
        <View style={styles.banner}>
            <View style={styles.bannerIconWrapper}>
                <Ionicons name="pricetags-outline" size={24} color="#2563EB" />
            </View>
            <View style={styles.bannerTextWrapper}>
                <Text style={styles.bannerTitle}>Select Trip Category</Text>
                <Text style={styles.bannerSubtitle}>
                    Choose a trip type below to inspect, edit, or delete its hourly rates and platform fee splits.
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Browse Rates by Ride Category" />

            <View style={styles.content}>
                {loading && tripTypes.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loaderText}>Loading trip categories...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={tripTypes}
                        keyExtractor={(item) => item.id.toString()}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        ListHeaderComponent={renderHeader}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() =>
                                    navigation.navigate("UpdatePaymentList", { TripDetails: item })
                                }
                                activeOpacity={0.75}
                            >
                                <View style={styles.cardLeft}>
                                    <View style={styles.categoryIconWrapper}>
                                        <Ionicons name="navigate-outline" size={20} color="#0D9488" />
                                    </View>
                                    <View>
                                        <Text style={styles.categoryTitle}>{item.trip_type}</Text>
                                        <Text style={styles.categoryIdText}>ID: #{item.id}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardRight}>
                                    <Text style={styles.viewRatesText}>View Rates</Text>
                                    <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="navigate-circle-outline" size={54} color="#CBD5E1" />
                                <Text style={styles.emptyTitle}>No Trip Types Found</Text>
                                <Text style={styles.emptySubtitle}>
                                    Please create a trip category first before configuring payment rates.
                                </Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
};

export default UpdatePayment;

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
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    categoryIconWrapper: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: "#CCFBF1",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    categoryIdText: {
        fontSize: 11,
        color: COLORS.textMuted,
        marginTop: 2,
    },
    cardRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    viewRatesText: {
        fontSize: 13,
        fontWeight: "700",
        color: COLORS.primary,
        marginRight: 4,
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
});
