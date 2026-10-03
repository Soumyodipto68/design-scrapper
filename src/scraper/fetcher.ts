import { chromium } from "playwright";

let browser: any = null;

export async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

export async function fetchPage(url: string) {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
  });
  const page = await context.newPage();

  // Capture response headers from the main document request
  let headers: Record<string, string> = {};
  page.on("response", async (response: any) => {
    if (response.url() === url || response.url().startsWith(url)) {
      headers = await response.allHeaders();
    }
  });

  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 });

    const screenshot = await page.screenshot({
      type: "png",
      fullPage: false,
    });
    const screenshotBase64 = screenshot.toString("base64");
    const data = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("*"));
      const styles: any[] = [];

      elements.forEach((el) => {
        const computed = window.getComputedStyle(el);
        styles.push({
          tag: el.tagName.toLowerCase(),
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          fontFamily: computed.fontFamily,
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          letterSpacing: computed.letterSpacing,
          paddingTop: computed.paddingTop,
          paddingRight: computed.paddingRight,
          paddingBottom: computed.paddingBottom,
          paddingLeft: computed.paddingLeft,
          marginTop: computed.marginTop,
          marginBottom: computed.marginBottom,
          borderRadius: computed.borderRadius,
          boxShadow: computed.boxShadow,
        });
      });

      // ── Heading hierarchy ──────────────────────
      const headings: any[] = [];
      ["h1", "h2", "h3", "h4", "h5", "h6"].forEach((tag) => {
        document.querySelectorAll(tag).forEach((el) => {
          const c = window.getComputedStyle(el);
          headings.push({
            level: tag,
            text: (el.textContent || "").trim().slice(0, 60),
            fontSize: c.fontSize,
            fontWeight: c.fontWeight,
            fontFamily: c.fontFamily.split(",")[0].replace(/['"]/g, ""),
            color: c.color,
          });
        });
      });

      // ── Button styles ──────────────────────────
      const buttons: any[] = [];
      document
        .querySelectorAll("button, a.btn, a[class*='button'], [role='button']")
        .forEach((el) => {
          const c = window.getComputedStyle(el);
          buttons.push({
            text: (el.textContent || "").trim().slice(0, 40),
            backgroundColor: c.backgroundColor,
            color: c.color,
            borderRadius: c.borderRadius,
            padding: `${c.paddingTop} ${c.paddingRight}`,
            border: c.border,
            fontSize: c.fontSize,
            fontWeight: c.fontWeight,
          });
        });

      // Screenshot as base64
      return {
        styles,
        headings: headings.slice(0, 30),
        buttons: buttons.slice(0, 15),
        viewportWidth: window.innerWidth,
        html: document.documentElement.outerHTML,
      };
    });

    return {
      ...data,
      headers,
      screenshot: screenshotBase64,
    };
  } finally {
    await context.close();
  }

}
