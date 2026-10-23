/* phone.js — "A phone is enough".
   A phone in appliqué, held in a hand, with five steps sewn on its screen: LINE sign-in, a photograph,
   the page, an order, a PromptPay QR. The steps advance on their own every 2.5 s, on a tap and on Next.
   window.TOYS.phone = function (root) {...}   Needs window.STITCH (stitch.js). */
(function () {
  "use strict";
  var S = window.STITCH;
  window.TOYS = window.TOYS || {};

  var SKIN = "#c98d62", SKIN_THREAD = "#e8c29b", SKIN_D = "#8f5a3a", NAIL = "#f6e1d8";
  var BODY = "#1f2333", SCREEN = "#f8f1df", INK = "#1f2333";
  var FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans Thai", sans-serif';
  var STEP_MS = 2.5;

  var STEPS = [
    { en: "Sign in with LINE — no email needed", th: "เข้าสู่ระบบด้วย LINE ไม่ต้องใช้อีเมล" },
    { en: "Photograph the piece", th: "ถ่ายรูปชิ้นงาน" },
    { en: "Your page is live", th: "หน้าของคุณออนไลน์แล้ว" },
    { en: "An order comes in", th: "มีออเดอร์เข้ามา" },
    { en: "Paid by PromptPay QR", th: "จ่ายด้วย PromptPay QR" }
  ];
  var TX = {
    label: { en: "A phone is enough", th: "แค่มีโทรศัพท์ก็พอ" },
    next: { en: "Next", th: "ถัดไป" },
    again: { en: "Again", th: "เริ่มใหม่" },
    order: { en: "1 order · ฿1,500", th: "1 ออเดอร์ · ฿1,500" }
  };

  function lang() { return document.documentElement.dataset.lang === "th" ? "th" : "en"; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function el(tag, props, kids) {
    var e = document.createElement(tag), k;
    if (props) for (k in props) { if (k === "class") e.className = props[k]; else e.setAttribute(k, props[k]); }
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function circle(cx, cy, rad, n) {
    var p = [], i;
    for (i = 0; i <= n; i++) p.push([cx + Math.cos(i / n * Math.PI * 2) * rad, cy + Math.sin(i / n * Math.PI * 2) * rad]);
    return p;
  }
  /* a cut piece with straight sides and rounded corners */
  function rrect(x, y, w, h, r) {
    var p = [];
    r = Math.min(r, w / 2, h / 2);
    var arc = function (cx, cy, a0) { for (var j = 0; j <= 4; j++) { var a = a0 + (j / 4) * Math.PI / 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
    arc(x + r, y + r, Math.PI); arc(x + w - r, y + r, 1.5 * Math.PI); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, 0.5 * Math.PI);
    return p;
  }
  /* a tapered capsule from a to b: a finger, a nail, a thumb joint */
  function capsule(a, b, ra, rb) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, ang = Math.atan2(dy, dx), p = [], i, t, n = 9;
    p.push([a[0] + nx * ra, a[1] + ny * ra]); p.push([b[0] + nx * rb, b[1] + ny * rb]);
    for (i = 1; i < n; i++) { t = ang + Math.PI / 2 - (i / n) * Math.PI; p.push([b[0] + Math.cos(t) * rb, b[1] + Math.sin(t) * rb]); }
    p.push([b[0] - nx * rb, b[1] - ny * rb]); p.push([a[0] - nx * ra, a[1] - ny * ra]);
    for (i = 1; i < n; i++) { t = ang - Math.PI / 2 - (i / n) * Math.PI; p.push([a[0] + Math.cos(t) * ra, a[1] + Math.sin(t) * ra]); }
    return p;
  }

  /* cross-stitch figures: rows of 0/1, five tall (the baht sign seven, with its two ticks) */
  var G = {
    "0": ["111", "101", "101", "101", "111"], "1": ["010", "110", "010", "010", "111"], "2": ["111", "001", "111", "100", "111"],
    "3": ["111", "001", "111", "001", "111"], "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"],
    "6": ["111", "100", "111", "101", "111"], "7": ["111", "001", "010", "010", "010"], "8": ["111", "101", "111", "101", "111"],
    "9": ["111", "101", "111", "001", "111"], ",": ["00", "00", "00", "01", "10"],
    "L": ["100", "100", "100", "100", "111"], "I": ["111", "010", "010", "010", "111"], "N": ["10001", "11001", "10101", "10011", "10001"], "E": ["111", "100", "110", "100", "111"],
    "฿": ["010", "110", "101", "110", "101", "110", "010"]
  };
  function figW(str, cell) { var n = 0, i; for (i = 0; i < str.length; i++) n += G[str.charAt(i)][0].length + 1; return (n - 1) * cell; }
  function figures(str, x, y, cell, w, col) {
    var out = [], cx = x, i, r, q, g, dy, add = function (s) { out.push(s); };
    for (i = 0; i < str.length; i++) {
      g = G[str.charAt(i)]; dy = g.length === 7 ? -1 : 0;
      for (r = 0; r < g.length; r++) for (q = 0; q < g[r].length; q++) if (g[r].charAt(q) === "1") S.cross(cx + q * cell, y + (r + dy) * cell, cell * 0.9, w, col).forEach(add);
      cx += (g[0].length + 1) * cell;
    }
    return out;
  }
  /* a QR-like square of stitches: three finders and a seeded scatter */
  function qrStitches(x, y, size, n, seed, col) {
    var cell = size / n, rg = S.rng(seed), out = [], r, q, dark, fr, fq, add = function (s) { out.push(s); };
    for (r = 0; r < n; r++) for (q = 0; q < n; q++) {
      fr = r < 3 ? r : r >= n - 3 ? r - (n - 3) : -1; fq = q < 3 ? q : q >= n - 3 ? q - (n - 3) : -1;
      if (fr >= 0 && fq >= 0 && !(r >= n - 3 && q >= n - 3)) dark = !(fr === 1 && fq === 1);
      else if ((r < 4 && (q < 4 || q >= n - 4)) || (r >= n - 4 && q < 4)) dark = false;
      else dark = rg() < 0.48;
      if (dark) S.cross(x + q * cell + cell * 0.06, y + r * cell + cell * 0.06, cell * 0.88, Math.max(0.9, cell * 0.36), col).forEach(add);
    }
    return out;
  }
  /* a square of cross-stitched diamonds, the piece being photographed and sold */
  function diamonds(x, y, size, n, col0) {
    var cell = size / n, out = [], r, q, d, cols = ["#d7263d", "#f6c445", "#e0457b", "#3fa7d6", "#d9dee2"], c = (n - 1) / 2, add = function (s) { out.push(s); };
    for (r = 0; r < n; r++) for (q = 0; q < n; q++) {
      d = Math.abs(r - c) + Math.abs(q - c);
      S.cross(x + q * cell + cell * 0.05, y + r * cell + cell * 0.05, cell * 0.9, Math.max(0.9, cell * 0.28), d > c + 0.1 ? col0 : cols[Math.min(cols.length - 1, Math.round(d / (c / 2.2)) % cols.length)]).forEach(add);
    }
    return out;
  }
  function springOut(x) { return 1 - Math.exp(-6 * x) * Math.cos(10 * x); }
  function ease(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }

  var CSS = [
    "[data-toy=phone] canvas{margin:0 auto}",
    "[data-toy=phone] .ctl{justify-content:center;margin:10px 2px 0}",
    "[data-toy=phone] .ctl button{min-width:92px;font-size:16px;padding:8px 18px}",
    "[data-toy=phone] .ctl .go{background:#f6c445;border-color:#c9a02e;color:#000;font-weight:800}",
    "[data-toy=phone] .say{text-align:center;font-size:17px;line-height:1.4;margin:8px 4px 2px}",
    "html[data-lang=th] [data-toy=phone] .say{line-height:1.6}"
  ].join("\n");

  window.TOYS.phone = function (root) {
    var step = 0, prev = -1, tStep = 0, press = 0, hop = 0, auto = true, dirty = true, failed = false, lastH = 0, lastW = 0;
    var g = null, bg = null, palm = null, phone = null, fingers = null, thumb = null, steps = null, dots = null, clipPath = null, sprites = {};

    root.setAttribute("role", "group");
    var style = el("style"); style.textContent = CSS; root.appendChild(style);
    var canvas = el("canvas", { "aria-hidden": "true" }); canvas.style.height = "320px"; root.appendChild(canvas);
    var bNext = el("button", { type: "button", class: "go" }), bAgain = el("button", { type: "button" });
    root.appendChild(el("div", { class: "ctl" }, [bNext, bAgain]));
    var say = el("p", { class: "say", "aria-live": "polite" }); root.appendChild(say);

    function words() {
      var L = lang();
      root.setAttribute("aria-label", TX.label[L]);
      bNext.textContent = TX.next[L]; bAgain.textContent = TX.again[L];
      say.textContent = (step + 1) + ". " + STEPS[step][L];
    }
    function reserveSay() {
      var ghost = say.cloneNode(false), L = lang(), best = 0, i;
      ghost.removeAttribute("aria-live"); ghost.setAttribute("aria-hidden", "true"); ghost.style.cssText = "visibility:hidden;min-height:0";
      say.style.minHeight = "0"; say.parentNode.insertBefore(ghost, say.nextSibling);
      for (i = 0; i < 5; i++) { ghost.textContent = (i + 1) + ". " + STEPS[i][L]; best = Math.max(best, ghost.offsetHeight); }
      say.parentNode.removeChild(ghost); say.style.minHeight = best + "px";
    }
    /* one viewport: the canvas takes what the buttons and the sentence leave, about 60svh at most */
    function sizeCanvas() {
      var avail = root.clientWidth - 22; if (avail < 120) return;
      var cw = Math.min(avail, 440), vh = window.innerHeight || 700, ch = canvas.offsetHeight, extra = root.offsetHeight - ch;
      var h = Math.round(clamp(Math.min(vh - extra - 12, 0.6 * vh, cw * 1.62), 250, 560));
      if (Math.abs(cw - lastW) > 0.5) { canvas.style.width = cw + "px"; lastW = cw; }
      if (h !== lastH) { canvas.style.height = h + "px"; lastH = h; }
    }
    function fit() { reserveSay(); sizeCanvas(); }

    /* ------------------------------------------------------------ the picture, baked once per size */
    function layout(W, H, dpr) {
      var u = Math.min(H / 5.3, W / 3.1), cx = W / 2 + 0.04 * u, cy = 0.35 * u + 2 * u;
      return { W: W, H: H, dpr: dpr, u: u, cx: cx, cy: cy, sx: cx - 0.915 * u, sy: cy - 1.915 * u, sw: 1.83 * u, sh: 3.83 * u };
    }
    function P(x, y) { return [g.cx + x * g.u, g.cy + y * g.u]; }
    function PP(list) { return list.map(function (p) { return P(p[0], p[1]); }); }

    function bakeBg() {
      var L = S.layer(g.W, g.H, g.dpr), c = L.ctx, hem = rrect(8, 8, g.W - 16, g.H - 16, 7);
      S.cloth(c, [[0, 0], [g.W, 0], [g.W, g.H], [0, g.H]], "#e8dcc2", { shadow: false, pitch: 3.4, seed: 82, grain: 0.42 });
      S.sew(c, S.running(hem.concat([hem[0]]), 5, 4, 1.1, "#3f67b8"));
      return L;
    }
    /* the palm, behind the phone, running off the bottom edge as the wrist */
    function bakePalm() {
      var L = S.layer(g.W, g.H, g.dpr), c = L.ctx, u = g.u;
      var pts = PP([[-1.10, 0.6], [-1.22, 1.25], [-1.12, 1.8], [-0.88, 2.25], [-0.66, 2.7], [-0.6, 3.6], [0.95, 3.6], [1.0, 2.7], [1.14, 2.1], [1.25, 1.3], [1.15, 0.65], [0.6, 0.4], [-0.6, 0.4]]);
      S.applique(c, S.curve(pts, true, 8), SKIN, SKIN_THREAD, { inset: 2.6, dash: 3.6, gap: 3, tw: 1, seed: 91, pitch: 3, grain: 0.5 });
      S.sew(c, S.stem(S.curve(PP([[-1.0, 1.75], [-0.86, 2.08], [-0.6, 2.36]]), false, 8), 6, 1.2, SKIN_D, 3));
      S.sew(c, S.stem(S.curve(PP([[-0.78, 2.55], [-0.2, 2.74], [0.5, 2.7]]), false, 8), 6, 1.2, SKIN_D, 4));
      return L;
    }
    function bakePhone() {
      var L = S.layer(g.W, g.H, g.dpr), c = L.ctx, u = g.u;
      var btn = [[-1.045, -0.9, 0.06, 0.5], [-1.045, -0.25, 0.06, 0.34]];
      btn.forEach(function (b, i) { S.applique(c, rrect(g.cx + b[0] * u, g.cy + b[1] * u, b[2] * u, b[3] * u, 1.5), "#3a3f55", null, { pitch: 2.4, seed: 30 + i }); });
      S.applique(c, rrect(g.cx - u, g.cy - 2 * u, 2 * u, 4 * u, 0.24 * u), BODY, "#aeb6bd", { inset: 0.045 * u, dash: 4, gap: 3.2, tw: 1, seed: 17, pitch: 2.6, grain: 0.6 });
      S.applique(c, rrect(g.sx, g.sy, g.sw, g.sh, 0.17 * u), SCREEN, "#cfc29f", { inset: 2.6, dash: 3.4, gap: 3, tw: 0.9, seed: 19, pitch: 3, grain: 0.3 });
      S.applique(c, rrect(g.cx - 0.28 * u, g.sy + 0.07 * u, 0.56 * u, 0.13 * u, 0.065 * u), BODY, null, { pitch: 2.2, seed: 21, shadow: false });
      S.sew(c, [S.knot(P(0.18, -1.915 + 0.135), Math.max(1.3, 0.045 * u), "#3fa7d6")]);
      S.sew(c, [S.straight([g.cx - 0.2 * u, g.sy + 3.7 * u], [g.cx + 0.2 * u, g.sy + 3.7 * u], 1.5, "#b9ad8f")]);
      return L;
    }
    /* the thumb lies across the lower left of the screen: two cut pieces, a nail, creases at the joint */
    function bakeThumb() {
      var L = S.layer(g.W, g.H, g.dpr), c = L.ctx, u = g.u, base = P(-0.93, 1.84), joint = P(-0.71, 1.24), tip = P(-0.42, 0.84), d = [tip[0] - joint[0], tip[1] - joint[1]], dl = Math.hypot(d[0], d[1]) || 1, nx = -d[1] / dl, ny = d[0] / dl;
      d = [d[0] / dl, d[1] / dl];
      var o = { inset: 2.4, dash: 3.4, gap: 2.8, tw: 0.95, pitch: 3, grain: 0.5 };
      S.applique(c, capsule(base, joint, 0.275 * u, 0.25 * u), SKIN, SKIN_THREAD, { inset: o.inset, dash: o.dash, gap: o.gap, tw: o.tw, pitch: 3, grain: 0.5, seed: 93 });
      S.applique(c, capsule(joint, tip, 0.238 * u, 0.205 * u), SKIN, SKIN_THREAD, { inset: o.inset, dash: o.dash, gap: o.gap, tw: o.tw, pitch: 3, grain: 0.5, seed: 94 });
      var na = [tip[0] - d[0] * 0.03 * u, tip[1] - d[1] * 0.03 * u], nb = [tip[0] + d[0] * 0.11 * u, tip[1] + d[1] * 0.11 * u];
      S.applique(c, capsule(na, nb, 0.105 * u, 0.1 * u), NAIL, "#fff3ee", { inset: 1.5, dash: 2.2, gap: 2, tw: 0.7, pitch: 2, seed: 95, shadow: false, grain: 0.3 });
      var cr = function (at, k, len) { var m = [at[0] + d[0] * k * u, at[1] + d[1] * k * u]; return S.stem(S.curve([[m[0] + nx * len * u, m[1] + ny * len * u], [m[0] + d[0] * 0.025 * u, m[1] + d[1] * 0.025 * u], [m[0] - nx * len * u, m[1] - ny * len * u]], false, 6), 5, 1.1, SKIN_D, 5); };
      S.sew(c, cr(joint, 0.0, 0.17)); S.sew(c, cr(joint, -0.06, 0.13));
      S.sew(c, cr(tip, -0.43, 0.1));
      return L;
    }
    /* four fingertips wrapped round the right edge: index, middle, ring, little; each with a nail and a knuckle crease */
    function bakeFingers() {
      var L = S.layer(g.W, g.H, g.dpr), c = L.ctx, u = g.u;
      [[0.78, 0.84, 1.04, 0.165], [1.12, 0.82, 1.06, 0.168], [1.46, 0.85, 1.05, 0.162], [1.78, 0.93, 1.04, 0.145]].forEach(function (f, i) {
        var y = f[0], tipP = P(f[1], y), outP = P(f[2], y + 0.025), r = f[3] * u;
        S.applique(c, capsule(outP, tipP, r, r * 0.95), SKIN, SKIN_THREAD, { inset: 2.2, dash: 3.2, gap: 2.6, tw: 0.9, pitch: 3, grain: 0.5, seed: 100 + i });
        S.applique(c, capsule([tipP[0] + 0.05 * u, tipP[1] - 0.01 * u], [tipP[0] - 0.015 * u, tipP[1] - 0.01 * u], 0.07 * u, 0.065 * u), NAIL, "#fff3ee", { inset: 1.3, dash: 2, gap: 1.8, tw: 0.6, pitch: 2, seed: 110 + i, shadow: false, grain: 0.3 });
        S.sew(c, S.stem(S.curve([P(1.0, y - 0.105), P(1.025, y + 0.005), P(1.0, y + 0.115)], false, 6), 5, 1.2, SKIN_D, 6 + i));
        S.sew(c, S.stem(S.curve([P(0.9, y - 0.09), P(0.915, y + 0.005), P(0.9, y + 0.1)], false, 6), 5, 1.0, SKIN_D, 16 + i));
      });
      return L;
    }

    /* ---- the five screens: each one a layer the size of the screen, content in units of u from its top left */
    function SL() { return S.layer(g.sw + 8, g.sh + 8, g.dpr); }
    function sp(x, y) { return [4 + x * g.u, 4 + y * g.u]; }
    function app(c, path, col, thread, seed, o) { var q = o || {}; q.seed = seed; q.pitch = q.pitch || 2.6; S.applique(c, path, col, thread, q); }
    function bubble(c, cxu, cyu, wu, hu, col, thread, tailLeft, seed) {
      var u = g.u, a = sp(cxu - wu / 2, cyu - hu / 2), by = a[1] + hu * u, bx = tailLeft ? a[0] : a[0] + wu * u, dir = tailLeft ? 1 : -1;
      app(c, [[bx + dir * 0.52 * u, by - 3], [bx + dir * 0.08 * u, by + 0.27 * u], [bx + dir * 0.27 * u, by - 3]], col, thread, seed, { inset: 1.3, dash: 2.2, gap: 2, tw: 0.8 });
      app(c, rrect(a[0], a[1], wu * u, hu * u, 0.28 * hu * u), col, thread, seed + 1, { inset: 2.4, dash: 3.4, gap: 2.8, tw: 0.95 });
    }
    function bakeSteps() {
      var u = g.u, out = [], i;
      /* 1: LINE, a green bubble with its word, and an envelope struck through */
      var s1 = SL(), c = s1.ctx;
      var env = sp(0.915 - 0.425, 1.98);
      app(c, rrect(env[0], env[1], 0.85 * u, 0.55 * u, 0.06 * u), "#fff9e8", "#b9ad8f", 41, { inset: 2, dash: 3, gap: 2.6, tw: 0.8, grain: 0.35 });
      S.sew(c, S.stem([[env[0] + 0.05 * u, env[1] + 0.06 * u], [env[0] + 0.425 * u, env[1] + 0.32 * u], [env[0] + 0.8 * u, env[1] + 0.06 * u]], 5, 1.1, "#9a8f78", 3));
      var a = sp(0.915 - 0.36, 2.46), b = sp(0.915 + 0.36, 2.04);
      S.sew(c, S.satin([a, b], function () { return 0.04 * u; }, 2.3, 1.4, function () { return "#d7263d"; }));
      var s1b = SL(); bubble(s1b.ctx, 0.915, 1.28, 1.3, 0.84, "#2f9e5b", "#d9f0dd", true, 45);
      var fw = figW("LINE", Math.max(3, 0.066 * u)), cell = Math.max(3, 0.066 * u), bp = sp(0.915 - 0.65, 1.28 - 0.42);
      S.sew(s1b.ctx, figures("LINE", bp[0] + (1.3 * u - fw) / 2, bp[1] + (0.84 * u - 5 * cell) / 2, cell, Math.max(1, cell * 0.28), "#f9f6e8"));
      out.push({ main: s1, over: s1b });
      /* 2: the piece, a viewfinder round it, the shutter */
      var s2 = SL(), sq = sp(0.915 - 0.475, 1.05);
      app(s2.ctx, rrect(sq[0], sq[1], 0.95 * u, 0.95 * u, 0.05 * u), "#23284a", "#d9dee2", 51, { inset: 2, dash: 3, gap: 2.6, tw: 0.8 });
      S.sew(s2.ctx, diamonds(sq[0] + 0.1 * u, sq[1] + 0.1 * u, 0.75 * u, 9, "#2d3358"));
      var sh = sp(0.915 + 0.05, 2.5);
      app(s2.ctx, circle(sh[0], sh[1], 0.2 * u, 20), "#d9dee2", "#8f98a1", 52, { inset: 2, dash: 3, gap: 2.4, tw: 0.8 });
      S.sew(s2.ctx, S.knots(sh[0], sh[1], 0.12 * u, 0.12 * u, Math.max(1.1, 0.026 * u), function () { return "#d7263d"; }, 12));
      var s2b = SL(), q = 0.62 * u, mid = sp(0.915, 1.525), k = 0.12 * u, w = [];
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (sg) {
        var cx = mid[0] + sg[0] * q, cy = mid[1] + sg[1] * q;
        w.push(S.straight([cx, cy], [cx - sg[0] * k * 1.6, cy], 2.2, INK)); w.push(S.straight([cx, cy], [cx, cy - sg[1] * k * 1.6], 2.2, INK));
      });
      S.sew(s2b.ctx, w);
      out.push({ main: s2, over: s2b });
      /* 3: the page: header, picture, name, price, QR */
      var s3 = SL(), cardW = 1.5, cardX = 0.915 - cardW / 2, cp = sp(cardX, 0.8);
      app(s3.ctx, rrect(cp[0], cp[1], cardW * u, 1.78 * u, 0.1 * u), "#fffdf4", "#b9ad8f", 61, { inset: 2.2, dash: 3.2, gap: 2.8, tw: 0.8, grain: 0.3 });
      app(s3.ctx, rrect(cp[0] + 0.07 * u, cp[1] + 0.07 * u, (cardW - 0.14) * u, 0.2 * u, 0.06 * u), "#23284a", null, 62, { shadow: false });
      S.sew(s3.ctx, [S.knot([cp[0] + 0.2 * u, cp[1] + 0.17 * u], Math.max(1.2, 0.03 * u), "#d9dee2"), S.knot([cp[0] + 0.3 * u, cp[1] + 0.17 * u], Math.max(1.2, 0.03 * u), "#d9dee2")]);
      var pic = sp(0.915 - 0.4, 1.12);
      app(s3.ctx, rrect(pic[0], pic[1], 0.8 * u, 0.8 * u, 0.04 * u), "#23284a", "#d9dee2", 63, { inset: 1.8, dash: 2.8, gap: 2.4, tw: 0.7 });
      S.sew(s3.ctx, diamonds(pic[0] + 0.07 * u, pic[1] + 0.07 * u, 0.66 * u, 9, "#2d3358"));
      var nl = sp(cardX + 0.14, 2.04), wv = [], j;
      for (j = 0; j <= 8; j++) wv.push([nl[0] + j * 0.14 * u, nl[1] + (j % 2 ? -0.025 : 0.025) * u]);
      S.sew(s3.ctx, S.stem(S.curve(wv, false, 5), 5, 1.4, INK, 8));
      var pr = sp(cardX + 0.14, 2.2), pc = Math.max(2.2, 0.036 * u);
      S.sew(s3.ctx, figures("฿1,500", pr[0], pr[1] + 0.09 * u, pc, Math.max(0.8, pc * 0.3), "#d7263d"));
      var qr = sp(cardX + cardW - 0.13 - 0.4, 2.14), qs = 0.4 * u;
      app(s3.ctx, rrect(qr[0] - 2, qr[1] - 2, qs + 4, qs + 4, 2), "#ffffff", "#b9ad8f", 64, { inset: 1.2, dash: 2, gap: 1.8, tw: 0.6, shadow: false, grain: 0.25 });
      S.sew(s3.ctx, qrStitches(qr[0], qr[1], qs, 9, 7, INK));
      out.push({ main: s3 });
      /* 4: the order bubble, pink, its words drawn live in either language */
      var s4 = SL(); bubble(s4.ctx, 0.915, 1.55, 1.52, 0.86, "#e0457b", "#fde0ea", true, 71);
      out.push({ main: s4 });
      /* 5: a QR, a pocket (back and front) */
      var s5 = SL(), qp = sp(0.915 - 0.42, 1.08), qz = 0.84 * u;
      app(s5.ctx, rrect(qp[0] - 5, qp[1] - 5, qz + 10, qz + 10, 0.06 * u), "#ffffff", "#b9ad8f", 81, { inset: 1.8, dash: 3, gap: 2.6, tw: 0.8, grain: 0.25 });
      S.sew(s5.ctx, qrStitches(qp[0], qp[1], qz, 13, 5, INK));
      var s5a = SL(), pk = sp(0.76, 2.34), pw = 0.8 * u, ph = 0.6 * u;
      app(s5a.ctx, rrect(pk[0], pk[1] - 0.03 * u, pw, ph, 0.07 * u), "#8a4a12", null, 83, { shadow: false });
      var s5b = SL();
      app(s5b.ctx, rrect(pk[0] - 0.02 * u, pk[1] + 0.1 * u, pw + 0.04 * u, ph - 0.06 * u, 0.1 * u), "#f28c28", "#ffe2bd", 84, { inset: 2.2, dash: 3.2, gap: 2.6, tw: 0.9 });
      var zz = [], zx;
      for (zx = pk[0] + 0.08 * u; zx < pk[0] + pw - 0.08 * u; zx += 0.1 * u) zz.push(S.cross(zx, pk[1] + 0.17 * u, 0.07 * u, 0.9, "#fff1d6"));
      zz.forEach(function (cr) { S.sew(s5b.ctx, cr); });
      out.push({ main: s5, back: s5a, front: s5b });
      return out;
    }
    /* the five dots under the camera: the current one is a red knot in a ring */
    function bakeDots() {
      var u = g.u, out = [], i, k, W2 = 1.3 * u, L, sts, cx0;
      for (i = 0; i < 5; i++) {
        L = S.layer(W2 + 8, 0.3 * u + 8, g.dpr); sts = [];
        for (k = 0; k < 5; k++) {
          cx0 = 4 + W2 / 2 + (k - 2) * 0.24 * u;
          if (k === i) { sts = sts.concat(S.split(circle(cx0, 4 + 0.15 * u, 0.085 * u, 12), 2.4, 1, "#d7263d", true)); sts.push(S.knot([cx0, 4 + 0.15 * u], Math.max(1.8, 0.05 * u), "#d7263d")); }
          else sts.push(S.knot([cx0, 4 + 0.15 * u], Math.max(1.4, 0.034 * u), k < i ? "#8f98a1" : "#cfc29f"));
        }
        S.sew(L.ctx, sts); out.push(L);
      }
      return out;
    }
    function coinSprite(r) {
      var key = Math.round(r * 10), s = sprites[key];
      if (!s) {
        var sz = Math.ceil(r * 2 + 8), cx = sz / 2;
        s = sprites[key] = S.layer(sz, sz, g.dpr);
        S.cloth(s.ctx, circle(cx, cx, r, 22), "#cfd6db", { pitch: Math.max(1.4, r * 0.3), seed: 5, grain: 0.5 });
        S.sew(s.ctx, S.stem(circle(cx, cx, r * 0.88, 20), 2.2, Math.max(0.7, r * 0.18), "#8f98a1", 3));
        S.sew(s.ctx, S.coin(cx, cx, r * 0.66));
      }
      return s;
    }
    function bake(st) {
      var W = st.w, H = st.h;
      g = layout(W, H, st.dpr); sprites = {};
      bg = bakeBg(); palm = bakePalm(); phone = bakePhone(); fingers = bakeFingers(); thumb = bakeThumb(); steps = bakeSteps(); dots = bakeDots();
      clipPath = rrect(g.sx, g.sy, g.sw, g.sh, 0.17 * g.u);
      dirty = false;
    }

    /* ------------------------------------------------------------ the five screens in motion */
    function put(c, L, dx, dy, sc, ox, oy) {          /* draw a screen layer at the screen's top left, scaled about (ox, oy) in screen px */
      c.save(); c.translate(g.sx - 4 + dx, g.sy - 4 + dy);
      if (sc !== 1) { c.translate(ox + 4, oy + 4); c.scale(sc, sc); c.translate(-ox - 4, -oy - 4); }
      c.drawImage(L.canvas, 0, 0, L.w, L.h); c.restore();
    }
    function drawStep(c, i, lt, dx) {
      var u = g.u, S_ = steps[i], L = lang(), x, y, sc, f, ph, k;
      if (i === 0) {
        put(c, S_.main, dx, 0, 1, 0, 0);
        sc = 1 + 0.045 * Math.sin(lt * 4.2); put(c, S_.over, dx, 0, sc, 0.915 * u, 1.28 * u);
      } else if (i === 1) {
        put(c, S_.main, dx, 0, 1, 0, 0);
        sc = 1 + 0.2 * Math.pow(Math.max(0, 1 - lt / 0.7), 2) + 0.012 * Math.sin(lt * 5); put(c, S_.over, dx, 0, sc, 0.915 * u, 1.525 * u);
        f = lt - 1.25; if (f > 0 && f < 0.3) { c.save(); c.globalAlpha = 0.8 * (1 - f / 0.3); c.fillStyle = "#ffffff"; c.fillRect(g.sx + dx, g.sy, g.sw, g.sh); c.restore(); }
      } else if (i === 2) {
        put(c, S_.main, dx, (1 - ease(lt / 0.5)) * 0.9 * u, 1, 0, 0);
        if (lt > 0.5) S.sew(c, [S.knot([g.sx + dx + (0.915 + 0.62) * u, g.sy + 0.97 * u], Math.max(1.6, 0.04 * u), Math.sin(lt * 6) > -0.2 ? "#2f9e5b" : "#9ec9ae")]);
      } else if (i === 3) {
        sc = springOut(lt / 1.0); put(c, S_.main, dx, Math.sin(lt * 2.6) * 0.02 * u, Math.max(0.01, sc), 0.915 * u, 1.55 * u);
        if (lt > 0.35) {
          c.save(); c.font = "700 " + Math.round(0.175 * u) + "px " + FONT; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#ffffff";
          var tw = c.measureText(TX.order[L]).width, fitK = Math.min(1, 1.3 * u / (tw || 1));
          c.translate(g.sx + dx + 0.915 * u, g.sy + 1.55 * u); c.scale(Math.max(0.01, sc) * fitK, Math.max(0.01, sc) * fitK); c.fillText(TX.order[L], 0, 0); c.restore();
        }
        for (k = 0; k < 3; k++) { ph = ((lt * 1.1 + k * 0.33) % 1); if (lt > 0.2) S.sew(c, S.running(circleArc(g.sx + dx + (0.915 + 0.78) * u, g.sy + (1.55 - 0.44) * u, (0.1 + ph * 0.3) * u), 2, 3, 1, k === 0 ? "#e0457b" : "#f4a0bd")); }
      } else {
        put(c, S_.main, dx, 0, 1, 0, 0);
        put(c, S_.back, dx, 0, 1, 0, 0);
        drawCoin(c, lt, dx);
        put(c, S_.front, dx, 0, 1, 0, 0);
      }
    }
    function circleArc(cx, cy, r) { var p = [], i; for (i = 0; i <= 8; i++) { var a = -2.4 + i / 8 * 1.3; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
    /* the coin falls out of the QR's corner into the pocket, again and again */
    function drawCoin(c, lt, dx) {
      var u = g.u, r = 0.15 * u, s = coinSprite(r), cyc = 1.9, x0 = g.sx + dx + 1.2 * u, x1 = g.sx + dx + 1.16 * u, y0 = g.sy + 1.5 * u, y1 = g.sy + 2.55 * u, ph, y, fx;
      if (S.reduced) { c.drawImage(s.canvas, x1 - s.w / 2, y1 - 0.06 * u - s.h / 2, s.w, s.h); return; }
      ph = (lt - 0.3) % cyc; if (lt < 0.3 || ph > 0.8) return;
      y = y0 + (y1 - y0) * Math.pow(ph / 0.8, 1.7); fx = Math.max(0.45, Math.abs(Math.cos(ph * 11)));
      c.save(); c.translate(x0 + (x1 - x0) * (ph / 0.8), y); c.scale(fx, 1); c.drawImage(s.canvas, -s.w / 2, -s.h / 2, s.w, s.h); c.restore();
    }

    function draw(st, dt) {
      if (failed) return;
      try {
        var c = st.ctx, W = st.w, H = st.h, t = st.t;
        if (W < 100 || H < 100) return;
        if (dirty || !g || g.W !== W || g.H !== H || g.dpr !== st.dpr) bake(st);
        if (auto && step < 4 && t - tStep >= STEP_MS) go(step + 1, false);
        press = Math.max(0, press - dt * 4.5); hop = Math.max(0, hop - dt * 3);
        var lt = S.reduced ? 99 : t - tStep, tr = (prev >= 0 && !S.reduced) ? clamp(lt / 0.38, 0, 1) : 1, e = ease(tr), u = g.u;
        var bob = S.reduced ? 0 : 1.6 * Math.sin(t * 1.4) - 7 * Math.sin(hop * Math.PI);
        c.drawImage(bg.canvas, 0, 0, W, H);
        c.save(); c.translate(0, bob);
        c.drawImage(palm.canvas, 0, 0, W, H);
        c.drawImage(phone.canvas, 0, 0, W, H);
        c.save(); c.beginPath(); clipPath.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath(); c.clip();
        if (tr < 1) drawStep(c, prev, 99, -e * g.sw);
        drawStep(c, step, lt, (1 - e) * g.sw * (prev >= 0 ? 1 : 0));
        c.restore();
        c.drawImage(dots[step].canvas, g.cx - dots[step].w / 2, g.sy + 0.42 * u - 4 - 0.15 * u, dots[step].w, dots[step].h);
        c.drawImage(fingers.canvas, 0, 0, W, H);
        c.save(); c.translate(press * 0.05 * u, -press * 0.06 * u); c.drawImage(thumb.canvas, 0, 0, W, H); c.restore();
        c.restore();
      } catch (e) { failed = true; if (window.console) console.error("phone.js", e); }
    }

    /* ------------------------------------------------------------ input */
    function ting(n) { try { S.ting(n, 0, 0.04); } catch (e) { /* no audio here */ } }
    function go(n, byUser) {
      var m = ((n % 5) + 5) % 5;
      prev = step; step = m; tStep = st ? st.t : 0;
      if (byUser) { press = 1; ting(11 + m * 5); }
      words(); if (st) st.kick();
    }
    bNext.addEventListener("click", function () { go(step + 1, true); });
    bAgain.addEventListener("click", function () { prev = -1; auto = true; go(0, true); prev = -1; });
    canvas.addEventListener("click", function (e) {
      var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (g && Math.abs(y - (g.sy + 0.42 * g.u)) < 0.2 * g.u && Math.abs(x - g.cx) < 0.62 * g.u) { go(Math.round((x - g.cx) / (0.24 * g.u)) + 2, true); return; }
      if (g && (x < g.cx - 1.4 * g.u || x > g.cx + 1.5 * g.u)) { hop = 1; ting(3); st.kick(); return; }
      go(step + 1, true);
    });
    document.addEventListener("langchange", function () { words(); fit(); st.kick(); });
    window.addEventListener("resize", function () { fit(); });
    window.addEventListener("load", function () { fit(); });
    if (window.ResizeObserver) new ResizeObserver(function () { var w = root.clientWidth; if (w && Math.abs(w - (root.__w || 0)) > 1) { root.__w = w; fit(); } }).observe(root);

    var st = S.stage(canvas, draw, { resize: function () { dirty = true; } });
    words(); fit(); st.redraw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(); dirty = true; st.kick(); });
  };
})();
