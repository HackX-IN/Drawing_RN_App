import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/core";

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const [drawings, setDrawings] = useState([]);
  const isFocused = useIsFocused();
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

  useEffect(() => {
    fetchAllDrawings();
  }, [isFocused]);

  const navigateToCanvas = (drawingData: any) => {
    navigation.navigate("Canvas", { drawingData });
  };

  const deleteDrawing = async (drawingName: string) => {
    try {
      await AsyncStorage.removeItem(drawingName);

      setDrawings((prevDrawings) =>
        prevDrawings.filter((drawing) => drawing.name !== drawingName)
      );
    } catch (error) {
      console.error("Error deleting drawing from AsyncStorage: ", error);
    }
  };

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
    <ScrollView contentContainerStyle={styles.container}>
      {drawings.map((drawing) => (
        <TouchableOpacity
          key={drawing.name}
          style={styles.drawingItem}
          onPress={() => navigateToCanvas(drawing)}
          onLongPress={() => handleLongPress(drawing.name)}
        >
          <Text style={styles.drawingName}>{drawing.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
    borderTopWidth: 1,
    borderTopColor: "black",
  },
  drawingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#fff",
    marginTop: 8,
  },
  drawingName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
});
