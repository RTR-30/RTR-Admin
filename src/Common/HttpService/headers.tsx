import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "../ToastMessage";

export const rtrToken = async () => {
    const getDatas: any = await AsyncStorage.getItem("storeData");
    const storeData = JSON.parse(getDatas);

    const tokens = storeData?.token
    
    if(tokens){
        return {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${tokens}`
        }
    }else{
        showError("Authorization Error");
    }
}