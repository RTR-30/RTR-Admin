import React from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";
import Header from "../../../Common/PageHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import Foundation from "react-native-vector-icons/Foundation"
import { useNavigation } from "@react-navigation/native";

const PaymentMode = () => {
    const value = "Payment Mode"
    const navigation: any = useNavigation();
    
    const goToCreatePayment = () => {
        navigation.navigate("CreatePayment")
    }

    const goToUpdatePayment = () => {
        navigation.navigate("UpdatePayment")
    }

    return (
        <View style={{ flex: 1 }}>
            <Header value={value} />

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <View style={{ width: '100%', height: 100, flexDirection: 'row', justifyContent: 'space-around' }}>
                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToCreatePayment} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Foundation name="burst-new" color={'black'} size={40} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Create Payment</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToUpdatePayment} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Foundation name="upload" color={'black'} size={40} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Update Payment</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default PaymentMode;