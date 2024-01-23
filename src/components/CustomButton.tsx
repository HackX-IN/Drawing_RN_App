import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CustomButtonProps } from "../types";

const CustomButton: React.FC<CustomButtonProps> = ({
  onPress,
  backgroundColor,
  iconName,
  label,
  containerStyle,
  labelStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        buttonStyles.buttonContainer,
        { ...containerStyle, backgroundColor },
      ]}
    >
      {iconName && <Ionicons name={iconName} size={30} color="white" />}
      <Text style={[buttonStyles.buttonText, { ...labelStyle }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
export const buttonStyles = StyleSheet.create({
  buttonContainer: {
    padding: 7,
    borderRadius: 5,
    margin: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});
