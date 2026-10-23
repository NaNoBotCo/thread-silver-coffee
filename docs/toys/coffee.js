/* coffee.js — "Cherry to cup" (window.TOYS.coffee)
   An arabica branch in appliqué: glossy dark leaves in opposite pairs, cherries tight at the joints.
   A ripe cherry that is tapped drops into a woven basket; twelve pour into a bag whose label is
   cross-stitched while you watch. Everything is cut cloth and thread from window.STITCH, baked into
   sprites once; the frame loop moves them. Motion comes from the frame clock and from taps; every
   colour and layout from S.rng, a new seed each round. */
(function () {
  "use strict";
  var S = window.STITCH;
  window.TOYS = window.TOYS || {};

  var D2R = Math.PI / 180;
  var clamp = S.clamp, lerp = S.lerp, mix = S.mix;
  var INDIGO = "#23284a", BLK = "#1f2333", LINEN = "#efe6d2", STRAW = "#e3c88a", EARTH = "#a98660";
  var NEED = 12;

  /* ------------------------------------------------------------------ words, both languages */
  var ROASTS = [
    { name: "Zambon", en: "medium dark", th: "คั่วกลางค่อนเข้ม", col: "#7a3b1f" },
    { name: "Canela", en: "medium", th: "คั่วกลาง", col: "#b06a2e" },
    { name: "Lunita", en: "medium light", th: "คั่วกลางค่อนอ่อน", col: "#d9a45a" }
  ];
  var TXT = {
    title: { en: "Cherry to cup", th: "จากผลกาแฟสู่ถ้วย" },
    pick: { en: "Pick", th: "เก็บ" },
    pickAria: { en: "Pick a ripe cherry", th: "เก็บผลกาแฟที่สุก" },
    desc: {
      en: "A coffee branch with red, orange and green cherries. Ripe cherries go into a woven basket; twelve pour into a bag labelled Suan Lahu.",
      th: "กิ่งกาแฟที่มีผลสีแดง สีส้ม และสีเขียว ผลสุกลงตะกร้าสาน ครบสิบสองผลเทลงถุงที่ติดป้าย Suan Lahu"
    }
  };
  function tr(o) { return o[document.documentElement.dataset.lang === "th" ? "th" : "en"]; }
  function countText(n) { return tr({ en: "Cherries in the basket: " + n + " of 12", th: "ผลกาแฟในตะกร้า: " + n + " จาก 12 ผล" }); }
  function sayStart() { return tr({ en: "Red cherries are ripe. Green ones need more time.", th: "ผลสีแดงสุกแล้ว ผลสีเขียวยังต้องรอ" }); }
  function sayNot() { return tr({ en: "Not yet.", th: "ยังไม่สุก" }); }
  function sayFacts(i) {
    var r = ROASTS[i];
    return tr({
      en: "<b>" + r.name + "</b>, " + r.en + ". Suan Lahu is a Black Lahu village farm at Doi Mod in Chiang Rai province: organic arabica since 2009. It roasts its own: Zambon, Canela, Lunita. ฿500 for 500 g in Thailand.",
      th: "<b>" + r.name + "</b> " + r.th + " \u00b7 Suan Lahu เป็นฟาร์มในหมู่บ้านลาหู่ดำที่ดอยมอด (Doi Mod) จังหวัดเชียงราย ปลูกกาแฟอาราบิกาอินทรีย์มาตั้งแต่ปี 2009 และคั่วเอง ได้แก่ Zambon, Canela, Lunita ขนาด 500 กรัม ราคา \u0e3f500 ในประเทศไทย"
    });
  }

  /* ------------------------------------------------------------------ small helpers */
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  var ease = {
    out: function (u) { return 1 - Math.pow(1 - u, 3); },
    back: function (u) { var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
    inout: function (u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }
  };
  function add(list, x) {
    if (!x) return list;
    if (x.k) list.push(x); else for (var i = 0; i < x.length; i++) list.push(x[i]);
    return list;
  }
  function rect(x, y, w, h) { return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]; }
  function ell(cx, cy, rx, ry, n) {
    var o = [], i, a; n = n || 28;
    for (i = 0; i < n; i++) { a = (i / n) * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return o;
  }
  function rrect(x, y, w, h, r) {
    var o = [], i, a, k, n = 4, cs = [[x + w - r, y + r, -90], [x + w - r, y + h - r, 0], [x + r, y + h - r, 90], [x + r, y + r, 180]];
    for (k = 0; k < 4; k++) for (i = 0; i <= n; i++) { a = (cs[k][2] + (i / n) * 90) * D2R; o.push([cs[k][0] + Math.cos(a) * r, cs[k][1] + Math.sin(a) * r]); }
    return o;
  }
  function dense(p, step) {
    var out = [], i, k, a, b, n;
    for (i = 0; i < p.length; i++) {
      a = p[i]; b = p[(i + 1) % p.length];
      n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
      for (k = 0; k < n; k++) out.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    return out;
  }
  function pathTo(c, pts) { c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath(); }
  var OPT = { inset: 1.8, dash: 2.8, gap: 2.2, tw: 0.8, pitch: 2.2 };
  function ap(c, pts, col, thr, o) {
    var q = {}, k;
    for (k in OPT) q[k] = OPT[k];
    if (o) for (k in o) q[k] = o[k];
    S.applique(c, dense(pts, 3), col, thr === undefined ? mix(col, "#ffffff", 0.5) : thr, q);
  }
  function sprite(sc, w, h, ox, oy, fn) {
    var L = S.layer(w, h, sc), c = L.ctx;
    c.translate(ox, oy); fn(c);
    return { c: L.canvas, w: w, h: h, ox: ox, oy: oy };
  }
  function put(c, sp, x, y) { c.drawImage(sp.c, x - sp.ox, y - sp.oy, sp.w, sp.h); }
  /* a band of cloth of varying width along a path */
  function ribbon(path, wFn) {
    var Lp = [], Rp = [], i, a, b, dx, dy, l, nx, ny, w;
    for (i = 0; i < path.length; i++) {
      a = path[Math.max(0, i - 1)]; b = path[Math.min(path.length - 1, i + 1)];
      dx = b[0] - a[0]; dy = b[1] - a[1]; l = Math.hypot(dx, dy) || 1; nx = -dy / l; ny = dx / l; w = wFn(i / (path.length - 1)) / 2;
      Lp.push([path[i][0] + nx * w, path[i][1] + ny * w]); Rp.push([path[i][0] - nx * w, path[i][1] - ny * w]);
    }
    return Lp.concat(Rp.reverse());
  }

  /* ------------------------------------------------------------------ cross-stitch lettering (5 x 7 cells) */
  var FONT = {
    A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"], B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"], E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"], H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"], L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"], N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"], S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"], U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"], "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"], "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"], "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    "฿": ["00100", "11110", "10001", "10001", "11110", "10001", "10001", "11110", "00100"]
  };
  function adv(ch) { return ch === " " ? 4 : ch === "·" ? 4 : 6; }
  function textStitches(txt, cx, y, cell, col) {
    var total = 0, i, ch, x, g, r, k, sts = [];
    for (i = 0; i < txt.length; i++) total += adv(txt.charAt(i));
    x = cx - ((total - 1) * cell) / 2;
    for (i = 0; i < txt.length; i++) {
      ch = txt.charAt(i);
      if (ch === "·") add(sts, S.cross(x + cell, y + 3 * cell, cell * 0.95, cell * 0.8, col));
      else if (FONT[ch]) {
        g = FONT[ch];
        for (r = 0; r < g.length; r++) for (k = 0; k < 5; k++) if (g[r].charAt(k) === "1") add(sts, S.cross(x + k * cell, y + (r - (g.length - 7) / 2) * cell, cell * 0.95, cell * 0.8, col));
      }
      x += adv(ch) * cell;
    }
    return sts;
  }

  /* ------------------------------------------------------------------ the cherries */
  var CH = {
    deep: ["#8f0f2a", "#d23a52"], red: ["#c4162f", "#f0596a"], orange: ["#e0662a", "#f7a85c"], green: ["#4f9a43", "#b2dc84"]
  };
  var CR = 6.4;                                                                       /* cherry radius, design units */
  function bakeCherrySet(sc) {
    var set = {};
    Object.keys(CH).forEach(function (key) {
      set[key] = [0, 1, 2].map(function (v) {
        return sprite(sc, 24, 26, 12, 13, function (c) {
          var base = CH[key][0], hi = CH[key][1], poly = ell(0, 0.4, 5.9 + v * 0.15, 6.6 + v * 0.1, 22);
          S.sew(c, S.satinFill(poly, -0.5 + (v - 1) * 0.3, 0.9, 1.5, function (t) { return mix(hi, base, clamp(t * 1.35)); }));
          S.sew(c, [S.knot([3.3 - v * 0.4, 4.4], 0.95, "#3b1d12"), S.straight([-2.4, -6.0], [-3.2, -8.8], 1.1, "#5c4a2a"),
            S.straight([-3.6, -1.6], [-2.5, -4.1], 1.0, mix(hi, "#ffffff", 0.55))]);
        });
      });
    });
    return set;
  }

  /* ------------------------------------------------------------------ leaves */
  function bakeLeaf(L, sc) {
    var LF = L.LF, WF = L.WF, bend = L.bend, ph = L.ph, r = S.rng(L.seed), n = 24, i, t, up = [], lo = [], ax = [];
    function hw(u) { return (WF / 2) * Math.sin(Math.PI * Math.pow(clamp(u), 0.78)) * (1 - 0.15 * u); }
    function ya(u) { return bend * LF * u * u; }
    var v = (r() - 0.5) * 0.18, base = mix("#1b5a35", v > 0 ? "#2f8a50" : "#0f3a22", Math.abs(v)), lit = mix(base, "#4fb06c", 0.42);
    for (i = 0; i <= n; i++) {
      t = i / n;
      up.push([t * LF, ya(t) - hw(t) * (1 + 0.075 * Math.sin(6.283 * 3.4 * t + ph))]);
      lo.push([t * LF, ya(t) + hw(t) * (1 + 0.075 * Math.sin(6.283 * 3.4 * t + ph + 2.1))]);
      ax.push([t * LF, ya(t)]);
    }
    var poly = up.concat(lo.slice().reverse()), minY = 1e9, maxY = -1e9;
    poly.forEach(function (p) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; });
    var pad = 8, w = Math.ceil(LF + 26), h = Math.ceil(maxY - minY + 2 * pad), ox = 12, oy = pad - minY;
    L.sp = sprite(sc, w, h, ox, oy, function (c) {
      var sts = [], j, tt, side, tEnd, hE, bx, by, ex, ey, mx, my, vcol, path = [];
      S.sew(c, [S.straight([-6, 0.4], [1, 0], 2.4, mix(base, "#c6e5a0", 0.35))]);
      S.cloth(c, poly, base, { pitch: 2.2, grain: 0.5 });
      S.cloth(c, up.concat(ax.slice().reverse()), lit, { pitch: 2.2, shadow: false, grain: 0.45 });
      for (i = 22; i >= 1; i--) { tt = i / n; path.push([tt * LF, ya(tt) - hw(tt) + Math.min(2, 0.55 * hw(tt))]); }
      for (i = 1; i <= 22; i++) { tt = i / n; path.push([tt * LF, ya(tt) + hw(tt) - Math.min(2, 0.55 * hw(tt))]); }
      S.sew(c, S.running(path, 3, 2.2, 0.8, mix(base, "#8fd6a0", 0.55)));
      vcol = mix(base, "#9fe0a8", 0.38);
      for (j = 1; j <= 9; j++) {
        tt = 0.07 + j * 0.09;
        for (side = -1; side <= 1; side += 2) {
          tEnd = Math.min(0.96, tt + 0.14); hE = hw(tEnd) * 0.78;
          bx = tt * LF; by = ya(tt); ex = tEnd * LF; ey = ya(tEnd) + side * hE;
          mx = (bx + ex) / 2 + 0.8; my = (by + ey) / 2 + side * 0.9;
          sts.push(S.straight([bx, by], [mx, my], 0.95, vcol), S.straight([mx, my], [ex, ey], 0.9, vcol));
        }
      }
      S.sew(c, sts);
      S.sew(c, S.satin(ax, function (u) { return 1.9 * (1 - u) + 0.55; }, 0.85, 1.1, function () { return "#c6e5a0"; }));
    });
    L.hl = sprite(sc, w, h, ox, oy, function (c) {
      var hs = [], k, u;
      [0.26, 0.38, 0.5, 0.62].forEach(function (a0) { hs.push(S.straight([a0 * LF, ya(a0) - hw(a0) * 0.55], [(a0 + 0.1) * LF, ya(a0 + 0.1) - hw(a0 + 0.1) * 0.55], 1.3, "#e6f6c8")); });
      for (k = 0; k < 3; k++) { u = 0.34 + k * 0.17; hs.push(S.straight([u * LF, ya(u) - hw(u) * 0.82], [(u + 0.05) * LF, ya(u + 0.05) - hw(u + 0.05) * 0.82], 1, "#d4eeb4")); }
      S.threads(c, hs);
    });
  }

  /* the branch: stem, nodes, opposite leaf pairs, cherries tight at the joints (design units) */
  function makeBranch(seed, wd, yStem, csr) {
    var R = CR * csr, r = S.rng(seed), d = 86, n = Math.ceil(wd / d) + 2, pts = [], x = -0.5 * d + r() * 0.25 * d, k, i, j;
    var leaves = [], cherries = [], nodes = [];
    for (k = 0; k <= n; k++) { pts.push([x, yStem + 8 * Math.sin(k * 0.85 + (seed % 7)) + (r() - 0.5) * 6]); x += d * (0.93 + r() * 0.14); }
    var path = S.curve(pts, false, 10);
    for (k = 1; k < pts.length - 1; k++) {
      var p = pts[k], a = Math.atan2(pts[k + 1][1] - pts[k - 1][1], pts[k + 1][0] - pts[k - 1][0]), odd = k % 2;
      nodes.push({ x: p[0], y: p[1] });
      [-1, 1].forEach(function (side) {
        var LF = (odd ? 72 : 90) + r() * 18, ang = side * (odd ? 64 + r() * 22 : 44 + r() * 20) * D2R;
        leaves.push({ x: p[0], y: p[1], a: a + ang, LF: LF, WF: LF * (odd ? 0.52 : 0.45), bend: 0.04 + r() * 0.15, seed: 300 + leaves.length * 7 + seed, ph: r() * 6.28, wob: -9, sp: null, hl: null, born: -9 });
      });
      [-1, 1].forEach(function (side) {
        var cnt = 1 + Math.floor(r() * 4), tries = 0, cx = p[0] + (r() - 0.5) * 8, cy = p[1] + side * (5 + 0.8 * R);
        while (cnt > 0 && tries < 40) {
          tries++;
          var ang = r() * 6.283, rad = Math.sqrt(r()) * 1.55 * R, px = cx + Math.cos(ang) * rad * 1.15, py = cy + Math.sin(ang) * rad * 0.8, ok = true;
          for (i = 0; i < cherries.length; i++) if (Math.hypot(cherries[i].x - px, cherries[i].y - py) < R * 1.72) { ok = false; break; }
          if (Math.abs(py - p[1]) < 4.2 + 0.4 * R) ok = false;
          if (!ok) continue;
          var u = r();
          cherries.push({ x: px, y: py, key: u < 0.26 ? "deep" : u < 0.52 ? "red" : u < 0.72 ? "orange" : "green", v: Math.floor(r() * 3), tilt: (r() - 0.5) * 0.8, ph: r() * 6.28, t1: null, t2: null, picked: false, wob: -9, sx: 0, sy: 0, born: -9 });
          cnt--;
        }
      });
    }
    /* enough ripe cherries are inside the picture, whatever its width */
    var inView = function (c) { return c.x > 8 && c.x < wd - 8; };
    var ripe = cherries.filter(function (c) { return inView(c) && (c.key === "deep" || c.key === "red"); }).length;
    for (i = 0; i < cherries.length && ripe < NEED + 3; i++) if (inView(cherries[i]) && (cherries[i].key === "orange" || cherries[i].key === "green")) { cherries[i].key = i % 2 ? "red" : "deep"; ripe++; }
    var greens = cherries.filter(function (c) { return c.key === "green"; });
    for (j = 0; j < Math.min(3, greens.length); j++) { greens[j].t1 = 4 + r() * 5; greens[j].t2 = greens[j].t1 + 6 + r() * 5; }
    return { seed: seed, path: path, nodes: nodes, leaves: leaves, cherries: cherries, yStem: yStem, wd: wd, stem: null, ready: false };
  }
  function bakeStem(b, sc) {
    var top = b.yStem - 34, h = 68, wd = b.wd + 130;
    b.stem = sprite(sc, wd, h, 60, -top, function (c) {
      var poly = ribbon(b.path, function (u) { return 10.5 - 4 * u; }), i, sts = [];
      S.cloth(c, poly, "#7a5a3a", { pitch: 2.2, grain: 0.5 });
      S.sew(c, S.stem(ribbon(b.path, function (u) { return 5 - 2 * u; }).slice(0, b.path.length), 7, 1.5, "#a58458", 3));
      S.sew(c, S.stem(ribbon(b.path, function (u) { return -(5.4 - 2 * u); }).slice(0, b.path.length), 7, 1.3, "#553a22", 5));
      b.nodes.forEach(function (nd, k) {
        S.cloth(c, ell(nd.x, nd.y, 6.4, 6.0, 14), "#6b4c2e", { pitch: 1.8, shadow: false });
        sts.push(S.knot([nd.x, nd.y], 2.2, "#8a6a42"));
      });
      for (i = 0; i < 26; i++) { var q = b.path[Math.floor((i / 26) * (b.path.length - 1))]; sts.push(S.straight([q[0] + 1, q[1] - 1], [q[0] + 3.5, q[1] + 0.6], 0.8, "#4a321d")); }
      S.sew(c, sts);
    });
  }

  /* ------------------------------------------------------------------ background: sky, hills, ground */
  function bakeBG(M, dpr) {
    var L = S.layer(M.w, M.h, dpr), c = L.ctx, r = S.rng(11), i, pts, sts = [];
    S.cloth(c, rect(0, 0, M.w, M.h), "#cfe3ee", { pitch: 3.2, shadow: false, grain: 0.4 });
    ap(c, ell(M.w * 0.86, M.h * 0.14, Math.min(M.w, M.h) * 0.07, Math.min(M.w, M.h) * 0.07, 32), "#f6d77a", "#fff0b8", { inset: 2.4, dash: 3, gap: 2.4, tw: 0.9, shadow: false });
    [[0.56, "#b6d6bd", "#dbeedf", 0], [0.64, "#98c6a2", "#c4e3cb", 2.2]].forEach(function (hl) {
      pts = [];
      for (i = 0; i <= 8; i++) pts.push([M.w * i / 8, M.h * (hl[0] + 0.05 * Math.sin(i * 1.25 + hl[3]))]);
      ap(c, S.curve(pts, false, 8).concat([[M.w, M.h], [0, M.h]]), hl[1], hl[2], { inset: 2.4, dash: 3.2, gap: 2.6, tw: 0.9, shadow: false });
    });
    for (i = 0; i < 70; i++) sts.push(S.knot([r() * M.w, M.h * (0.68 + r() * 0.12)], 1 + r() * 0.8, mix("#98c6a2", "#2f6a46", 0.35 + r() * 0.3)));
    S.sew(c, sts);
    S.cloth(c, rect(0, M.groundY, M.w, M.h - M.groundY), EARTH, { pitch: 3.4, shadow: false });
    sts = [];
    for (i = 0; i < 160; i++) sts.push(S.knot([r() * M.w, M.groundY + 6 + r() * (M.h - M.groundY - 8)], 0.7 + r() * 0.9, mix(EARTH, r() < 0.5 ? "#fff3dc" : "#2a1a10", 0.25 + r() * 0.25)));
    S.sew(c, sts);
    c.fillStyle = "rgba(40,25,15,.22)"; c.fillRect(0, M.groundY, M.w, 4);
    return L;
  }

  /* ------------------------------------------------------------------ the woven shoulder basket (origin: bottom centre) */
  var HEAP = [[-30, -99], [-15, -100], [0, -98], [15, -100], [30, -99], [-22, -108], [-7, -109], [8, -109], [23, -108], [-14, -117], [3, -118], [-5, -126]];
  function basketHalf(y) {
    var T = [[-106, 66], [-80, 63.5], [-50, 58], [-22, 50], [0, 44]], i;
    for (i = 1; i < T.length; i++) if (y <= T[i][0]) return lerp(T[i - 1][1], T[i][1], (y - T[i - 1][0]) / (T[i][0] - T[i - 1][0]));
    return 44;
  }
  function bakeBasket(sc) {
    var K = {}, a, i;
    K.back = sprite(sc, 150, 46, 75, 128, function (c) {
      var arc = [];
      ap(c, ell(0, -106, 62, 11.5, 28), "#4a2f18", null, { pitch: 1.8, shadow: false });
      for (i = 0; i <= 14; i++) { a = Math.PI + (i / 14) * Math.PI; arc.push([Math.cos(a) * 66, -106 + Math.sin(a) * 13.5]); }
      S.sew(c, S.satin(arc, function () { return 2.6; }, 1.0, 1.4, function () { return "#8a5a2b"; }));
    });
    K.front = sprite(sc, 200, 150, 122, 130, function (c) {
      var body = [], sts = [], j, q, y, rx, ry, a0, a1, dir, col, n, strap;
      /* the strap lies behind the body: indigo cloth with a yellow centre stitch */
      strap = S.curve([[-58, -104], [-80, -98], [-100, -76], [-108, -42], [-104, -12], [-90, 5]], false, 8);
      ap(c, ribbon(strap, function () { return 9; }), INDIGO, "#8f9ac4", { inset: 1.3, dash: 2.6, gap: 2, tw: 0.7, pitch: 1.8 });
      S.sew(c, S.running(strap, 4, 3, 1.1, "#f6c445"));
      for (i = 0; i <= 5; i++) { y = -106 + i * 21.2; body.push([basketHalf(y), y]); }
      for (i = 0; i <= 14; i++) { a = (i / 14) * Math.PI; body.push([Math.cos(a) * 44, Math.sin(a) * 8.8]); }
      for (i = 5; i >= 0; i--) { y = -106 + i * 21.2; body.push([-basketHalf(y), y]); }
      for (i = 0; i <= 18; i++) { a = Math.PI - (i / 18) * Math.PI; body.push([Math.cos(a) * 66, -106 + Math.sin(a) * 13.5]); }
      S.cloth(c, body, STRAW, { pitch: 2.2 });
      c.save(); pathTo(c, body); c.clip();
      for (j = 0; j < 15; j++) {
        y = -100 + j * 6.6; rx = basketHalf(y) - 0.5; ry = rx * 0.205; n = Math.floor((Math.PI * rx * 0.86) / 4.4);
        for (q = 0; q < n; q++) {
          a0 = Math.PI * 0.07 + (q / n) * Math.PI * 0.86; a1 = Math.PI * 0.07 + ((q + 1) / n) * Math.PI * 0.86; dir = (q + j) & 1 ? 1.7 : -1.7;
          col = (j === 4 || j === 9) ? BLK : j === 5 ? "#d7263d" : ((q + j) % 3 === 0 ? "#b88a46" : "#f1dca8");
          sts.push(S.straight([Math.cos(a0) * rx, y + Math.sin(a0) * ry + dir], [Math.cos(a1) * rx, y + Math.sin(a1) * ry - dir], 2.3, col));
        }
      }
      S.sew(c, sts);
      c.restore();
      var rim = [];
      for (i = 0; i <= 22; i++) { a = Math.PI - (i / 22) * Math.PI; rim.push([Math.cos(a) * 66, -106 + Math.sin(a) * 13.5]); }
      S.sew(c, S.satin(rim, function () { return 3.4; }, 1.0, 1.5, function (t) { return (Math.floor(t * 44) % 2) ? "#8a5a2b" : "#a8743a"; }));
      sts = [];
      for (i = 0; i <= 28; i++) { a = Math.PI - (i / 28) * Math.PI; sts.push(S.straight([Math.cos(a) * 64.5, -106 + Math.sin(a) * 12.2], [Math.cos(a) * 67.4 + 1.2, -106 + Math.sin(a) * 14.8 + 1.4], 1.2, "#f1dca8")); }
      S.sew(c, sts);
      S.sew(c, [S.knot([-58, -104], 2.8, "#f6c445"), S.knot([-58, -104], 1.2, "#d7263d")]);
    });
    return K;
  }

  /* ------------------------------------------------------------------ the bag (origin: bottom centre) */
  var BHEAP = [[-30, -127], [-15, -128], [0, -126], [15, -128], [30, -127], [-22, -136], [-7, -137], [8, -137], [23, -136], [-14, -145], [3, -146], [-5, -153]];
  var PATCH = { x: -48, y: -104, w: 96, h: 66 };
  function bakeBag(sc) {
    var K = {}, KRAFT = "#cfa56b", DARK = "#a98150";
    var outline = function (top) { return S.curve([[-50, top], [-55, -90], [-58, -55], [-55, -18], [-54, 0], [0, 3], [54, 0], [55, -18], [58, -55], [55, -90], [50, top]], true, 6); };
    K.back = sprite(sc, 130, 176, 65, 158, function (c) {
      ap(c, outline(-142), DARK, "#e0c89a", { inset: 2, dash: 3, gap: 2.4, tw: 0.8, pitch: 2.2 });
      ap(c, [[-47, -142], [47, -142], [47, -118], [-47, -118]], "#3a2616", null, { pitch: 1.8, shadow: false });
    });
    K.front = sprite(sc, 130, 176, 65, 158, function (c) {
      var top = S.curve([[-50, -118], [-25, -121], [0, -119], [25, -121], [50, -118]], false, 6), poly = [], i;
      poly = top.slice();
      poly = poly.concat([[55, -90], [58, -55], [55, -18], [54, 0], [0, 3], [-54, 0], [-55, -18], [-58, -55], [-55, -90]]);
      ap(c, poly, KRAFT, "#f0dcae", { inset: 2.2, dash: 3, gap: 2.4, tw: 0.8, pitch: 2.2 });
      ap(c, rrect(PATCH.x, PATCH.y, PATCH.w, PATCH.h, 4), INDIGO, "#8f9ac4", { inset: 2.2, dash: 2.6, gap: 2, tw: 0.8, pitch: 1.8 });
      S.sew(c, S.running([[-52, -8], [52, -8]], 3, 2.4, 0.9, "#f0dcae"));
    });
    K.sealed = sprite(sc, 130, 176, 65, 158, function (c) {
      var o = outline(-132);
      ap(c, o, KRAFT, "#f0dcae", { inset: 2.2, dash: 3, gap: 2.4, tw: 0.8, pitch: 2.2 });
      ap(c, rect(-52, -138, 104, 28), mix(KRAFT, "#4a2d12", 0.18), "#f0dcae", { inset: 2, dash: 3, gap: 2.4, tw: 0.8, pitch: 2.2 });
      var sts = [], i;
      for (i = -46; i <= 46; i += 4.6) sts.push(S.straight([i, -136], [i + 2.2, -112], 0.8, mix(KRAFT, "#4a2d12", 0.45)));
      S.sew(c, sts);
      S.sew(c, [S.straight([-52, -110.5], [52, -110.5], 2.0, "#d7263d")]);
      S.sew(c, S.stem([[14, -110.5], [26, -120], [32, -108]], 4, 2.0, "#d7263d", 7));
      S.sew(c, S.stem([[14, -110.5], [24, -100], [34, -106]], 4, 2.0, "#d7263d", 9));
      S.sew(c, [S.knot([14, -110.5], 3.2, "#d7263d")]);
      ap(c, rrect(PATCH.x, PATCH.y, PATCH.w, PATCH.h, 4), INDIGO, "#8f9ac4", { inset: 2.2, dash: 2.6, gap: 2, tw: 0.8, pitch: 1.8 });
      S.sew(c, S.running([[-52, -8], [52, -8]], 3, 2.4, 0.9, "#f0dcae"));
    });
    return K;
  }

  /* ------------------------------------------------------------------ the cup (origin: bottom centre of the saucer) */
  function bakeCup(sc) {
    var K = {};
    K.cup = sprite(sc, 70, 56, 35, 50, function (c) {
      var sts = [], i;
      ap(c, ell(0, -2, 27, 5.2, 28), LINEN, "#b8a47e", { inset: 1.4, dash: 2.4, gap: 2, tw: 0.7, pitch: 1.8 });
      ap(c, S.curve([[-16, -30], [-17, -20], [-14, -8], [0, -5], [14, -8], [17, -20], [16, -30]], true, 6), "#f4efe3", "#aeb6bd", { inset: 1.8, dash: 2.6, gap: 2.2, tw: 0.7, pitch: 1.8 });
      for (i = -12; i <= 12; i += 3.1) add(sts, S.cross(i, -22, 2.2, 0.8, "#2b59c3"));
      for (i = -11; i <= 11; i += 5.5) sts.push(S.knot([i + 1, -14], 1.2, "#d7263d"));
      S.sew(c, sts);
      S.sew(c, S.stem(ringPath(21, -19, 6.5, 7.5), 4, 2.2, "#f4efe3", 12));
      ap(c, ell(0, -30, 16, 3.6, 24), "#4a2a16", null, { pitch: 1.5, shadow: false });
      S.sew(c, [S.straight([-8, -31], [-3, -32], 1.0, "#a8744a")]);
    });
    K.steam = [0, 1, 2].map(function (j) {
      return sprite(sc, 26, 48, 13, 46, function (c) {
        var path = [], i;
        for (i = 0; i <= 16; i++) path.push([Math.sin(i * 0.75 + j * 2) * 4 + (j - 1) * 5, -i * 2.6]);
        S.sew(c, S.stem(path, 4, 1.7, "#ffffff", 20 + j));
      });
    });
    return K;
  }
  function ringPath(cx, cy, rx, ry) {
    var o = [], i, a;
    for (i = 0; i <= 20; i++) { a = (i / 20) * Math.PI * 2; o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]); }
    return o;
  }
  /* the label: lines of cross stitch, listed in the order a needle would work them */
  function labelStitches(roast) {
    var cx = PATCH.w / 2, sts = [], y = 6;
    add(sts, textStitches("SUAN LAHU", cx, y, 1.8, "#f6c445")); y += 12.6 + 4.5;
    add(sts, textStitches(roast.name.toUpperCase(), cx, y, 2.6, LINEN)); y += 18.2 + 4.5;
    add(sts, S.satin([[cx - 22, y + 1.5], [cx + 22, y + 1.5]], function () { return 1.5; }, 1.0, 1.1, function () { return roast.col; })); y += 3 + 4.5;
    add(sts, textStitches("500 G · ฿500", cx, y, 1.45, "#f28c28"));
    return sts;
  }

  /* ------------------------------------------------------------------ the toy */
  window.TOYS.coffee = function (root) {
    var canvas = el("canvas"), sr = el("p", "sr"), ctl = el("div", "ctl"), bPick = el("button"), read = el("span", "read"), say = el("p", "say");
    bPick.type = "button";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.touchAction = "manipulation";
    say.setAttribute("aria-live", "polite");
    ctl.appendChild(bPick); ctl.appendChild(read);
    root.appendChild(sr); root.appendChild(canvas); root.appendChild(ctl); root.appendChild(say);
    root.setAttribute("role", "group");

    var CUP = null, dprNow = 1, clock = 0, M = null, BGL = null, BK = null, BG = null, CS = null, tasks = [], sayFn = null, bakeKey = "";
    var branch = null, nextBranch = null, round = 0, roundT0 = 0, mode = "pick", modeT0 = 0;
    var landed = 0, reserved = 0, flights = [], heap = [], bagHeap = 0, bagFly = [];
    function newBag(roast, t0) { return { sealed: false, roast: roast, sealT0: 0, label: null, stitches: [], drawn: 0, hop: -9, inT0: t0 }; }
    var bag = newBag(0, -9), oldBag = null, oldBagT0 = 0;
    var bk = { jig: -9, lift: 0 }, gust = -9, timers = [];

    function metrics(w, h) {
      /* strap-left to bag-right is 348 units; a cup beside the bag adds 104 when there is room */
      var sb = Math.min(clamp(w / 400, 0.6, 1.25), (w - 12) / 348), sr2 = clamp(w / 560, 0.62, 1.3), gy = Math.round(h * 0.9);
      var cup = w >= 470 * sb + 12, span = (cup ? 452 : 348) * sb, x0 = (w - span) / 2, cs = Math.max(sr2, sb * 0.9) * 1.3;
      return { w: w, h: h, sb: sb, sr: sr2, cs: cs, csr: cs / sr2, gy: gy, bx: x0 + 112 * sb, gx: x0 + 290 * sb, cup: cup, yStem: h * 0.3, groundY: Math.round(h * 0.82) };
    }
    function contentWidth() { return Math.max(220, (root.clientWidth || 320) - 20); }
    function applyLayout() {
      var w = contentWidth(), h = clamp(w * 1.0, 300, Math.min((window.innerHeight || 700) * 0.6, 520));
      canvas.style.height = Math.round(h) + "px";
    }
    applyLayout();
    window.addEventListener("resize", applyLayout);

    function prog(t0, dur) { return S.reduced ? 1 : clamp((clock - t0) / dur); }
    function later(d, fn) { if (S.reduced || d <= 0) { fn(); return; } timers.push({ at: clock + d, fn: fn }); }
    function setSay(fn) { sayFn = fn; say.innerHTML = fn(); }
    function words() {
      bPick.textContent = tr(TXT.pick);
      bPick.setAttribute("aria-label", tr(TXT.pickAria));
      read.textContent = countText(landed);
      sr.textContent = tr(TXT.desc);
      root.setAttribute("aria-label", tr(TXT.title));
      if (sayFn) say.innerHTML = sayFn();
    }
    document.addEventListener("langchange", words);

    /* ---- baking, a few pieces a frame */
    function branchTasks(b, sc, done) {
      var t = [];
      t.push(function () { bakeStem(b, sc); });
      b.leaves.forEach(function (L) { t.push(function () { bakeLeaf(L, sc); L.born = clock; }); });
      t.push(function () { b.ready = true; if (done) done(); });
      return t;
    }
    function rebuild(st) {
      M = metrics(st.w, st.h);
      var sc = M.sr * st.dpr, sb = M.sb * st.dpr, csc = M.cs * st.dpr, keep = branch ? branch.cherries.map(function (c) { return c.picked; }) : null;
      BGL = bakeBG(M, st.dpr);
      branch = makeBranch(2026 + round * 97, M.w / M.sr, M.yStem / M.sr, M.csr);
      if (keep && keep.length === branch.cherries.length) branch.cherries.forEach(function (c, i) { c.picked = keep[i]; });
      tasks = [];
      tasks.push(function () { CS = { sc: csc, set: bakeCherrySet(csc) }; });
      branchTasks(branch, sc).forEach(function (f) { tasks.push(f); });
      tasks.push(function () { BK = bakeBasket(sb); BG = bakeBag(sb); CUP = bakeCup(sb); });
      nextBranch = null; bakeKey = st.w + "x" + st.h + "@" + st.dpr;
      CS = null; dprNow = st.dpr;
    }
    function runTasks() {
      if (!tasks.length) return;
      var t0 = performance.now();
      do { tasks.shift()(); } while (tasks.length && performance.now() - t0 < 9);
    }

    /* ---- positions */
    function swayDY() { return S.reduced ? 0 : Math.sin(clock * 1.21) * 1.6 * M.sr; }
    function swayRot() {
      var g = clock - gust, e = !S.reduced && g >= 0 && g < 3 ? Math.exp(-1.3 * g) * Math.sin(g * 9) * 0.012 : 0;
      return S.reduced ? 0 : Math.sin(clock * 1.21 + 0.7) * 0.0035 + e;
    }
    function toScreen(dx, dy) {
      var px = dx * M.sr, py = dy * M.sr, ax = 0, ay = M.yStem, a = swayRot(), x = px - ax, y = py - ay;
      return [x * Math.cos(a) - y * Math.sin(a) + ax, x * Math.sin(a) + y * Math.cos(a) + ay + swayDY()];
    }
    function basketX(lift) { return { tx: 74 * M.sb * lift, ty: -100 * M.sb * lift, rot: 48 * D2R * lift }; }
    function basketToScreen(lx, ly, lift) {
      var T = basketX(lift), x = lx, y = ly + 53, cs = Math.cos(T.rot), sn = Math.sin(T.rot);
      return [M.bx + T.tx + (x * cs - y * sn) * M.sb, M.gy + T.ty + ((x * sn + y * cs) - 53) * M.sb];
    }
    function bagToScreen(lx, ly) { return [M.gx + lx * M.sb, M.gy + ly * M.sb]; }
    function isRipe(ch) { return ch.key === "deep" || ch.key === "red" || (ch.t2 !== null && clock - roundT0 >= ch.t2 + 1.6); }
    function looks(ch) {
      if (ch.t1 === null) return [[ch.key, 1]];
      var t = clock - roundT0, u1 = clamp((t - ch.t1) / 1.6), u2 = clamp((t - ch.t2) / 1.6);
      if (S.reduced) return [[ch.key, 1]];
      if (t < ch.t1) return [["green", 1]];
      if (t < ch.t1 + 1.6) return [["green", 1], ["orange", u1]];
      if (t < ch.t2) return [["orange", 1]];
      if (t < ch.t2 + 1.6) return [["orange", 1], ["red", u2]];
      return [["red", 1]];
    }

    /* ---- the story */
    function pickCherry(ch) {
      if (mode !== "pick" || reserved >= NEED || ch.picked) return;
      S.audio();
      var k = isRipe(ch) ? (ch.key === "deep" ? "deep" : "red") : null, s0 = [ch.sx, ch.sy], slot = reserved, T;
      ch.picked = true; reserved++;
      S.ting(slot * 5 + 2, 0, 0.03);
      if (reserved === NEED) S.jingle(5, 3);
      var to = basketToScreen(HEAP[slot][0], HEAP[slot][1], 0);
      T = S.reduced ? 0 : 0.38 + Math.hypot(to[0] - s0[0], to[1] - s0[1]) * 0.0011;
      flights.push({ t0: clock, T: T, from: s0, to: to, slot: slot, key: k, v: ch.v, spin: (ch.ph > 3 ? 1 : -1) * (4 + ch.v), r: ch.tilt });
      if (S.reduced) land(flights.pop());
    }
    function land(f) {
      heap[f.slot] = { key: f.key, v: f.v };
      landed++; read.textContent = countText(landed);
      bk.jig = clock;
      if (landed === NEED) later(0.3, startPour);
    }
    function pickNext() {
      if (mode !== "pick" || reserved >= NEED) return;
      var best = null, bd = 1e9, mouth = [M.bx, M.gy - 100 * M.sb];
      branch.cherries.forEach(function (ch) {
        if (ch.picked || !isRipe(ch) || ch.sx < -4 || ch.sx > M.w + 4) return;
        var d = Math.hypot(ch.sx - mouth[0], ch.sy - mouth[1]);
        if (d < bd) { bd = d; best = ch; }
      });
      if (best) pickCherry(best);
    }
    function queueNext() {
      nextBranch = makeBranch(2026 + (round + 1) * 97, M.w / M.sr, M.yStem / M.sr, M.csr);
      branchTasks(nextBranch, M.sr * dprNow).forEach(function (f) { tasks.push(f); });
    }
    function startPour() {
      mode = "pour"; modeT0 = clock; bagHeap = 0; bagFly = [];
      if (bag.sealed) { oldBag = bag; oldBagT0 = clock; bag = newBag(round % 3, clock); }
      bag.roast = round % 3; bag.stitches = labelStitches(ROASTS[bag.roast]); bag.drawn = 0;
      bag.label = S.layer(PATCH.w, PATCH.h, M.sb * dprNow);
      queueNext();
      if (S.reduced) {
        heap = []; landed = 0; reserved = 0; flights = []; bagHeap = NEED;
        bag.sealed = true; bag.sealT0 = -9;
        S.sew(bag.label.ctx, bag.stitches); bag.drawn = bag.stitches.length;
        setSay(function () { return sayFacts(bag.roast); });
        mode = "hold"; modeT0 = clock - 10; read.textContent = countText(0);
      }
    }

    /* ---- input */
    bPick.addEventListener("click", function () { S.audio(); pickNext(); });
    canvas.addEventListener("click", function (e) {
      if (!M) return;
      S.audio();
      var r = canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top, i, best = null, bd = 1e9, d, hitR = Math.max(20, CR * M.cs * 3);
      if (mode === "pick" && branch) {
        branch.cherries.forEach(function (ch) { if (ch.picked) return; d = Math.hypot(ch.sx - x, ch.sy - y); if (d < hitR && d < bd) { bd = d; best = ch; } });
        if (best) {
          if (isRipe(best)) pickCherry(best);
          else { best.wob = clock; setSay(sayNot); }
          return;
        }
      }
      /* a bag, the basket, a leaf, or the open air each answer */
      if (Math.abs(x - M.gx) < 60 * M.sb && y > M.gy - 150 * M.sb && y < M.gy + 6) { bag.hop = clock; return; }
      if (Math.abs(x - M.bx) < 70 * M.sb && y > M.gy - 130 * M.sb && y < M.gy + 6) { bk.jig = clock; return; }
      if (branch && branch.ready) {
        var bl = null, bdl = 1e9;
        branch.leaves.forEach(function (L) {
          if (!L.sp) return;
          var p0 = toScreen(L.x, L.y), p1 = toScreen(L.x + Math.cos(L.a) * L.LF * 0.55, L.y + Math.sin(L.a) * L.LF * 0.55), dd = Math.hypot(p1[0] - x, p1[1] - y);
          if (dd < L.LF * 0.5 * M.sr && dd < bdl) { bdl = dd; bl = L; }
        });
        if (bl) { bl.wob = clock; return; }
      }
      gust = clock;
    });

    /* ---- per frame */
    function update(dt) {
      var step = S.reduced ? 0 : dt, i, keep = [], fire = [], f, u;
      clock += step;
      if (timers.length) {
        timers.forEach(function (t) { (t.at <= clock ? fire : keep).push(t); }); timers = keep;
        fire.sort(function (a, b) { return a.at - b.at; }).forEach(function (t) { t.fn(); });
      }
      for (i = flights.length - 1; i >= 0; i--) { f = flights[i]; if (clock - f.t0 >= f.T) { flights.splice(i, 1); land(f); } }
      if (mode === "pour") {
        var t = clock - modeT0, lift = t < 0.55 ? ease.inout(t / 0.55) : t < 1.7 ? 1 : 1 - ease.inout(clamp((t - 1.7) / 0.6));
        bk.lift = lift;
        /* cherries leave the tilted rim one after another */
        while (bagFly.length < NEED && t >= 0.5 + bagFly.length * 0.1) {
          var idx = NEED - 1 - bagFly.length, from = basketToScreen(58 + (idx % 3) * 2, -100, bk.lift), slot = BHEAP[NEED - 1 - idx];
          landed = Math.max(0, landed - 1); read.textContent = countText(landed);
          bagFly.push({ t0: clock, T: 0.46, from: from, to: bagToScreen(slot[0], slot[1]), key: heap[idx] ? heap[idx].key : "red", v: heap[idx] ? heap[idx].v : 0, idx: idx, landedIn: false });
          heap[idx] = null;
        }
        bagFly.forEach(function (g) { if (!g.landedIn && clock - g.t0 >= g.T) { g.landedIn = true; bagHeap++; } });
        if (!bag.sealed && t >= 2.15) { bag.sealed = true; bag.sealT0 = clock; setSay(function () { return sayFacts(bag.roast); }); }
        if (bag.sealed && t >= 2.65) {
          var k = Math.floor(clamp((t - 2.65) / 1.5) * bag.stitches.length);
          if (k > bag.drawn) { S.sew(bag.label.ctx, bag.stitches.slice(bag.drawn, k)); bag.drawn = k; }
          if (k >= bag.stitches.length && mode === "pour") { mode = "hold"; modeT0 = clock; }
        }
      } else if (mode === "hold") {
        bk.lift = 0;
        if (!nextBranch) queueNext();
        if (clock - modeT0 > 0.9) {
          if (nextBranch && nextBranch.ready) {
            heap = []; landed = 0; reserved = 0; flights = []; bagFly = [];
            branch = nextBranch; nextBranch = null; round++; roundT0 = clock;
            branch.cherries.forEach(function (c, j) { c.born = clock + 0.25 + j * 0.012; });
            branch.leaves.forEach(function (L, j) { L.born = clock + j * 0.03; });
            mode = "pick"; modeT0 = clock; read.textContent = countText(0);
          }
        }
      }
    }

    /* ---- drawing */
    function drawBranch(c) {
      var b = branch, i, L, ch, a, g, pop, p, looksArr, k, tw, W2 = M.w;
      if (!b || !b.stem) return;
      c.save();
      c.translate(0, swayDY()); c.translate(0, M.yStem); c.rotate(swayRot()); c.translate(0, -M.yStem); c.scale(M.sr, M.sr);
      put(c, b.stem, 0, 0);
      var glintBand = function (x) { var v = Math.sin(6.283 * (clock / 6.5 - x / (W2 * 1.15))); return v > 0 ? Math.pow(v, 6) : 0; };
      for (i = 0; i < b.leaves.length; i++) {
        L = b.leaves[i]; if (!L.sp) continue;
        pop = prog(L.born, 0.3); if (pop <= 0) continue;
        tw = clock - L.wob; a = L.a + (S.reduced ? 0 : Math.sin(clock * 1.3 + L.ph) * 0.03 + (tw >= 0 && tw < 2 ? Math.exp(-2.4 * tw) * Math.sin(tw * 16) * 0.14 : 0) + (clock - gust >= 0 && clock - gust < 3 ? Math.exp(-1.3 * (clock - gust)) * Math.sin((clock - gust) * 8 + L.ph) * 0.08 : 0));
        c.save(); c.translate(L.x, L.y); c.rotate(a); c.scale(lerp(0.86, 1, ease.out(pop)), lerp(0.86, 1, ease.out(pop)));
        put(c, L.sp, 0, 0);
        g = S.reduced ? 0.4 : glintBand(L.x * M.sr);
        if (g > 0.02) { c.globalAlpha = g * 0.95; put(c, L.hl, 0, 0); }
        c.restore();
      }
      for (i = 0; i < b.cherries.length; i++) {
        ch = b.cherries[i];
        p = toScreen(ch.x, ch.y); ch.sx = p[0]; ch.sy = p[1];
        if (ch.picked) continue;
        pop = prog(ch.born, 0.4); if (pop <= 0) continue;
        tw = clock - ch.wob;
        a = ch.tilt + (S.reduced ? 0 : Math.sin(clock * 1.6 + ch.ph) * 0.04 + (tw >= 0 && tw < 1.4 ? Math.exp(-3 * tw) * Math.sin(tw * 24) * 0.4 : 0));
        looksArr = looks(ch);
        c.save(); c.translate(ch.x, ch.y); c.rotate(a); c.scale(M.csr * lerp(0.4, 1, ease.back(pop)), M.csr * lerp(0.4, 1, ease.back(pop)));
        for (k = 0; k < looksArr.length; k++) { c.globalAlpha = looksArr[k][1]; put(c, CS.set[looksArr[k][0]][ch.v], 0, 0); }
        c.restore();
      }
      c.restore();
    }
    function drawHeapCherry(c, h, x, y) {
      if (!h || !h.key) return;
      var k = M.cs / M.sb;
      c.save(); c.translate(x, y); c.scale(k, k); put(c, CS.set[h.key][h.v], 0, 0); c.restore();
    }
    function drawBasket(c) {
      var T = basketX(bk.lift), jg = clock - bk.jig, jr = !S.reduced && jg >= 0 && jg < 1.2 ? Math.exp(-4 * jg) * Math.sin(jg * 22) * 0.035 : 0, i;
      c.fillStyle = "rgba(40,25,15," + (0.24 * (1 - 0.6 * bk.lift)).toFixed(3) + ")"; c.beginPath(); c.ellipse(M.bx, M.gy + 3, 54 * M.sb, 8 * M.sb, 0, 0, Math.PI * 2); c.fill();
      c.save();
      c.translate(M.bx + T.tx, M.gy + T.ty); c.scale(M.sb, M.sb); c.translate(0, -53); c.rotate(T.rot + jr); c.translate(0, 53);
      put(c, BK.back, 0, 0);
      for (i = 0; i < NEED; i++) if (heap[i]) drawHeapCherry(c, heap[i], HEAP[i][0], HEAP[i][1]);
      put(c, BK.front, 0, 0);
      c.restore();
    }
    function drawBagOne(c, b, alpha, dx, hopT) {
      var hp = clock - hopT, hop = !S.reduced && hp >= 0 && hp < 0.7 ? Math.abs(Math.sin(hp * 9)) * Math.exp(-4 * hp) * 9 : 0, su = b.sealed ? prog(b.sealT0, 0.45) : 0, i;
      c.save(); c.globalAlpha = alpha;
      c.fillStyle = "rgba(40,25,15," + (0.24 * alpha).toFixed(3) + ")"; c.beginPath(); c.ellipse(M.gx + dx, M.gy + 3, 52 * M.sb, 7 * M.sb, 0, 0, Math.PI * 2); c.fill();
      c.translate(M.gx + dx, M.gy - hop * M.sb); c.scale(M.sb, M.sb);
      if (su < 1) {
        put(c, BG.back, 0, 0);
        if (b === bag) for (i = 0; i < Math.min(bagHeap, NEED); i++) drawHeapCherry(c, { key: i % 2 ? "deep" : "red", v: i % 3 }, BHEAP[i][0], BHEAP[i][1]);
        else for (i = 0; i < NEED; i++) drawHeapCherry(c, { key: i % 2 ? "deep" : "red", v: i % 3 }, BHEAP[i][0], BHEAP[i][1]);
        put(c, BG.front, 0, 0);
      }
      if (su > 0) {
        c.globalAlpha = alpha * su; put(c, BG.sealed, 0, 0);
        c.globalAlpha = alpha; if (b.label) c.drawImage(b.label.canvas, PATCH.x, PATCH.y, PATCH.w, PATCH.h);
      }
      c.restore();
    }
    function drawBags(c) {
      if (oldBag) {
        var u = prog(oldBagT0, 0.5);
        if (u < 1) drawBagOne(c, oldBag, 1 - u, 130 * M.sb * u, -9); else oldBag = null;
      }
      if (bag) {
        var ui = prog(bag.inT0, 0.5);
        drawBagOne(c, bag, ui, 130 * M.sb * (1 - ease.out(ui)), bag.hop);
      }
    }
    function drawCup(c) {
      var cx = M.gx + 132 * M.sb;
      if (!CUP || !M.cup) return;
      var warm = bag.sealed || oldBag || round > 0, j, ph, a;
      c.save(); c.fillStyle = "rgba(40,25,15,.22)"; c.beginPath(); c.ellipse(cx, M.gy + 3, 26 * M.sb, 4.5 * M.sb, 0, 0, Math.PI * 2); c.fill();
      c.translate(cx, M.gy); c.scale(M.sb, M.sb); put(c, CUP.cup, 0, 0);
      if (warm) for (j = 0; j < 3; j++) {
        ph = S.reduced ? 0.3 : ((clock * 0.35 + j * 0.34) % 1);
        a = Math.sin(Math.PI * ph) * 0.8; c.globalAlpha = a;
        put(c, CUP.steam[j], 0, -32 - ph * 30);
      }
      c.restore();
    }
    function drawFlights(c) {
      var i, f, u, x, y, key;
      for (i = 0; i < flights.length; i++) {
        f = flights[i]; u = clamp((clock - f.t0) / f.T);
        x = lerp(f.from[0], f.to[0], ease.out(u)); y = lerp(f.from[1], f.to[1], u * u);
        c.save(); c.translate(x, y); c.rotate(f.r + f.spin * u); c.scale(M.cs, M.cs);
        put(c, CS.set[f.key || "red"][f.v], 0, 0); c.restore();
      }
      for (i = 0; i < bagFly.length; i++) {
        f = bagFly[i]; if (f.landedIn) continue;
        u = clamp((clock - f.t0) / f.T);
        var ctrl = [(f.from[0] + f.to[0]) / 2, Math.min(f.from[1], f.to[1]) - 26 * M.sb];
        x = (1 - u) * (1 - u) * f.from[0] + 2 * (1 - u) * u * ctrl[0] + u * u * f.to[0]; y = (1 - u) * (1 - u) * f.from[1] + 2 * (1 - u) * u * ctrl[1] + u * u * f.to[1];
        c.save(); c.translate(x, y); c.rotate(u * 5); c.scale(M.cs, M.cs); put(c, CS.set[f.key || "red"][f.v], 0, 0); c.restore();
      }
    }

    function draw(st, dt) {
      var c = st.ctx, key = st.w + "x" + st.h + "@" + st.dpr;
            if (key !== bakeKey) rebuild(st);
      runTasks();
      update(dt);
      c.drawImage(BGL.canvas, 0, 0, st.w, st.h);
      if (CS && branch) drawBranch(c);
      if (BK && BG && CS) { drawCup(c); drawBags(c); drawBasket(c); drawFlights(c); }
    }

    S.stage(canvas, draw, { resize: function () { applyLayout(); } });
    setSay(sayStart); words();
  };
})();
