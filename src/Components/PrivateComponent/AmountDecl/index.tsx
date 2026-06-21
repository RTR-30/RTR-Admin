import React from "react";
import {
    TouchableOpacity,
    Text,
    View
} from "react-native";
import Header from "../../../Common/PageHeader";
import Ionicons from "react-native-vector-icons/Ionicons"
import FontAwesome from "react-native-vector-icons/FontAwesome"
import { useNavigation } from "@react-navigation/native";

const AmountDeclearation = () => {
    const value = "Amount Declearation";
    const navigation: any = useNavigation();

    const gotoTripType = () => {
        navigation.navigate("TripType")    
    }

    const gotoPaymentMode = () => {
        navigation.navigate("PaymentMode")
    }
    return(
        <View style={{flex:1}}>
             <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width:'100%' }}>
                <View style={{width:'100%', height:100, flexDirection:'row', justifyContent:'space-around'}}>
                    <View style={{backgroundColor:'#fff', width:'45%', borderRadius:'10%', shadowColor:'black', elevation:3, borderWidth:0.5, borderColor:'black', justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity onPress={gotoTripType} style={{justifyContent:'center', alignItems:'center', height:'100%', width:'100%'}}>
                            <Ionicons name="list" color={'black'} size={30}/>
                            <Text style={{textAlign:'center', color:'black', fontSize:14, fontWeight:'bold'}}>Create Trip Type</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{backgroundColor:'#fff', width:'45%', borderRadius:'10%', shadowColor:'black', elevation:3, borderWidth:0.5, borderColor:'black', justifyContent:'center', alignItems:'center'}}>
                        <TouchableOpacity onPress={gotoPaymentMode} style={{justifyContent:'center', alignItems:'center', height:'100%', width:'100%'}}>
                            <FontAwesome name="rupee" color={'black'} size={30}/>
                            <Text style={{textAlign:'center', color:'black', fontSize:14, fontWeight:'bold'}}>Payment Mode</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default AmountDeclearation;