import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    FlatList,
    TextInput
} from "react-native";
import Header from "../../../Common/PageHeader";
import { submitApprovalService, totalapprovalList } from "./helperapi";
import { showError, showSuccess } from "../../../Common/ToastMessage";

const TotalApprovalList = () => {
    const value = "Approval List";
    const [loader, setLoader] = useState<boolean>(false);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);
    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [datas, setDatas] = useState<any>([]);
    const [totalCount, setTotalCount] = useState<any>(null);
    const [search, setSearch] = useState<any>(null);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);


    const handleApprovalList = async (value?: any, limit?: any, page?: any) => {
        if (footerLoader) {
            setLoader(false);
        } else {
            setLoader(true);
        }

        try {
            const res = await totalapprovalList(value, limit, page);
            
            setTotalCount(res?.data?.pagination?.total);
            setDatas(res?.data?.data || []);
        } catch (error) {
            showError("error approval list");
        } finally {
            setLoader(false)
            setOnRefreshing(false);
            setFooterLoader(false);
        }
    }

    const onRefresh = () => {
        setOnRefreshing(true);
        setLoader(false);
        setFooterLoader(false);
        setTotalCount(null);
        setCurrentPageLimit(1);
        setDatas([]);
        handleApprovalList("", currentPageLimit, 1).then(() => {
        }).catch(() => {
            showError("Check Internet Connection");
        }).finally(() => {
            setLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        })

    }

    const handleSearch = (text: string) => {
        setSearch(text);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            handleApprovalList(text.trim(), currentPageLimit, 1);
        }, 2000); // 2 seconds debounce

        setSearchTimeout(timeout);
    };

    const handleSubmit = async (userid: any) => {
        setLoader(true);
        try {
            const res = await submitApprovalService(userid)
            const { data: { success = false, message = '' } } = res;
            if(success){
                handleApprovalList("", currentPageLimit, 1);
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoader(false);
        }
    }

    const renderList = ({ item, index }: any) => {
        
        return (
            <View style={styles.itemContainer}>
                <View style={{ width: '80%', height: '100%' }}>
                    <Text style={styles.nameText}>{item?.fullname}</Text>
                    <Text style={styles.detailText}>DOB: {item?.dob}</Text>
                    <Text style={styles.detailText}>Aadhaar: {item?.aadhaar}</Text>
                    <Text style={styles.detailText}>Driving license: {item?.licensenumber}</Text>
                    <Text style={styles.detailText}>Phone: {item?.partnerMobileNo}</Text>
                </View>

                <View style={{ width: '20%', height: '100%', justifyContent:'center', alignItems:'center' }}>
                    <TouchableOpacity style={{backgroundColor: "green", padding:9, borderRadius:10}} onPress={()=>handleSubmit(item?.partneruserid)}>
                        <Text style={{ textAlign: 'center', color: 'white', fontWeight: '700' }}>Approve</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const loadMore = () => {
        setCurrentPageLimit(currentPageLimit + 10);
        setFooterLoader(true);
    }

    const renderLoader = () => {
        return (
            totalCount !== datas.length && (
                <View style={{ alignItems: 'center', height: 30, marginTop: 16 }}>
                    {
                        footerLoader && <ActivityIndicator size={"large"} color={"#5a639c"} />
                    }
                </View>
            )
        )
    }

    useEffect(() => {
        handleApprovalList("", currentPageLimit, 1);
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10 }}>
                {loader && (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
                <>
                    <View>
                        <TextInput
                            placeholder="Search by name, email or phone"
                            value={search}
                            onChangeText={handleSearch}
                            style={{
                                backgroundColor: '#fff',
                                borderWidth: 1,
                                borderColor: '#ccc',
                                borderRadius: 8,
                                padding: 10,
                                marginBottom: 10,
                                fontSize: 16,
                                color: '#000',
                            }}
                            placeholderTextColor="#555"
                        />
                    </View>
                    
                    <View style={{width:'100%', padding:1}}>
                        <Text style={{ color:'black', fontWeight:'bold', textAlign:'right'}}>Total Count: {totalCount}</Text>
                    </View>

                    <FlatList
                        data={datas}
                        renderItem={renderList}
                        keyExtractor={(item, index) => index.toString()}
                        removeClippedSubviews={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No approval found.</Text>
                        }
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={onRefreshing} onRefresh={onRefresh} tintColor={"#6200EE"} />}
                        contentContainerStyle={{
                            // paddingVertical: 16,
                            gap: 10,
                        }}
                        ListFooterComponent={renderLoader}
                        onEndReached={loadMore}
                        onEndReachedThreshold={0}
                    />
                </>
            </View>
        </View>
    )
};

export default TotalApprovalList;

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#f2f2f2',
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        flexDirection: 'row',
        width: '100%',
        borderWidth: 0.5
    },
    nameText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    detailText: {
        fontSize: 14,
        color: '#555',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
});