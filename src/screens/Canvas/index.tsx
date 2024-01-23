import { View } from "react-native";
import React from "react";
import Canvas from "@/src/components/Canvas";

const CanvasScreen = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const params = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Canvas data={params} navigation={navigation} />
    </View>
  );
};

export default CanvasScreen;
