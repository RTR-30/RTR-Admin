import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ToastAndroid
} from "react-native";
import Header from "../../../Common/PageHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
    const value = "Home";
    const navigation: any = useNavigation();

    const goToCarOwner = () => {
        navigation.navigate("CarOwner")
    }

    const goToCarDriver = () => {
        navigation.navigate("CarDriver")
    }

    const goToBookingList = () => {
        navigation.navigate("BookingList")
    }

    const goToApprovalList = () => {
        navigation.navigate("ApprovalList")
    }

    const goToAmountDeclearation = () => {
        navigation.navigate("AmountDeclearation")
    }

    const goToAppSettings = () => {
        navigation.navigate("AppSettings")
    }

    const goToPackageManagement = () => {
        navigation.navigate("PackageManagement")
    }

    const goToFeedback = () => {
        navigation.navigate("Feedback")
    }

    const goToGearType = () => {
        navigation.navigate("GearType")
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                <View style={{ flexDirection: 'row', width: '100%', height: '10%', justifyContent: 'space-around', borderWidth: "0.5px" }}>
                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToCarOwner} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="car" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Total Car Owner</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToCarDriver} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="car-sport" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Total Car Driver</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', width: '100%', height: '10%', justifyContent: 'space-around', marginTop: '10%' }}>
                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToBookingList} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="book" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Total Booking List</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToApprovalList} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="thumbs-up" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Total Approval List</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', width: '100%', height: '10%', justifyContent: 'space-around', marginTop: '10%' }}>
                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToAmountDeclearation} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <MaterialIcons name="payments" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Amount Declearation</Text>
                        </TouchableOpacity>
                    </View>


                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToAppSettings} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="settings" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>App Settings</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', width: '100%', height: '10%', justifyContent: 'space-around', marginTop: '10%' }}>
                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToPackageManagement} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="file-tray-full" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Package Management</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToGearType} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="cog" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Gear Type</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={{ flexDirection: 'row', width: '100%', height: '10%', justifyContent: 'space-around', marginTop: '10%' }}>
                    <View style={{ width: '45%', backgroundColor: '#fff', shadowColor: '#000', borderRadius: 10, elevation: 4 }}>
                        <TouchableOpacity onPress={goToFeedback} style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="chatbox-ellipses" color={"black"} size={30} />
                            <Text style={{ color: '#000', fontSize: 14, fontWeight: '800', textAlign: 'center' }}>Feedback</Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        </View>
    )
}

export default Dashboard