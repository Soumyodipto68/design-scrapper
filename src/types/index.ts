export interface ColorInfo {
  hex: string;
  usage: string;
  count: number;
}

export interface FontInfo {
  family: string;
  size: string;
  weight: string;
  count: number;
}

export interface HeadingInfo {
  level: string;
  text: string;
  fontSize: string;
  fontWeight: string;
  fontFamily: string;
  color: string;
}

export interface ButtonInfo {
  text: string;
  backgroundColor: string;
  color: string;
  borderRadius: string;
  padding: string;
  border: string;
  fontSize: string;
  fontWeight: string;
}

export interface DesignData {
  url: string;
  colors: ColorInfo[];
  fonts: FontInfo[];
  headings: HeadingInfo[];
  buttons: ButtonInfo[];
  spacing: string[];
  breakpoints: string[];
  layout: string;
}

export interface TechInfo {
  name: string;
  version?: string;
  category: string;
}