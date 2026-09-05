import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from "react-native";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { ApproveService, RejectService, WithdrawalRequestListService } from "./helper";

const Withdrawal = () => {
    const value = "Withdrawal";
    const navigation: any = useNavigation();

    const [withdrawalList, setWithdrawalList] = useState<any[]>([]);

    const [loading, setLoading] = useState(false);
    const [footerLoading, setFooterLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalPages, setTotalPages] = useState(1);

    const fetchWithdrawalList = async ( pageNumber = 1, isLoadMore = false ) => {
        if (isLoadMore) {
            setFooterLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const res = await WithdrawalRequestListService(pageNumber, limit);
            const { data: { data = [], message = "", success = false, pagination }, } = res;
            
            if (success) {
                if (isLoadMore) {
                    setWithdrawalList((prev) => [ ...prev, ...data ]);
                } else {
                    setWithdrawalList(data);
                }

                setPage(pagination?.page || pageNumber);
                setTotalPages(pagination?.totalPages || 1);
            } else {
                showError(message);
            }
        } catch (error: any) {
            showError(error);
        } finally {
            setLoading(false);
            setFooterLoading(false);
        }
    };

    const handleApprove = async (id: any) => {
        setLoading(true)
        const payload = {
            requestId: id
        }
        try{    
            const res = await ApproveService(payload);
            const { data: { message = "", success = false } } = res;
            if(success){
                showSuccess(message)
                fetchWithdrawalList(1, false);
            } else {
                showError(message)
            }
        } catch(error){
            showError(error)
        } finally{
            setLoading(false)
        }
    }

    const handleReject = async (id: any) => {
        setLoading(true)
        const payload = {
            requestId: id
        }
        try{    
            const res = await RejectService(payload)
            const { data: { message = "", success = false } } = res;
            if(success){
                showSuccess(message)
                fetchWithdrawalList(1, false);
            } else {
                showError(message)
            }
        } catch(error){
            showError(error)
        } finally{
            setLoading(false)
        }
    }

    // -----------------------------------
    // Load More
    // -----------------------------------
    const handleLoadMore = () => {
        if (
            !loading &&
            !footerLoading &&
            page < totalPages
        ) {
            const nextPage = page + 1;

            fetchWithdrawalList(nextPage, true);
        }
    };

    // -----------------------------------
    // Pull to Refresh
    // -----------------------------------
    const handleRefresh = async () => {
        setRefreshing(true);

        setPage(1);

        await fetchWithdrawalList(1, false);

        setRefreshing(false);
    };

    // -----------------------------------
    // Date Format
    // -----------------------------------
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

    // -----------------------------------
    // Status Style
    // -----------------------------------
    const getStatusStyle = (status: string) => {
        switch (status) {
            case "APPROVED":
                return {
                    backgroundColor: "#E8F5E9",
                    color: "#2E7D32",
                };

            case "REJECTED":
                return {
                    backgroundColor: "#FFEBEE",
                    color: "#C62828",
                };

            case "CANCELLED":
                return {
                    backgroundColor: "#FFF3E0",
                    color: "#EF6C00",
                };

            default:
                return {
                    backgroundColor: "#FFF8E1",
                    color: "#F9A825",
                };
        }
    };

    const renderWithdrawal = ({ item }: any) => {
        const statusStyle = getStatusStyle(item?.status);

        return (
            <View style={{ backgroundColor: "#FFFFFF", borderRadius: 12, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: "#E5E5E5", elevation: 2 }} >
                {/* Header */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center"}} >
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#222" }} >₹{Number(item?.amount || 0 ).toLocaleString("en-IN")}</Text>

                    <View style={{ backgroundColor: statusStyle.backgroundColor, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }} >
                        <Text style={{ fontSize: 12, fontWeight: "700", color: statusStyle.color }} >{item?.status}</Text>
                    </View>
                </View>                

                {/* Partner Details */}
                <View style={{ marginTop: 12, flexDirection:'row' }}>
                    <View style={{width: '70%', justifyContent:'center'}}>
                        <Text style={{ fontSize: 14, fontWeight: "700", color: "#333", marginBottom: 8 }}>Partner Details</Text>
                        <Text style={{ fontSize: 14, color: "#555" }} >Name: {item?.partnerName || "-"}</Text>
                        <Text style={{ fontSize: 14, color: "#555" }}>Mobile: {item?.partnerMobileNo || "-"}</Text>
                        <Text style={{ fontSize: 14, color: "#555" }} >Account Name: {item?.bank_details?.account_name || "-"}</Text>
                        <Text style={{ fontSize: 14, color: "#555" }} >Account Number: {item?.bank_details?.account_number || "-"}</Text>
                        <Text style={{ fontSize: 14, color: "#555" }} >IFSC: {item?.bank_details?.ifsc || "-"}</Text>
                    </View>

                    <View style={{width: '30%', justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity onPress={() => handleApprove(item.id)} style={{padding:10, backgroundColor: '#76C457', borderRadius:10, marginTop:10}}>
                            <Text style={{ fontSize: 14, color: "#fff", fontWeight:'bold' }}>Approve</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleReject(item.id)} style={{padding:10, backgroundColor: '#BE1A1A', borderRadius:10, marginTop:10}}>
                            <Text style={{ fontSize: 14, color: "#fff", fontWeight:'bold' }}>Reject</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Date */}
                <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#EEEEEE" }} >
                    <Text style={{ fontSize: 12, color: "#777" }} >Requested On</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#333", marginTop: 3 }} > {formatDate(item?.created_at)}{" "} {formatTime(item?.created_at)}</Text>
                </View>
            </View>
        );
    };

    const renderFooter = () => {
        if (!footerLoading) return null;

        return (
            <View style={{ paddingVertical: 15, alignItems: "center" }} >
                <ActivityIndicator size="small" />
                <Text style={{ marginTop: 5, color: "#777", }} >Loading more...</Text>
            </View>
        );
    };

    const renderEmpty = () => {
        if (loading) return null;

        return (
            <View style={{ alignItems: "center", paddingTop: 100 }}>
                <Text style={{ fontSize: 16, color: "#777" }}>No withdrawal requests found</Text>
            </View>
        );
    };

    useEffect(() => {
        fetchWithdrawalList(1, false);
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: "#F7F7F7", }} >
            {/* Header */}
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            {/* Content */}
            <View style={{ flex: 9, padding: 10, width: "100%" }} >
                {loading ? (
                    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : (
                    <FlatList
                        data={withdrawalList}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderWithdrawal}
                        removeClippedSubviews={false}
                        showsVerticalScrollIndicator={false}
                        // Pagination
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        // Footer
                        ListFooterComponent={
                            renderFooter()
                        }
                        // Empty
                        ListEmptyComponent={
                            renderEmpty()
                        }
                        // Pull to refresh
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                        }
                        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
                    />
                )}
            </View>
        </View>
    );
};

export default Withdrawal;