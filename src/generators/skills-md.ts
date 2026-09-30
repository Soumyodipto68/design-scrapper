import { TechInfo } from "../types";

export function buildSkillsMd(url: string, techs: TechInfo[] | null | undefined): string {
  let md = `# Tech Stack Analysis\n\n`;
  md += `**URL:** ${url}\n\n`;

  // Guard: ensure techs is a real array
  const items: TechInfo[] = Array.isArray(techs) ? techs : [];

  if (items.length === 0) {
    md += `_No technologies detected._\n`;
    return md;
  }

  // Group by category
  const grouped: Record<string, TechInfo[]> = {};
  items.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  for (const [category, list] of Object.entries(grouped)) {
    md += `## ${category}\n\n`;
    list.forEach((t) => {
      md += `- **${t.name}**${t.version ? ` (v${t.version})` : ""}\n`;
    });
    md += `\n`;
  }

  return md;
}