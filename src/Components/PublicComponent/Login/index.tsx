import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { showError, showSuccess } from "../../../Common/ToastMessage";
import { loginService } from "./helper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../../utils/ColorCode";

const Login = () => {
  const navigation: any = useNavigation();
  const [loader, setLoader] = useState<boolean>(false);
  const [user, setUser] = useState({
    name: "",
    password: "",
  });

  const handleLogin = async () => {
    if (!user.name.trim() || !user.password.trim()) {
      showError("Email and password are required");
      return;
    }
    
    setLoader(true);
    const payload = {
      "email": user?.name,
      "password": user?.password
    }

    try {
      const res = await loginService(payload);
      const {status, message, token, admin} = res?.data;
      console.log(res?.data);
      
      if(status === 200){
        const storedData = {
          admin: admin,
          token: token
        }
        await AsyncStorage.setItem("storeData", JSON.stringify(storedData));

        navigation.navigate("Home");
        showSuccess(message)
        setUser(()=>({
          name: "",
          password: ""
        }))
      } else {
        showError(message)
      }
    } catch (error) {
      showError(error)
    } finally {
      setLoader(false)
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loader && (
        <View style={{position:'absolute', height:'100%', width:'100%', justifyContent:'center', alignItems:'center'}}>
          <ActivityIndicator size={"large"} color={"red"}/>
        </View>
      )}
      <View
        style={{
          width: "80%",
          borderWidth: 0.5,
          borderRadius: 10,
          padding: 15,
        }}
      >
        <Text
          style={{
            color: "black",
            fontSize: 30,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Login
        </Text>

        {/* Name / Email */}
        <Text style={{ color: "black", fontSize: 14, marginBottom: 5 }}>
          Email
        </Text>
        <TextInput
          value={user.name}
          onChangeText={(text) =>
            setUser({ ...user, name: text })
          }
          placeholder="Enter email"
          placeholderTextColor="#999"
          style={{
            borderWidth: 0.5,
            borderRadius: 5,
            padding: 10,
            marginBottom: 15,
            color: "black",
          }}
        />

        {/* Password */}
        <Text style={{ color: "black", fontSize: 14, marginBottom: 5 }}>
          Password
        </Text>
        <TextInput
          value={user.password}
          onChangeText={(text) =>
            setUser({ ...user, password: text })
          }
          placeholder="Enter password"
          placeholderTextColor="#999"
          secureTextEntry
          style={{
            borderWidth: 0.5,
            borderRadius: 5,
            padding: 10,
            marginBottom: 25,
            color: "black",
          }}
        />

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          style={{
            backgroundColor: COLORS.primary,
            padding: 12,
            borderRadius: 5,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight:'bold' }}>
            Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
