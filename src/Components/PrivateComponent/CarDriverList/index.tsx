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
import { totalcardriverUser } from "./helperapi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TotalCarDriverList = () => {
    const value = "Car Driver";
    const [loader, setLoader] = useState<boolean>(false);
    const [tokens, setTokens] = useState(null);
    const [onRefreshing, setOnRefreshing] = useState<boolean>(false);
    const [footerLoader, setFooterLoader] = useState<boolean>(false);
    const [currentPageLimit, setCurrentPageLimit] = useState<any>(10);
    const [datas, setDatas] = useState<any>([]);
    const [totalCount, setTotalCount] = useState<any>(null);
    const [search, setSearch] = useState<any>(null);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);


    const handleCarDriver = async (value?: any, limit?: any, page?: any, tokens?: any) => {
        if (footerLoader) {
            setLoader(false);
        } else {
            setLoader(true);
        }

        try {
            const res = await totalcardriverUser(value, limit, page, tokens);
            setTotalCount(res?.data?.pagination?.total);
            setDatas(res?.data?.data || []);
        } catch (error) {
            ToastAndroid.show("error car driver", ToastAndroid.SHORT);
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
        handleCarDriver("", currentPageLimit, 1, tokens).then(() => {
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

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout
        const timeout = setTimeout(() => {
            handleCarDriver(text.trim(), currentPageLimit, 1, tokens);
        }, 2000); // 2 seconds debounce

        setSearchTimeout(timeout);
    };

    const renderList = ({ item, index }: any) => {
        return (
            <View style={styles.itemContainer}>
                <Text style={styles.nameText}>{item?.name}</Text>
                <Text style={styles.detailText}>Email: {item?.email}</Text>
                <Text style={styles.detailText}>Phone: {item?.mobileno}</Text>
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
                handleCarDriver("", currentPageLimit, 1, token);
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
                        renderItem={renderList}
                        keyExtractor={(item, index) => index.toString()}
                        removeClippedSubviews={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No car driver found.</Text>
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

export default TotalCarDriverList;

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