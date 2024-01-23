import { TextStyle, ViewStyle } from "react-native";

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
  r: number;
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

interface CustomButtonProps {
  onPress: (event: any) => void;
  backgroundColor: string;
  label: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  iconName?: string | any;
}

export type {
  CircleProps,
  IPath,
  RectangleProps,
  LineProps,
  StarProps,
  CustomButtonProps,
};
