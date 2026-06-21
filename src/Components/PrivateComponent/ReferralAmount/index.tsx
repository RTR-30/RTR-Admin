import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ToastAndroid,
    TextInput,
    TouchableOpacity
} from "react-native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { referralAmountService, updateReferralAmountService } from "./helper";
import Header from "../../../Common/PageHeader";
import { COLORS } from "../../../utils/ColorCode";


const ReferralAmount = () => {
    const value = "Referral Amount"
    const [loading, setLoading] = useState<boolean>(false);
    const [tokens, setTokens] = useState<any>(null);
    const [referral, setRefferal] = useState<any>({});

    const [referralCost, setReferralCost] = useState<any>({
        referalAmount: ''
    })

    const updateReferralAmount = async () => {
        setLoading(true);
        
        const payload = {
            amount: Number(referralCost.referalAmount)
        }

        try {
            const res = await updateReferralAmountService(payload, tokens)
            const { data: { data = {}, message = '', success } } = res;
            if (success === true) {
                fetchReferralAmount(tokens)
                showSuccess(message)
            } else {
                showError(message)
            }
        } catch(error){
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchReferralAmount = async (token: any) => {
        setLoading(true);

        try {
            const res = await referralAmountService(token);
            const { data: { data = {}, message = '', success } } = res;
            if (success === true) {
                setRefferal(data)
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserData = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            const storeData = JSON.parse(getDatas);

            const token = storeData?.token
            if (token) {
                setTokens(token);
                fetchReferralAmount(token)
            }
        } catch (error) {
            showError(error);
        }
    }

    useEffect(() => {
        fetchUserData()
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <Text style={{ color: "#000", fontWeight: 'bold', fontSize: 16 }}>Current Referral Amount: <Text style={{ color: COLORS.primary }}>{referral.reward_amount}</Text></Text>

                <View style={{ marginTop: 20 }}>
                    <Text style={{ color: "#000", fontWeight: 'bold', fontSize: 13 }}>Enter Update Referral Amount</Text>
                    <TextInput
                        value={String(referralCost.referalAmount)}
                        onChangeText={(text) =>
                            setReferralCost({
                                ...referralCost,
                                referalAmount: text,
                            })
                        }
                        placeholder="enter amount"
                        keyboardType="numeric"
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            borderRadius: 8,
                            paddingHorizontal: 10,
                            marginTop: 10,
                            color: "#000",
                        }}
                    />

                    <View style={{marginTop:40, justifyContent:'center', alignItems:'center'}}>
                        <View style={{backgroundColor: COLORS.primary, padding:10, width:'60%', borderRadius:10, height:40, justifyContent:'center', alignItems:'center'}}>
                            <TouchableOpacity onPress={updateReferralAmount} style={{width: '100%', height:'100%', justifyContent:'center', alignItems:'center'}}>
                                <Text style={{color:'#fff', fontWeight:'bold'}}>Update Amount</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default ReferralAmount;