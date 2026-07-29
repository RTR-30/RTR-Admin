import React from "react";
import {
    View,
    Text,
    TouchableOpacity
} from "react-native";
import Header from "../../../Common/PageHeader";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";

const Feedback = () => {
    const value = "FeedBack";
    const navigation: any = useNavigation();

    const goToCreateFeedback = () => {
        navigation.navigate("CreateFeedback")
    }

    const goToFeedbackList = () => {
        navigation.navigate("FeedbackList")
    }

    return(
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', height: 100 }}>
                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToCreateFeedback} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Ionicons name="add" color={'black'} size={30} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Create Feedback</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ backgroundColor: '#fff', width: '45%', borderRadius: '10%', shadowColor: 'black', elevation: 3, borderWidth: 0.5, borderColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                        <TouchableOpacity onPress={goToFeedbackList} style={{ justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                            <Ionicons name="chatbox-ellipses" color={'black'} size={30} />
                            <Text style={{ textAlign: 'center', color: 'black', fontSize: 14, fontWeight: 'bold' }}>Feedback List</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default Feedback;