import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";
import { ApproveService, RejectService, WithdrawalRequestListService } from "./helper";

const Withdrawal = () => {
    const value = "Withdrawals";

    const [withdrawalList, setWithdrawalList] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [footerLoading, setFooterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState<string>("");
    const [totalCount, setTotalCount] = useState<number>(0);
    const [actionLoadingId, setActionLoadingId] = useState<any>(null);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);
    const searchTimeout = useRef<any>(null);

    const fetchWithdrawalList = async (pageNumber = 1, isLoadMore = false, searchQuery = search) => {
        if (isLoadMore) {
            setFooterLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await WithdrawalRequestListService(pageNumber, limit, searchQuery);
            const { data: { data = [], message = "", success = false, pagination = {} } = {} } = res || {};

            if (success) {
                if (isLoadMore) {
                    setWithdrawalList((prev) => [...prev, ...data]);
                } else {
                    setWithdrawalList(data);
                }

                setPage(pagination?.page || pageNumber);
                setTotalPages(pagination?.totalPages || 1);
                setTotalCount(
                    pagination?.total ??
                    pagination?.totalCount ??
                    pagination?.totalRecords ??
                    (isLoadMore ? withdrawalList.length + data.length : data.length)
                );
            } else {
                showError(message || "Failed to load withdrawal requests");
            }
        } catch (error: any) {
            showError(error?.message || "Check internet connection");
        } finally {
            setLoading(false);
            setFooterLoading(false);
        }
    };

    const handleApprove = async (id: any) => {
        setActionLoadingId({ id, action: "approve" });
        const payload = {
            requestId: id,
        };
        try {
            const res = await ApproveService(payload);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success) {
                showSuccess(message || "Withdrawal approved");
                fetchWithdrawalList(1, false, search);
            } else {
                showError(message || "Approval failed");
            }
        } catch (error: any) {
            showError("Approval failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleReject = async (id: any) => {
        setActionLoadingId({ id, action: "reject" });
        const payload = {
            requestId: id,
        };
        try {
            const res = await RejectService(payload);
            const { data: { message = "", success = false } = {} } = res || {};
            if (success) {
                showSuccess(message || "Withdrawal rejected");
                fetchWithdrawalList(1, false, search);
            } else {
                showError(message || "Rejection failed");
            }
        } catch (error: any) {
            showError("Rejection failed");
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setPage(1);
            fetchWithdrawalList(1, false, text.trim());
        }, 400);
    };

    const handleClearSearch = () => {
        setSearch("");

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        setPage(1);
        fetchWithdrawalList(1, false, "");
    };

    const handleLoadMore = () => {
        if (!loading && !footerLoading && page < totalPages) {
            const nextPage = page + 1;
            fetchWithdrawalList(nextPage, true, search);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        await fetchWithdrawalList(1, false, search);
        setRefreshing(false);
    };

    const formatDate = (date: string) => {
        if (!date) return "-";
        const d = new Date(date);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date: string) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status?.toUpperCase()) {
            case "APPROVED":
                return {
                    backgroundColor: "#ECFDF5",
                    color: "#059669",
                    borderColor: "#A7F3D0",
                };
            case "REJECTED":
                return {
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    borderColor: "#FECACA",
                };
            case "CANCELLED":
                return {
                    backgroundColor: "#FFFBEB",
                    color: "#D97706",
                    borderColor: "#FDE68A",
                };
            default:
                return {
                    backgroundColor: "#FEF3C7",
                    color: "#B45309",
                    borderColor: "#FDE68A",
                };
        }
    };

    const renderWithdrawal = ({ item }: any) => {
        const status = item?.status || "PENDING";
        const statusStyle = getStatusStyle(status);
        const isPending = status === "PENDING" || status === "REQUESTED";
        const isApproving = actionLoadingId?.id === item.id && actionLoadingId?.action === "approve";
        const isRejecting = actionLoadingId?.id === item.id && actionLoadingId?.action === "reject";

        return (
            <View style={styles.cardContainer}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.amountBox}>
                        <Ionicons name="wallet-outline" size={20} color="#059669" style={{ marginRight: 6 }} />
                        <Text style={styles.amountText}>
                            ₹{Number(item?.amount || 0).toLocaleString("en-IN")}
                        </Text>
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, borderColor: statusStyle.borderColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>{status}</Text>
                    </View>
                </View>

                {/* Partner Details */}
                <View style={styles.partnerSection}>
                    <View style={styles.partnerInfoRow}>
                        <Ionicons name="person-circle-outline" size={16} color="#64748B" style={styles.partnerIcon} />
                        <Text style={styles.partnerNameText}>{item?.partnerName || "Unnamed Partner"}</Text>
                        <Text style={styles.partnerMobileText}>• {item?.partnerMobileNo || "-"}</Text>
                    </View>

                    {/* Bank Account Details Card */}
                    <View style={styles.bankBox}>
                        <View style={styles.bankDetailRow}>
                            <Text style={styles.bankLabel}>A/C Name</Text>
                            <Text style={styles.bankValue}>{item?.bank_details?.account_name || "-"}</Text>
                        </View>
                        <View style={styles.bankDetailRow}>
                            <Text style={styles.bankLabel}>A/C Number</Text>
                            <Text style={styles.bankValueBold}>{item?.bank_details?.account_number || "-"}</Text>
                        </View>
                        <View style={styles.bankDetailRow}>
                            <Text style={styles.bankLabel}>IFSC Code</Text>
                            <Text style={styles.bankValueBadge}>{item?.bank_details?.ifsc || "-"}</Text>
                        </View>
                    </View>
                </View>

                {/* Actions & Timestamp */}
                <View style={styles.cardFooter}>
                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={13} color="#94A3B8" style={{ marginRight: 4 }} />
                        <Text style={styles.dateText}>
                            {formatDate(item?.created_at)} {formatTime(item?.created_at)}
                        </Text>
                    </View>

                    {isPending ? (
                        <View style={styles.actionButtonsRow}>
                            <TouchableOpacity
                                onPress={() => handleReject(item.id)}
                                disabled={isRejecting || isApproving}
                                style={styles.rejectButton}
                                activeOpacity={0.8}
                            >
                                {isRejecting ? (
                                    <ActivityIndicator size="small" color="#DC2626" />
                                ) : (
                                    <>
                                        <Ionicons name="close-circle-outline" size={14} color="#DC2626" style={{ marginRight: 4 }} />
                                        <Text style={styles.rejectButtonText}>Reject</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleApprove(item.id)}
                                disabled={isApproving || isRejecting}
                                style={styles.approveButton}
                                activeOpacity={0.8}
                            >
                                {isApproving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Ionicons name="checkmark-circle-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                                        <Text style={styles.approveButtonText}>Approve</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!footerLoading) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.footerText}>Loading more requests...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="wallet-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Withdrawal Requests</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? `No results match "${search}". Try searching with a different keyword.`
                        : "There are currently no withdrawal requests pending in the queue."}
                </Text>
            </View>
        );
    };

    useEffect(() => {
        fetchWithdrawalList(1, false, "");
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Driver Wallet Payout Management" />

            <View style={styles.content}>
                {/* Search Box */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, mobile, account number..."
                        placeholderTextColor="#94A3B8"
                        value={search}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {loading && !refreshing && !footerLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
                    ) : search ? (
                        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={18} color="#94A3B8" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Count Row */}
                <View style={styles.countRow}>
                    <Text style={styles.countText}>Total Requests</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{totalCount}</Text>
                    </View>
                </View>

                {loading && withdrawalList.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.centerLoaderText}>Loading payout requests...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={withdrawalList}
                        keyExtractor={(item, index) => String(item?.id || index)}
                        renderItem={renderWithdrawal}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={handleRefresh}
                                colors={[COLORS.primary]}
                                tintColor={COLORS.primary}
                            />
                        }
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </View>
        </View>
    );
};

export default Withdrawal;

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
    searchLoader: {
        marginRight: 4,
    },
    clearButton: {
        padding: 4,
    },
    countRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingHorizontal: 2,
    },
    countText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: "600",
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
    centerLoader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    centerLoaderText: {
        fontSize: 13,
        color: COLORS.textMuted,
        marginTop: 10,
    },
    cardContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    amountBox: {
        flexDirection: "row",
        alignItems: "center",
    },
    amountText: {
        fontSize: 20,
        fontWeight: "800",
        color: COLORS.textMain,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    partnerSection: {
        marginBottom: 12,
    },
    partnerInfoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    partnerIcon: {
        marginRight: 6,
    },
    partnerNameText: {
        fontSize: 14,
        fontWeight: "700",
        color: COLORS.textMain,
    },
    partnerMobileText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginLeft: 4,
        fontWeight: "500",
    },
    bankBox: {
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        gap: 6,
    },
    bankDetailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    bankLabel: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    bankValue: {
        fontSize: 13,
        color: COLORS.textMain,
        fontWeight: "600",
    },
    bankValueBold: {
        fontSize: 13,
        color: COLORS.textMain,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    bankValueBadge: {
        fontSize: 12,
        color: "#0284C7",
        fontWeight: "700",
        backgroundColor: "#E0F2FE",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: COLORS.borderLight,
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 12,
        color: COLORS.textMuted,
        fontWeight: "500",
    },
    actionButtonsRow: {
        flexDirection: "row",
        gap: 8,
    },
    rejectButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FECACA",
    },
    rejectButtonText: {
        fontSize: 12,
        color: "#DC2626",
        fontWeight: "700",
    },
    approveButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: "#059669",
        ...SHADOWS.sm,
    },
    approveButtonText: {
        fontSize: 12,
        color: "#FFFFFF",
        fontWeight: "700",
    },
    footerLoader: {
        paddingVertical: 15,
        alignItems: "center",
    },
    footerText: {
        marginTop: 5,
        color: COLORS.textMuted,
        fontSize: 12,
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
    listContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
});