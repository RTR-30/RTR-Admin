import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
    View,
    TouchableOpacity,
    Text,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { COLORS } from "../../utils/ColorCode";

const Header = ({ value }: any) => {
    const navigation: any = useNavigation();

    const back = async () => {
        // navigation.navigate("Home");
        await navigation.goBack();
    }
    return (
        <View style={{
            height: 60,
            backgroundColor: COLORS.primary,
            justifyContent: 'center',
        }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: '15%', justifyContent: 'center', alignItems: 'center' }}>
                    {value === "Home" ? null : (
                        <TouchableOpacity onPress={back}>
                            <Ionicons name="arrow-back" color={"white"} size={24} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ width: '70%', justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', color:'white' }}>{value}</Text>
                </View>

                <View style={{width: '15%'}}>

                </View>
            </View>
        </View>
    )
}

export default Header;