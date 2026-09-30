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

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

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
        paddingTop: computed.paddingTop,
        marginTop: computed.marginTop,
      });
    });

    return {
      styles,
      viewportWidth: window.innerWidth,
      html: document.documentElement.outerHTML,
    };
  });

  await page.close();
  await context.close();

  return {
    ...data,
    headers,
  };
}