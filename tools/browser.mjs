// browser.mjs — one place to get a browser for the tools.
// playwright-core comes from this project (npm install), or from the folder named in PLAYWRIGHT_FROM.
// CHROME names a Chrome or Chromium executable; without it, playwright uses the browser it installed
// (npx playwright-core install chromium).
import { createRequire } from "module";
const from = process.env.PLAYWRIGHT_FROM ? process.env.PLAYWRIGHT_FROM.replace(/\/?$/, "/") + "package.json" : import.meta.url;
export const { chromium } = createRequire(from)("playwright-core");
export const launch = (opts = {}) => chromium.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}), ...opts });
