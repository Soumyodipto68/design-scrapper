import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fetchPage } from "./scraper/fetcher";
import { detectTech } from "./detectors/tech";
import { buildDesignMd } from "./generators/design-md";
import { buildSkillsMd } from "./generators/skills-md";
import { DesignData, ColorInfo, FontInfo } from "./types";

const app = express();

// ── Middleware ─────────────────────────────
app.use(express.json({ limit: "20mb" }));
dotenv.config();
// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  next();
});

// Serve static frontend
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir, { maxAge: "1h" }));

// ────────────────────────────────────────────
// Core scrape logic
// ────────────────────────────────────────────
async function scrapeSingle(url: string) {
  const pageData = await fetchPage(url);

  const techs = detectTech(pageData.html, pageData.headers ?? null);

  // Colors
  const colorMap: Record<string, number> = {};
  pageData.styles.forEach((s: any) => {
    if (s.color && s.color !== "rgba(0, 0, 0, 0)") {
      colorMap[s.color] = (colorMap[s.color] || 0) + 1;
    }
    if (s.backgroundColor && s.backgroundColor !== "rgba(0, 0, 0, 0)") {
      colorMap[s.backgroundColor] = (colorMap[s.backgroundColor] || 0) + 1;
    }
  });

  const colors: ColorInfo[] = Object.entries(colorMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([hex, count]) => ({ hex, usage: "detected", count }));

  // Fonts
  const fontMap: Record<string, number> = {};
  pageData.styles.forEach((s: any) => {
    if (s.fontFamily) fontMap[s.fontFamily] = (fontMap[s.fontFamily] || 0) + 1;
  });

  const fonts: FontInfo[] = Object.entries(fontMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([family, count]) => ({
      family: family.split(",")[0].replace(/['"]/g, "").trim(),
      size: "varied",
      weight: "varied",
      count,
    }));

  // Spacing
  const spacingSet = new Set<string>();
  pageData.styles.forEach((s: any) => {
    [s.paddingTop, s.paddingLeft, s.marginTop, s.marginBottom].forEach((v: string) => {
      if (v && v !== "0px" && parseFloat(v) > 0) spacingSet.add(v);
    });
  });

  const designData: DesignData = {
    url,
    colors,
    fonts,
    headings: pageData.headings || [],
    buttons: pageData.buttons || [],
    spacing: [...spacingSet]
      .sort((a, b) => parseFloat(a) - parseFloat(b))
      .slice(0, 12),
    breakpoints: [`viewport: ${pageData.viewportWidth}px`],
    layout: `Detected ${pageData.styles.length} elements`,
  };

  return {
    design_md: buildDesignMd(designData),
    skills_md: buildSkillsMd(url, techs),
    screenshot: pageData.screenshot,
  };
}

// ────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────
app.post("/api/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "Valid URL required" });
    }
    console.log(`Scraping: ${url}`);
    res.json(await scrapeSingle(url));
  } catch (err: any) {
    console.error("Scrape error:", err.message);
    res.status(500).json({ error: "Scraping failed." });
  }
});

app.post("/api/batch-scrape", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "Provide an array of URLs" });
    }

    const results: any[] = [];
    for (const url of urls.slice(0, 10)) {
      if (!/^https?:\/\//.test(url)) continue;
      try {
        results.push({ url, ...(await scrapeSingle(url)), success: true });
      } catch (err: any) {
        results.push({ url, error: err.message, success: false });
      }
    }
    res.json({ results });
  } catch (err: any) {
    console.error("Batch error:", err.message);
    res.status(500).json({ error: "Batch scraping failed" });
  }
});

// Health check for Railway
app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

// SPA Fallback: Serve index.html for all other routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ────────────────────────────────────────────
// Start Server
// ────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...");
  server.close(() => process.exit(0));
});