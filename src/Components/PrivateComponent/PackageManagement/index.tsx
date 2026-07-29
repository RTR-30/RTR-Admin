import React from "react";
import {
    View,
    TouchableOpacity,
    Text
} from "react-native";
import Header from "../../../Common/PageHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const PackageManagement = () => {
    const value = "Package Management";
    const navigation: any = useNavigation();

    const goToCreatePackage = () => {
        navigation.navigate("CreatePackage")
    }

    const goToPackageList = () => {
        navigation.navigate("PackageList")
    }

    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height:100 }}>
                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToCreatePackage} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Ionicons name="add" color={'black'} size={30} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Create Package</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToPackageList} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Ionicons name="cash" color={'black'} size={30} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Package List</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default PackageManagement;