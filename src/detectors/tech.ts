import Wappalyzer from "wappalyzer";

export async function detectTech(url: string): Promise<any[]> {
  const wappalyzer = new Wappalyzer({
    userAgent: "Mozilla/5.0 (compatible; DesignScraper/1.0)",
  });

  try {
    const response = await fetch(url);
    const html = await response.text();
    const techs = wappalyzer.analyze(html);
    return techs.map((t: any) => ({
      name: t.name,
      version: t.version,
      category: t.category,
    }));
  } catch (err) {
    console.error("Wappalyzer error:", err);
    return [];
  }
}