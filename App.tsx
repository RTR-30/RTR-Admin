import React from "react";
import NavigationPage from "./src/Auth";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { COLORS } from "./src/utils/ColorCode";

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />
      <NavigationPage />
    </SafeAreaProvider>
  );
};

export default App;
