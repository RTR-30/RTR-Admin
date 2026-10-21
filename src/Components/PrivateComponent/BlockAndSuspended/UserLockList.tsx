import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import {
    userBlackAndSuspendedServices,
    updateUserStatusService,
} from "./helper";

const UserLockList = () => {
    const value = "Locked Users";

    const [loader, setLoader] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);
    const [actionLoadingId, setActionLoadingId] = useState<any>(null);

    const [list, setList] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>("");

    const limit = 10;
    const searchTimeout = useRef<any>(null);

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const fetchList = async (
        pageNumber: number = 1,
        isLoadMore: boolean = false,
        searchQuery: string = search
    ) => {
        if (isLoadMore) {
            setFooterLoader(true);
        } else {
            setLoader(true);
        }

        try {
            const res = await userBlackAndSuspendedServices(pageNumber, limit, searchQuery);
            const responseData = res?.data;
            const items = responseData?.data || (Array.isArray(responseData) ? responseData : []);
            const total =
                responseData?.pagination?.total ??
                responseData?.total ??
                items.length;
            const calculatedTotalPages =
                responseData?.pagination?.totalPages ??
                (total > 0 ? Math.ceil(total / limit) : 1);

            if (isLoadMore) {
                setList((prev) => [...prev, ...items]);
            } else {
                setList(items);
            }

            setTotalCount(total);
            setPage(responseData?.pagination?.page || pageNumber);
            setTotalPages(calculatedTotalPages);
        } catch (error: any) {
            showError(error?.message || "Failed to load user list");
        } finally {
            setLoader(false);
            setRefreshing(false);
            setFooterLoader(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchList(1, false, search);
    };

    const handleLoadMore = () => {
        if (!loader && !footerLoader && page < totalPages) {
            const nextPage = page + 1;
            fetchList(nextPage, true, search);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        searchTimeout.current = setTimeout(() => {
            setPage(1);
            fetchList(1, false, text.trim());
        }, 500);
    };

    const handleClearSearch = () => {
        setSearch("");
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        setPage(1);
        fetchList(1, false, "");
    };

    const handleUnlockUser = (item: any) => {
        const userId = item?.id ?? item?.Id ?? item?.userId;
        if (!userId) {
            showError("Invalid user ID");
            return;
        }

        const userName = item?.name || item?.Name || item?.fullname || `ID ${userId}`;

        Alert.alert(
            "Unlock User",
            `Are you sure you want to unlock ${userName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Unlock",
                    onPress: async () => {
                        setActionLoadingId(userId);
                        try {
                            const payload = {
                                status: "ACTIVE",
                            };
                            const res = await updateUserStatusService(userId, payload);
                            if (
                                res?.status === 200 ||
                                res?.status === 201 ||
                                res?.data?.success
                            ) {
                                showSuccess(
                                    res?.data?.message || "User unlocked successfully"
                                );
                                fetchList(1, false, search);
                            } else {
                                showError(
                                    res?.data?.message || "Failed to unlock user"
                                );
                            }
                        } catch (error: any) {
                            showError(error?.message || "Failed to unlock user");
                        } finally {
                            setActionLoadingId(null);
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchList(1, false, "");
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const renderStatusBadge = (status?: string) => {
        const normalized = (status || "").toUpperCase();
        if (normalized === "SUSPENDED") {
            return (
                <View style={[styles.badge, styles.badgeSuspended]}>
                    <Text style={styles.badgeSuspendedText}>SUSPENDED</Text>
                </View>
            );
        }
        if (normalized === "BLOCKED") {
            return (
                <View style={[styles.badge, styles.badgeBlocked]}>
                    <Text style={styles.badgeBlockedText}>BLOCKED</Text>
                </View>
            );
        }
        return (
            <View style={[styles.badge, styles.badgeDefault]}>
                <Text style={styles.badgeDefaultText}>{normalized || "LOCKED"}</Text>
            </View>
        );
    };

    const renderItem = ({ item }: { item: any }) => {
        const id = item?.id ?? item?.Id ?? item?.userId ?? "-";
        const name = item?.name ?? item?.Name ?? item?.fullname ?? "-";
        const email = item?.email ?? item?.Email ?? "-";
        const phone = item?.mobileno ?? item?.MobileNo ?? item?.phone ?? "-";
        const reason = item?.reason ?? item?.block_reason ?? item?.suspended_reason;
        const suspendedUntil = item?.suspended_until ?? item?.suspendedUntil;
        const isUnlocking = actionLoadingId === id;

        return (
            <View style={styles.card}>
                {/* Header row: ID + Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.idContainer}>
                        <Ionicons name="person-circle-outline" size={20} color="#555" />
                        <Text style={styles.idText}>ID: {id}</Text>
                    </View>
                    {renderStatusBadge(item?.status)}
                </View>

                {/* Body Details */}
                <View style={styles.cardBody}>
                    <Text style={styles.nameText}>{name}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={15} color="#666" />
                        <Text style={styles.infoText}>{phone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={15} color="#666" />
                        <Text style={styles.infoText}>{email}</Text>
                    </View>

                    {suspendedUntil ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="calendar-outline" size={15} color="#D46B08" />
                            <Text style={styles.suspendedDateText}>
                                Suspended Until: {formatDate(suspendedUntil)}
                            </Text>
                        </View>
                    ) : null}

                    {reason ? (
                        <View style={styles.reasonBox}>
                            <Text style={styles.reasonLabel}>Reason:</Text>
                            <Text style={styles.reasonText}>{reason}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Footer Action: Unlock User */}
                <View style={styles.cardFooter}>
                    <TouchableOpacity
                        style={[
                            styles.unlockButton,
                            isUnlocking && styles.unlockButtonDisabled,
                        ]}
                        onPress={() => handleUnlockUser(item)}
                        disabled={isUnlocking}
                        activeOpacity={0.8}
                    >
                        {isUnlocking ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="lock-open-outline" size={15} color="#fff" />
                                <Text style={styles.unlockButtonText}>Unlock</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!footerLoader) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary || "#E0211F"} />
            </View>
        );
    };

    const renderEmpty = () => {
        if (loader) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="shield-checkmark-outline" size={54} color="#aaa" />
                <Text style={styles.emptyTitle}>No Users Found</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? `No results match "${search}". Try a different keyword.`
                        : "There are currently no blocked or suspended users."}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Restricted Customer Accounts" />

            <View style={styles.content}>
                {/* Search Box */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, email or phone"
                        placeholderTextColor="#888"
                        value={search}
                        onChangeText={handleSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {search ? (
                        <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                            <Ionicons name="close-circle" size={18} color="#888" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Count Row */}
                <View style={styles.countRow}>
                    <Text style={styles.countText}>
                        Total Count: <Text style={styles.countBold}>{totalCount}</Text>
                    </Text>
                </View>

                {/* Initial Loader */}
                {loader && list.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary || "#E0211F"} />
                    </View>
                ) : (
                    <FlatList
                        data={list}
                        renderItem={renderItem}
                        keyExtractor={(item, index) =>
                            item?.id?.toString?.() ||
                            item?.Id?.toString?.() ||
                            item?.userId?.toString?.() ||
                            index.toString()
                        }
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        removeClippedSubviews={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={[COLORS.primary || "#E0211F"]}
                                tintColor={COLORS.primary || "#E0211F"}
                            />
                        }
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.2}
                        ListFooterComponent={renderFooter}
                        ListEmptyComponent={renderEmpty}
                    />
                )}
            </View>
        </View>
    );
};

export default UserLockList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f6fa",
    },
    content: {
        flex: 1,
        paddingHorizontal: 14,
        paddingTop: 10,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#dcdfe6",
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: "#000",
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
    },
    countRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: 10,
        paddingHorizontal: 2,
    },
    countText: {
        fontSize: 13,
        color: "#555",
    },
    countBold: {
        fontWeight: "bold",
        color: "#000",
    },
    listContent: {
        paddingBottom: 24,
        gap: 12,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e8eaed",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f2f5",
    },
    idContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    idText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#222",
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    badgeBlocked: {
        backgroundColor: "#FFF1F0",
        borderColor: "#FFA39E",
    },
    badgeBlockedText: {
        color: "#CF1322",
        fontSize: 11,
        fontWeight: "700",
    },
    badgeSuspended: {
        backgroundColor: "#FFF7E6",
        borderColor: "#FFD591",
    },
    badgeSuspendedText: {
        color: "#D46B08",
        fontSize: 11,
        fontWeight: "700",
    },
    badgeDefault: {
        backgroundColor: "#F5F5F5",
        borderColor: "#D9D9D9",
    },
    badgeDefaultText: {
        color: "#595959",
        fontSize: 11,
        fontWeight: "700",
    },
    cardBody: {
        paddingVertical: 10,
        gap: 6,
    },
    nameText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#111",
        marginBottom: 2,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        color: "#555",
    },
    suspendedDateText: {
        fontSize: 13,
        color: "#D46B08",
        fontWeight: "600",
    },
    reasonBox: {
        marginTop: 4,
        backgroundColor: "#f8f9fa",
        padding: 8,
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: "#E0211F",
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#666",
        textTransform: "uppercase",
    },
    reasonText: {
        fontSize: 12,
        color: "#333",
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f2f5",
    },
    unlockButton: {
        backgroundColor: "#16a34a",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 7,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    unlockButtonDisabled: {
        opacity: 0.65,
    },
    unlockButtonText: {
        fontSize: 13,
        color: "#fff",
        fontWeight: "700",
    },
    centerLoader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    footerLoader: {
        paddingVertical: 12,
        alignItems: "center",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginTop: 14,
    },
    emptySubtitle: {
        fontSize: 13,
        color: "#888",
        textAlign: "center",
        marginTop: 6,
        lineHeight: 18,
    },
});

