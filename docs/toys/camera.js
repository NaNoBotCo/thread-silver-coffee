/* camera.js — "One walk, every stall" (window.TOYS.camera)
   Eight market stalls under appliqué awnings and one walker with a phone. A snap flashes a stall,
   raises a stitched map pin and floats up a page card with a stitched QR square.
   Cut cloth and thread from window.STITCH. The pictures are baked once into layers; the frame loop
   only moves sprites. Motion comes from the frame clock and from taps; colours and layouts from S.rng. */
(function () {
  "use strict";
  var S = window.STITCH;
  window.TOYS = window.TOYS || {};

  /* ------------------------------------------------------------------ constants */
  var N = 8, P = 120, X0 = 40, WW = 1040, H0 = 400;
  var AWN_TOP = 152, AWN_MID = 178, AWN_BOT = 202, TABLE_TOP = 290, AISLE = 340, WALK_Y = 386;
  var DRESS = ["#d7263d", "#e0457b", "#f28c28", "#f6c445", "#2f9e5b", "#2b59c3", "#3fa7d6", "#7b4bb7"];
  var INDIGO = "#23284a", BLK = "#1f2333", LINEN = "#efe6d2", SILVER = "#d9dee2", WOOD = "#8a5a36";
  var WALL = "#2b3262", EARTH = "#a98660", STRAW = "#e3c88a";
  var D2R = Math.PI / 180;
  var clamp = S.clamp, lerp = S.lerp, mix = S.mix;
  var PAGE_URL = "https://motdang.net/markets/cm/kamthieng/amulets/";

  /* ------------------------------------------------------------------ words, both languages */
  var TXT = {
    title: { en: "One walk, every stall", th: "เดินรอบเดียว ได้ทุกร้าน" },
    snap: { en: "Snap", th: "ถ่ายภาพ" },
    again: { en: "Again", th: "เริ่มใหม่" },
    snapAria: { en: "Snap the stall nearest the phone", th: "ถ่ายร้านที่อยู่ใกล้โทรศัพท์ที่สุด" },
    againAria: { en: "Start again from the first stall", th: "เริ่มใหม่ตั้งแต่ร้านแรก" },
    desc: {
      en: "A market row of eight stalls under striped awnings. A person with a phone walks along the front. A snapped stall has a map pin, a page card and a QR sign.",
      th: "แถวตลาดแปดร้านใต้กันสาดลายทาง คนถือโทรศัพท์เดินไปตามหน้าร้าน ร้านที่ถูกถ่ายมีหมุดแผนที่ การ์ดหน้าเว็บ และป้าย QR"
    }
  };
  function tr(o) { return o[document.documentElement.dataset.lang === "th" ? "th" : "en"]; }
  function countText(n) { return tr({ en: "Stalls with a page: " + n + " of 8", th: "ร้านที่มีหน้าเว็บ: " + n + " จาก 8 ร้าน" }); }
  function sayStart() { return tr({ en: "One walk, eight stalls. Snap or tap a stall: it gets a page.", th: "เดินรอบเดียว แปดร้าน ถ่ายหรือแตะร้านไหน ร้านนั้นก็มีหน้าเว็บของตัวเอง" }); }
  function saySnap(i) { return tr({ en: "Stall " + (i + 1) + " has a page and a QR sign.", th: "ร้านที่ " + (i + 1) + " มีหน้าเว็บและป้าย QR แล้ว" }); }
  function sayAgain(i) { return tr({ en: "Stall " + (i + 1) + " has its page.", th: "ร้านที่ " + (i + 1) + " มีหน้าเว็บแล้ว" }); }
  function sayDone() {
    var a = "<a href=\"" + PAGE_URL + "\" target=\"_blank\" rel=\"noopener\">motdang.net/markets/cm/kamthieng/amulets/</a>";
    return tr({
      en: "Chiang Mai’s Kamthieng amulet hall got 28 stall pages, each with a printable QR table sign, from one morning’s walk in September 2026. ",
      th: "ห้องพระเครื่องในตลาดคำเที่ยง เชียงใหม่ ได้หน้าเว็บ 28 ร้าน แต่ละหน้ามีป้าย QR สำหรับพิมพ์วางโต๊ะ จากการเดินเช้าเดียวในเดือนกันยายน 2026 "
    }) + a;
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
  /* a cut piece sewn down: cloth, then a running stitch just inside its edge */
  function ap(c, pts, col, thr, o) {
    var q = {}, k;
    for (k in OPT) q[k] = OPT[k];
    if (o) for (k in o) q[k] = o[k];
    S.applique(c, dense(pts, 3), col, thr === undefined ? mix(col, "#ffffff", 0.5) : thr, q);
  }
  /* an offscreen piece in design units: origin at (ox, oy) inside it */
  function sprite(sc, w, h, ox, oy, fn) {
    var L = S.layer(w, h, sc), c = L.ctx;
    c.translate(ox, oy); fn(c);
    return { c: L.canvas, w: w, h: h, ox: ox, oy: oy };
  }
  function put(c, sp, x, y) { c.drawImage(sp.c, x - sp.ox, y - sp.oy, sp.w, sp.h); }

  /* ------------------------------------------------------------------ the eight stalls */
  var STALLS = [
    { pal: [0, 3, 5], back: "#1f2333", drape: "#2f9e5b", band: "tri", acc: ["#f6c445", "#e0457b"], ground: "earth", goods: ["cloth", "silver"] },
    { pal: [1, 4, 3], back: "#3a2d4f", drape: "#2b59c3", band: "cross", acc: ["#efe6d2", "#f28c28"], ground: "mat", mat: [0, 3], goods: ["coffee", "basket"] },
    { pal: [2, 7, 6], back: "#1f3b34", drape: "#d7263d", band: "tri", acc: ["#efe6d2", "#f6c445"], ground: "earth", goods: ["cloth", "basket"], skirts: true, coins: true },
    { pal: [5, 2, 1], back: "#6b1f2e", drape: "#f6c445", band: "diamond", acc: ["#23284a", "#d7263d"], ground: "earth", goods: ["basket", "cloth"] },
    { pal: [4, 1, 2], back: "#4a2b1e", drape: "#7b4bb7", band: "cross", acc: ["#f6c445", "#3fa7d6"], ground: "mat", mat: [5, 2], goods: ["silver", "coffee"], coins: true },
    { pal: [6, 0, 3], back: "#1f2333", drape: "#e0457b", band: "tri", acc: ["#efe6d2", "#2b59c3"], ground: "earth", goods: ["coffee", "cloth"] },
    { pal: [7, 3, 4], back: "#6b1f2e", drape: "#3fa7d6", band: "diamond", acc: ["#f6c445", "#7b4bb7"], ground: "mat", mat: [4, 1], goods: ["basket", "coffee"], skirts: true },
    { pal: [3, 5, 0], back: "#3a2d4f", drape: "#f28c28", band: "cross", acc: ["#23284a", "#efe6d2"], ground: "earth", goods: ["silver", "cloth"], coins: true }
  ];
  function stallX0(i) { return X0 + i * P + 6; }

  /* ------------------------------------------------------------------ baking the hall */
  function bakeWall(c) {
    var k, sts = [];
    S.cloth(c, rect(0, 0, WW, 346), WALL, { pitch: 3.4, shadow: false, grain: 0.5 });
    S.cloth(c, rect(0, 0, WW, 19), "#5b3b27", { pitch: 2.2, shadow: false });
    S.sew(c, S.running([[0, 15], [WW, 15]], 5, 3.5, 1.2, "#8a6040"));
    for (k = 0; k < Math.floor(WW / 9); k++) add(sts, S.cross(6 + k * 9, 25, 4, 1.1, mix(DRESS[k % 8], WALL, 0.45)));
    S.sew(c, sts);
    /* two roof posts at the ends of the hall */
    S.cloth(c, rect(10, 19, 9, 321), "#4a3020", { pitch: 2.2, shadow: false });
    S.cloth(c, rect(WW - 19, 19, 9, 321), "#4a3020", { pitch: 2.2, shadow: false });
    /* above each stall, a stitched outline where its pin and page card will sit */
    sts = [];
    for (k = 0; k < N; k++) {
      var cx = stallX0(k) + 54, ring = [], slot = rrect(cx - 42, 40, 84, 70, 6);
      slot.push(slot[0]);
      add(sts, S.running(slot, 3, 3, 1, mix(WALL, "#ffffff", 0.2)));
      for (var a = 0; a <= 24; a++) ring.push([cx + Math.cos((a / 24) * Math.PI * 2) * 8.5, 126 + Math.sin((a / 24) * Math.PI * 2) * 8.5]);
      add(sts, S.running(ring, 2.4, 2.4, 1, mix(WALL, "#ffffff", 0.2)));
    }
    S.sew(c, sts);
  }
  function bakeGround(c) {
    var r = S.rng(77), k, sts = [];
    S.cloth(c, rect(0, AISLE, WW, H0 - AISLE), EARTH, { pitch: 3.4, shadow: false });
    for (k = 0; k < 16; k++) S.cloth(c, ell(r() * WW, 352 + r() * 42, 24 + r() * 34, 4 + r() * 4, 20), mix(EARTH, r() < 0.5 ? "#d2b48a" : "#8b6a46", 0.5), { pitch: 3.4, shadow: false, grain: 0.35 });
    for (k = 0; k < 230; k++) sts.push(S.knot([r() * WW, AISLE + 6 + r() * 52], 0.7 + r() * 0.9, mix(EARTH, r() < 0.5 ? "#fff3dc" : "#2a1a10", 0.25 + r() * 0.25)));
    S.sew(c, sts);
    sts = [];
    for (k = 0; k < 20; k++) {
      var y = 350 + r() * 40, x = r() * (WW - 90);
      sts = sts.concat(S.running([[x, y], [x + 30 + r() * 50, y + (r() - 0.5) * 3]], 3.5, 3, 1, mix(EARTH, "#e8d2ad", 0.45)));
    }
    S.sew(c, sts);
    c.fillStyle = "rgba(40,25,15,.26)"; c.fillRect(0, AISLE, WW, 5);
  }
  function edgeX(xt, xb, y0, y1, y) { return lerp(xt, xb, (y - y0) / (y1 - y0)); }
  function bakeMat(c, x0, x1, st) {
    var poly = [[x0 + 8, 345], [x1 - 8, 345], [x1 + 3, 377], [x0 - 3, 377]], j, sts = [], q, y, xl, xr, x;
    S.cloth(c, poly, "#dcc58e", { pitch: 2.2 });
    for (j = 0; j < 7; j++) {
      y = 352 + j * 3.4; xl = edgeX(x0 + 8, x0 - 3, 345, 377, y) + 3; xr = edgeX(x1 - 8, x1 + 3, 345, 377, y) - 3;
      for (x = xl, q = 0; x < xr - 3; x += 4.4, q++) sts.push(S.straight([x + (j % 2) * 2.2, y], [x + (j % 2) * 2.2 + 3.2, y], 1.3, q % 2 ? "#c9b072" : "#f0e2b4"));
    }
    S.sew(c, sts);
    [[348, 351, DRESS[st.mat[0]]], [371, 374.5, DRESS[st.mat[1]]]].forEach(function (b) {
      var p = [[edgeX(x0 + 8, x0 - 3, 345, 377, b[0]) + 1, b[0]], [edgeX(x1 - 8, x1 + 3, 345, 377, b[0]) - 1, b[0]], [edgeX(x1 - 8, x1 + 3, 345, 377, b[1]) - 1, b[1]], [edgeX(x0 + 8, x0 - 3, 345, 377, b[1]) + 1, b[1]]];
      ap(c, p, b[2], mix(b[2], "#ffffff", 0.55), { inset: 0.9, dash: 2, gap: 1.6, tw: 0.6, shadow: false });
    });
  }
  function bakePole(c, x, y0, y1) {
    S.cloth(c, rect(x - 2.3, y0, 4.6, y1 - y0), WOOD, { pitch: 1.5, grain: 0.5 });
    S.sew(c, S.stem([[x - 1.1, y0 + 3], [x - 1.1, y1 - 2]], 7, 1.2, "#c18a58", Math.floor(x)));
    S.sew(c, [S.straight([x + 1.4, y0 + 3], [x + 1.4, y1 - 3], 1.0, "#5a3820"), S.knot([x, y0 + 2], 2.3, "#6f4a2b")]);
  }
  function bakePanel(c, x0, x1, st) {
    var bx = x0 + 5, bw = x1 - x0 - 10, cA = DRESS[st.pal[0]], cB = DRESS[st.pal[1]], sts = [], x;
    S.cloth(c, rect(bx, AWN_BOT, bw, TABLE_TOP - AWN_BOT), st.back, { pitch: 2.2, shadow: false, grain: 0.5 });
    ap(c, rect(bx, 247, bw, 5), cA, mix(cA, "#ffffff", 0.5), { inset: 1, dash: 2, gap: 1.6, tw: 0.6, shadow: false, pitch: 1.5 });
    for (x = bx + 3; x < bx + bw - 5; x += 3) add(sts, S.cross(x, 240, 2.1, 0.8, x % 6 < 3 ? cB : LINEN));
    S.sew(c, sts);
    c.fillStyle = "rgba(12,10,26,.34)"; c.fillRect(bx, AWN_BOT + 2, bw, 16);
  }
  function bakeTable(c, x0, x1, st) {
    var w = x1 - x0, n = 12, sw = (w - 6) / n, k, a, sts = [], xa, xm, col, poly, y;
    S.cloth(c, rect(x0 + 1, 287, w - 2, 9), "#c7a36c", { pitch: 2.2 });
    S.sew(c, [S.straight([x0 + 3, 289.6], [x1 - 3, 289.6], 1.2, "#ecd5a2")]);
    S.cloth(c, rect(x0 + 3, 296, w - 6, 40), st.drape, { pitch: 2.2 });
    c.fillStyle = "rgba(25,15,8,.22)"; c.fillRect(x0 + 3, 296, w - 6, 3);
    for (k = 0; k < n; k++) {
      xa = x0 + 3 + k * sw; xm = xa + sw / 2; col = k % 2 ? st.acc[0] : st.acc[1];
      if (st.band === "tri") {
        ap(c, [[xa, 309], [xa + sw, 309], [xm, 321]], col, mix(col, "#ffffff", 0.5), { inset: 1.2, dash: 1.8, gap: 1.4, tw: 0.6, shadow: false, pitch: 1.5 });
      } else if (st.band === "diamond") {
        ap(c, [[xm, 309.5], [xm + 5.2, 315.5], [xm, 321.5], [xm - 5.2, 315.5]], col, mix(col, "#ffffff", 0.5), { inset: 1.1, dash: 1.8, gap: 1.4, tw: 0.6, shadow: false, pitch: 1.5 });
        sts.push(S.knot([xm, 315.5], 1.3, k % 2 ? st.acc[1] : st.acc[0]));
      }
    }
    if (st.band === "cross") {
      for (y = 0; y < 3; y++) for (xa = x0 + 6; xa < x1 - 9; xa += 2.9) add(sts, S.cross(xa, 309 + y * 4.2, 2.3, 0.8, y === 1 ? st.acc[1] : st.acc[0]));
      add(sts, S.running([[x0 + 5, 306], [x1 - 5, 306]], 2.2, 1.6, 0.8, st.acc[0]));
      add(sts, S.running([[x0 + 5, 324], [x1 - 5, 324]], 2.2, 1.6, 0.8, st.acc[0]));
    }
    S.sew(c, sts);
    for (k = 0; k < n; k++) {
      xa = x0 + 3 + k * sw; xm = xa + sw / 2; col = k % 2 ? st.acc[1] : st.acc[0];
      poly = [[xa, 331], [xa + sw + 0.2, 331]];
      for (a = 0; a <= 6; a++) poly.push([xm + Math.cos((a / 6) * Math.PI) * sw / 2 + 0.1, 331 + Math.sin((a / 6) * Math.PI) * 5.2]);
      ap(c, poly, col, mix(col, "#ffffff", 0.5), { inset: 1, dash: 1.8, gap: 1.4, tw: 0.55, pitch: 1.5 });
    }
  }

  /* goods: drawn with the origin at the bottom centre of the item, y up is negative */
  function gCloth(c, r) {
    var idx = [], y = 0, k, i, j, sts, col, w, h, x, acc, fr;
    while (idx.length < 3) { j = Math.floor(r() * 8); if (idx.indexOf(j) < 0) idx.push(j); }
    for (k = 0; k < 3; k++) {
      col = DRESS[idx[k]]; w = 44 - k * 4 + r() * 3; h = 9 + r() * 1.5; x = -w / 2 + (r() - 0.5) * 4;
      acc = k % 2 ? LINEN : "#f6c445"; if (acc === col) acc = LINEN;
      ap(c, rect(x, y - h, w, h), col, mix(col, "#ffffff", 0.5), { inset: 1.2, dash: 2.2, gap: 1.8, tw: 0.7, pitch: 1.5 });
      sts = [];
      for (i = x + 3; i < x + w - 5; i += 2.6) add(sts, S.cross(i, y - h + 1.6, 2.0, 0.8, acc));
      for (i = x + 3; i < x + w - 5; i += 2.6) add(sts, S.cross(i, y - 3.8, 2.0, 0.8, (k + Math.floor(i / 2.6)) % 2 ? acc : mix(col, "#1f2333", 0.5)));
      S.sew(c, sts);
      fr = [];
      for (i = 0; i < 4; i++) fr.push(S.straight([x + w - 0.5, y - h + 1.5 + i * 1.8], [x + w + 2.3, y - h + 1.9 + i * 1.8], 0.7, col));
      S.sew(c, fr);
      y -= h;
    }
  }
  function ringPath(cx, cy, rx, ry, rot) {
    var o = [], i, a, x, y;
    for (i = 0; i <= 26; i++) { a = (i / 26) * Math.PI * 2; x = Math.cos(a) * rx; y = Math.sin(a) * ry; o.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]); }
    return o;
  }
  function gSilver(c, r) {
    var i, sts = [], b, bangles = [[-13, 7.2, 10.2, -0.16], [-4, 7.8, 11.4, 0.04], [5.5, 7.4, 10.6, 0.2], [14, 6.6, 9.4, -0.05]];
    ap(c, rect(-23, -8, 46, 8), "#2b3a67", "#8f9ac4", { inset: 1.2, dash: 2.2, gap: 1.8, tw: 0.6, pitch: 1.5 });
    ap(c, rect(-17, -16, 34, 8), "#2b3a67", "#8f9ac4", { inset: 1.2, dash: 2.2, gap: 1.8, tw: 0.6, pitch: 1.5 });
    for (i = 0; i < bangles.length; i++) {
      b = bangles[i];
      S.sew(c, S.stem(ringPath(b[0], -16 - b[2] * 0.92, b[1], b[2], b[3]), 4.4, 2.7, SILVER, 31 + i));
      S.sew(c, S.stem(ringPath(b[0], -16 - b[2] * 0.92, b[1] - 2.2, b[2] - 2.2, b[3]), 5, 1.3, S.SILVER2, 41 + i));
      S.sew(c, [S.straight([b[0] - b[1] * 0.7, -16 - b[2] * 1.5], [b[0] - b[1] * 0.35, -16 - b[2] * 1.85], 0.9, "#ffffff")]);
    }
    for (i = 0; i < 5; i++) add(sts, S.coin(-17 + i * 8.5, -4, 3.1));
    for (i = 0; i <= 8; i++) sts.push(S.bead(-15 + i * 3.75, -13.4 + 3.6 * Math.sin((i / 8) * Math.PI), 1.2));
    S.sew(c, sts);
  }
  function gCoffee(c) {
    var specs = [[-17, 22, 33, "#c9a46a"], [1, 24, 37, "#ecdcb8"], [18, 19, 29, "#8c5a3a"]], i, sx, w, h, col, poly;
    for (i = 0; i < 3; i++) {
      sx = specs[i][0]; w = specs[i][1]; h = specs[i][2]; col = specs[i][3];
      poly = [[sx - w / 2, 0], [sx + w / 2, 0], [sx + w / 2 + 0.9, -h * 0.45], [sx + w / 2 - 1.2, -h * 0.84], [sx + w / 2 - 3, -h], [sx - w / 2 + 3, -h], [sx - w / 2 + 1.2, -h * 0.84], [sx - w / 2 - 0.9, -h * 0.45]];
      ap(c, poly, col, mix(col, "#ffffff", 0.55), { inset: 1.4, dash: 2.4, gap: 2, tw: 0.7, pitch: 1.5 });
      ap(c, rect(sx - w / 2 + 3, -h - 0.5, w - 6, 6), mix(col, "#3a2410", 0.22), mix(col, "#ffffff", 0.5), { inset: 1, dash: 2, gap: 1.6, tw: 0.6, pitch: 1.5 });
      S.sew(c, [S.straight([sx - w / 2 + 2, -h + 3.2], [sx + w / 2 - 2, -h + 3.2], 1.1, "#d7263d"), S.knot([sx + 1, -h + 3.2], 1.6, "#d7263d")]);
      ap(c, rect(sx - w / 4 - 1, -h * 0.66, w / 2 + 2, h * 0.3), LINEN, "#b8a47e", { inset: 1, dash: 1.8, gap: 1.5, tw: 0.55, pitch: 1.5 });
      S.sew(c, [S.knot([sx - 1.2, -h * 0.5], 1.6, "#d7263d"), S.knot([sx + 1.6, -h * 0.5 + 0.4], 1.3, "#2f9e5b")]);
    }
  }
  function basketPiece(c, cx, w0, w1, h, c1, c2, acc, handle) {
    var poly = dense([[cx - w0 / 2, 0], [cx + w0 / 2, 0], [cx + w1 / 2, -h], [cx - w1 / 2, -h]], 3), c1b = mix(c1, "#fff6dc", 0.3);
    var sts = [], rows = Math.floor(h / 3.2), j, q, x, y, half, col, dir;
    S.cloth(c, poly, c1, { pitch: 2.2 });
    c.save(); pathTo(c, poly); c.clip();
    for (j = 0; j < rows; j++) {
      y = -h + 2.4 + j * 3.2; half = lerp(w1, w0, (j + 0.5) / rows) / 2;
      for (x = cx - half, q = 0; x < cx + half; x += 3.1, q++) {
        dir = (j + q) & 1 ? 1 : -1;
        col = j === 2 || j === rows - 3 ? acc : ((q + j) % 3 === 0 ? c2 : c1b);
        sts.push(S.straight([x, y + dir * 1.3], [x + 2.5, y - dir * 1.3], 1.5, col));
      }
    }
    S.sew(c, sts); c.restore();
    ap(c, ell(cx, -h, w1 / 2 + 0.8, 2.4, 20), mix(c2, "#3a2410", 0.1), mix(c2, "#ffffff", 0.4), { inset: 0.8, dash: 2, gap: 1.6, tw: 0.6, pitch: 1.5, shadow: false });
    if (handle) S.sew(c, S.stem(S.curve([[cx - w1 / 2 + 3, -h], [cx - w1 / 2 + 5, -h - 9], [cx, -h - 13], [cx + w1 / 2 - 5, -h - 9], [cx + w1 / 2 - 3, -h]], false, 6), 4, 2.3, c2, 9));
  }
  function gBasket(c) {
    basketPiece(c, -9, 30, 42, 32, STRAW, "#b88a46", BLK, true);
    basketPiece(c, 17, 20, 29, 22, STRAW, "#b88a46", "#d7263d", false);
  }
  function gSkirts(c, x0, x1, r) {
    var k, j, sx, top = 216, w0, w1, y0, y1, col, bands, h = 46;
    ap(c, rect(x0 + 5, 212.5, x1 - x0 - 10, 3.4), "#6f4a2b", "#c18a58", { inset: 0.8, dash: 2, gap: 1.6, tw: 0.6, pitch: 1.5 });
    for (k = 0; k < 4; k++) {
      sx = x0 + 17 + k * 24.6; w0 = 15; w1 = 23;
      bands = [BLK, DRESS[Math.floor(r() * 8)], BLK, DRESS[Math.floor(r() * 8)], DRESS[Math.floor(r() * 8)]];
      y0 = top;
      for (j = 0; j < 5; j++) {
        y1 = y0 + (j === 0 ? 5 : (h - 5) / 4); col = j === 0 ? INDIGO : bands[j];
        var xl0 = sx - lerp(w0, w1, (y0 - top) / h) / 2, xr0 = sx + lerp(w0, w1, (y0 - top) / h) / 2, xl1 = sx - lerp(w0, w1, (y1 - top) / h) / 2, xr1 = sx + lerp(w0, w1, (y1 - top) / h) / 2;
        ap(c, [[xl0, y0], [xr0, y0], [xr1, y1], [xl1, y1]], col, mix(col, "#ffffff", 0.5), { inset: 0.9, dash: 1.8, gap: 1.4, tw: 0.55, pitch: 1.5 });
        if (col === BLK) { var cs = []; for (var q = xl0 + 3; q < xr0 - 4; q += 2.6) add(cs, S.cross(q, y0 + 2.4, 1.9, 0.7, "#f6c445")); S.sew(c, cs); }
        y0 = y1;
      }
      S.sew(c, [S.straight([sx - 4, 213.5], [sx - 3, 216.5], 0.8, "#c18a58"), S.straight([sx + 4, 213.5], [sx + 3, 216.5], 0.8, "#c18a58")]);
    }
  }
  var GOODS = { cloth: gCloth, silver: gSilver, coffee: gCoffee, basket: gBasket };

  function bakeAwning(c, x0, x1, pal) {
    var xa = x0 - 2, xb = x1 + 2, w = xb - xa, n = 9, sw = w / n, k, a, cols = pal.map(function (j) { return DRESS[j]; }), sts = [];
    var AWN = { inset: 1.5, dash: 2.4, gap: 2, tw: 0.8, pitch: 2.2 };
    ap(c, rect(xa + 3, 147.5, w - 6, 5.5), "#6f4a2b", "#c18a58", { inset: 0.9, dash: 2.2, gap: 1.8, tw: 0.6, pitch: 1.5 });
    for (k = 0; k < n; k++) {
      var u0 = k / n, u1 = (k + 1) / n, col = cols[k % 3];
      var t0 = x0 + 8 + (x1 - x0 - 16) * u0, t1 = x0 + 8 + (x1 - x0 - 16) * u1, b0 = xa + w * u0, b1 = xa + w * u1;
      ap(c, [[t0, AWN_TOP], [t1 + 0.3, AWN_TOP], [b1 + 0.3, AWN_MID], [b0, AWN_MID]], col, mix(col, "#ffffff", 0.55), AWN);
    }
    for (k = 0; k < n; k++) {
      var xs0 = xa + k * sw, xs1 = xs0 + sw, xm = (xs0 + xs1) / 2, col2 = cols[(k + 1) % 3], poly = [[xs0, AWN_MID - 2], [xs1 + 0.3, AWN_MID - 2], [xs1 + 0.3, AWN_BOT]];
      for (a = 0; a <= 8; a++) poly.push([xm + Math.cos((a / 8) * Math.PI) * sw / 2 + 0.15, AWN_BOT + Math.sin((a / 8) * Math.PI) * sw / 2]);
      poly.push([xs0, AWN_BOT]);
      ap(c, poly, col2, mix(col2, "#ffffff", 0.55), AWN);
      sts.push(S.knot([xm, AWN_BOT + sw / 2 - 2.2], 1.3, LINEN));
    }
    for (k = xa + 3; k < xb - 5; k += 4.4) add(sts, S.cross(k, 186.5, 2.2, 0.75, "#fff4d8"));
    S.sew(c, sts);
  }

  function bakeStall(c, i) {
    var st = STALLS[i], x0 = stallX0(i), x1 = x0 + 108, cx = x0 + 54, r = S.rng(900 + i * 17), g = st.goods.length;
    var slots = g === 1 ? [0] : g === 2 ? [-26, 26] : [-33, 0, 33], k = g === 1 ? 1 : g === 2 ? 0.9 : 0.78;
    if (st.ground === "mat") bakeMat(c, x0, x1, st);
    bakePanel(c, x0, x1, st);
    bakePole(c, x0 + 2.5, AWN_TOP - 2, 343); bakePole(c, x1 - 2.5, AWN_TOP - 2, 343);
    if (st.skirts) gSkirts(c, x0, x1, r);
    bakeTable(c, x0, x1, st);
    st.goods.forEach(function (name, j) {
      c.save(); c.translate(cx + slots[j], TABLE_TOP + 1); c.scale(k, k); GOODS[name](c, r); c.restore();
    });
    bakeAwning(c, x0, x1, st.pal);
  }

  /* ------------------------------------------------------------------ the walker: kinematics */
  function gauss(p, c, s) { var d = Math.abs(p - c); d = Math.min(d, 1 - d); return Math.exp(-(d * d) / (2 * s * s)); }
  var FK = [[0, 12], [0.08, 0], [0.32, 0], [0.5, -35], [0.58, -52], [0.72, -40], [0.88, -4], [1, 12]];
  function footKey(p) {
    for (var i = 1; i < FK.length; i++) if (p <= FK[i][0]) {
      var a = FK[i - 1], b = FK[i], f = (p - a[0]) / (b[0] - a[0]);
      f = (1 - Math.cos(f * Math.PI)) / 2; return a[1] + (b[1] - a[1]) * f;
    }
    return 12;
  }
  /* head 14 units, seven heads: hip 3.4 from the top, thigh 1.6, shin 1.65, ankle to sole 0.35 */
  var L1 = 22.4, L2 = 23.1, SOLE = 4.9, UA = 18.9, FA = 15.4;
  function legPose(p, k) {
    p = p - Math.floor(p);
    var th = (4 + 24 * Math.cos(2 * Math.PI * p)) * D2R * k;
    var d = ((p - 0.72) + 1.5) % 1 - 0.5, sw = d < 0 ? 0.11 : 0.07;
    var kn = (4 + 12 * gauss(p, 0.1, 0.07) + 20 * gauss(p, 0.5, 0.06) + 62 * Math.exp(-(d * d) / (2 * sw * sw))) * D2R * k;
    var s2 = th - kn, ft = footKey(p) * D2R * k;
    var al = clamp(ft - s2, -42 * D2R, 30 * D2R), psi = s2 + al;               /* ankle stays inside its range */
    var kx = L1 * Math.sin(th), ky = L1 * Math.cos(th), ax = kx + L2 * Math.sin(s2), ay = ky + L2 * Math.cos(s2);
    var low = -1e9, pts = [[-3.6, SOLE], [5.5, SOLE], [9.7, SOLE]], i, yy;
    for (i = 0; i < 3; i++) { yy = ay - pts[i][0] * Math.sin(psi) + pts[i][1] * Math.cos(psi); if (yy > low) low = yy; }
    return { th: th, s2: s2, psi: psi, kx: kx, ky: ky, ax: ax, ay: ay, low: low };
  }
  var SPEED = 44;                                                               /* world units per second */
  var CYCLE = (function () { var a = legPose(0.15, 1).ax, b = legPose(0.35, 1).ax; return Math.abs((b - a) / 0.2) / SPEED; })();

  function limbPoly(r0, r1, len) {
    var pts = [], n = 6, i, a;
    for (i = 0; i <= n; i++) { a = Math.PI + (i / n) * Math.PI; pts.push([Math.cos(a) * r0, Math.sin(a) * r0]); }
    for (i = 0; i <= n; i++) { a = (i / n) * Math.PI; pts.push([Math.cos(a) * r1, len + Math.sin(a) * r1]); }
    return pts;
  }
  var SHIRT = [[-5.2, -26.2], [-1.5, -27.4], [2.8, -27.2], [4.6, -25.0], [5.7, -20.5], [5.9, -15.0], [5.5, -8.5], [5.6, -2.0], [5.5, 2.8], [0.5, 3.4], [-5.6, 3.0], [-6.0, -3], [-6.3, -10], [-6.7, -17.5], [-6.0, -23.0]];
  var HEAD = [[-1.0, -47.6], [3.0, -46.8], [5.0, -44.6], [5.6, -42.0], [5.5, -40.6], [6.1, -39.4], [7.5, -37.4], [6.3, -36.8], [6.2, -35.9], [5.6, -35.2], [5.9, -34.4], [5.0, -33.5], [3.0, -32.6], [-0.6, -32.8], [-3.6, -34.6], [-5.8, -37.6], [-6.5, -41.2], [-5.9, -44.6], [-3.8, -46.8]];
  var HAIR = [[-0.2, -48.3], [3.6, -47.4], [5.0, -45.2], [3.2, -44.6], [0.5, -44.2], [-1.8, -42.6], [-2.8, -40.2], [-4.4, -38.2], [-5.6, -37.0], [-6.7, -39.8], [-7.0, -43.2], [-5.6, -46.4], [-3.2, -47.9]];

  function bakeWalker(B) {
    var sc = B.sc, W = {}, skin = "#c4875a", shirt = "#f3ecd8", collar = "#e0457b", trou = "#2d3366", shoe = "#d7263d", sole = "#efe6d2";
    var O = { inset: 0.8, dash: 1.5, gap: 1.2, tw: 0.5, pitch: 1.5 };
    function dk(col, far) { return far ? mix(col, "#150e0a", 0.3) : col; }
    function lt(col) { return mix(col, "#ffffff", 0.45); }
    function limbSp(r0, r1, len, col, thr, extra, padB) {
      var w = Math.ceil(2 * Math.max(r0, r1) + 10), h = Math.ceil(len + r0 + r1 + (padB || 12));
      return sprite(sc, w, h, w / 2, r0 + 4, function (c) { ap(c, limbPoly(r0, r1, len), col, thr, O); if (extra) extra(c); });
    }
    [false, true].forEach(function (far) {
      var sk = dk(skin, far), sh = dk(shirt, far), co = dk(collar, far), tp = dk(trou, far), so = dk(shoe, far), ix = far ? "F" : "N";
      W["up" + ix] = limbSp(2.9, 2.4, UA, sk, null, function (c) {
        ap(c, S.curve([[-3.7, -3.4], [3.7, -3.4], [4.0, 9.8], [-4.0, 10]], true, 3), sh, "#c9b995", O);
        S.sew(c, S.running([[-3.8, 9], [3.9, 9]], 1.2, 0.9, 0.55, co));
      });
      W["fo" + ix] = limbSp(2.3, 1.75, FA, sk, null, function (c) {
        ap(c, S.curve([[-1.9, 14.4], [1.9, 14.4], [2.5, 18.5], [2.6, 22.8], [1.4, 25.2], [-0.9, 24.8], [-1.7, 21.6], [-2.0, 18]], true, 4), sk, null, O);
        ap(c, S.curve([[1.6, 15.6], [4.2, 18.0], [4.5, 20.4], [2.2, 19.6]], true, 3), sk, null, O);
        S.sew(c, [S.straight([0.1, 21.2], [0.1, 24.0], 0.35, mix(sk, "#1a120c", 0.45)), S.straight([-0.8, 21.4], [-0.8, 23.8], 0.35, mix(sk, "#1a120c", 0.45))]);
      }, 18);
      W["th" + ix] = limbSp(4.6, 3.7, L1, tp, lt(tp), null, 12);
      W["sh" + ix] = sprite(sc, 18, 36, 9, 7, function (c) {
        ap(c, S.curve([[-1.9, 18], [1.9, 18], [1.8, 24.2], [-1.8, 24.2]], true, 3), sk, null, O);
        ap(c, limbPoly(3.7, 3.0, 16.6), tp, lt(tp), O);
        S.sew(c, S.running([[-3.0, 17.4], [3.1, 17.4]], 1.3, 0.9, 0.5, co));
      });
      W["ft" + ix] = sprite(sc, 26, 17, 9, 7, function (c) {
        ap(c, S.curve([[-2.9, -1.6], [2.6, -1.6], [3.4, 0.2], [6.5, 1.8], [9.3, 3.2], [10.1, 4.2], [9.7, SOLE], [-3.6, SOLE], [-3.9, 3.0], [-3.4, 0.8]], true, 4), so, lt(so), O);
        ap(c, [[-3.7, 3.6], [9.9, 3.6], [9.7, SOLE], [-3.6, SOLE]], dk(sole, far), null, { inset: 0.5, pitch: 1.5, shadow: false });
        S.sew(c, [S.straight([3.3, 0.3], [5.1, 1.0], 0.6, sole), S.straight([4.6, 1.0], [6.5, 1.7], 0.6, sole)]);
      });
    });
    W.torso = sprite(sc, 34, 70, 17, 56, function (c) {
      ap(c, S.curve([[-2.6, -27.8], [2.4, -27.8], [2.7, -33.8], [-2.9, -33.8]], true, 3), skin, null, O);
      ap(c, S.curve(SHIRT, true, 5), shirt, "#c9b995", O);
      S.sew(c, S.running([[-3.4, -21], [-3.8, -9], [-4, 1.5]], 1.8, 1.4, 0.5, "#c9b995"));
      ap(c, [[-2.9, -27.6], [3.4, -27.4], [3.0, -25.6], [-2.6, -25.8]], collar, null, { inset: 0.5, pitch: 1.5, shadow: false });
      ap(c, S.curve(HEAD, true, 6), skin, "#e0a874", { inset: 0.7, dash: 1.4, gap: 1.2, tw: 0.5, pitch: 1.5 });
      ap(c, ell(-1.2, -39.3, 1.5, 2.3, 10), mix(skin, "#1a120c", 0.14), null, { inset: 0.4, pitch: 1.5, shadow: false });
      S.sew(c, [S.straight([-1.6, -39.9], [-1.0, -38.4], 0.6, mix(skin, "#1a120c", 0.45))]);
      S.sew(c, S.satinFill(HAIR, 1.15, 0.8, 1.2, function (t, row) { return row % 4 === 0 ? "#34395e" : BLK; }));
      S.sew(c, S.pompom(-7.6, -44.4, 2.7, BLK, 5));
      S.sew(c, [S.knot([3.4, -41.3], 0.85, BLK), S.straight([2.1, -43.3], [4.9, -43.5], 0.8, BLK), S.straight([4.9, -35.3], [6.0, -35.4], 0.6, "#8a2f2f"), S.knot([1.6, -37.6], 1.4, "#d9946a")]);
    });
    W.phone = sprite(sc, 12, 20, 6, 10, function (c) {
      ap(c, rrect(-2.2, -6, 4.4, 12, 1.2), "#232838", S.SILVER2, { inset: 0.6, dash: 1.2, gap: 1, tw: 0.45, pitch: 1.5 });
      S.sew(c, [S.straight([-1.4, -4.6], [-1.4, 4.6], 0.9, "#9fd4ee"), S.knot([1.0, -4.3], 0.8, S.SILVER2)]);
    });
    B.walker = W;
  }
  function part(c, sp, x, y, a) { c.save(); c.translate(x, y); c.rotate(-a); c.drawImage(sp.c, -sp.ox, -sp.oy, sp.w, sp.h); c.restore(); }
  function legDraw(c, th, sh, ft, lp) { part(c, th, 0, 0, lp.th); part(c, sh, lp.kx, lp.ky, lp.s2); part(c, ft, lp.ax, lp.ay, lp.psi); }

  function drawWalker(c, B, Wk, R, burst) {
    var Wp = B.walker, k = Wk.k, la = legPose(Wk.ph, k), lb = legPose(Wk.ph + 0.5, k);
    var hipY = -Math.max(la.low, lb.low), lean = (1.5 + 2.5 * k) * D2R;
    var shx = -0.4 * Math.cos(lean) + 25.4 * Math.sin(lean), shy = -0.4 * Math.sin(lean) - 25.4 * Math.cos(lean);
    var phiN = lerp(38, 64, R) * D2R + 0.15 * (lb.th - 4 * D2R * k), epsN = lerp(95, 92, R) * D2R;
    var phiF = 0.9 * (la.th - 4 * D2R * k), epsF = (8 + 0.45 * Math.max(0, phiF / D2R)) * D2R;
    var ex, ey, fa, px, py, j, a, sts;
    c.fillStyle = "rgba(30,18,10,.3)"; c.beginPath(); c.ellipse(Wk.x, WALK_Y + 1, 23, 3.4, 0, 0, Math.PI * 2); c.fill();
    c.save(); c.translate(Wk.x, WALK_Y + hipY); c.scale(Wk.face, 1);
    part(c, Wp.upF, shx, shy, phiF);
    ex = shx + UA * Math.sin(phiF); ey = shy + UA * Math.cos(phiF);
    part(c, Wp.foF, ex, ey, phiF + epsF);
    legDraw(c, Wp.thF, Wp.shF, Wp.ftF, lb);
    c.save(); c.rotate(lean); put(c, Wp.torso, 0, 0); c.restore();
    legDraw(c, Wp.thN, Wp.shN, Wp.ftN, la);
    part(c, Wp.upN, shx, shy, phiN);
    ex = shx + UA * Math.sin(phiN); ey = shy + UA * Math.cos(phiN); fa = phiN + epsN;
    part(c, Wp.foN, ex, ey, fa);
    px = ex + 0.4 * Math.cos(fa) + 19 * Math.sin(fa); py = ey - 0.4 * Math.sin(fa) + 19 * Math.cos(fa);
    c.save(); c.translate(px, py); c.rotate(-0.12); put(c, Wp.phone, 0, 0); c.restore();
    if (burst > 0 && burst < 1) {
      sts = [];
      for (j = 0; j < 8; j++) {
        a = j * Math.PI / 4 + 0.2;
        sts.push(S.straight([px + 0.8 + Math.cos(a) * (4 + 5 * burst), py - 5 + Math.sin(a) * (4 + 5 * burst)], [px + 0.8 + Math.cos(a) * (7 + 8 * burst), py - 5 + Math.sin(a) * (7 + 8 * burst)], 1.1, "#fff7c8"));
      }
      S.threads(c, sts);
    }
    c.restore();
  }

  /* ------------------------------------------------------------------ pins, cards, hanging bits */
  function bakePin(sc, col) {
    return sprite(sc, 28, 38, 14, 35, function (c) {
      var path = S.curve([[0, 0], [1.4, -3.0], [5.4, -9], [9.4, -16.4], [9.2, -24], [4.2, -29.6], [-1.6, -30.4], [-7.4, -27], [-10, -20], [-8.4, -12.4], [-5.4, -8.2], [-1.4, -3.0]], true, 6);
      ap(c, path, col, mix(col, "#ffffff", 0.6), { inset: 1.5, dash: 2.2, gap: 1.8, tw: 0.7, pitch: 1.5 });
      ap(c, ell(0, -20, 4.8, 4.8, 16), LINEN, null, { pitch: 1.5, shadow: false });
      S.sew(c, [S.knot([0, -20], 2.0, INDIGO)]);
    });
  }
  function bakePom(sc, col, seed) {
    return sprite(sc, 18, 28, 9, 3, function (c) {
      S.sew(c, [S.straight([0, 0], [0, 9], 0.9, LINEN)]);
      S.sew(c, S.pompom(0, 13.5, 4.3, col, seed));
    });
  }
  function bakeStrand(sc) {
    return sprite(sc, 16, 72, 8, 3, function (c) {
      var sts = [S.straight([0, 0], [0, 58], 0.9, "#8a6040")], y, i;
      for (i = 0; i < 6; i++) { y = 8 + i * 9; add(sts, S.coin(0, y, 3.0)); sts.push(S.bead(0, y + 4.8, 1.15)); }
      sts.push(S.straight([0, 58], [-2.2, 66], 0.9, "#d7263d"), S.straight([0, 58], [0, 67], 0.9, "#d7263d"), S.straight([0, 58], [2.2, 66], 0.9, "#d7263d"));
      S.sew(c, sts);
    });
  }
  function bakeQR(c, x, y, size, seed, col) {
    var n = 13, m = size / n, r = S.rng(seed), sts = [], i, j;
    function fin(a, b) { return a === 0 || a === 4 || b === 0 || b === 4 || (a === 2 && b === 2); }
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var on;
      if (i < 5 && j < 5) on = fin(i, j);
      else if (i < 5 && j >= n - 5) on = fin(i, j - (n - 5));
      else if (i >= n - 5 && j < 5) on = fin(i - (n - 5), j);
      else on = r() < 0.5;
      if (on) add(sts, S.cross(x + j * m + 0.15, y + i * m + 0.15, m - 0.3, 0.85, col));
    }
    S.sew(c, sts);
  }
  /* a page card: picture square cut from the stall, two name lines, a stitched QR square */
  function bakeCard(B, i) {
    var st = STALLS[i], col = DRESS[st.pal[0]], x0 = stallX0(i), sts = [];
    return sprite(B.sc, 90, 78, 45, 72, function (c) {
      ap(c, rrect(-40, -66, 80, 66, 5), "#fbf6ea", col, { inset: 2.4, dash: 3, gap: 2.4, tw: 0.9, pitch: 2.2, grain: 0.3 });
      c.save(); c.beginPath(); c.rect(-34, -60, 34, 34); c.clip();
      c.drawImage(B.world.canvas, (x0 + 4) * B.sc, 196 * B.sc, 100 * B.sc, 100 * B.sc, -34, -60, 34, 34);
      c.restore();
      S.sew(c, S.running([[-34, -60], [0, -60], [0, -26], [-34, -26], [-34, -60]], 2.6, 2, 0.8, "#fbf6ea"));
      S.sew(c, [S.knot([-34, -60], 1.5, col), S.knot([0, -60], 1.5, col), S.knot([0, -26], 1.5, col), S.knot([-34, -26], 1.5, col)]);
      add(sts, S.satin([[5, -56], [15, -56]], function () { return 1.7; }, 1.0, 1.1, function () { return BLK; }));
      add(sts, S.satin([[17.5, -56], [24, -56]], function () { return 1.7; }, 1.0, 1.1, function () { return BLK; }));
      add(sts, S.satin([[26.5, -56], [34, -56]], function () { return 1.7; }, 1.0, 1.1, function () { return BLK; }));
      add(sts, S.satin([[5, -48.5], [16, -48.5]], function () { return 1.2; }, 1.0, 0.9, function () { return "#6a5b4b"; }));
      add(sts, S.satin([[18.5, -48.5], [27, -48.5]], function () { return 1.2; }, 1.0, 0.9, function () { return "#6a5b4b"; }));
      S.sew(c, sts);
      bakeQR(c, 7, -42, 26, 500 + i, BLK);
      add(sts = [], S.satin([[-34, -14], [-8, -14]], function () { return 2.4; }, 1.0, 1.2, function () { return col; }));
      sts.push(S.knot([-4, -14], 2.0, col));
      S.sew(c, sts);
    });
  }

  /* ------------------------------------------------------------------ the toy */
  window.TOYS.camera = function (root) {
    var canvas = el("canvas"), sr = el("p", "sr"), ctl = el("div", "ctl"), bSnap = el("button"), read = el("span", "read"), say = el("p", "say");
    bSnap.type = "button";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.touchAction = "manipulation";
    say.setAttribute("aria-live", "polite");
    ctl.appendChild(bSnap); ctl.appendChild(read);
    root.appendChild(sr); root.appendChild(canvas); root.appendChild(ctl); root.appendChild(say);
    root.setAttribute("role", "group");

    var clock = 0, B = null, lay = null, tasks = [], camReady = false;
    var claimed = [], shown = [], count = 0, flashes = [], timers = [], cards = [], sayFn = null;
    var cam = { x: 0, hold: null };
    var Wk = { x: S.reduced ? X0 + P * 0.5 : X0 - 20, dir: 1, face: 1, ph: S.reduced ? 0.3 : 0, vf: 1, k: 1, pauseUntil: 0, raiseT0: -9, turning: false, turnT0: -9 };

    function layout(avail) {
      var ih = window.innerHeight || 700, cap = clamp(ih * 0.6, 250, 560), all = avail >= 860, s, Vw, cw = avail;
      if (all) { Vw = 1000; s = avail / Vw; } else { s = clamp(avail / 330, 0.8, 1.15); Vw = avail / s; }
      if (H0 * s > cap) { s = cap / H0; Vw = avail / s; }
      if (Vw > WW) { Vw = WW; cw = Math.round(Vw * s); }
      return { s: s, Vw: Vw, cw: cw, h: Math.round(H0 * s), all: Vw >= 960 };
    }
    function contentWidth() { return Math.max(220, (root.clientWidth || 320) - 20); }
    function applyLayout() {
      lay = layout(contentWidth());
      canvas.style.height = lay.h + "px";
      canvas.style.maxWidth = lay.cw + "px";
      canvas.style.margin = "0 auto";
    }
    applyLayout();
    window.addEventListener("resize", applyLayout);

    function prog(t0, dur) { return S.reduced ? 1 : clamp((clock - t0) / dur); }
    function later(d, fn) { if (S.reduced || d <= 0) { fn(); return; } timers.push({ at: clock + d, fn: fn }); }
    function setSay(fn) { sayFn = fn; say.innerHTML = fn(); }
    function words() {
      bSnap.textContent = tr(count === N ? TXT.again : TXT.snap);
      bSnap.setAttribute("aria-label", tr(count === N ? TXT.againAria : TXT.snapAria));
      read.textContent = countText(count);
      sr.textContent = tr(TXT.desc);
      root.setAttribute("aria-label", tr(TXT.title));
      if (sayFn) say.innerHTML = sayFn();
    }
    document.addEventListener("langchange", words);

    /* ---- baking, a few pieces a frame so a phone never stalls */
    function makeTasks(b) {
      var t = [], i, c = b.world.ctx;
      t.push(function () { bakeWall(c); bakeGround(c); });
      t.push(function () { bakeWalker(b); });
      t.push(function () {
        b.pins = DRESS.map(function (col) { return bakePin(b.sc, col); });
        b.poms = [0, 1, 2, 3, 4, 5, 6, 7].map(function (j) { return bakePom(b.sc, DRESS[(j * 3 + 2) % 8], 40 + j); });
        b.strand = bakeStrand(b.sc);
      });
      for (i = 0; i < N; i++) t.push((function (k) { return function () { bakeStall(c, k); b.stallReady[k] = true; }; })(i));
      return t;
    }
    function ensureBake(st) {
      var sc = (st.w / lay.Vw) * st.dpr;
      if (B && Math.abs(B.sc - sc) / sc < 0.015) return;
      B = { sc: sc, world: S.layer(WW, H0, sc), stallReady: [], walker: null, pins: null, poms: null, strand: null };
      tasks = makeTasks(B); cards = [];
    }
    function runTasks() {
      if (!tasks.length) return;
      var t0 = performance.now();
      do { tasks.shift()(); } while (tasks.length && performance.now() - t0 < 9);
    }

    /* ---- the story: a snap */
    function stallCx(i) { return stallX0(i) + 54; }
    function nearestFree() {
      var best = -1, bd = 1e9, i, d;
      for (i = 0; i < N; i++) if (!claimed[i]) { d = Math.abs(stallCx(i) - Wk.x); if (d < bd) { bd = d; best = i; } }
      return best;
    }
    function snapStall(i) {
      if (i < 0) return;
      S.audio();
      var cx = stallCx(i), visible = lay.all || (cx > cam.x + 30 && cx < cam.x + lay.Vw - 30), delay = visible ? 0 : 0.6;
      if (!visible) cam.hold = { x: cx, until: clock + 2.4 };
      if (!S.reduced) {
        Wk.raiseT0 = clock + delay; Wk.pauseUntil = Math.max(Wk.pauseUntil, clock + delay + 1.2);
        flashes.push({ i: i, t0: clock + delay + 0.3 });
      }
      if (claimed[i]) { claimed[i].hop = clock + delay + 0.3; setSay(function () { return sayAgain(i); }); return; }
      claimed[i] = { t0: clock + delay };
      later(delay + 0.5, function () {
        shown[i] = true; count++;
        read.textContent = countText(count);
        S.ting(i * 7 + 3, 0, 0.035);
        if (count === N) { setSay(sayDone); words(); later(0.5, function () { S.jingle(7, 5); }); }
        else setSay(function () { return saySnap(i); });
      });
    }
    function reset() {
      claimed = []; shown = []; count = 0; flashes = []; timers = []; cam.hold = null;
      Wk.pauseUntil = 0; Wk.raiseT0 = -9;
      setSay(sayStart); words();
    }
    bSnap.addEventListener("click", function () { S.audio(); if (count === N) reset(); else snapStall(nearestFree()); });
    canvas.addEventListener("click", function (e) {
      if (!lay) return;
      var r = canvas.getBoundingClientRect(), s = r.width / lay.Vw, wx = (e.clientX - r.left) / s + cam.x;
      snapStall(clamp(Math.floor((wx - X0) / P), 0, N - 1));
    });

    /* ---- per frame */
    function update(dt) {
      var step = S.reduced ? 0 : dt, xmin = X0 - 20, xmax = X0 + N * P + 20, i, u;
      clock += step;
      if (timers.length) {
        var keep = [], fire = [];
        timers.forEach(function (t) { (t.at <= clock ? fire : keep).push(t); });
        timers = keep;
        fire.sort(function (a, b) { return a.at - b.at; }).forEach(function (t) { t.fn(); });
      }
      var paused = clock < Wk.pauseUntil, near = (Wk.dir > 0 && Wk.x > xmax - 16) || (Wk.dir < 0 && Wk.x < xmin + 16);
      Wk.vf += ((paused || near || Wk.turning ? 0 : 1) - Wk.vf) * Math.min(1, step * 5);
      if (near && Wk.vf < 0.05 && !Wk.turning) { Wk.turning = true; Wk.turnT0 = clock; Wk.dir = -Wk.dir; }
      if (Wk.turning) { u = (clock - Wk.turnT0) / 0.55; if (u >= 1) { Wk.turning = false; Wk.face = Wk.dir; } else Wk.face = lerp(-Wk.dir, Wk.dir, ease.inout(u)); }
      Wk.x += Wk.dir * SPEED * Wk.vf * step; Wk.ph += (Wk.vf * step) / CYCLE; Wk.k = Wk.vf;
      if (lay.all) cam.x = (WW - lay.Vw) / 2;
      else {
        var tx = Wk.x - lay.Vw * 0.5 + Wk.dir * lay.Vw * 0.1;
        if (cam.hold && clock < cam.hold.until) tx = cam.hold.x - lay.Vw * 0.5;
        tx = clamp(tx, 0, WW - lay.Vw);
        cam.x = !camReady || S.reduced ? tx : cam.x + (tx - cam.x) * (1 - Math.exp(-step * 3.5));
        camReady = true;
      }
    }

    function drawHanging(c) {
      var i, st, x0, x1, sw, sp;
      for (i = 0; i < N; i++) {
        st = STALLS[i]; x0 = stallX0(i); x1 = x0 + 108;
        sw = S.reduced ? 0 : Math.sin(clock * 1.6 + i * 1.7) * 0.11;
        c.save(); c.translate(x0 + 3, AWN_BOT + 6); c.rotate(sw); put(c, B.poms[i], 0, 0); c.restore();
        c.save(); c.translate(x1 - 3, AWN_BOT + 6); c.rotate(-sw * 0.8); put(c, B.poms[(i + 3) % 8], 0, 0); c.restore();
        if (st.coins) {
          [x0 + 22, x1 - 22, x0 + 54].forEach(function (sx, j) {
            c.save(); c.translate(sx, AWN_BOT + 6); c.rotate(S.reduced ? 0 : Math.sin(clock * 1.3 + i + j * 2.1) * 0.07); put(c, B.strand, 0, 0); c.restore();
          });
        }
      }
    }
    function drawFlashes(c) {
      var keep = [], k;
      flashes.forEach(function (f) {
        var tau = clock - f.t0, x0 = stallX0(f.i), x1 = x0 + 108, a, sc, sts, bx0, bx1, by0, by1, L = 12;
        if (tau > 0.9) return;
        keep.push(f);
        if (tau > -0.2 && tau < 0.5) {
          sc = 1 + 0.14 * (1 - ease.out(clamp((tau + 0.2) / 0.3)));
          var mx = (x0 + x1) / 2, my = 246, hw = 62 * sc, hh = 98 * sc;
          bx0 = mx - hw; bx1 = mx + hw; by0 = my - hh; by1 = my + hh;
          sts = [];
          [[bx0, by0, 1, 1], [bx1, by0, -1, 1], [bx0, by1, 1, -1], [bx1, by1, -1, -1]].forEach(function (p) {
            sts.push(S.straight([p[0], p[1]], [p[0] + p[2] * L, p[1]], 2.4, "#fffbe6"), S.straight([p[0], p[1]], [p[0], p[1] + p[3] * L], 2.4, "#fffbe6"));
          });
          S.sew(c, sts);
        }
        if (tau > 0) {
          a = tau < 0.05 ? (tau / 0.05) * 0.92 : 0.92 * Math.exp(-(tau - 0.05) * 7);
          c.fillStyle = "rgba(255,252,238," + a.toFixed(3) + ")"; c.fillRect(x0 - 8, 146, 124, 198);
        }
      });
      flashes = keep;
    }
    function drawPins(c) {
      var i, rec, u, v, cx, tipY, bob, hop, cb, sc, a;
      for (i = 0; i < N; i++) {
        rec = claimed[i]; if (!rec) continue;
        u = prog(rec.t0 + 0.5, 0.55); if (u <= 0) continue;
        v = prog(rec.t0 + 0.78, 0.6);
        cx = stallCx(i);
        bob = S.reduced ? 0 : Math.sin(clock * 2.1 + i * 0.9) * 1.5 * u;
        hop = rec.hop && !S.reduced ? 7 * Math.sin(Math.PI * clamp((clock - rec.hop) / 0.4)) : 0;
        tipY = lerp(172, 146, ease.back(u)) + bob - hop;
        if (v > 0) {
          if (!cards[i] && B.stallReady[i]) cards[i] = bakeCard(B, i);
          if (cards[i]) {
            cb = lerp(140, 108, ease.back(v)) + (S.reduced ? 0 : Math.sin(clock * 1.6 + i * 1.3) * 1.2 * v) - hop; sc = lerp(0.35, 1, ease.out(v)); a = clamp(v * 3);
            c.save(); c.globalAlpha = a; c.translate(cx, cb); c.scale(sc, sc); put(c, cards[i], 0, 0); c.restore();
          }
        }
        c.fillStyle = "rgba(20,12,30," + (0.26 * u).toFixed(3) + ")"; c.beginPath(); c.ellipse(cx, AWN_TOP + 1.5, 7 * u, 1.9 * u, 0, 0, Math.PI * 2); c.fill();
        c.save(); c.globalAlpha = clamp(u * 4); c.translate(cx, tipY); c.scale(lerp(0.6, 1, ease.back(u)), lerp(0.6, 1, ease.back(u))); put(c, B.pins[STALLS[i].pal[0]], 0, 0); c.restore();
      }
    }

    function draw(st, dt) {
      var c = st.ctx;
      if (!lay) applyLayout();
      ensureBake(st); runTasks();
      update(dt);
      var s = st.w / lay.Vw, tr0 = clock - Wk.raiseT0, R = 0, burst = -1;
      if (!S.reduced && tr0 >= 0 && tr0 < 1.2) R = tr0 < 0.25 ? ease.out(tr0 / 0.25) : tr0 < 0.8 ? 1 : 1 - ease.inout((tr0 - 0.8) / 0.4);
      if (!S.reduced && tr0 > 0.28 && tr0 < 0.65) burst = (tr0 - 0.28) / 0.37;
      c.fillStyle = WALL; c.fillRect(0, 0, st.w, st.h);
      c.drawImage(B.world.canvas, Math.round(cam.x * B.sc), 0, Math.round(lay.Vw * B.sc), Math.round(H0 * B.sc), 0, 0, st.w, st.h);
      if (B.walker && B.pins) {
        c.save(); c.scale(s, s); c.translate(-cam.x, 0);
        drawHanging(c); drawWalker(c, B, Wk, R, burst); drawFlashes(c); drawPins(c);
        c.restore();
      }
    }

    S.stage(canvas, draw, { resize: function () { applyLayout(); } });
    setSay(sayStart); words();
  };
})();
