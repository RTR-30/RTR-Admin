import React from "react";
import NavigationPage from "./src/Auth";
import { StatusBar } from "react-native";
import { COLORS } from "./src/utils/ColorCode";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

const App = () => {

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'green',
          backgroundColor: '#E8F5E9',
        }}
        text1Style={{
          color: 'green',
          fontSize: 16,
          fontWeight: 'bold',
        }}
        text2Style={{
          color: '#333',
          fontSize: 14,
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: 'red',
          backgroundColor: '#FFEBEE',
        }}
        text1Style={{
          color: 'red',
          fontSize: 16,
          fontWeight: 'bold',
        }}
        text2Style={{
          color: '#333',
          fontSize: 14,
        }}
      />
    ),
  };


  return (
    <>
      <StatusBar backgroundColor={COLORS.primary} barStyle={"light-content"} />
      <NavigationPage />
      <Toast config={toastConfig} />
    </>
  )
};

export default App;