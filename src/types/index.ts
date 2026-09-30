export interface ColorInfo {
  hex: string;
  usage: string;
  count: number;
}

export interface FontInfo {
  family: string;
  weight: string;
  size: string;
  count: number;
}

export interface SpacingInfo {
  padding: string;
  margin: string;
}

export interface DesignData {
  url: string;
  colors: ColorInfo[];
  fonts: FontInfo[];
  breakpoints: string[];
  layout: string;
}

export interface TechInfo {
  name: string;
  version?: string;
  category: string;
}

export interface ScrapeResponse {
  design_md: string;
  skills_md: string;
}