import React, { useEffect, useState } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    ScrollView,
    TextInput,
    Switch,
    ActivityIndicator
} from "react-native";
import Header from "../../../Common/PageHeader";
import { useNavigation } from "@react-navigation/native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CreateGearTypeService } from "./helper";
import { COLORS } from "../../../utils/ColorCode";

const CreateGearType = () => {
    const value = "Create Gear Type";
    const navigation: any = useNavigation();
    const [loading, setLoading] = useState(false);
    const [GearType, setGearType] = useState<any>({
        name: ''
    })

    const CreateGearTypes = async () => {
        if (GearType?.name === "") {
            return showError('Enter GearType Name');
        }
        setLoading(true);
        const payload = {
            name: GearType?.name,
            is_active: true
        }

        try {
            const res = await CreateGearTypeService(payload);
            const { data: { message = '', success = false } } = res;
            if (success) {
                showSuccess(message)
                navigation.goBack();
            } else {
                showError(message)
            }
        } catch (error) {
            showError(error)
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                <Header value={value} />
            </View>

            <View style={{ flex: 9, padding: 10, width: '100%' }}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        padding: 10,
                        paddingBottom: 40,
                    }}
                >
                    {loading && (
                        <ActivityIndicator size="small" style={{ marginTop: 10 }} />
                    )}

                    <View style={{ width: '100%', padding: 5 }}>
                        <View style={{ marginTop: 2 }}>
                            <Text style={{ color: COLORS.primary, fontWeight: 'bold', fontSize: 12 }}>Gear Name</Text>
                            <TextInput
                                placeholder="Enter Gear Type Name"
                                placeholderTextColor="#999"
                                value={GearType.name}
                                onChangeText={(text) =>
                                    setGearType({ ...GearType, name: text })
                                }
                                style={{
                                    height: 50,
                                    borderWidth: 1,
                                    borderColor: "#E5E7EB",
                                    borderRadius: 12,
                                    backgroundColor: "#F9FAFB",
                                    paddingHorizontal: 15,
                                    fontSize: 16,
                                    marginBottom: 18,
                                    marginTop: 5,
                                }}
                            />
                        </View>

                        <View style={{ marginTop: '10%', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => CreateGearTypes()} style={{ width: '70%', justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary, padding: 10, borderRadius: 40 }}>
                                <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Create Package</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>

        </View>
    )
}

export default CreateGearType;