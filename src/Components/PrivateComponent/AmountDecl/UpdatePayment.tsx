import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    FlatList
} from "react-native";
import Header from "../../../Common/PageHeader";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { getTripPaymentServices, getTripTypesServices, updateTripPaymentService } from "./helperapi";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UpdatePayment = () => {
    const value = "Update Payment";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState<boolean>(false);
    
    const [tripTypes, setTripTypes] = useState<any>(null);

    const handleTripTypes = async () => {
        setLoading(true);
        try {
            const res = await getTripTypesServices();
            const { success, message, data } = res?.data;
            
            if (success === true) {
                showSuccess(message);
                setTripTypes(data);
            } else {
                showError(message);
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    };

    const renderData = (item: any) => {
        return (
            <View style={{marginBottom:20, padding:10, borderWidth:1, borderRadius:10}}>
                <TouchableOpacity onPress={()=>navigation.navigate("UpdatePaymentList", {TripDetails:item})}>
                    <Text style={{color:'black', fontSize:14, fontWeight:'bold'}}>{item.trip_type}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    useEffect(() => {
        handleTripTypes()
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            {loading && (
                <View
                    style={{
                        position: "absolute",
                        height: "100%",
                        width: "100%",
                        justifyContent: "center",
                        alignItems: "center"
                    }}
                >
                    <ActivityIndicator size="large" style={{ marginTop: 10 }} />
                </View>
            )}

            <View style={{ flex: 9, padding: 10 }}>
                <FlatList
                    data={tripTypes}
                    keyExtractor={(item: any) => item.id.toString()}
                    removeClippedSubviews={false}
                    renderItem={({ item }: any) => renderData(item)}
                />
            </View>


        </View>
    );
};

export default UpdatePayment;
