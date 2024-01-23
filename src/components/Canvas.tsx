import React from "react";
import {
  Canvas as SkCanvas,
  Circle,
  RoundedRect,
  Line,
  useCanvasRef,
  ImageSVG,
  Path,
} from "@shopify/react-native-skia";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import CustomButton from "@/components/CustomButton";
import { svgImage } from "@/constants/index";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CircleProps,
  IPath,
  LineProps,
  RectangleProps,
  StarProps,
} from "@/types/index";

const Canvas = () => {
  const ref = useCanvasRef();
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const [rectangles, setRectangles] = useState<RectangleProps[]>([]);
  const [lines, setLines] = useState<LineProps[]>([]);
  const [stars, setStars] = useState<StarProps[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<any>(null);
  const [paths, setPaths] = useState<IPath[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);

  const saveToFirebase = async () => {
    const canvasData = {
      circles,
      rectangles,
      lines,
      stars,
      paths,
    };

    const isCanvasNotEmpty =
      circles.length > 0 ||
      rectangles.length > 0 ||
      lines.length > 0 ||
      stars.length > 0 ||
      paths.length > 0;

    if (isCanvasNotEmpty) {
      try {
        await AsyncStorage.setItem("canvasData", JSON.stringify(canvasData));
        console.log("Canvas data saved to AsyncStorage");
        clearCanvas();
      } catch (error) {
        console.error("Error saving canvas data to AsyncStorage: ", error);
      }
    } else {
      console.log("Canvas is empty. No data to save.");
    }
  };

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
    setSelectedItemIndex(null);
    setSelectedItemType("");
  };
  const handleCanvasTouch = (event: any) => {
    if (event.nativeEvent) {
      const touchX = event.nativeEvent.locationX;
      const touchY = event.nativeEvent.locationY;

      const activeObject = findActiveObject(touchX, touchY);
      const activeRectangle = findActiveRectangle(touchX, touchY);
      const activeLine = findActiveLine(touchX, touchY);
      const activeStar = findActiveStar(touchX, touchY);

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
      }
    }
  };

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
        default:
          break;
      }
    }
  };

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
        default:
          break;
      }
    }
  };

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

        default:
          break;
      }
    }
  };

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
        default:
          break;
      }

      setSelectedItemIndex(null);
      setSelectedItemType(null);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <GestureDetector gesture={pan}>
        <View
          style={{
            height: "80%",
            width: "90%",
            borderColor: "black",
            borderWidth: 1,
            marginBottom: 25,
          }}
        >
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
            {/* {paths.map((p, index) => (
              <Path
                key={index}
                path={p.segments.join(" ")}
                strokeWidth={5}
                style="stroke"
                color={p.color}
              />
            ))} */}
            {!!svgImage && stars && (
              <>
                {stars.map((star, index) => (
                  <ImageSVG key={index} {...star} />
                ))}
              </>
            )}
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
          onPress={saveToFirebase}
          backgroundColor="purple"
          label="Save to cloud"
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
