import express from "express";
import { fetchPage } from "./scraper/fetcher";
import { detectTech } from "./detectors/tech";
import { buildDesignMd } from "./generators/design-md";
import { buildSkillsMd } from "./generators/skills-md";
import { DesignData, ColorInfo, FontInfo } from "./types";
import path from "path";


const app = express();
app.use(express.json());
// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));

app.post("/api/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "Valid URL required (http:// or https://)" });
    }

    console.log(`Scraping: ${url}`);
    const pageData = await fetchPage(url);

    // ── Detect tech stack ──────────────────────────────
    const techs = detectTech(pageData.html, pageData.headers);

    // ── Extract colors ─────────────────────────────────
    const colorMap: Record<string, number> = {};
    pageData.styles.forEach((s: any) => {
      if (s.color) {
        colorMap[s.color] = (colorMap[s.color] || 0) + 1;
      }
      if (s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)") {
        colorMap[s.backgroundColor] = (colorMap[s.backgroundColor] || 0) + 1;
      }
    });

    const colors: ColorInfo[] = Object.entries(colorMap)
      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
      .slice(0, 20)
      .map(([hex, count]) => ({ hex, usage: "detected", count }));

    // ── Extract fonts ──────────────────────────────────
    const fontMap: Record<string, number> = {};
    pageData.styles.forEach((s: any) => {
      if (s.fontFamily) {
        fontMap[s.fontFamily] = (fontMap[s.fontFamily] || 0) + 1;
      }
    });

    const fonts: FontInfo[] = Object.entries(fontMap)
      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
      .slice(0, 10)
      .map(([family, count]) => ({
        family: family.split(",")[0].replace(/['"]/g, "").trim(),
        size: "varied",
        weight: "varied",
        count,
      }));

    // ── Build design data ──────────────────────────────
    const designData: DesignData = {
      url,
      colors,
      fonts,
      breakpoints: [`viewport: ${pageData.viewportWidth}px`],
      layout: `Detected ${pageData.styles.length} elements on initial viewport`,
    };

    // ── Return results ─────────────────────────────────
    res.json({
      design_md: buildDesignMd(designData),
      skills_md: buildSkillsMd(url, techs),
    });
  } catch (err: any) {
    console.error("Scrape error:", err);
    res.status(500).json({ error: err.message });
  }
});
const publicPath = path.join(__dirname, "../public");
console.log("Serving static files from:", publicPath);
// Add this RIGHT BEFORE app.listen() to test
app.get("/test", (req, res) => {
  res.send("Express is working!");
});
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
