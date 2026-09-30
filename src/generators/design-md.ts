import { DesignData } from "../types";

export function buildDesignMd(data: DesignData): string {
  let md = `# Design Analysis\n\n`;
  md += `**URL:** ${data.url}\n\n`;

  md += `## Colors\n\n`;
  if (data.colors.length > 0) {
    data.colors.forEach((c) => {
      md += `- **${c.hex}** — ${c.usage} (${c.count} occurrences)\n`;
    });
  } else {
    md += `*No color data extracted.*\n`;
  }

  md += `\n## Typography\n\n`;
  if (data.fonts.length > 0) {
    data.fonts.forEach((f) => {
      md += `- **${f.family}** — ${f.size}, weight ${f.weight} (${f.count} occurrences)\n`;
    });
  } else {
    md += `*No font data extracted.*\n`;
  }

  md += `\n## Breakpoints\n\n`;
  data.breakpoints.forEach((bp) => {
    md += `- ${bp}\n`;
  });

  md += `\n## Layout\n\n`;
  md += `${data.layout}\n`;

  return md;
}