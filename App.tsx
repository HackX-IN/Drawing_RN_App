import "react-native-gesture-handler";
import Canvas from "@/components/Canvas";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Canvas />
      </View>
    </GestureHandlerRootView>
  );
}
