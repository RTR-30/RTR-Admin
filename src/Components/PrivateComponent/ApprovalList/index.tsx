import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    FlatList,
    TextInput,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { submitApprovalService, totalapprovalList } from "./helperapi";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const TotalApprovalList = () => {
    const value = "Approval List";
    const [loader, setLoader] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);
    const [actionLoadingId, setActionLoadingId] = useState<any>(null);

    const [currentPageLimit, setCurrentPageLimit] = useState<number>(10);
    const [datas, setDatas] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [search, setSearch] = useState<string>("");
    const searchTimeout = useRef<any>(null);

    const handleApprovalList = async (searchTerm = search, limit = currentPageLimit, page = 1) => {
        if (!footerLoader && !onRefreshing) {
            setLoader(true);
        }

        try {
            const res = await totalapprovalList(searchTerm, limit, page);
            const items = res?.data?.data || [];
            const count = res?.data?.pagination?.total ?? items.length;

            setTotalCount(count);
            setDatas(items);
        } catch (error) {
            showError("Failed to fetch approval list");
        } finally {
            setLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };

    const onRefresh = () => {
        setOnRefreshing(true);
        setCurrentPageLimit(10);
        handleApprovalList(search, 10, 1);
    };

    const handleSearch = (text: string) => {
        setSearch(text);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleApprovalList(text.trim(), currentPageLimit, 1);
        }, 400);
    };

    const handleClearSearch = () => {
        setSearch("");
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        handleApprovalList("", currentPageLimit, 1);
    };

    const handleSubmit = async (userId: any) => {
        setActionLoadingId(userId);
        try {
            const res = await submitApprovalService(userId);
            const { data: { success = false, message = "" } = {} } = res || {};
            if (success) {
                showSuccess(message || "Partner approved successfully");
                handleApprovalList(search, currentPageLimit, 1);
            } else {
                showError(message || "Failed to approve partner");
            }
        } catch (error: any) {
            showError(error?.message || "Failed to approve partner");
        } finally {
            setActionLoadingId(null);
        }
    };

    const loadMore = () => {
        if (!loader && !footerLoader && totalCount !== null && datas.length < totalCount) {
            setFooterLoader(true);
            const newLimit = currentPageLimit + 10;
            setCurrentPageLimit(newLimit);
            handleApprovalList(search, newLimit, 1);
        }
    };

    const renderLoader = () => {
        if (!footerLoader) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.footerLoaderText}>Loading more applications...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loader) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={56} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? `No pending approvals match "${search}".`
                        : "There are currently no driver applications waiting for approval."}
                </Text>
            </View>
        );
    };

    const renderList = ({ item }: { item: any }) => {
        const isApproving = actionLoadingId === item?.partneruserid;
        const initials = (item?.fullname || "P")
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

        return (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.avatarWrapper}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {item?.fullname || "Unnamed Partner"}
                        </Text>
                        <View style={styles.phoneRow}>
                            <Ionicons name="call-outline" size={13} color="#64748B" style={styles.phoneIcon} />
                            <Text style={styles.phoneText}>{item?.partnerMobileNo || "-"}</Text>
                        </View>
                    </View>
                    <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                    </View>
                </View>

                {/* Verification Chips */}
                <View style={styles.chipsContainer}>
                    <View style={styles.chip}>
                        <Ionicons name="id-card-outline" size={14} color="#0284C7" style={styles.chipIcon} />
                        <Text style={styles.chipLabel}>Aadhaar: </Text>
                        <Text style={styles.chipValue}>{item?.aadhaar || "-"}</Text>
                    </View>

                    <View style={styles.chip}>
                        <Ionicons name="car-outline" size={14} color="#7C3AED" style={styles.chipIcon} />
                        <Text style={styles.chipLabel}>License: </Text>
                        <Text style={styles.chipValue}>{item?.licensenumber || "-"}</Text>
                    </View>

                    {item?.dob ? (
                        <View style={styles.chip}>
                            <Ionicons name="calendar-outline" size={14} color="#059669" style={styles.chipIcon} />
                            <Text style={styles.chipLabel}>DOB: </Text>
                            <Text style={styles.chipValue}>{item.dob}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Footer Action */}
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[styles.approveButton, isApproving && styles.approveButtonDisabled]}
                        onPress={() => handleSubmit(item?.partneruserid)}
                        disabled={isApproving}
                        activeOpacity={0.8}
                    >
                        {isApproving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" style={styles.approveIcon} />
                                <Text style={styles.approveButtonText}>Approve Partner</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    useEffect(() => {
        handleApprovalList("", 10, 1);
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Driver Verification & Onboarding" />

            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by name, aadhaar or license"
                        value={search}
                        onChangeText={handleSearch}
                        style={styles.searchInput}
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {search ? (
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            style={styles.clearButton}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Count Row */}
                <View style={styles.countRow}>
                    <Text style={styles.countLabel}>Pending Verifications</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{totalCount ?? datas.length}</Text>
                    </View>
                </View>

                {/* List */}
                {loader && datas.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.centerLoaderText}>Fetching pending approvals...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={datas}
                        renderItem={renderList}
                        keyExtractor={(item, index) => item?.partneruserid?.toString() || index.toString()}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={renderEmpty}
                        refreshControl={
                            <RefreshControl
                                refreshing={onRefreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                        contentContainerStyle={styles.listContent}
                        ListFooterComponent={renderLoader}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0.4}
                    />
                )}
            </View>
        </View>
    );
};

export default TotalApprovalList;

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
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
        ...SHADOWS.sm,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: COLORS.textMain,
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    countRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    countLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    countBadge: {
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#92400E",
    },
    listContent: {
        paddingBottom: 30,
        flexGrow: 1,
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
        alignItems: "center",
    },
    avatarWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#D1FAE5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#059669",
    },
    headerInfo: {
        flex: 1,
    },
    nameText: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 2,
    },
    phoneRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    phoneIcon: {
        marginRight: 4,
    },
    phoneText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: "500",
    },
    pendingBadge: {
        backgroundColor: "#FFFBEB",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#FDE68A",
    },
    pendingBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#B45309",
    },
    chipsContainer: {
        marginTop: 12,
        gap: 6,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    chipIcon: {
        marginRight: 6,
    },
    chipLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textSecondary,
    },
    chipValue: {
        fontSize: 12,
        fontWeight: "600",
        color: COLORS.textMain,
    },
    cardFooter: {
        marginTop: 14,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    approveButton: {
        backgroundColor: "#059669",
        height: 42,
        borderRadius: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        ...SHADOWS.sm,
    },
    approveButtonDisabled: {
        opacity: 0.7,
    },
    approveIcon: {
        marginRight: 6,
    },
    approveButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    centerLoader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    centerLoaderText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 10,
    },
    footerLoader: {
        paddingVertical: 16,
        alignItems: "center",
    },
    footerLoaderText: {
        fontSize: 12,
        color: COLORS.textMuted,
        marginTop: 6,
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
        lineHeight: 18,
    },
});