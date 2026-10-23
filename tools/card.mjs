// card.mjs — the share card: the page's own hero at 1200x630 (#card mode), saved as docs/card.jpg
import { launch } from "./browser.mjs";
const url = process.argv[2] || "http://127.0.0.1:9013/index.html?lang=en#card";
const out = process.argv[3] || decodeURIComponent(new URL("../docs/card.jpg", import.meta.url).pathname);
const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(3500);
await p.screenshot({ path: out, type: "jpeg", quality: 88 });
await b.close();
console.log(out);
