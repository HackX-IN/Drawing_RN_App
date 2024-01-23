import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  View,
  Image,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";
import Toast from "react-native-toast-message";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [drawings, setDrawings] = useState([]); // using state to hold  drawings
  const isFocused = useIsFocused();

  // Set options for the navigation header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 30,
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={() => navigation.navigate("Canvas")}
        >
          <Ionicons name="add-circle" size={32} color={"black"} />
        </Pressable>
      ),
    });
  });

  // Function to fetch all drawings from AsyncStorage
  const fetchAllDrawings = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const drawingKeys = allKeys.filter((key) => key.startsWith("drawing"));

      const drawings = await AsyncStorage.multiGet(drawingKeys);
      const parsedDrawings = drawings.map(([key, value]) => ({
        name: key,
        data: JSON.parse(value),
      }));
      setDrawings(parsedDrawings);
    } catch (error) {
      console.error("Error fetching drawings from AsyncStorage: ", error);
    }
  };

  //useEffect to fetch drawings
  useEffect(() => {
    fetchAllDrawings();
  }, [isFocused]);

  const navigateToCanvas = (drawingData: any) => {
    navigation.navigate("Canvas", { drawingData });
  };

  // Function to delete a drawing
  const deleteDrawing = async (drawingName: string) => {
    try {
      await AsyncStorage.removeItem(drawingName);

      setDrawings((prevDrawings) =>
        prevDrawings.filter((drawing) => drawing.name !== drawingName)
      );
      Toast.show({
        type: "success",
        text1: "Drawing deleted successfully",
        position: "bottom",
        topOffset: 30,
        bottomOffset: 40,
        autoHide: true,
        visibilityTime: 1000,
      });
    } catch (error) {
      console.error("Error deleting drawing from AsyncStorage: ", error);
    }
  };

  //Function to handle long press
  const handleLongPress = (drawingName: string) => {
    Alert.alert(
      "Delete Drawing",
      `Are you sure you want to delete ${drawingName}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => deleteDrawing(drawingName),
        },
      ]
    );
  };

  return (
    // ScrollView to display the list of drawings
    <ScrollView contentContainerStyle={styles.container}>
      {drawings.length < 1 ? (
        <View style={styles.emptyContainer}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/128/4401/4401807.png",
            }}
            style={styles.emptyImage}
          />
          <Text style={styles.text}>No drawings available</Text>
        </View>
      ) : (
        drawings.map((drawing) => (
          <TouchableOpacity
            key={drawing.name}
            style={styles.drawingItem}
            onPress={() => navigateToCanvas(drawing)}
            onLongPress={() => handleLongPress(drawing.name)}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="color-palette" size={24} color="black" />
              <Text style={styles.drawingName}>{drawing.name}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={24} color="black" />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

export default HomeScreen;
// Styles for the component
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#ffff",
  },
  drawingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    justifyContent: "space-between",
  },
  drawingName: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "capitalize",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
    color: "black",
  },
});
