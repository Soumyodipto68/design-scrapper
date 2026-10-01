import express from "express";
import path from "path";
import { fetchPage } from "./scraper/fetcher";
import { detectTech } from "./detectors/tech";
import { buildDesignMd } from "./generators/design-md";
import { buildSkillsMd } from "./generators/skills-md";
import { DesignData, ColorInfo, FontInfo } from "./types";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(express.json({ limit: "20mb" })); // screenshots are base64 — allow larger payloads

// Serve static frontend
app.use(express.static(path.join(__dirname, "../public")));
// ────────────────────────────────────────────────────────
// Core scrape logic (shared by single + batch endpoints)
// ────────────────────────────────────────────────────────
async function scrapeSingle(url: string) {
  const pageData = await fetchPage(url);

  // ── Detect tech stack ──────────────────────────────
  const techs = detectTech(pageData.html, pageData.headers ?? null);

  // ── Extract colors ─────────────────────────────────
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

  // ── Extract fonts ──────────────────────────────────
  const fontMap: Record<string, number> = {};
  pageData.styles.forEach((s: any) => {
    if (s.fontFamily) {
      fontMap[s.fontFamily] = (fontMap[s.fontFamily] || 0) + 1;
    }
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

  // ── Extract spacing scale ──────────────────────────
  const spacingSet = new Set<string>();
  pageData.styles.forEach((s: any) => {
    [s.paddingTop, s.paddingLeft, s.marginTop, s.marginBottom].forEach(
      (v: string) => {
        if (v && v !== "0px" && parseFloat(v) > 0) spacingSet.add(v);
      },
    );
  });
  const spacing = [...spacingSet]
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .slice(0, 12);

  // ── Build design data ──────────────────────────────
  const designData: DesignData = {
    url,
    colors,
    fonts,
    headings: pageData.headings || [],
    buttons: pageData.buttons || [],
    spacing,
    breakpoints: [`viewport: ${pageData.viewportWidth}px`],
    layout: `Detected ${pageData.styles.length} elements on initial viewport`,
  };

  return {
    design_md: buildDesignMd(designData),
    skills_md: buildSkillsMd(url, techs),
    screenshot: pageData.screenshot,
  };
}

// ────────────────────────────────────────────────────────
// Routes
// ────────────────────────────────────────────────────────

// Single URL scrape
app.post("/api/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res
        .status(400)
        .json({ error: "Valid URL required (http:// or https://)" });
    }

    console.log(`Scraping: ${url}`);
    const result = await scrapeSingle(url);
    res.json(result);
  } catch (err: any) {
    console.error("Scrape error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Batch scrape (up to 10 URLs, sequential for safety)
app.post("/api/batch-scrape", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: "Provide an array of URLs" });
    }

    const results: any[] = [];
    for (const url of urls.slice(0, 10)) {
      if (!/^https?:\/\//.test(url)) continue;

      console.log(`Batch scraping: ${url}`);
      try {
        const result = await scrapeSingle(url);
        results.push({ url, ...result, success: true });
      } catch (err: any) {
        results.push({ url, error: err.message, success: false });
      }
    }

    res.json({ results });
  } catch (err: any) {
    console.error("Batch error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown for Railway restarts
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => process.exit(0));
});
