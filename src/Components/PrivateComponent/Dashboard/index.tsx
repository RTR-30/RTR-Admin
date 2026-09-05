import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import Header from "../../../Common/PageHeader";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";

const Dashboard = () => {
    const value = "Home";
    const navigation: any = useNavigation();

    const menuItems = [
        {
            title: "Total Car Owner",
            icon: "car",
            iconType: "ion",
            onPress: () => navigation.navigate("CarOwner"),
        },
        {
            title: "Total Car Driver",
            icon: "car-sport",
            iconType: "ion",
            onPress: () => navigation.navigate("CarDriver"),
        },
        {
            title: "Total Booking List",
            icon: "book",
            iconType: "ion",
            onPress: () => navigation.navigate("BookingList"),
        },
        {
            title: "Total Approval List",
            icon: "thumbs-up",
            iconType: "ion",
            onPress: () => navigation.navigate("ApprovalList"),
        },
        {
            title: "Amount Declaration",
            icon: "payments",
            iconType: "material",
            onPress: () => navigation.navigate("AmountDeclearation"),
        },
        {
            title: "App Settings",
            icon: "settings",
            iconType: "ion",
            onPress: () => navigation.navigate("AppSettings"),
        },
        {
            title: "Package Management",
            icon: "file-tray-full",
            iconType: "ion",
            onPress: () => navigation.navigate("PackageManagement"),
        },
        {
            title: "Gear Type",
            icon: "cog",
            iconType: "ion",
            onPress: () => navigation.navigate("GearType"),
        },
        {
            title: "Feedback",
            icon: "chatbox-ellipses",
            iconType: "ion",
            onPress: () => navigation.navigate("Feedback"),
        },
        {
            title: "Withdrawal",
            icon: "wallet-sharp",
            iconType: "ion",
            onPress: () => navigation.navigate("Withdrawal"),
        },
    ];

    const renderIcon = (item: any) => {
        if (item.iconType === "material") {
            return (
                <MaterialIcons name={item.icon} size={32} color="#000"/>
            );
        }

        return (
            <Ionicons name={item.icon} size={32} color="#000" />
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }} >
            <Header value={value} />

            <ScrollView
                contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }} >
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.onPress}
                            activeOpacity={0.7}
                            style={{
                                width: "48%",
                                height: 120,
                                backgroundColor: "#fff",
                                borderRadius: 12,
                                marginBottom: 15,
                                justifyContent: "center",
                                alignItems: "center",

                                // Android
                                elevation: 4,

                                // iOS
                                shadowColor: "#000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.15,
                                shadowRadius: 4,
                            }}
                        >
                            {renderIcon(item)}

                            <Text style={{ color: "#000", fontSize: 14, fontWeight: "800", textAlign: "center", marginTop: 10 }} >{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default Dashboard;