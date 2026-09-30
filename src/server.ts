import express from "express";
import { fetchPage } from "./scraper/fetcher";
import { detectTech } from "./detectors/tech";
import { buildDesignMd } from "./generators/design-md";
import { buildSkillsMd } from "./generators/skills-md";

const app = express();
app.use(express.json());

app.post("/api/scrape", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !/^https?:\/\//.test(url)) {
      return res.status(400).json({ error: "Valid URL required (http:// or https://)" });
    }

    console.log(`Scraping: ${url}`);
    const pageData = await fetchPage(url);

    // Detect tech from collected HTML + headers
    const techs = detectTech(pageData.html, pageData.headers);

    // ... rest of your existing color/font extraction logic stays the same ...

    res.json({
      design_md: buildDesignMd(designData),
      skills_md: buildSkillsMd(url, techs),
    });
  } catch (err: any) {
    console.error("Scrape error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});