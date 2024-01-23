import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/Home";
import CanvasScreen from "@/screens/Canvas";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerTitle: "DigiCanvas",
              headerTitleStyle: {
                color: "black",
                fontSize: 20,
                fontWeight: "bold",
              },
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen
            name="Canvas"
            component={CanvasScreen}
            options={{
              animation: "slide_from_bottom",
              animationDuration: 500,
              headerShadowVisible: false,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
