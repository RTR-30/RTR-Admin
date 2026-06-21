import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid,
    StyleSheet,
    RefreshControl,
    FlatList,
    TextInput
} from "react-native";
import Header from "../../../Common/PageHeader";
import { totalbookinglist } from "./helperapi";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TotalBookingList = () => {
    const value = "Booking List";
    const [loader, setLoader] = useState<boolean>(false);
    const [tokens, setTokens] = useState(null);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);
    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [datas, setDatas] = useState<any>([]);
    const [totalCount, setTotalCount] = useState<any>(null);
    const [search, setSearch] = useState<any>(null);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);


    const handleBookingList = async (value?: any, limit?: any, page?: any, tokens?: any) => {
        if (footerLoader) {
            setLoader(false);
        } else {
            setLoader(true);
        }

        try {
            const res = await totalbookinglist(value, limit, page, tokens);
            console.log(res);
            
            setTotalCount(res?.data?.pagination?.total);
            setDatas(res?.data?.data || []);
        } catch (error) {
            console.log(error);
            
            ToastAndroid.show("error booking list", ToastAndroid.SHORT);
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
        handleBookingList("", currentPageLimit, 1, tokens).then(() => {
        }).catch(() => {
            ToastAndroid.show("Check Internet Connection", ToastAndroid.SHORT);
        }).finally(() => {
            setLoader(false);
            setOnRefreshing(false);
            setFooterLoader(false);
        })

    }

    const handleSearch = (text: string) => {
        setSearch(text);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            handleBookingList(text.trim(), currentPageLimit, 1, tokens);
        }, 2000);

        setSearchTimeout(timeout);
    };

    const renderList = async ({ item, index }: any) => {
        const formattedStartDate = await moment(item.StartDate).format("DD MMM YYYY, hh:mm A");
        const formattedEndDate = await moment(item.EndDate).format("DD MMM YYYY, hh:mm A");

        return (
            <View style={styles.itemContainer}>
                <Text style={styles.nameText}>{item?.Name}</Text>
                <Text style={styles.detailText}>Address: {item?.Address}</Text>
                <Text style={styles.detailText}>Phone: {item?.MobileNo}</Text>
                <Text style={styles.detailText}>Start Date: {formattedStartDate}</Text>
                <Text style={styles.detailText}>End Date: {formattedEndDate}</Text>
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

    const userStoredData = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            const storeData = JSON.parse(getDatas);
            
            const token = storeData?.token
            if (token) {
                setTokens(token);
                handleBookingList("", currentPageLimit, 1, token);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    }

    useEffect(() => {
        userStoredData();

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

                    <View style={{ width: '100%', padding: 1 }}>
                        <Text style={{ color: 'black', fontWeight: 'bold', textAlign: 'right' }}>Total Count: {totalCount}</Text>
                    </View>

                    <FlatList
                        data={datas}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderList}
                        removeClippedSubviews={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No Bookings found.</Text>
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

export default TotalBookingList;

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: '#f2f2f2',
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
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