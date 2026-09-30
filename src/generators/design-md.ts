import { DesignData } from "../types";
import { rgbToHex } from "../utils/color";

export function buildDesignMd(data: DesignData): string {
  let md = `# 🎨 Design Analysis\n\n`;
  md += `**URL:** ${data.url}\n\n`;

  // ── Colors ─────────────────────────────────
  md += `## 🌈 Color Palette\n\n`;
  md += `| Swatch | Hex | Usage | Count |\n`;
  md += `|--------|-----|-------|-------|\n`;
  data.colors.slice(0, 15).forEach((c) => {
    const hex = rgbToHex(c.hex);
    md += `| \`${hex}\` | ${hex} | ${c.usage} | ${c.count} |\n`;
  });

  // ── Typography scale ───────────────────────
  md += `\n## 🔤 Typography Scale\n\n`;
  if (data.headings && data.headings.length > 0) {
    md += `| Tag | Size | Weight | Font | Sample |\n`;
    md += `|-----|------|--------|------|--------|\n`;
    data.headings.slice(0, 12).forEach((h: any) => {
      md += `| ${h.level} | ${h.fontSize} | ${h.fontWeight} | ${h.fontFamily} | ${h.text} |\n`;
    });
  } else {
    md += `_No headings detected._\n`;
  }

  // ── Body fonts ─────────────────────────────
  md += `\n### Base Fonts\n\n`;
  data.fonts.slice(0, 6).forEach((f) => {
    md += `- **${f.family}** (${f.count} occurrences)\n`;
  });

  // ── Buttons ────────────────────────────────
  md += `\n## 🔘 Button Styles\n\n`;
  if (data.buttons && data.buttons.length > 0) {
    data.buttons.slice(0, 8).forEach((b: any, i: number) => {
      md += `### Button ${i + 1}: "${b.text}"\n\n`;
      md += '```css\n';
      md += `.btn-${i + 1} {\n`;
      md += `  background: ${rgbToHex(b.backgroundColor)};\n`;
      md += `  color: ${rgbToHex(b.color)};\n`;
      md += `  border-radius: ${b.borderRadius};\n`;
      md += `  padding: ${b.padding};\n`;
      md += `  font-size: ${b.fontSize};\n`;
      md += `  font-weight: ${b.fontWeight};\n`;
      md += `}\n`;
      md += '```\n\n';
    });
  } else {
    md += `_No buttons detected._\n`;
  }

  // ── Spacing scale ──────────────────────────
  md += `\n## 📐 Spacing Scale\n\n`;
  if (data.spacing && data.spacing.length > 0) {
    md += `Detected spacing values:\n\n`;
    data.spacing.forEach((s: string) => {
      md += `- \`${s}\`\n`;
    });
  } else {
    md += `_No consistent spacing detected._\n`;
  }

  md += `\n## 📱 Breakpoints\n\n`;
  data.breakpoints.forEach((bp) => {
    md += `- ${bp}\n`;
  });

  return md;
}