import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../Components/PublicComponent/Login";
import Dashboard from "../Components/PrivateComponent/Dashboard/index";
import TotalCarOwnerList from "../Components/PrivateComponent/CarOwnerList/index";
import TotalCarDriverList from "../Components/PrivateComponent/CarDriverList/index";
import TotalBookingList from "../Components/PrivateComponent/BookingList/index";
import TotalApprovalList from "../Components/PrivateComponent/ApprovalList/index";
import AmountDeclearation from "../Components/PrivateComponent/AmountDecl/index";
import TripType from "../Components/PrivateComponent/AmountDecl/TripType";
import PaymentMode from "../Components/PrivateComponent/AmountDecl/PaymentMode";
import CreatePayment from "../Components/PrivateComponent/AmountDecl/CreatePayment";
import UpdatePayment from "../Components/PrivateComponent/AmountDecl/UpdatePayment";
import UpdatePaymentList from "../Components/PrivateComponent/AmountDecl/UpdatePaymentList";
import ReferralAmount from "../Components/PrivateComponent/ReferralAmount";
const Stack = createNativeStackNavigator();

const NavigationPage = () => {
    return(
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login" screenOptions={{
                headerShown: false
            }}>
                <Stack.Screen name="Login" component={Login}/>
                <Stack.Screen name="Home" component={Dashboard}/>
                <Stack.Screen name="CarOwner" component={TotalCarOwnerList}/>
                <Stack.Screen name="CarDriver" component={TotalCarDriverList}/>
                <Stack.Screen name="BookingList" component={TotalBookingList}/>
                <Stack.Screen name="ApprovalList" component={TotalApprovalList}/>
                <Stack.Screen name="AmountDeclearation" component={AmountDeclearation}/>
                <Stack.Screen name="TripType" component={TripType}/>
                <Stack.Screen name="PaymentMode" component={PaymentMode}/>
                <Stack.Screen name="CreatePayment" component={CreatePayment}/>
                <Stack.Screen name="UpdatePayment" component={UpdatePayment}/>
                <Stack.Screen name="UpdatePaymentList" component={UpdatePaymentList}/>
                <Stack.Screen name="ReferralAmount" component={ReferralAmount}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default NavigationPage;