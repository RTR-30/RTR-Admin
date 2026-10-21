import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";

import Header from "../../../Common/PageHeader";
import { showError } from "../../../Common/ToastMessage";
import { COLORS } from "../../../utils/ColorCode";
import { AutoCloseBookingsService } from "./helperapi";

const AutoClosingList = () => {
    const value = "Auto Closing List";

    const [loader, setLoader] = useState<boolean>(false);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [list, setList] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [search, setSearch] = useState<string>("");

    const limit = 10;

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "-";
        try {
            const m = moment(dateString);
            if (m.isValid()) {
                return m.format("DD MMM YYYY, hh:mm A");
            }
            const d = new Date(dateString);
            if (!isNaN(d.getTime())) {
                return d.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                });
            }
            return dateString;
        } catch {
            return dateString;
        }
    };

    const fetchList = async (
        pageNumber: number = 1,
        isLoadMore: boolean = false
    ) => {
        if (isLoadMore) {
            setFooterLoader(true);
        } else {
            setLoader(true);
        }

        try {
            const res = await AutoCloseBookingsService(limit, pageNumber);
            const responseData = res?.data;

            const items: any[] = Array.isArray(responseData?.data)
                ? responseData.data
                : Array.isArray(responseData?.bookings)
                ? responseData.bookings
                : Array.isArray(responseData)
                ? responseData
                : [];

            const total =
                responseData?.pagination?.total ??
                responseData?.total ??
                responseData?.totalCount ??
                items.length;

            const calculatedTotalPages =
                responseData?.pagination?.totalPages ??
                responseData?.pagination?.lastPage ??
                responseData?.lastPage ??
                responseData?.totalPages ??
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
            showError(error?.message || "Failed to load auto closing list");
        } finally {
            setLoader(false);
            setRefreshing(false);
            setFooterLoader(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchList(1, false);
    };

    const handleLoadMore = () => {
        if (!loader && !footerLoader && page < totalPages) {
            const nextPage = page + 1;
            fetchList(nextPage, true);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
    };

    const handleClearSearch = () => {
        setSearch("");
    };

    useEffect(() => {
        fetchList(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Local filter if search query is entered
    const filteredList = search.trim()
        ? list.filter((item) => {
              const q = search.trim().toLowerCase();
              const name = (
                  item?.customerName ??
                  item?.customer_name ??
                  item?.CustomerName ??
                  item?.Name ??
                  item?.name ??
                  item?.userName ??
                  ""
              ).toLowerCase();
              const phone = (
                  item?.MobileNo ??
                  item?.mobileno ??
                  item?.phone ??
                  item?.Phone ??
                  ""
              ).toLowerCase();
              const address = (
                  item?.Address ??
                  item?.address ??
                  item?.pickupAddress ??
                  item?.pickup_address ??
                  item?.fromAddress ??
                  ""
              ).toLowerCase();
              const id = (
                  item?.bookingId ??
                  item?.booking_id ??
                  item?.BookingId ??
                  item?.id ??
                  item?.Id ??
                  ""
              )
                  .toString()
                  .toLowerCase();

              return (
                  name.includes(q) ||
                  phone.includes(q) ||
                  address.includes(q) ||
                  id.includes(q)
              );
          })
        : list;

    const renderItem = ({ item, index }: { item: any; index: number }) => {
        const id =
            item?.bookingId ??
            item?.booking_id ??
            item?.BookingId ??
            item?.id ??
            item?.Id ??
            `#${index + 1}`;

        const customerName =
            item?.customerName ??
            item?.customer_name ??
            item?.CustomerName ??
            item?.Name ??
            item?.name ??
            item?.userName ??
            "Customer";

        const phone =
            item?.MobileNo ??
            item?.mobileno ??
            item?.phone ??
            item?.Phone ??
            item?.customerMobile ??
            "-";

        const pickupAddress =
            item?.Address ??
            item?.address ??
            item?.pickupAddress ??
            item?.pickup_address ??
            item?.fromAddress ??
            item?.PickupLocation ??
            item?.pickupLocation ??
            "-";

        const dropAddress =
            item?.DropAddress ??
            item?.dropAddress ??
            item?.drop_address ??
            item?.toAddress ??
            item?.DropLocation ??
            item?.dropLocation;

        const startDate =
            item?.StartDate ??
            item?.startDate ??
            item?.start_date ??
            item?.pickupDate ??
            item?.PickupDate ??
            item?.createdAt;

        const endDate =
            item?.EndDate ??
            item?.endDate ??
            item?.end_date ??
            item?.dropDate ??
            item?.DropDate;

        const amount =
            item?.amount ??
            item?.Amount ??
            item?.totalAmount ??
            item?.TotalAmount ??
            item?.fare ??
            item?.price;

        const tripType =
            item?.TripType?.name ??
            item?.tripType?.name ??
            item?.tripTypeName ??
            item?.tripType ??
            item?.TripType;

        const gearType =
            item?.GearType?.name ??
            item?.gearType?.name ??
            item?.gearTypeName ??
            item?.gearType;

        const reason =
            item?.cancelReason ??
            item?.cancel_reason ??
            item?.cancelledReason ??
            item?.reason ??
            item?.autoCancelReason ??
            item?.auto_cancel_reason ??
            "Auto cancelled due to driver timeout / no acceptance";

        const status = (item?.status || "AUTO CANCELLED").toUpperCase();

        return (
            <View style={styles.card}>
                {/* Header: ID + Badge */}
                <View style={styles.cardHeader}>
                    <View style={styles.idContainer}>
                        <Ionicons name="receipt-outline" size={18} color="#444" />
                        <Text style={styles.idText}>ID: {id}</Text>
                    </View>
                    <View style={styles.badgeCancelled}>
                        <Ionicons name="close-circle-outline" size={13} color="#CF1322" />
                        <Text style={styles.badgeCancelledText}>{status}</Text>
                    </View>
                </View>

                {/* Body Details */}
                <View style={styles.cardBody}>
                    {/* Customer & Phone */}
                    <View style={styles.customerRow}>
                        <Text style={styles.customerName}>{customerName}</Text>
                        {phone !== "-" ? (
                            <View style={styles.phoneContainer}>
                                <Ionicons name="call-outline" size={14} color="#555" />
                                <Text style={styles.phoneText}>{phone}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Route Details */}
                    <View style={styles.routeSection}>
                        <View style={styles.routeRow}>
                            <Ionicons name="location" size={16} color="#16a34a" style={styles.routeIcon} />
                            <View style={styles.routeTextContainer}>
                                <Text style={styles.routeLabel}>Pickup / Address</Text>
                                <Text style={styles.routeAddress} numberOfLines={2}>
                                    {pickupAddress}
                                </Text>
                            </View>
                        </View>

                        {dropAddress ? (
                            <View style={[styles.routeRow, { marginTop: 8 }]}>
                                <Ionicons name="location-sharp" size={16} color="#dc2626" style={styles.routeIcon} />
                                <View style={styles.routeTextContainer}>
                                    <Text style={styles.routeLabel}>Drop Location</Text>
                                    <Text style={styles.routeAddress} numberOfLines={2}>
                                        {dropAddress}
                                    </Text>
                                </View>
                            </View>
                        ) : null}
                    </View>

                    {/* Dates */}
                    <View style={styles.datesRow}>
                        <View style={styles.dateBlock}>
                            <Ionicons name="calendar-outline" size={14} color="#555" />
                            <Text style={styles.dateLabel}>Start:</Text>
                            <Text style={styles.dateValue}>{formatDateTime(startDate)}</Text>
                        </View>
                        {endDate ? (
                            <View style={[styles.dateBlock, { marginTop: 4 }]}>
                                <Ionicons name="time-outline" size={14} color="#555" />
                                <Text style={styles.dateLabel}>End:</Text>
                                <Text style={styles.dateValue}>{formatDateTime(endDate)}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Meta Chips: Trip Type / Gear Type / Amount */}
                    <View style={styles.metaRow}>
                        {tripType ? (
                            <View style={styles.metaChip}>
                                <Ionicons name="car-outline" size={13} color="#475569" />
                                <Text style={styles.metaChipText}>{String(tripType)}</Text>
                            </View>
                        ) : null}

                        {gearType ? (
                            <View style={styles.metaChip}>
                                <Ionicons name="cog-outline" size={13} color="#475569" />
                                <Text style={styles.metaChipText}>{String(gearType)}</Text>
                            </View>
                        ) : null}

                        {amount !== undefined && amount !== null ? (
                            <View style={[styles.metaChip, styles.metaChipAmount]}>
                                <Text style={styles.amountText}>₹{Number(amount).toLocaleString("en-IN")}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Cancellation Reason Notice */}
                    {reason ? (
                        <View style={styles.reasonBox}>
                            <Ionicons name="alert-circle-outline" size={15} color="#CF1322" style={{ marginTop: 1 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.reasonLabel}>Cancellation Notice</Text>
                                <Text style={styles.reasonText}>{reason}</Text>
                            </View>
                        </View>
                    ) : null}
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
                <Ionicons name="calendar-clear-outline" size={54} color="#aaa" />
                <Text style={styles.emptyTitle}>No Auto Closed Bookings Found</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? `No results match "${search}". Try a different keyword.`
                        : "There are currently no auto-cancelled bookings."}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Auto-Terminated & Driver Timeout Rides" />

            <View style={styles.content}>
                {/* Search Box */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by customer, phone, location..."
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
                        Total Count: <Text style={styles.countBold}>{search.trim() ? filteredList.length : totalCount}</Text>
                    </Text>
                </View>

                {/* Initial Loader */}
                {loader && list.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary || "#E0211F"} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredList}
                        renderItem={renderItem}
                        keyExtractor={(item, index) =>
                            item?.id?.toString?.() ||
                            item?.bookingId?.toString?.() ||
                            item?.booking_id?.toString?.() ||
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

export default AutoClosingList;

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
        fontSize: 14,
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
    badgeCancelled: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 9,
        paddingVertical: 3,
        borderRadius: 12,
        backgroundColor: "#FFF1F0",
        borderWidth: 1,
        borderColor: "#FFA39E",
    },
    badgeCancelledText: {
        color: "#CF1322",
        fontSize: 11,
        fontWeight: "700",
    },
    cardBody: {
        paddingTop: 10,
        gap: 8,
    },
    customerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    customerName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1e293b",
        flex: 1,
    },
    phoneContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    phoneText: {
        fontSize: 13,
        color: "#475569",
        fontWeight: "600",
    },
    routeSection: {
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        padding: 10,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    routeRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    routeIcon: {
        marginRight: 8,
        marginTop: 2,
    },
    routeTextContainer: {
        flex: 1,
    },
    routeLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748b",
        marginBottom: 2,
        textTransform: "uppercase",
    },
    routeAddress: {
        fontSize: 13,
        color: "#1e293b",
        lineHeight: 18,
    },
    datesRow: {
        gap: 4,
    },
    dateBlock: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
    },
    dateLabel: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "600",
    },
    dateValue: {
        fontSize: 12,
        color: "#1e293b",
        fontWeight: "500",
    },
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        marginTop: 2,
    },
    metaChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    metaChipText: {
        fontSize: 12,
        color: "#475569",
        fontWeight: "600",
    },
    metaChipAmount: {
        backgroundColor: "#ecfdf5",
        marginLeft: "auto",
    },
    amountText: {
        fontSize: 13,
        fontWeight: "700",
        color: "#059669",
    },
    reasonBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 6,
        backgroundColor: "#fff1f2",
        padding: 9,
        borderRadius: 6,
        borderLeftWidth: 3,
        borderLeftColor: "#e11d48",
        marginTop: 4,
    },
    reasonLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "#9f1239",
        textTransform: "uppercase",
    },
    reasonText: {
        fontSize: 12,
        color: "#881337",
        marginTop: 2,
        lineHeight: 16,
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