// shoot.mjs — screenshots in real device emulation (headless Chrome alone cannot go below ~500 px wide).
// node tools/shoot.mjs <url> <out-prefix> [WxH ...] [--full] [--wait ms] [--click selector]
import { createRequire } from "module";
const require = createRequire("/Users/annikapeacock/Developer/claude code projects/share-cards/package.json");
const { chromium } = require("playwright-core");
const args = process.argv.slice(2);
const url = args[0], out = args[1];
const sizes = args.slice(2).filter((a) => /^\d+x\d+$/.test(a));
const full = args.includes("--full");
const wi = args.indexOf("--wait"), wait = wi > 0 ? +args[wi + 1] : 2500;
const ci = args.indexOf("--click"), click = ci > 0 ? args[ci + 1] : null;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const errors = [];
for (const s of sizes.length ? sizes : ["390x844", "1440x900"]) {
  const [w, h] = s.split("x").map(Number);
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") errors.push(`${s} ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`${s} ${e.message}`));
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(wait);
  if (click) { await page.click(click).catch(() => {}); await page.waitForTimeout(1200); }
  await page.screenshot({ path: `${out}-${s}.png`, fullPage: full });
  await ctx.close();
}
await browser.close();
console.log(errors.length ? "ERRORS\n" + errors.join("\n") : "no console errors");
