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
import AppSettings from "../Components/PrivateComponent/AppSettings";
import PackageManagement from "../Components/PrivateComponent/PackageManagement";
import PackageList from "../Components/PrivateComponent/PackageManagement/PackageList";
import CreatePackage from "../Components/PrivateComponent/PackageManagement/CreatePackage";
import GearType from "../Components/PrivateComponent/GearType";
import CreateGearType from "../Components/PrivateComponent/GearType/CreateGearType";
import GearTypeList from "../Components/PrivateComponent/GearType/GearTypeList";
import Feedback from "../Components/PrivateComponent/Feedbacks";
import CreateFeedback from "../Components/PrivateComponent/Feedbacks/CreateFeedback";
import FeedbackList from "../Components/PrivateComponent/Feedbacks/FeedbackList";
import Withdrawal from "../Components/PrivateComponent/Withdraws";
import AppVersionControl from "../Components/PrivateComponent/AppVersionControl";
import CarDriverDetails from "../Components/PrivateComponent/CarDriverList/CarDriverDetails";
import CarOwnerDetails from "../Components/PrivateComponent/CarOwnerList/CarOwnerDetails";

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
                <Stack.Screen name="AppSettings" component={AppSettings}/>
                <Stack.Screen name="PackageManagement" component={PackageManagement}/>
                <Stack.Screen name="CreatePackage" component={CreatePackage}/>
                <Stack.Screen name="PackageList" component={PackageList}/>
                <Stack.Screen name="GearType" component={GearType}/>
                <Stack.Screen name="CreateGearType" component={CreateGearType}/>
                <Stack.Screen name="GearTypeList" component={GearTypeList}/>
                <Stack.Screen name="Feedback" component={Feedback}/>
                <Stack.Screen name="CreateFeedback" component={CreateFeedback}/>
                <Stack.Screen name="FeedbackList" component={FeedbackList}/>
                <Stack.Screen name="Withdrawal" component={Withdrawal}/>
                <Stack.Screen name="AppVersionControl" component={AppVersionControl}/>
                <Stack.Screen name="CarOwnerDetails" component={CarOwnerDetails}/>
                <Stack.Screen name="CarDriverDetails" component={CarDriverDetails}/>
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default NavigationPage;