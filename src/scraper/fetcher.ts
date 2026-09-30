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
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

  const data = await page.evaluate(() => {
    // Collect all computed styles for every element
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
        paddingLeft: computed.paddingLeft,
        marginTop: computed.marginTop,
        marginLeft: computed.marginLeft,
      });
    });

    // Collect viewport size
    const viewportWidth = window.innerWidth;

    // Collect all link hrefs (for framework detection hints)
    const scripts = Array.from(document.querySelectorAll("script[src]")).map(
      (s) => s.src
    );
    const linkStyles = Array.from(document.querySelectorAll("link[rel=stylesheet]")).map(
      (l) => l.href
    );

    return { styles, viewportWidth, scripts, linkStyles };
  });

  await page.close();
  return data;
}