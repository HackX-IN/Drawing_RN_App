import { Platform } from "react-native";
import Toast from "react-native-toast-message";

const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
const fontStyle: any = {
  fontFamily,
  fontSize: 14,
  fontStyle: "italic",
  fontWeight: "bold",
};

//Generate random Numbers
const numberOfRandomNumbers = 5;
const minRange = 1;
const maxRange = 100;
const randomNumbers: any = [];

for (let i = 0; i < numberOfRandomNumbers; i++) {
  const randomNumber =
    Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
  randomNumbers.push(randomNumber);
}

//Showing Toast
const showToast = (type: string, text: string) => {
  Toast.show({
    type,
    position: "top",
    text1: text,
    visibilityTime: 3000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};

export { fontStyle, randomNumbers, numberOfRandomNumbers, showToast };
