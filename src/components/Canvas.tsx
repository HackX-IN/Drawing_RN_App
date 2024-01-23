import React, { useEffect } from "react";
import {
  Canvas as SkCanvas,
  Circle,
  RoundedRect,
  Line,
  useCanvasRef,
  ImageSVG,
  Path,
  Text,
  matchFont,
  SkFont,
} from "@shopify/react-native-skia";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import CustomButton from "@/components/CustomButton";
import { svgImage } from "@/constants/index";
import {
  fontStyle,
  numberOfRandomNumbers,
  randomNumbers,
  showToast,
} from "@/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CircleProps,
  IPath,
  LineProps,
  RectangleProps,
  StarProps,
  TextProps,
} from "@/types/index";

const Canvas = ({ data, navigation }: { data: any; navigation: any }) => {
  console.log("🚀 ~ Canvas ~ data:", data);

  const font = matchFont(fontStyle);

  const ref = useCanvasRef();
  //State to manage different shapes and their properties
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const [rectangles, setRectangles] = useState<RectangleProps[]>([]);
  const [lines, setLines] = useState<LineProps[]>([]);
  const [stars, setStars] = useState<StarProps[]>([]);
  const [texts, setTexts] = useState<TextProps[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<any>(null);
  const [paths, setPaths] = useState<IPath[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);

  // Fetching data from navigation prop
  useEffect(() => {
    if (data && data.drawingData) {
      const drawingData = data.drawingData.data;
      setCircles(drawingData.circles || []);
      setRectangles(drawingData.rectangles || []);
      setLines(drawingData.lines || []);
      setPaths(drawingData.paths || []);
    }
  }, [data]);

  // Saving data to AsyncStorage
  const saveData = async () => {
    const canvasData = {
      circles,
      rectangles,
      lines,
      stars,
      paths,
      texts,
    };

    try {
      const randomIndex = Math.floor(Math.random() * numberOfRandomNumbers);
      const randomItemNumber = randomNumbers[randomIndex];

      const itemName = `drawing${randomItemNumber}`;
      if (data) {
        const existingData = await AsyncStorage.getItem(data.drawingData.name);
        if (existingData) {
          const ExistingData = JSON.parse(existingData);
          const updatedData = {
            circles: ExistingData.circles.concat(circles),
            rectangles: ExistingData.rectangles.concat(rectangles),
            lines: ExistingData.lines.concat(lines),
            stars: ExistingData.stars.concat(stars),
            paths: ExistingData.paths.concat(paths),
            texts: ExistingData.texts.concat(texts),
          };

          await AsyncStorage.setItem(
            data.drawingData.name,
            JSON.stringify(updatedData)
          );
          console.log(
            `Canvas data updated in AsyncStorage with name: ${itemName}`
          );
          showToast("success", "Data saved successfully");
        }
      } else {
        await AsyncStorage.setItem(itemName, JSON.stringify(canvasData));
        console.log(`Canvas data saved to AsyncStorage with name: ${itemName}`);
        showToast("success", "Data saved successfully");
        clearCanvas();
      }
    } catch (error) {
      console.error(
        "Error saving/updating canvas data to AsyncStorage: ",
        error
      );
    } finally {
      navigation.goBack();
    }
  };

  // Functions to add different shapes to the canvas
  const addCircle = (
    cx: number,
    cy: number,
    r: number,
    color: string
  ): void => {
    const newCircle: CircleProps = { cx, cy, r, color };
    setCircles((prevCircles) => [...prevCircles, newCircle]);
  };

  const addRectangle = (
    x: number,
    y: number,
    width: number,
    height: number,
    r: number,
    color: string
  ): void => {
    const newRect: RectangleProps = { x, y, r, color, width, height };
    setRectangles((prevRect) => [...prevRect, newRect]);
  };

  const addLine = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    color: string,
    strokeWidth: number
  ): void => {
    const newLine: LineProps = { p1, p2, color, strokeWidth };
    setLines((prevLines) => [...prevLines, newLine]);
  };
  const addStar = (
    width: number,
    height: number,
    x: number,
    y: number,
    svg: any
  ): void => {
    const newStar: StarProps = { width, height, x, y, svg };
    setStars((prevStars) => [...prevStars, newStar]);
  };

  const addText = (
    text: string,
    x: number,
    y: number,
    font?: string | SkFont,
    color?: string,
    fontSize?: number
  ) => {
    const newText: TextProps = { text, x, y, font, color, fontSize };
    setTexts((prevTexts) => [...prevTexts, newText]);
  };

  // Function for canvas to add shapes
  const handlePress = (event: any, type: string): void => {
    switch (type) {
      case "circle":
        addCircle(
          event.nativeEvent.locationX + 20,
          event.nativeEvent.locationY + 20,
          28,
          "blue"
        );
        break;
      case "rectangle":
        addRectangle(
          event.nativeEvent.locationX + 20,
          event.nativeEvent.locationY + 20,
          50,
          30,
          10,
          "green"
        );
        break;
      case "line":
        addLine(
          { x: 80, y: 80 },
          {
            x: event.nativeEvent.locationX + 20,
            y: event.nativeEvent.locationY + 20,
          },
          "lightblue",
          4
        );
        break;
      case "star":
        addStar(
          100,
          100,
          event.nativeEvent.locationX + 20,
          event.nativeEvent.locationY + 20,
          svgImage
        );
      case "text":
        addText(
          "Hello World",
          event.nativeEvent.locationX + 20,
          event.nativeEvent.locationY + 20,
          font,
          "black",
          20
        );
      default:
        break;
    }
  };
  const handleSelect = (index: any, type: any): void => {
    setSelectedItemIndex(index);
    setSelectedItemType(type);
  };

  const pan = Gesture.Pan()
    .onStart((g) => {
      const newPaths = [...paths];
      newPaths[paths.length] = {
        segments: [],
        color: "#06d6a0",
      };
      newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      if (selectedItemIndex === null) {
        setPaths(newPaths);
      }
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        if (selectedItemIndex === null) {
          setPaths(newPaths);
        }
      }
    })
    .minDistance(1);

  const clearCanvas = () => {
    setPaths([]);
    setCircles([]);
    setRectangles([]);
    setLines([]);
    setStars([]);
    setTexts([]);
    setSelectedItemIndex(null);
    setSelectedItemType("");
  };

  // Handling touch on canvas to interact with shapes
  const handleCanvasTouch = (event: any) => {
    if (event.nativeEvent) {
      const touchX = event.nativeEvent.locationX;
      const touchY = event.nativeEvent.locationY;

      const activeObject = findActiveObject(touchX, touchY);
      const activeRectangle = findActiveRectangle(touchX, touchY);
      const activeLine = findActiveLine(touchX, touchY);
      const activeStar = findActiveStar(touchX, touchY);
      const activeText = findActiveText(touchX, touchY);

      if (activeObject) {
        console.log(activeObject);
        handleObjectTouch(activeObject);
      } else if (activeRectangle) {
        console.log(activeRectangle);
        handleObjectTouch(activeRectangle);
      } else if (activeLine) {
        console.log(activeLine);
        handleObjectTouch(activeLine);
      } else if (activeStar) {
        console.log(activeStar);
        handleObjectTouch(activeStar);
      } else if (activeText) {
        console.log(activeText);
        handleObjectTouch(activeText);
      }
    }
  };

  //function to find active text
  const findActiveText = (touchX: number, touchY: number) => {
    for (const text of texts) {
      const { x, y, fontSize = 16, text: textContent } = text;

      const textWidth = textContent.length * (fontSize / 2); // Adjust as needed
      const textHeight = fontSize; // Adjust as needed

      if (
        touchX >= x &&
        touchX <= x + textWidth &&
        touchY >= y &&
        touchY <= y + textHeight
      ) {
        return { type: "text", index: texts.indexOf(text) };
      }
    }

    return null;
  };
  // Function to find active rectangle
  const findActiveRectangle = (touchX: number, touchY: number) => {
    for (const rectangle of rectangles) {
      const { x, y, width, height } = rectangle;

      if (
        touchX >= x &&
        touchX <= x + width &&
        touchY >= y &&
        touchY <= y + height
      ) {
        return { type: "rectangle", index: rectangles.indexOf(rectangle) };
      }
    }

    return null;
  };
  // Function to find active Star
  const findActiveStar = (touchX: number, touchY: number) => {
    for (const star of stars) {
      const { x, y, width, height } = star;

      if (
        touchX >= x &&
        touchX <= x + width &&
        touchY >= y &&
        touchY <= y + height
      ) {
        return { type: "star", index: stars.indexOf(star) };
      }
    }

    return null;
  };
  // Function to find active Line
  const findActiveLine = (touchX: number, touchY: number) => {
    const touchThreshold = 5;

    for (const line of lines) {
      const { p1, p2 } = line;

      const distance = pointToLineDistance({ x: touchX, y: touchY }, p1, p2);

      if (distance <= touchThreshold) {
        return { type: "line", index: lines.indexOf(line) };
      }
    }

    return null;
  };

  // Function to find Distance of line
  const pointToLineDistance = (point: any, lineStart: any, lineEnd: any) => {
    const { x: x1, y: y1 } = lineStart;
    const { x: x2, y: y2 } = lineEnd;
    const { x, y } = point;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  //Function to find active Circle
  const findActiveObject = (x: number, y: number) => {
    for (const circle of circles) {
      const distance = Math.sqrt(
        Math.pow(x - circle.cx, 2) + Math.pow(y - circle.cy, 2)
      );
      if (distance <= circle.r) {
        return { type: "circle", index: circles.indexOf(circle) };
      }
    }

    return null;
  };

  const handleObjectTouch = (activeObject: { type: string; index: number }) => {
    const { type, index } = activeObject;

    handleSelect(index, type);
  };

  // Function to enlarge the selected object
  const handleEnlarge = (): void => {
    if (selectedItemIndex !== null) {
      switch (selectedItemType) {
        case "circle":
          setCircles((prevCircles) => {
            const updatedCircles = [...prevCircles];
            updatedCircles[selectedItemIndex].r *= 1.2;
            return updatedCircles;
          });
          break;
        case "rectangle":
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[selectedItemIndex].width *= 1.2;
            updatedRectangles[selectedItemIndex].height *= 1.2;
            return updatedRectangles;
          });
          break;
        case "line":
          setLines((prevLines) => {
            const updatedLines = [...prevLines];
            updatedLines[selectedItemIndex].strokeWidth *= 1.2;
            updatedLines[selectedItemIndex].p1.x *= 1.2;
            updatedLines[selectedItemIndex].p1.y *= 1.2;
            updatedLines[selectedItemIndex].p2.x *= 1.2;
            updatedLines[selectedItemIndex].p2.y *= 1.2;
            return updatedLines;
          });
          break;
        case "star":
          setStars((prevStars) => {
            const updatedStars = [...prevStars];
            updatedStars[selectedItemIndex].height *= 1.2;
            updatedStars[selectedItemIndex].width *= 1.2;
            return updatedStars;
          });
          break;
        case "text":
          setTexts((prevTexts) => {
            const updatedTexts = [...prevTexts];
            updatedTexts[selectedItemIndex].fontSize *= 1.2;
            return updatedTexts;
          });
          break;
        default:
          break;
      }
    }
  };
  // Function to Shrink the selected object
  const handleShrink = (): void => {
    if (selectedItemIndex !== null) {
      switch (selectedItemType) {
        case "circle":
          setCircles((prevCircles) => {
            const updatedCircles = [...prevCircles];
            updatedCircles[selectedItemIndex].r *= 0.8;
            return updatedCircles;
          });
          break;
        case "rectangle":
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[selectedItemIndex].width *= 0.8;
            updatedRectangles[selectedItemIndex].height *= 0.8;
            return updatedRectangles;
          });
          break;
        case "line":
          setLines((prevLines) => {
            const updatedLines = [...prevLines];
            updatedLines[selectedItemIndex].p1.x *= 0.8;
            updatedLines[selectedItemIndex].p1.y *= 0.8;
            updatedLines[selectedItemIndex].p2.x *= 0.8;
            updatedLines[selectedItemIndex].p2.y *= 0.8;
            return updatedLines;
          });
          break;
        case "star":
          setStars((prevStars) => {
            const updatedStars = [...prevStars];
            updatedStars[selectedItemIndex].height *= 0.8;
            updatedStars[selectedItemIndex].width *= 0.8;
            return updatedStars;
          });
          break;
        case "text":
          setTexts((prevTexts) => {
            const updatedTexts = [...prevTexts];
            const fontSize = updatedTexts[selectedItemIndex].fontSize || 16;
            updatedTexts[selectedItemIndex].fontSize = fontSize * 0.8;
            return updatedTexts;
          });
          break;
        default:
          break;
      }
    }
  };
  // Function to Move the selected object
  const handleMove = (direction: string): void => {
    if (selectedItemIndex !== null) {
      switch (selectedItemType) {
        case "circle":
          setCircles((prevCircles) => {
            const updatedCircles = [...prevCircles];
            switch (direction) {
              case "up":
                updatedCircles[selectedItemIndex].cy -= 10;
                break;
              case "down":
                updatedCircles[selectedItemIndex].cy += 10;
                break;
              case "left":
                updatedCircles[selectedItemIndex].cx -= 10;
                break;
              case "right":
                updatedCircles[selectedItemIndex].cx += 10;
                break;
              default:
                break;
            }
            return updatedCircles;
          });
          break;

        case "rectangle":
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles];
            switch (direction) {
              case "up":
                updatedRectangles[selectedItemIndex].y -= 10;
                break;
              case "down":
                updatedRectangles[selectedItemIndex].y += 10;
                break;
              case "left":
                updatedRectangles[selectedItemIndex].x -= 10;
                break;
              case "right":
                updatedRectangles[selectedItemIndex].x += 10;
                break;
              default:
                break;
            }
            return updatedRectangles;
          });
          break;

        case "line":
          setLines((prevLines) => {
            console.log("Before update - lines:", prevLines);
            const updatedLines = [...prevLines];
            switch (direction) {
              case "up":
                updatedLines[selectedItemIndex].p1.y -= 10;
                updatedLines[selectedItemIndex].p2.y -= 10;
                break;
              case "down":
                updatedLines[selectedItemIndex].p1.y += 10;
                updatedLines[selectedItemIndex].p2.y += 10;
                break;
              case "left":
                updatedLines[selectedItemIndex].p1.x -= 10;
                updatedLines[selectedItemIndex].p2.x -= 10;
                break;
              case "right":
                updatedLines[selectedItemIndex].p1.x += 10;
                updatedLines[selectedItemIndex].p2.x += 10;
                break;
              default:
                break;
            }
            console.log("After update - lines:", updatedLines);
            return updatedLines;
          });
          break;

        case "star":
          setStars((prevStars) => {
            const updatedStars = [...prevStars];
            switch (direction) {
              case "up":
                updatedStars[selectedItemIndex].y -= 10;
                break;
              case "down":
                updatedStars[selectedItemIndex].y += 10;
                break;
              case "left":
                updatedStars[selectedItemIndex].x -= 10;
                break;
              case "right":
                updatedStars[selectedItemIndex].x += 10;
                break;
              default:
                break;
            }
            return updatedStars;
          });
          break;
        case "text":
          setTexts((prevTexts) => {
            const updatedTexts = [...prevTexts];
            switch (direction) {
              case "up":
                updatedTexts[selectedItemIndex].y -= 10;
                break;
              case "down":
                updatedTexts[selectedItemIndex].y += 10;
                break;
              case "left":
                updatedTexts[selectedItemIndex].x -= 10;
                break;
              case "right":
                updatedTexts[selectedItemIndex].x += 10;
                break;
              default:
                break;
            }
            return updatedTexts;
          });
          break;
        default:
          break;
      }
    }
  };
  // Function to Delete the selected object
  const handleDelete = (): void => {
    if (selectedItemIndex !== null) {
      switch (selectedItemType) {
        case "circle":
          setCircles((prevCircles) =>
            prevCircles.filter((_, index) => index !== selectedItemIndex)
          );
          break;
        case "rectangle":
          setRectangles((prevRectangles) =>
            prevRectangles.filter((_, index) => index !== selectedItemIndex)
          );
          break;
        case "line":
          setLines((prevLines) =>
            prevLines.filter((_, index) => index !== selectedItemIndex)
          );
          break;
        case "star":
          setStars((prevStars) =>
            prevStars.filter((_, index) => index !== selectedItemIndex)
          );
          break;
        case "text":
          setTexts((prevTexts) =>
            prevTexts.filter((_, index) => index !== selectedItemIndex)
          );
          break;

        default:
          break;
      }

      setSelectedItemIndex(null);
      setSelectedItemType(null);
    }
  };

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <View style={styles.canvas}>
          <SkCanvas
            style={{ flex: 1 }}
            ref={ref}
            onTouchEnd={(event) => handleCanvasTouch(event)}
          >
            {circles.map((circle, index) => (
              <Circle {...circle} key={index} />
            ))}
            {rectangles.map((rectangle, index) => (
              <RoundedRect key={index} {...rectangle} />
            ))}
            {lines.map((line, index) => (
              <Line key={index} {...line} />
            ))}
            {paths.map((p, index) => (
              <Path
                key={index}
                path={p.segments.join(" ")}
                strokeWidth={5}
                style="stroke"
                color={p.color}
              />
            ))}
            {!!svgImage && stars && (
              <>
                {stars.map((star, index) => (
                  <ImageSVG key={index} {...star} />
                ))}
              </>
            )}
            {texts.map((text, index) => (
              <Text {...text} key={index} />
            ))}
          </SkCanvas>
        </View>
      </GestureDetector>
      <ScrollView horizontal style={{ position: "absolute", bottom: 8 }}>
        <CustomButton
          onPress={(event) => handlePress(event, "circle")}
          backgroundColor="purple"
          label="Add Circle"
          iconName="add-circle"
        />
        <CustomButton
          onPress={(event) => handlePress(event, "rectangle")}
          backgroundColor="green"
          label="Add Rectangle"
          iconName="shapes"
        />
        <CustomButton
          onPress={(event) => handlePress(event, "line")}
          backgroundColor="red"
          label="Add Line"
          iconName="link-outline"
        />
        <CustomButton
          onPress={(event) => handlePress(event, "star")}
          backgroundColor="gold"
          label="Add Star"
          iconName="star"
        />
        <CustomButton
          onPress={(event) => handlePress(event, "text")}
          backgroundColor="black"
          label="Add text"
          iconName="pencil"
        />
        {selectedItemIndex !== null && (
          <>
            <CustomButton
              onPress={handleEnlarge}
              backgroundColor="orange"
              label="Enlarge"
              iconName="add-outline"
            />
            <CustomButton
              onPress={handleShrink}
              backgroundColor="purple"
              label="Shrink"
              iconName="remove-outline"
            />
            <CustomButton
              onPress={() => handleMove("up")}
              backgroundColor="blue"
              label="Up"
              iconName="arrow-up"
            />
            <CustomButton
              onPress={() => handleMove("down")}
              backgroundColor="gold"
              label="Down"
              iconName="arrow-down"
            />
            <CustomButton
              onPress={() => handleMove("left")}
              backgroundColor="green"
              label="Left"
              iconName="arrow-back"
            />
            <CustomButton
              onPress={() => handleMove("right")}
              backgroundColor="red"
              label="Right"
              iconName="arrow-forward"
            />
            <CustomButton
              onPress={handleDelete}
              backgroundColor="red"
              label="Delete"
              iconName="trash-bin"
            />
          </>
        )}
        <CustomButton
          onPress={saveData}
          backgroundColor="purple"
          label="Save "
          iconName="cloud-upload-outline"
        />
        <CustomButton
          onPress={clearCanvas}
          backgroundColor="gray"
          label="Clear All"
          iconName="trash-bin"
        />
      </ScrollView>
    </View>
  );
};

export default Canvas;

//Styles for Canvas Component

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  canvas: {
    height: "80%",
    width: "90%",
    borderColor: "black",
    borderWidth: 1,
    marginBottom: 70,
  },
});
