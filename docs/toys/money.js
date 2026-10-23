/* money.js — "Where the baht goes".
   One sale as a band of appliqué cloth hung on a line, sewn from pieces whose widths are to scale:
   maker, CCA, and Rung's 5% fee in two halves (block fund, Mot Dang).
   window.TOYS.money = function (root) {...}   Needs window.STITCH (stitch.js). */
(function () {
  "use strict";
  var S = window.STITCH;
  window.TOYS = window.TOYS || {};

  var RATE = 33.73;                         // baht per US$1, open.er-api.com, 23 Oct 2026
  var PRICES = [200, 300, 500, 700, 1000, 1500, 2000, 3000, 5000, 7000, 10000];
  var COL = ["#2f9e5b", "#23284a", "#e0457b", "#f6c445"];            // maker, CCA, block fund, Mot Dang
  var THREAD = ["#e3f3d8", "#d9dee2", "#fde0ea", "#b3611a"];         // running stitch on each piece
  var TABS = ["#d7263d", "#f28c28", "#2b59c3", "#7b4bb7", "#3fa7d6", "#e0457b"];
  var MARKET = "https://culturalcrossroadsasia.org/living-legacy-market";
  var RUNG = "https://rung.nanobotco.workers.dev";
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif';

  var NAME = [
    { en: "Maker", th: "ผู้ทำ" },
    { en: "CCA", th: "CCA" },
    { en: "Block fund", th: "กองทุนของย่าน" },
    { en: "Mot Dang", th: "มดแดง" }
  ];
  var TX = {
    label: { en: "Where the baht goes", th: "เงินแต่ละบาทไปที่ไหน" },
    price: { en: "Price", th: "ราคา" },
    share: { en: "CCA's share", th: "ส่วนของ CCA" },
    shareSub: { en: "CCA's to set", th: "CCA ตั้งเอง" },
    month: { en: "One month", th: "หนึ่งเดือน" },
    makers: { en: "Makers", th: "ผู้ทำ" },
    each: { en: "Pieces each", th: "ชิ้นต่อคน" },
    uMakers: { en: " makers", th: " คน" },
    uPieces: { en: " pieces", th: " ชิ้น" },
    sale: { en: "One sale: ", th: "ขาย 1 ชิ้น: " },
    fee: { en: "Rung fee 5%", th: "ค่าธรรมเนียม 5%" },
    t1: { en: "Sales a month", th: "ยอดขายต่อเดือน" },
    t2: { en: "Makers get a month", th: "ผู้ทำได้รับต่อเดือน" },
    t3: { en: "CCA gets a month", th: "CCA ได้รับต่อเดือน" },
    t4: { en: "CCA gets a year", th: "CCA ได้รับต่อปี" },
    t5: { en: "Block fund gets a month", th: "กองทุนของย่านได้รับต่อเดือน" }
  };

  /* ---------------------------------------------------------------- small helpers */
  function lang() { return document.documentElement.dataset.lang === "th" ? "th" : "en"; }
  function sep(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  /* exact to the satang: 37.5 -> 37.50, 1125 -> 1,125 */
  function num(n) {
    var c = Math.round(n * 100), w = Math.floor(c / 100), f = c % 100;
    return sep(w) + (f ? "." + (f < 10 ? "0" : "") + f : "");
  }
  function baht(n) { return "฿" + num(n); }
  function bahtR(n) { return "฿" + sep(n); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function el(tag, props, kids) {
    var e = document.createElement(tag), k;
    if (props) for (k in props) { if (k === "class") e.className = props[k]; else e.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  /* a line of words with links: parts are strings or {a: text, href: url} */
  function fill(node, parts) {
    node.textContent = "";
    parts.forEach(function (p) {
      if (typeof p === "string") node.appendChild(document.createTextNode(p));
      else { var a = el("a", { href: p.href, target: "_blank", rel: "noopener" }); a.textContent = p.a; node.appendChild(a); }
    });
  }
  function readGifts() {
    var m = /gifts=([0-9][0-9,]*(?:\.[0-9]+)?)/.exec(location.hash || "");
    if (!m) return null;
    var n = parseFloat(m[1].replace(/,/g, ""));
    return n > 0 && isFinite(n) ? n : null;
  }

  /* ---------------------------------------------------------------- cross-stitch figures (3 x 5 cells) */
  var GLYPH = {
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"],
    "2": ["111", "001", "111", "100", "111"], "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"], "7": ["111", "001", "010", "010", "010"],
    "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "111"],
    "%": ["101", "001", "010", "100", "101"]
  };
  function textW(str, cell) {
    var n = 0, i;
    for (i = 0; i < str.length; i++) n += GLYPH[str.charAt(i)][0].length + 1;
    return (n - 1) * cell;
  }
  function stitchText(str, x, y, cell, w, col) {
    var out = [], cx = x, i, r, q, g;
    var add = function (s) { out.push(s); };
    for (i = 0; i < str.length; i++) {
      g = GLYPH[str.charAt(i)];
      for (r = 0; r < g.length; r++) for (q = 0; q < g[r].length; q++) if (g[r].charAt(q) === "1") S.cross(cx + q * cell, y + r * cell, cell * 0.9, w, col).forEach(add);
      cx += (g[0].length + 1) * cell;
    }
    return out;
  }

  /* a cut piece: straight sides, top and bottom cut a little by hand, corners rounded */
  function rrect(x, y, w, h, r, seed, jit) {
    var rg = S.rng(seed || 1), p = [], i, m, f;
    r = Math.min(r, w / 2, h / 2);
    var arc = function (cx, cy, a0) { for (var j = 0; j <= 3; j++) { var a = a0 + (j / 3) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(x + r, y + r, Math.PI);
    m = Math.max(1, Math.round((w - 2 * r) / 8));
    for (i = 1; i < m; i++) { f = i / m; p.push([x + r + (w - 2 * r) * f, y + (jit ? (rg() - 0.5) * jit : 0)]); }
    arc(x + w - r, y + r, 1.5 * Math.PI);
    arc(x + w - r, y + h - r, 0);
    for (i = 1; i < m; i++) { f = i / m; p.push([x + w - r - (w - 2 * r) * f, y + h + (jit ? (rg() - 0.5) * jit : 0)]); }
    arc(x + r, y + h - r, 0.5 * Math.PI);
    return p;
  }

  /* the cloth moves: a travelling wave plus a slower one, in pixels */
  function wave(x, t, a) { return a * (Math.sin(x * 0.021 - t * 1.7) + 0.5 * Math.sin(x * 0.047 + t * 1.15 + 1.3)); }
  var SH = [];
  (function () { var q; for (q = -5; q <= 5; q++) SH.push(q === 0 ? null : q < 0 ? "rgba(255,250,235," + (0.04 * -q).toFixed(3) + ")" : "rgba(40,25,15," + (0.03 * q).toFixed(3) + ")"); })();

  var CSS = [
    "[data-toy=money] canvas{margin:0}",
    "[data-toy=money] .ctl.chips{margin:8px 0 0;gap:6px}",
    "[data-toy=money] .ctl .chip{display:inline-flex;gap:6px;align-items:baseline;padding:6px 11px;font-size:14px;line-height:1.3;border:2px solid transparent;color:#fff}",
    "[data-toy=money] .ctl .chip b{font-weight:800}",
    "[data-toy=money] .ctl .chip.c0{background:#2f9e5b}",
    "[data-toy=money] .ctl .chip.c1{background:#23284a}",
    "[data-toy=money] .ctl .chip.c2{background:#e0457b}",
    "[data-toy=money] .ctl .chip.c3{background:#f6c445;color:#1d1a16}",
    "[data-toy=money] .ctl .chip[aria-pressed=true]{border-color:#211a14;box-shadow:0 0 0 2px #fffaf0,0 0 0 4px #211a14}",
    "[data-toy=money] .say{font-size:15px;line-height:1.45}",
    "html[data-lang=th] [data-toy=money] .say{line-height:1.65}",
    "[data-toy=money] .ctl.sl{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(250px,100%),1fr));gap:2px 18px;margin:6px 2px 0}",
    "[data-toy=money] .ctl.sl label{display:grid;grid-template-columns:minmax(64px,31%) minmax(0,1fr) auto;gap:0 8px;align-items:center;min-height:28px;font-size:14px}",
    "[data-toy=money] .ctl.sl .lb{font-weight:600;line-height:1.25}",
    "[data-toy=money] .ctl.sl .lb small{display:block;font-weight:400;font-size:12px;color:#6a5b4b}",
    "[data-toy=money] .ctl.sl .lb small:empty{display:none}",
    "[data-toy=money] .ctl.sl input[type=range]{width:100%;margin:0;min-width:0}",
    "[data-toy=money] .ctl.sl output{min-width:58px;text-align:right}",
    "[data-toy=money] .mh{margin:10px 2px 0;padding-top:6px;border-top:1px dashed #c9b48f;font-weight:700;font-size:14px;line-height:1.4}",
    "[data-toy=money] .rows{margin:6px 0 0;padding:2px 10px;background:rgba(127,110,80,.09);border:1px solid #d9c9aa;border-radius:10px}",
    "[data-toy=money] .row{display:flex;justify-content:space-between;align-items:baseline;gap:10px;padding:2px 0;font-size:14px;line-height:1.35}",
    "[data-toy=money] .row+.row{border-top:1px dotted #c9b48f}",
    "[data-toy=money] .row span{color:#4a3d2f}",
    "[data-toy=money] .row b{font:700 16px/1.3 Georgia,'Noto Serif Thai',serif;white-space:nowrap}",
    "[data-toy=money] .gifts{margin:10px 2px 0;padding:6px 10px;border-left:4px solid #23284a;background:rgba(35,40,74,.06);font-size:14px;line-height:1.45}",
    "[data-toy=money] .foot{margin:10px 2px 0;font-size:13px;line-height:1.45;color:#6a5b4b}",
    "html[data-lang=th] [data-toy=money] .gifts,html[data-lang=th] [data-toy=money] .foot,html[data-lang=th] [data-toy=money] .row{line-height:1.5}"
  ].join("\n");

  window.TOYS.money = function (root) {
    var s = { pi: 5, share: 45, makers: 30, each: 4, sel: -1 };
    var gifts = readGifts(), gEl = null;
    var geom = null, bg = null, back = null, comp = null, bgKey = "", segL = [null, null, null, null], segKey = ["", "", "", ""];
    var compY = 0, dirty = true, coins = [], burst = null, lastBurst = -9, seedN = 1, lift = [0, 0, 0, 0], gust = 0, lastH = 0, sprites = {}, failed = false;

    /* ------------------------------------------------------------ build */
    root.setAttribute("role", "group");
    var style = el("style"); style.textContent = CSS; root.appendChild(style);
    var canvas = el("canvas", { "aria-hidden": "true" }); canvas.style.height = "200px"; root.appendChild(canvas);

    var chipBox = el("div", { class: "ctl chips" });
    var chips = [0, 1, 2, 3].map(function (i) {
      var nm = el("span"), amt = el("b"), btn = el("button", { type: "button", class: "chip c" + i, "aria-pressed": "false" }, [nm, amt]);
      btn.addEventListener("click", function () { pick(i); });
      chipBox.appendChild(btn);
      return { btn: btn, nm: nm, amt: amt };
    });
    root.appendChild(chipBox);
    var say = el("p", { class: "say", "aria-live": "polite" }); root.appendChild(say);

    function slider(min, max, step, val) {
      var main = el("span"), sub = el("small"), lb = el("span", { class: "lb" }, [main, sub]), out = el("output"), input = el("input", { type: "range", min: min, max: max, step: step });
      input.value = val;
      return { wrap: el("label", null, [lb, input, out]), lb: main, sub: sub, out: out, input: input };
    }
    var pr = slider(0, PRICES.length - 1, 1, s.pi), sh = slider(0, 50, 5, s.share);
    root.appendChild(el("div", { class: "ctl sl" }, [pr.wrap, sh.wrap]));
    var mh = el("p", { class: "mh" }); root.appendChild(mh);
    var mk = slider(5, 300, 5, s.makers), pc = slider(1, 20, 1, s.each);
    root.appendChild(el("div", { class: "ctl sl" }, [mk.wrap, pc.wrap]));
    var rowsBox = el("div", { class: "rows" });
    var tl = [0, 1, 2, 3, 4].map(function () {
      var sm = el("span"), b = el("b");
      rowsBox.appendChild(el("div", { class: "row" }, [sm, b]));
      return { sm: sm, b: b };
    });
    root.appendChild(rowsBox);
    var foot = el("p", { class: "foot" }); root.appendChild(foot);

    /* ------------------------------------------------------------ numbers */
    function calc() {
      var price = PRICES[s.pi], half = price / 40, amt = [price * (95 - s.share) / 100, price * s.share / 100, half, half], sales = s.makers * s.each;
      return { price: price, amt: amt, sales: sales, gross: sales * price, maker: sales * amt[0], cca: sales * amt[1], ccaYear: 12 * sales * amt[1], fund: sales * amt[2] };
    }

    /* ------------------------------------------------------------ words */
    function noteParts(L) {
      return L === "th" ? ["ที่ 45% ผู้ทำเก็บไว้ 50% เหมือนใน", { a: "หน้าตลาดของ CCA", href: MARKET }] : ["At 45%, the maker keeps 50%, as on ", { a: "CCA's market page", href: MARKET }, "."];
    }
    function sayParts(i, v, L) {
      var a = baht(v.amt[i < 0 ? 0 : i]), th = L === "th", at45 = s.share === 45;
      if (i < 0) {
        if (at45) return th ? noteParts(L).concat([" แตะที่แถบผ้าเพื่อดูแต่ละส่วน"]) : noteParts(L).concat([" Tap a part of the band."]);
        return th ? ["ค่าธรรมเนียมของ Rung คือ 5% ของยอดที่จ่าย ครึ่งหนึ่งเข้ากองทุนของย่าน แตะที่แถบผ้าเพื่อดูแต่ละส่วน"] : ["Rung's fee is 5% of what is paid; half goes to the block fund. Tap a part of the band."];
      }
      if (i === 0) {
        if (at45) return th ? ["ผู้ทำได้ " + a + " "].concat(noteParts(L)) : ["The maker gets " + a + ". "].concat(noteParts(L));
        return th ? ["ผู้ทำได้ " + a + " คือราคาหลังหักส่วนของ CCA และค่าธรรมเนียม 5% ของ Rung"] : ["The maker gets " + a + ": the price less CCA's share and Rung's 5% fee."];
      }
      if (i === 1) {
        if (s.share === 0) return th ? ["ส่วนของ CCA ตั้งไว้ที่ 0% ตรงนี้ CCA เป็นผู้ตั้งเอง"] : ["CCA's share is 0% here. It is CCA's to set."];
        return th ? ["CCA ได้ " + a + " (" + s.share + "%) ส่วนนี้ CCA เป็นผู้ตั้งเอง"] : ["CCA gets " + a + " (" + s.share + "%). The share is CCA's to set."];
      }
      if (i === 2) return th ? ["กองทุนของย่านได้ " + a + " คือครึ่งหนึ่งของค่าธรรมเนียม Rung ร้านค้าในย่านเสนอและโหวตกันว่าจะใช้อย่างไร"] : ["The block fund gets " + a + ", half of Rung's fee; the shops on a block propose and vote how to spend it."];
      return th ? ["มดแดงได้ " + a + " คืออีกครึ่งหนึ่งของค่าธรรมเนียม 5% ที่ Rung ระบบร้านค้าของมดแดงเก็บ"] : ["Mot Dang gets " + a + ", half of the 5% fee that Rung, its shop system, charges."];
    }
    function footParts(L) {
      return L === "th" ? ["Rung คือระบบร้านค้าของมดแดง (", { a: "ตัวอย่างที่ใช้งานได้", href: RUNG }, ") ค่าธรรมเนียมคือ 5% ของยอดที่จ่าย ครึ่งหนึ่งเข้ากองทุนของย่าน"]
        : ["Rung is Mot Dang's shop system (", { a: "live demo", href: RUNG }, "). Its fee is 5% of what is paid; half goes to the block fund."];
    }
    function giftsText(v, L) {
      var thb = gifts * RATE, approx = Math.round(thb / 50) * 50, per = v.amt[1], n = per > 0 ? Math.ceil(thb / 12 / per - 1e-9) : 0;
      if (L === "th") {
        return "เงินบริจาคปีที่แล้ว: US$" + num(gifts) + " ≈ ฿" + sep(approx) + " ที่ ฿33.73 ต่อ US$1 (open.er-api.com, 23 Oct 2026) ยอดขายที่ให้ส่วนของ CCA เท่ากัน: " +
          (per > 0 ? sep(n) + " ชิ้นต่อเดือน" : "ไม่มี เมื่อส่วนของ CCA เป็น 0%");
      }
      return "Gifts last year: US$" + num(gifts) + " ≈ ฿" + sep(approx) + " at ฿33.73 per US$1 (open.er-api.com, 23 Oct 2026). " +
        (per > 0 ? "Sales that match it in CCA's share: " + sep(n) + " pieces a month." : "At a 0% share, no number of sales matches it.");
    }

    function render() {
      var L = lang(), v = calc(), i;
      root.setAttribute("aria-label", TX.label[L]);
      for (i = 0; i < 4; i++) {
        chips[i].nm.textContent = NAME[i][L];
        chips[i].amt.textContent = baht(v.amt[i]);
        chips[i].btn.setAttribute("aria-pressed", s.sel === i ? "true" : "false");
      }
      pr.lb.textContent = TX.price[L]; pr.out.textContent = baht(v.price); pr.input.setAttribute("aria-valuetext", baht(v.price));
      sh.lb.textContent = TX.share[L]; sh.sub.textContent = TX.shareSub[L]; sh.out.textContent = s.share + "%"; sh.input.setAttribute("aria-valuetext", s.share + "%");
      mh.textContent = TX.month[L];
      mk.lb.textContent = TX.makers[L]; mk.out.textContent = s.makers + TX.uMakers[L];
      pc.lb.textContent = TX.each[L]; pc.out.textContent = s.each + TX.uPieces[L];
      tl[0].sm.textContent = TX.t1[L] + " (" + sep(v.sales) + TX.uPieces[L] + ")"; tl[0].b.textContent = bahtR(v.gross);
      tl[1].sm.textContent = TX.t2[L]; tl[1].b.textContent = bahtR(v.maker);
      tl[2].sm.textContent = TX.t3[L]; tl[2].b.textContent = bahtR(v.cca);
      tl[3].sm.textContent = TX.t4[L]; tl[3].b.textContent = bahtR(v.ccaYear);
      tl[4].sm.textContent = TX.t5[L]; tl[4].b.textContent = bahtR(v.fund);
      fill(say, sayParts(s.sel, v, L));
      fill(foot, footParts(L));
      if (gifts !== null) {
        if (!gEl) { gEl = el("p", { class: "gifts" }); root.insertBefore(gEl, foot); }
        gEl.textContent = giftsText(v, L);
      } else if (gEl) { root.removeChild(gEl); gEl = null; }
    }

    /* keep the say line from jumping: reserve the height of the longest of its sentences at this width */
    function reserveSay() {
      var ghost = say.cloneNode(false), v = calc(), L = lang(), best = 0, i;
      ghost.removeAttribute("aria-live"); ghost.setAttribute("aria-hidden", "true"); ghost.style.cssText = "visibility:hidden;min-height:0";
      say.style.minHeight = "0";
      say.parentNode.insertBefore(ghost, say.nextSibling);
      for (i = -1; i < 4; i++) { fill(ghost, sayParts(i, v, L)); best = Math.max(best, ghost.offsetHeight); }
      say.parentNode.removeChild(ghost);
      say.style.minHeight = best ? best + "px" : "";
    }

    /* one viewport: the canvas takes what the viewport leaves after the controls, up to about 60svh */
    function sizeCanvas() {
      var cw = canvas.getBoundingClientRect().width;
      if (!cw) return;
      var vh = window.innerHeight || 700, ch = canvas.offsetHeight, maxH = Math.min(0.6 * vh, cw * (cw < 520 ? 0.74 : 0.5));
      var all = vh - (root.offsetHeight - ch) - 12;                                          /* the whole toy in one viewport */
      var top = vh - (mh.getBoundingClientRect().top - root.getBoundingClientRect().top - ch + 12) - 12;   /* canvas and its controls, the month below */
      var h = Math.round(all >= 170 ? clamp(all, 170, maxH) : clamp(top, 150, maxH));
      if (h !== lastH) { canvas.style.height = h + "px"; lastH = h; }
    }
    function fit() { reserveSay(); sizeCanvas(); }

    /* ------------------------------------------------------------ the band */
    function geometry(W, H) {
      var m = Math.round(clamp(W * 0.045, 12, 34)), bandW = W - 2 * m, bh = Math.round(clamp(H * 0.42, 40, 150));
      var tabH = 16, lab = 36, gh = tabH + bh + lab, top = Math.round(Math.max(tabH + 8, (H - gh) / 2 + tabH + 4));
      var pc = [0, 95 - s.share, 95, 97.5, 100], e = pc.map(function (p) { return m + Math.round(bandW * p / 100); }), seg = [], i;
      for (i = 0; i < 4; i++) seg.push({ x: e[i], w: e[i + 1] - e[i] });
      return { W: W, H: H, m: m, bandW: bandW, bh: bh, top: top, tabH: tabH, lab: lab, seg: seg };
    }

    function bakeBg(W, H, dpr) {
      var L = S.layer(W, H, dpr), c = L.ctx;
      S.cloth(c, [[0, 0], [W, 0], [W, H], [0, H]], "#e8dcc2", { shadow: false, pitch: 3.4, seed: 81, grain: 0.42 });
      var hem = rrect(8, 8, W - 16, H - 16, 7, 5, 0);
      S.sew(c, S.running(hem.concat([hem[0]]), 5, 4, 1.1, "#b8574a"));
      return L;
    }

    /* the line and its loops of cloth, drawn once per size */
    function bakeBack(g, dpr, compH) {
      var L = S.layer(g.W, compH, dpr), c = L.ctx, cy = g.top - g.tabH + 3 - compY, n = Math.max(3, Math.round(g.bandW / 90)), k, x;
      for (k = 0; k < n; k++) {
        x = g.m + (k + 0.5) * g.bandW / n;
        S.applique(c, rrect(x - 5, cy - 3, 10, (g.top - compY) + 7 - (cy - 3), 2, 60 + k, 0), TABS[k % TABS.length], "#fff7e0", { inset: 1.7, dash: 2.4, gap: 2.2, tw: 0.8, seed: 30 + k, pitch: 2.4 });
      }
      S.sew(c, S.stem([[-6, cy], [g.W + 6, cy]], 7, 2.4, "#7a5836", 5));
      return L;
    }

    /* one sewn piece of the band, with its own stitches */
    function bakeSeg(i, g, dpr, label) {
      var sg = g.seg[i], w = sg.w, h = g.bh, pad = 5, narrow = w < 14, push, sts = [], x, y, k;
      var L = S.layer(w + 2 * pad + 1, h + 2 * pad, dpr), c = L.ctx, inset = narrow ? Math.max(1, w * 0.16) : 2.4;
      push = function (q) { sts.push(q); };
      S.applique(c, rrect(pad, pad, w + (i < 3 ? 0.6 : 0), h, narrow ? 1.6 : 2.8, 40 + i, 0.8), COL[i], THREAD[i],
        { inset: inset, dash: narrow ? 2.4 : 3.4, gap: narrow ? 2.4 : 2.8, tw: narrow ? 0.7 : 0.95, seed: 21 + i, pitch: narrow ? 2.4 : 3.0 });
      if (narrow) {
        var dot = i === 3 ? "#c9741c" : S.SILVER, rd = clamp(w * 0.17, 0.9, 1.5);
        for (y = pad + 8; y < pad + h - 6; y += 9) sts.push(S.knot([pad + w / 2, y], rd, dot));
      } else {
        var cs = clamp(h * 0.065, 2.6, 5), tw = Math.max(0.9, cs * 0.27), base = i === 0 ? S.mix(COL[0], "#ffffff", 0.55) : S.SILVER, acc = i === 0 ? "#f6e7a8" : COL[2];
        var x0 = pad + inset + 5, x1 = pad + w - inset - 5, step = Math.max(cs + 1.8, (x1 - x0) / 90), yA = pad + inset + 4, yB = pad + h - inset - 4 - cs, col;
        for (x = x0, k = 0; x + cs <= x1; x += step, k++) {
          col = k % 5 === 2 ? acc : base;
          S.cross(x, yA, cs, tw, col).forEach(push); S.cross(x, yB, cs, tw, col).forEach(push);
        }
        if (label) {
          var cell = Math.min(clamp((h - 24) / 5, 2.4, 6.5), (w - 2 * inset - 18) / (3 * label.length - 1)), tWd = textW(label, cell);
          if (cell >= 2.4) stitchText(label, pad + (w - tWd) / 2, pad + (h - 5 * cell) / 2, cell, Math.max(0.9, cell * 0.28), i === 0 ? "#f4f8e4" : "#eef0f2").forEach(push);
        }
      }
      S.sew(c, sts);
      return L;
    }

    function drawLabels(c, g) {
      var L = lang(), fs = Math.round(clamp(g.W * 0.036, 11, 15)), y0 = g.top + g.bh + 5 - compY, x1 = g.seg[2].x, x2 = g.seg[3].x + g.seg[3].w, xm = (x1 + x2) / 2;
      S.sew(c, S.stem(S.curve([[x1 + 0.5, y0], [x1 + 0.5, y0 + 4], [xm - 2, y0 + 4], [xm, y0 + 7], [xm + 2, y0 + 4], [x2 - 0.5, y0 + 4], [x2 - 0.5, y0]], false, 4), 5, 1.1, "#6b4a2b", 9));
      c.save(); c.font = "700 " + fs + "px " + FONT; c.textBaseline = "top"; c.fillStyle = "#3b2c1c";
      var ft = TX.fee[L], fw = c.measureText(ft).width, lt = TX.sale[L] + baht(PRICES[s.pi]), lw = c.measureText(lt).width;
      c.textAlign = "right"; c.fillText(ft, x2, y0 + 13);
      if (g.m + lw + 10 < x2 - fw) { c.textAlign = "left"; c.fillText(lt, g.m, y0 + 13); }
      c.restore();
    }

    function bake(st) {
      var W = st.w, H = st.h, dpr = st.dpr, g = geometry(W, H), key = W + "x" + H + "@" + dpr, i, c;
      geom = g;
      compY = Math.max(0, g.top - g.tabH - 8);
      var compH = Math.max(10, Math.min(H, g.top + g.bh + g.lab + 6) - compY);
      if (bgKey !== key) { bg = bakeBg(W, H, dpr); back = bakeBack(g, dpr, compH); bgKey = key; segKey = ["", "", "", ""]; }
      for (i = 0; i < 4; i++) {
        var sg = g.seg[i];
        if (sg.w <= 0) { segL[i] = null; segKey[i] = ""; continue; }
        var lab = i === 0 ? (95 - s.share) + "%" : i === 1 ? s.share + "%" : "", sk = [sg.w, g.bh, lab, dpr].join(":");
        if (segKey[i] !== sk) { segL[i] = bakeSeg(i, g, dpr, lab); segKey[i] = sk; }
        segL[i].ox = sg.x - 5; segL[i].oy = g.top - 5;
      }
      if (!comp || comp.w !== W || comp.h !== compH || comp.scale !== dpr) comp = S.layer(W, compH, dpr);
      c = comp.ctx; c.clearRect(0, 0, W, compH);
      c.drawImage(back.canvas, 0, 0, W, compH);
      for (i = 0; i < 4; i++) if (segL[i]) c.drawImage(segL[i].canvas, segL[i].ox, segL[i].oy - compY, segL[i].w, segL[i].h);
      drawLabels(c, g);
      dirty = false;
    }

    /* a coin is a cut disc of silver cloth, a stitched rim and a satin face (S.coin); baked once per size */
    function circle(cx, cy, rad, n) {
      var p = [], i;
      for (i = 0; i <= n; i++) p.push([cx + Math.cos(i / n * Math.PI * 2) * rad, cy + Math.sin(i / n * Math.PI * 2) * rad]);
      return p;
    }
    function sprite(r, dpr) {
      var key = Math.round(r * 10) + ":" + dpr, sp = sprites[key];
      if (!sp) {
        var sz = Math.ceil(r * 2 + 8), cx = sz / 2;
        sp = sprites[key] = S.layer(sz, sz, dpr);
        if (r >= 3.2) {
          S.cloth(sp.ctx, circle(cx, cx, r, 22), "#cfd6db", { pitch: Math.max(1.4, r * 0.3), seed: 5, grain: 0.5 });
          S.sew(sp.ctx, S.stem(circle(cx, cx, r * 0.88, 20), 2.2, Math.max(0.7, r * 0.18), "#8f98a1", 3));
          S.sew(sp.ctx, S.coin(cx, cx, r * 0.66));
        } else S.sew(sp.ctx, S.coin(cx, cx, r));
      }
      return sp;
    }
    function spawn(segs, t) {
      var r = S.rng(1000 + seedN++);
      segs.forEach(function (i) {
        var sg = geom.seg[i]; if (!sg || sg.w <= 0) return;
        var n = sg.w >= 40 ? 3 : sg.w >= 12 ? 2 : 1, k;
        for (k = 0; k < n; k++) coins.push({ x: sg.x + sg.w * (0.5 + (r() - 0.5) * (n > 1 ? 0.6 : 0.2)), r: clamp(sg.w * 0.3, 2.4, 6.5), t0: t + k * 0.11 + r() * 0.12, y1: geom.top + geom.bh * (0.35 + r() * 0.3), ph: r() * 6.28, fall: 0.5 + r() * 0.12 });
      });
    }
    function shade(c, x, ww, y, h, t, amp) {
      var q = Math.round(clamp((wave(x + ww + 3, t, amp) - wave(x - 3, t, amp)) / (ww + 6) * 26, -5, 5));
      if (!q) return;
      c.fillStyle = SH[q + 5]; c.fillRect(x, y, ww + 0.6, h);
    }
    function drawLifted(c, i, k, t, amp) {
      var L = segL[i], g = geom, sg = g.seg[i], up = 10 * k, dyc = wave(sg.x + sg.w / 2, t, amp), x, ww, dy, j;
      c.save();
      c.fillStyle = "rgba(30,18,10," + (0.55 * k).toFixed(3) + ")"; c.fillRect(sg.x, g.top + dyc, sg.w, g.bh);                  /* the seat it came from */
      for (j = 1; j < 4; j++) { c.fillStyle = "rgba(40,25,15," + (0.07 * k).toFixed(3) + ")"; c.fillRect(sg.x + 2 * k - j * 1.5, g.top + dyc + 4 * k - j * 1.5, sg.w + j * 3, g.bh + j * 3); }
      c.restore();
      for (x = 0; x < L.w; x += 2) {
        ww = Math.min(2, L.w - x); dy = wave(L.ox + x + ww / 2, t, amp) - up;
        c.drawImage(L.canvas, x * L.scale, 0, Math.min((ww + 0.6) * L.scale, L.canvas.width - x * L.scale), L.canvas.height, L.ox + x, L.oy + dy, Math.min(ww + 0.6, L.w - x), L.h);
        if (x >= 5 && x < 5 + sg.w) shade(c, L.ox + x, ww, L.oy + 6 + dy, g.bh - 2, t, amp);
      }
    }
    function drawCoins(c, t, amp, dpr) {
      var j, k, u, v, f, y, a, fx, sp;
      for (j = coins.length - 1; j >= 0; j--) {
        k = coins[j]; u = t - k.t0; if (u < 0) continue;
        a = 1; fx = 1; f = 1;
        if (u < k.fall) { f = u / k.fall; y = -14 + (k.y1 + 14) * f * f; fx = Math.max(0.45, Math.abs(Math.cos(u * 11 + k.ph))); }
        else {
          v = u - k.fall;
          if (v > 1) { coins.splice(j, 1); continue; }
          y = k.y1 - (v < 0.45 ? Math.abs(Math.sin(v / 0.45 * Math.PI * 1.5)) * (1 - v / 0.45) * 7 : 0);
          if (v > 0.5) a = 1 - (v - 0.5) / 0.5;
        }
        y += wave(k.x, t, amp) * f;
        sp = sprite(k.r, dpr);
        c.save(); c.globalAlpha = a; c.translate(k.x, y); c.scale(fx, 1); c.drawImage(sp.canvas, -sp.w / 2, -sp.h / 2, sp.w, sp.h); c.restore();
      }
    }

    function draw(st, dt) {
      if (failed) return;
      try {
        var c = st.ctx, W = st.w, H = st.h, dpr = st.dpr, i, x, ww, dy;
        if (W < 80 || H < 80) return;
        if (dirty || !geom || geom.W !== W || geom.H !== H || bgKey !== W + "x" + H + "@" + dpr) bake(st);
        var g = geom, t = st.t, sw = W > 640 ? 3 : 2;
        gust = S.reduced ? 0 : gust * Math.exp(-dt * 1.7);
        var amp = clamp(H * 0.009, 1.2, 3) * (1 + 2.2 * gust);
        if (burst) { if (S.reduced) burst = null; else if (burst.force || t - lastBurst >= 0.5) { spawn(burst.segs, t); lastBurst = t; burst = null; } }
        c.drawImage(bg.canvas, 0, 0, W, H);
        for (x = 0; x < W; x += sw) {
          ww = Math.min(sw, W - x); dy = wave(x + ww / 2, t, amp);
          c.drawImage(comp.canvas, x * dpr, 0, Math.min((ww + 0.6) * dpr, comp.canvas.width - x * dpr), comp.canvas.height, x, compY + dy, Math.min(ww + 0.6, W - x), comp.h);
          if (x >= g.m && x < g.m + g.bandW) shade(c, x, ww, g.top + dy + 1, g.bh - 2, t, amp);
        }
        for (i = 0; i < 4; i++) {
          var target = s.sel === i ? 1 : 0;
          lift[i] = S.reduced ? target : lift[i] + (target - lift[i]) * (1 - Math.exp(-dt * 13));
          if (Math.abs(lift[i] - target) < 0.004) lift[i] = target;
          if (lift[i] > 0.004 && segL[i]) drawLifted(c, i, lift[i], t, amp);
        }
        drawCoins(c, t, amp, dpr);
      } catch (e) { failed = true; if (window.console) console.error("money.js", e); }
    }

    /* ------------------------------------------------------------ input */
    function hitSeg(x, y) {
      var g = geom, best = -1, bd = 1e9, i, sg, pad, d;
      if (!g || y < g.top - 12 || y > g.top + g.bh + 12) return -1;
      for (i = 0; i < 4; i++) {
        sg = g.seg[i]; if (sg.w <= 0) continue;
        pad = Math.max(0, (16 - sg.w) / 2);
        if (x >= sg.x - pad && x <= sg.x + sg.w + pad) { d = Math.abs(x - (sg.x + sg.w / 2)); if (d < bd) { bd = d; best = i; } }
      }
      return best;
    }
    function ting(n) { try { S.ting(n, 0, 0.04); } catch (e) { /* no audio here */ } }
    function pick(i) {
      s.sel = s.sel === i ? -1 : i;
      if (s.sel >= 0) { burst = { segs: [i], force: true }; ting(7 + i * 3); }
      render(); st.kick();
    }
    function changed(sale) {
      render();
      if (sale) { dirty = true; burst = { segs: [0, 1, 2, 3], force: false }; }
      st.kick();
    }
    pr.input.addEventListener("input", function () { s.pi = +pr.input.value; changed(true); });
    sh.input.addEventListener("input", function () { s.share = +sh.input.value; changed(true); });
    mk.input.addEventListener("input", function () { s.makers = +mk.input.value; changed(false); });
    pc.input.addEventListener("input", function () { s.each = +pc.input.value; changed(false); });
    canvas.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect(), i = hitSeg(e.clientX - r.left, e.clientY - r.top);
      if (i >= 0) pick(i);
      else { gust = 1; ting(31); if (s.sel >= 0) { s.sel = -1; render(); } st.kick(); }
    });
    document.addEventListener("langchange", function () { dirty = true; render(); fit(); st.kick(); });
    window.addEventListener("hashchange", function () { gifts = readGifts(); render(); });
    window.addEventListener("resize", function () { fit(); });
    window.addEventListener("load", function () { fit(); });
    if (window.ResizeObserver) { var lastW = 0; new ResizeObserver(function () { var w = root.clientWidth; if (w && Math.abs(w - lastW) > 1) { lastW = w; fit(); } }).observe(root); }

    var st = S.stage(canvas, draw, { resize: function () { dirty = true; } });
    render(); fit(); st.redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); dirty = true; st.kick(); });
  };
})();
