import { TechInfo } from "../types";

export function buildSkillsMd(url: string, techs: TechInfo[]): string {
  let md = `# Tech Stack Analysis\n\n`;
  md += `**URL:** ${url}\n\n`;

  if (techs.length === 0) {
    md += `_No technologies detected._\n`;
    return md;
  }

  // Group by category
  const grouped: Record<string, TechInfo[]> = {};
  techs.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  for (const [category, items] of Object.entries(grouped)) {
    md += `## ${category}\n\n`;
    items.forEach((t) => {
      md += `- **${t.name}**${t.version ? ` (v${t.version})` : ""}\n`;
    });
    md += `\n`;
  }

  return md;
}