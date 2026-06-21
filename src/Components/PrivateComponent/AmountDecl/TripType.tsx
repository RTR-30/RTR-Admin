import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ToastAndroid,
    ActivityIndicator
} from "react-native";
import Header from "../../../Common/PageHeader";
import { createTripTypeService } from "./helperapi";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";

const TripType = () => {

    const value = "Trip Type";
    const navigation: any = useNavigation();
    const [tokens, setTokens] = useState(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [tripTypes, setTripTypes] = useState({
        tripType: "",
        description: [{ keyName: "des", value: "" }]
    });

    const addDescription = () => {
        setTripTypes({
            ...tripTypes,
            description: [...tripTypes.description, { keyName: "des", value: "" }]
        });
    };

    const removeDescription = (index: any) => {
        const updated = tripTypes.description.filter((_, i) => i !== index);
        setTripTypes({ ...tripTypes, description: updated });
    };

    const updateDescription = (text: any, index: any) => {
        const updated = [...tripTypes.description];
        updated[index].value = text;
        setTripTypes({ ...tripTypes, description: updated });
    };

    const handleSubmit = async (datas: any) => {
        setLoading(true);
        const token = tokens;
        const payload = {
            tripType: datas.tripType,
            description: JSON.stringify(datas.description)
        }

        try {
            const res = await createTripTypeService(payload, token)
            
            if(res?.data?.success === true){
                navigation.goBack();
                ToastAndroid.show(res?.data?.message, ToastAndroid.SHORT);
            } else {
                ToastAndroid.show(res?.data?.message, ToastAndroid.SHORT);
            }
        } catch (error: any) {
            ToastAndroid.show(error, ToastAndroid.SHORT)
        } finally {
            setLoading(false);
        }

    };


    const userStoredData = async () => {
        try {
            const getDatas: any = await AsyncStorage.getItem("storeData");
            const storeData = JSON.parse(getDatas);
            
            const token = storeData?.token
            if (token) {
                setTokens(token);
            }
        } catch (error) {
            console.error("Error fetching user data from AsyncStorage:", error);
        }
    }

    useEffect(() => {
        userStoredData();
    }, [])

    return (
        <View style={{ flex: 1 }}>
            <Header value={value} />
            {loading && (
                <ActivityIndicator size="large" color="#0000ff" />
            )}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >

                {/* Trip Type */}
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                        Enter Trip Type
                    </Text>

                    <TextInput
                        placeholder="Enter Trip Type"
                        value={tripTypes.tripType}
                        onChangeText={(text) =>
                            setTripTypes({ ...tripTypes, tripType: text })
                        }
                        style={{
                            borderWidth: 1,
                            borderColor: "#000",
                            padding: 10,
                            borderRadius: 5,
                            color: 'black',
                            marginTop: 5
                        }}
                    />
                </View>

                {/* Description */}
                <View style={{ marginVertical: 10 }}>
                    <Text style={{ color: 'black', fontWeight: 'bold', fontSize: 16 }}>
                        Enter Description
                    </Text>

                    {tripTypes.description.map((item, index) => (
                        <View key={index} style={{ marginTop: 10 }}>

                            <TextInput
                                placeholder="Enter Description"
                                value={item.value}
                                onChangeText={(text) => updateDescription(text, index)}
                                multiline
                                style={{
                                    borderWidth: 1,
                                    borderColor: "#000",
                                    padding: 10,
                                    borderRadius: 5,
                                    height: 100,
                                    color: 'black',
                                    textAlignVertical: "top"
                                }}
                            />

                            {tripTypes.description.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => removeDescription(index)}
                                    style={{
                                        backgroundColor: 'red',
                                        padding: 8,
                                        borderRadius: 10,
                                        marginTop: 5,
                                        width: 80,
                                        alignSelf: 'flex-end'
                                    }}
                                >
                                    <Text style={{ color: 'white', textAlign: 'center' }}>
                                        Remove
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity
                        onPress={addDescription}
                        style={{
                            backgroundColor: COLORS.primary,
                            padding: 12,
                            borderRadius: 10,
                            marginTop: 10,
                            width: 150,
                            alignSelf: 'center'
                        }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center', fontWeight:'bold' }}>
                            Add New Line
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={{
                        backgroundColor: COLORS.primary,
                        height: 50,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 20,
                        marginTop: 30
                    }}
                    onPress={() => handleSubmit(tripTypes)}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                        Submit
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

export default TripType;
