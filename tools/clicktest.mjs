// clicktest.mjs — load the page, press every button, switch languages, report console errors
import { launch } from "./browser.mjs";
const url = process.argv[2] || "http://127.0.0.1:9013/index.html";
const b = await launch();
const errs = [];
for (const vp of [{ width: 390, height: 844, mobile: true }, { width: 1440, height: 900, mobile: false }]) {
  const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.mobile, hasTouch: vp.mobile });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errs.push(`${vp.width} pageerror ${e.message}`));
  p.on("console", (m) => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(`${vp.width} console ${m.text()}`); });
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const toys = await p.$$eval(".toy[data-toy]", (els) => els.map((e) => e.dataset.toy));
  for (const l of ["th", "en"]) { await p.click(`.langsw button[data-l=${l}]`); await p.waitForTimeout(300); }
  await p.click("#bWheel"); await p.click("#bSwing");
  const btns = await p.$$(".toy button");
  let n = 0; for (const bt of btns) { try { await bt.scrollIntoViewIfNeeded(); await bt.click({ timeout: 2000 }); n++; await p.waitForTimeout(150); } catch (e) { errs.push(`${vp.width} click failed: ${e.message.split("\n")[0]}`); } }
  const canv = await p.$$(".toy canvas"); for (const c of canv) { try { await c.scrollIntoViewIfNeeded(); await c.click({ timeout: 2000 }); } catch (e) {} }
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(`${vp.width}: toys ${toys.join(",")} · buttons pressed ${n}/${btns.length} · horizontal overflow ${overflow}px`);
  await ctx.close();
}
await b.close();
console.log(errs.length ? "ERRORS\n" + errs.join("\n") : "no errors");
