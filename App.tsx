import React from "react";
import NavigationPage from "./src/Auth";
import { StatusBar } from "react-native";
import { COLORS } from "./src/utils/ColorCode";


const App = () => {
  return (
    <>
      <StatusBar
        backgroundColor={COLORS.primary}
        barStyle="light-content"
      />

      <NavigationPage />
    </>
  );
};

export default App;
