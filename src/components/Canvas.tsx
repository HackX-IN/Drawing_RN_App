import React from "react";
import {
  Canvas as SkCanvas,
  Circle,
  RoundedRect,
  Line,
  useCanvasRef,
  Path,
  Skia,
  ImageSVG,
} from "@shopify/react-native-skia";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
  TouchableWithoutFeedback,
} from "react-native-gesture-handler";
interface CircleProps {
  cx: number;
  cy: number;
  r: number;
  color: string;
}

interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  r: number; // r for border radius
  color: string;
}
interface StarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  svg: any;
}

interface LineProps {
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  color: string;
  strokeWidth: number;
}

interface IPath {
  segments: String[];
  color?: string;
}

const Canvas = () => {
  const ref = useCanvasRef();
  const [circles, setCircles] = useState<CircleProps[]>([]);
  const [rectangles, setRectangles] = useState<RectangleProps[]>([]);
  const [lines, setLines] = useState<LineProps[]>([]);
  const [stars, setStars] = useState<StarProps[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<any>(null);
  const [paths, setPaths] = useState<IPath[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);

  const addCircle = (
    cx: number,
    cy: number,
    r: number,
    color: string
  ): void => {
    const newCircle: CircleProps = { cx, cy, r, color };
    setCircles((prevCircles) => [...prevCircles, newCircle]);
  };

  const svgStar =
    '<svg class="star-svg" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/2000/xlink" viewBox="0 0 200 200"><polygon id="star" fill="#fcbf49" points="100,0,129.38926261462365,59.54915028125263,195.10565162951536,69.09830056250526,147.55282581475768,115.45084971874736,158.77852522924732,180.90169943749473,100,150,41.2214747707527,180.90169943749476,52.447174185242325,115.45084971874738,4.894348370484636,69.09830056250527,70.61073738537632,59.549150281252636"></polygon></svg>';
  const svgImage = Skia.SVG.MakeFromString(svgStar);

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
          event.nativeEvent.locationX,
          event.nativeEvent.locationY,
          28,
          "blue"
        );
        break;
      case "rectangle":
        addRectangle(
          event.nativeEvent.locationX,
          event.nativeEvent.locationY,
          50,
          30,
          10,
          "green"
        );
        break;
      case "line":
        addLine(
          { x: 80, y: 80 },
          { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY },
          "lightblue",
          4
        );
        break;
      case "star":
        addStar(
          100,
          100,
          event.nativeEvent.locationX,
          event.nativeEvent.locationY,
          svgImage
        );
      default:
        break;
    }
  };
  const handleSelect = (index: any, type: any): void => {
    // Set the selected item in the state
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
      setPaths(newPaths);
    })
    .onUpdate((g) => {
      const index = paths.length - 1;
      const newPaths = [...paths];
      if (newPaths?.[index]?.segments) {
        newPaths[index].segments.push(`L ${g.x} ${g.y}`);
        setPaths(newPaths);
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

      if (activeObject) {
        console.log(activeObject);
        handleObjectTouch(activeObject);
      } else if (activeRectangle) {
        console.log(activeRectangle);
        handleObjectTouch(activeRectangle);
      } else if (activeLine) {
        console.log(activeLine);
        handleObjectTouch(activeLine);
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
        // Return the active rectangle
        return { type: "rectangle", index: rectangles.indexOf(rectangle) };
      }
    }

    // No active rectangle found
    return null;
  };

  const findActiveLine = (touchX: number, touchY: number) => {
    const touchThreshold = 5; // Adjust this value for your specific requirements

    for (const line of lines) {
      const { p1, p2 } = line;

      // Check if the touch coordinates are close to the line
      const distance = pointToLineDistance({ x: touchX, y: touchY }, p1, p2);

      if (distance <= touchThreshold) {
        // Return the active line
        return { type: "line", index: lines.indexOf(line) };
      }
    }

    // No active line found
    return null;
  };

  // Function to calculate the distance from a point to a line
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
    // Perform actions based on the type and index of the active object
    const { type, index } = activeObject;

    handleSelect(index, type);
  };

  const handleEnlarge = (): void => {
    if (selectedItemIndex !== null) {
      switch (selectedItemType) {
        case "circle":
          setCircles((prevCircles) => {
            const updatedCircles = [...prevCircles];
            updatedCircles[selectedItemIndex].r *= 1.2; // Increase the radius by 20%
            return updatedCircles;
          });
          break;
        case "rectangle":
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[selectedItemIndex].width *= 1.2; // Increase the width by 20%
            updatedRectangles[selectedItemIndex].height *= 1.2; // Increase the height by 20%
            return updatedRectangles;
          });
          break;
        // Add cases for other item types (line, star, etc.) if needed
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
            updatedCircles[selectedItemIndex].r *= 0.8; // Decrease the radius by 20%
            return updatedCircles;
          });
          break;
        case "rectangle":
          setRectangles((prevRectangles) => {
            const updatedRectangles = [...prevRectangles];
            updatedRectangles[selectedItemIndex].width *= 0.8; // Decrease the width by 20%
            updatedRectangles[selectedItemIndex].height *= 0.8; // Decrease the height by 20%
            return updatedRectangles;
          });
          break;
        // Add cases for other item types (line, star, etc.) if needed
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
            // const { cx, cy } = updatedCircles[selectedItemIndex];
            switch (direction) {
              case "up":
                updatedCircles[selectedItemIndex].cy -= 10; // Move up by 10 units
                break;
              case "down":
                updatedCircles[selectedItemIndex].cy += 10; // Move down by 10 units
                break;
              case "left":
                updatedCircles[selectedItemIndex].cx -= 10; // Move left by 10 units
                break;
              case "right":
                updatedCircles[selectedItemIndex].cx += 10; // Move right by 10 units
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
            // const { x, y } = updatedRectangles[selectedItemIndex];
            switch (direction) {
              case "up":
                updatedRectangles[selectedItemIndex].y -= 10; // Move up by 10 units
                break;
              case "down":
                updatedRectangles[selectedItemIndex].y += 10; // Move down by 10 units
                break;
              case "left":
                updatedRectangles[selectedItemIndex].x -= 10; // Move left by 10 units
                break;
              case "right":
                updatedRectangles[selectedItemIndex].x += 10; // Move right by 10 units
                break;
              default:
                break;
            }
            return updatedRectangles;
          });
          break;
        // Add cases for other item types (line, star, etc.) if needed
        default:
          break;
      }
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
          </SkCanvas>
        </View>
      </GestureDetector>
      <ScrollView horizontal style={{ position: "absolute", bottom: 8 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "purple",
            padding: 7,
            borderRadius: 5,
            margin: 5,
            alignItems: "center",
          }}
          onPress={(event) => handlePress(event, "circle")}
        >
          <Ionicons name="add-circle" size={30} color="white" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Add Circle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "green",
            padding: 7,
            borderRadius: 5,
            margin: 5,
            alignItems: "center",
          }}
          onPress={(event) => handlePress(event, "rectangle")}
        >
          <Ionicons name="shapes" size={30} color="white" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Add Rectangle
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "red",
            padding: 7,
            borderRadius: 5,
            margin: 5,
            alignItems: "center",
          }}
          onPress={(event) => handlePress(event, "line")}
        >
          <Ionicons name="link-outline" size={30} color="white" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Add Line
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "gold",
            padding: 7,
            borderRadius: 5,
            margin: 5,
            alignItems: "center",
          }}
          onPress={(event) => handlePress(event, "star")}
        >
          <Ionicons name="star" size={30} color="white" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Add Star
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: "gray",
            padding: 7,
            borderRadius: 5,
            margin: 5,
            alignItems: "center",
          }}
          onPress={clearCanvas}
        >
          <Ionicons name="trash-bin" size={30} color="white" />
          <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
            Clear All
          </Text>
        </TouchableOpacity>
        {selectedItemIndex !== null && (
          <>
            <TouchableOpacity
              style={{
                backgroundColor: "orange",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={handleEnlarge}
            >
              <Ionicons name="add-outline" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Enlarge
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "purple",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={handleShrink}
            >
              <Ionicons name="remove-outline" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Shrink
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "blue",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={() => handleMove("up")}
            >
              <Ionicons name="arrow-up" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "gold",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={() => handleMove("down")}
            >
              <Ionicons name="arrow-down" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Down
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "green",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={() => handleMove("left")}
            >
              <Ionicons name="arrow-back" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Left
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: "red",
                padding: 7,
                borderRadius: 5,
                margin: 5,
                alignItems: "center",
              }}
              onPress={() => handleMove("right")}
            >
              <Ionicons name="arrow-forward" size={30} color="white" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                Right
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default Canvas;
