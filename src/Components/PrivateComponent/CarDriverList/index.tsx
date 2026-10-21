import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TextInput,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

import Header from "../../../Common/PageHeader";
import { totalcardriverUser } from "./helperapi";
import { showError } from "../../../Common/ToastMessage";
import { COLORS, SHADOWS } from "../../../utils/ColorCode";

const TotalCarDriverList = () => {
    const value = "Car Drivers";
    const navigation: any = useNavigation();

    const [loader, setLoader] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);

    const [currentPageLimit, setCurrentPageLimit] = useState<number>(10);
    const [datas, setDatas] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState<number | null>(null);
    const [search, setSearch] = useState<string>("");
    const searchTimeout = useRef<any>(null);

    const handleCarDriver = async (searchTerm = search, limit = currentPageLimit, page = 1) => {
        if (!footerLoader && !onRefreshing) {
            setLoader(true);
        }

        try {
            const res = await totalcardriverUser(searchTerm, limit, page);
            const items = res?.data?.data || [];
            const count = res?.data?.pagination?.total ?? items.length;

            setTotalCount(count);
            setDatas(items);
        } catch (error) {
            showError("Failed to fetch drivers");
        } finally {
            setLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    };

    const onRefresh = () => {
        setOnRefreshing(true);
        setCurrentPageLimit(10);
        handleCarDriver(search, 10, 1);
    };

    const handleSearch = (text: string) => {
        setSearch(text);

        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            handleCarDriver(text.trim(), currentPageLimit, 1);
        }, 400);
    };

    const handleClearSearch = () => {
        setSearch("");
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        handleCarDriver("", currentPageLimit, 1);
    };

    const goToDetailsScreen = (item: any) => {
        navigation.navigate("CarDriverDetails", { carDriver: item });
    };

    const loadMore = () => {
        if (!loader && !footerLoader && totalCount !== null && datas.length < totalCount) {
            setFooterLoader(true);
            const newLimit = currentPageLimit + 10;
            setCurrentPageLimit(newLimit);
            handleCarDriver(search, newLimit, 1);
        }
    };

    const renderLoader = () => {
        if (!footerLoader) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.footerLoaderText}>Loading more drivers...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loader) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="car-sport-outline" size={54} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>No Drivers Found</Text>
                <Text style={styles.emptySubtitle}>
                    {search
                        ? `No drivers match "${search}". Try searching with another keyword.`
                        : "There are currently no registered drivers in the system."}
                </Text>
            </View>
        );
    };

    const renderList = ({ item }: { item: any }) => {
        const initials = (item?.name || "D")
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

        return (
            <TouchableOpacity
                onPress={() => goToDetailsScreen(item)}
                activeOpacity={0.75}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.avatarWrapper}>
                        <Text style={styles.avatarText}>{initials}</Text>
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.nameText} numberOfLines={1}>
                            {item?.name || "Unnamed Driver"}
                        </Text>
                        <View style={styles.idBadge}>
                            <Text style={styles.idBadgeText}>ID: #{item?.id ?? "-"}</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </View>

                <View style={styles.divider} />

                <View style={styles.cardBody}>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={15} color={COLORS.primary} style={styles.infoIcon} />
                        <Text style={styles.infoText}>{item?.mobileno || "No phone provided"}</Text>
                    </View>
                    <View style={[styles.infoRow, { marginTop: 6 }]}>
                        <Ionicons name="mail-outline" size={15} color="#64748B" style={styles.infoIcon} />
                        <Text style={styles.infoText} numberOfLines={1}>
                            {item?.email || "No email provided"}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    useEffect(() => {
        handleCarDriver("", 10, 1);
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <Header value={value} subtitle="Manage Fleet Drivers" />

            <View style={styles.content}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Ionicons name="search-outline" size={20} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by name, email or phone"
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

                {/* Counter Bar */}
                <View style={styles.countRow}>
                    <Text style={styles.countLabel}>Total Registered Drivers</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countBadgeText}>{totalCount ?? datas.length}</Text>
                    </View>
                </View>

                {/* Main List */}
                {loader && datas.length === 0 ? (
                    <View style={styles.centerLoader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.centerLoaderText}>Fetching fleet drivers...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={datas}
                        renderItem={renderList}
                        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
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

export default TotalCarDriverList;

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
        backgroundColor: "#DBEAFE",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    countBadgeText: {
        fontSize: 12,
        fontWeight: "700",
        color: "#1E40AF",
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
        backgroundColor: "#DBEAFE",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    avatarText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1D4ED8",
    },
    headerInfo: {
        flex: 1,
    },
    nameText: {
        fontSize: 15,
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: 3,
    },
    idBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#F1F5F9",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    idBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#64748B",
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.borderLight,
        marginVertical: 12,
    },
    cardBody: {},
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    infoIcon: {
        marginRight: 8,
        width: 16,
    },
    infoText: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontWeight: "500",
        flex: 1,
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