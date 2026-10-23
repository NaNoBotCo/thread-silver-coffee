/* stitch.js — thread on linen, as geometry. Ported from anidoodle's embroidery kit
   (engine/src/canvas-core/embroideryKit.ts) to plain browser JavaScript.
   A stitch is a length of twisted floss between two holes: pinched at both ends, a lit side and
   a shade side (light from the upper left), slanted grooves where the strands twist, and a hair of
   shadow down-right. Appliqué is a cut piece of cloth with its own weave, sewn down with running
   stitch. Randomness comes from S.rng(seed); motion from the time each toy passes in. */
(function () {
  "use strict";
  var S = {};
  var LIGHT = [-0.6, -0.8];

  S.rng = function (seed) {
    var a = seed >>> 0;
    return function () { a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  var clamp = S.clamp = function (v, a, b) { if (a === undefined) a = 0; if (b === undefined) b = 1; return Math.max(a, Math.min(b, v)); };
  var lerp = S.lerp = function (a, b, t) { return a + (b - a) * t; };
  var lerpP = S.lerpP = function (a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; };
  var hex = function (h) { var s = h.replace("#", ""); return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]; };
  S.hex = hex;
  var mix = S.mix = function (a, b, t) { var x = hex(a), y = hex(b); return "#" + x.map(function (v, i) { var n = Math.round(lerp(v, y[i], t)); return (n < 16 ? "0" : "") + n.toString(16); }).join(""); };
  var polyLen = S.polyLen = function (s) { var L = 0; for (var i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); return L; };
  var resample = S.resample = function (s, n) {
    var cum = [0]; for (var i = 1; i < s.length; i++) cum.push(cum[i - 1] + Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]));
    var L = cum[cum.length - 1], out = [], j = 1;
    for (var k = 0; k < n; k++) { var d = (L * k) / Math.max(1, n - 1); while (j < s.length - 1 && cum[j] < d) j++; var f = (d - cum[j - 1]) / (cum[j] - cum[j - 1] || 1); out.push(lerpP(s[j - 1], s[j], clamp(f))); }
    return out;
  };
  /* Catmull-Rom through control points: hand-placed points become a smooth edge */
  S.curve = function (pts, closed, per) {
    per = per || 10; var out = [], n = pts.length; if (n < 3) return pts.slice();
    var get = function (i) { return closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]; };
    var last = closed ? n : n - 1;
    for (var i = 0; i < last; i++) {
      var p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (var k = 0; k < per; k++) { var t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
                  0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
      }
    }
    if (!closed) out.push(pts[n - 1]);
    return out;
  };
  /* offset a closed or open polyline inward/outward by d (positive = left of travel) */
  S.offset = function (s, d, closed) {
    var n = s.length, out = [];
    for (var i = 0; i < n; i++) {
      var a = closed ? s[(i - 1 + n) % n] : s[Math.max(0, i - 1)], b = closed ? s[(i + 1) % n] : s[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      out.push([s[i][0] - (dy / l) * d, s[i][1] + (dx / l) * d]);
    }
    return out;
  };
  S.area = function (s) { var A = 0; for (var i = 0; i < s.length; i++) { var p = s[i], q = s[(i + 1) % s.length]; A += p[0] * q[1] - q[0] * p[1]; } return A / 2; };

  /* ---------------------------------------------------------------- cloth
     A plain-weave tile computed per pixel once (warp over weft, weft over warp at alternate
     crossings, rounded cords, slubs, the odd darker thread, pin-holes between). Returned as a
     grey multiplier tile: draw a piece's colour, then multiply the tile over it. */
  var tiles = {};
  S.weave = function (pitch, seed) {
    var key = pitch + ":" + (seed || 1); if (tiles[key]) return tiles[key];
    var nT = 32, Wd = Math.round(nT * pitch), c = document.createElement("canvas"); c.width = Wd; c.height = Wd;
    var x = c.getContext("2d"), img = x.createImageData(Wd, Wd), d = img.data, r = S.rng(seed || 4411);
    var thick = [], tint = [], slub = [];
    for (var i = 0; i < nT * 2; i++) { thick.push(0.8 + r() * 0.22); tint.push((r() < 0.08 ? 0.93 : 1) * (0.975 + r() * 0.05)); var row = []; for (var k = 0; k < 40; k++) row.push((r() < 0.05 ? 0.25 : 0) + (r() - 0.5) * 0.12); row.push(row[0]); slub.push(row); }
    var sl = function (th, along) { var s = (along / Wd) * 39, i0 = Math.floor(s), f = s - i0, row = slub[th]; return row[i0] + (row[i0 + 1] - row[i0]) * f; };
    for (var j = 0; j < Wd; j++) {
      var v = j / pitch, iv = Math.floor(v) % nT, fv = v - Math.floor(v);
      for (var i2 = 0; i2 < Wd; i2++) {
        var u = i2 / pitch, iu = Math.floor(u) % nT, fu = u - Math.floor(u);
        var warpHW = 0.5 * clamp(thick[iu] + sl(iu, j), 0.5, 1.15) * 0.94, weftHW = 0.5 * clamp(thick[nT + iv] + sl(nT + iv, i2), 0.5, 1.15) * 0.9;
        var dw = Math.abs(fu - 0.5), df = Math.abs(fv - 0.5), inWarp = dw < warpHW, inWeft = df < weftHW, warpTop = ((iu + iv) & 1) === 0, b, t;
        if (inWarp && (warpTop || !inWeft)) { var cr = Math.cos((dw / warpHW) * Math.PI * 0.5), rise = warpTop ? 0.82 + 0.18 * Math.sin(Math.PI * fv) : 0.74; b = (0.62 + 0.42 * Math.pow(cr, 0.7)) * rise; t = tint[iu]; }
        else if (inWeft) { var cr2 = Math.cos((df / weftHW) * Math.PI * 0.5), rise2 = !warpTop ? 0.84 + 0.16 * Math.sin(Math.PI * fu) : 0.74; b = (0.6 + 0.42 * Math.pow(cr2, 0.7)) * rise2; t = tint[nT + iv]; }
        else { b = 0.55; t = 1; }
        var m = clamp(b * t * 1.08, 0, 1) * 255, o = (j * Wd + i2) * 4;
        d[o] = m; d[o + 1] = m; d[o + 2] = m; d[o + 3] = 255;
      }
    }
    x.putImageData(img, 0, 0); tiles[key] = c; return c;
  };
  /* fill a path with cloth: its colour, then the weave multiplied over it */
  S.cloth = function (c, path, colour, o) {
    o = o || {}; var pitch = o.pitch || 3.2;
    c.save(); c.beginPath(); path.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath();
    if (o.shadow !== false) { c.save(); c.translate(1.4, 2); c.fillStyle = "rgba(40,25,15,.28)"; c.fill(); c.restore(); }
    c.fillStyle = colour; c.fill(); c.clip();
    var pat = c.createPattern(S.weave(pitch, o.seed || 4411), "repeat");
    if (o.angle) { var m = new DOMMatrix(); pat.setTransform(m.rotate(o.angle)); }
    c.globalCompositeOperation = "multiply"; c.globalAlpha = o.grain === undefined ? 0.55 : o.grain; c.fillStyle = pat; c.fill();
    c.restore();
  };

  /* ---------------------------------------------------------------- stitches */
  var flat = S.flat = function (a, b, w, col, t) { return { k: "flat", a: a, b: b, w: w, c: col, t: t === undefined ? 1 : t }; };
  var knot = S.knot = function (a, r, col) { return { k: "knot", a: a, b: a, w: r, c: col, t: 2.2 }; };
  var toneCache = {};
  var tone = function (col) { var h = toneCache[col]; if (!h) h = toneCache[col] = { base: col, hi: mix(col, "#ffffff", 0.5), lo: mix(col, "#1a120c", 0.38) }; return h; };
  S.headOf = function (s, p) { return s.k === "knot" ? s.a : p >= 1 ? s.b : lerpP(s.a, s.b, p); };
  S.shadows = function (c, sts, lastP) {
    if (lastP === undefined) lastP = 1;
    c.save(); c.lineCap = "round"; c.strokeStyle = "#3b2c1c"; c.fillStyle = "#3b2c1c";
    for (var i = 0; i < sts.length; i++) {
      var s = sts[i], p = i === sts.length - 1 ? lastP : 1; if (p <= 0) continue;
      if (s.k === "knot") { if (p < 0.5) continue; c.globalAlpha = 0.4; c.beginPath(); c.arc(s.a[0] + s.w * 0.4, s.a[1] + s.w * 0.55, s.w * 1.05, 0, Math.PI * 2); c.fill(); continue; }
      var b = S.headOf(s, p); c.globalAlpha = 0.32; c.lineWidth = s.w * 1.1; c.beginPath(); c.moveTo(s.a[0] + 0.9, s.a[1] + 1.3); c.lineTo(b[0] + 0.9, b[1] + 1.3); c.stroke();
    }
    c.restore();
  };
  S.threads = function (c, sts, lastP) {
    if (lastP === undefined) lastP = 1;
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    for (var i = 0; i < sts.length; i++) {
      var s = sts[i], p = i === sts.length - 1 ? lastP : 1; if (p <= 0) continue;
      var T = tone(s.c);
      if (s.k === "knot") {
        if (p < 0.5) { c.globalAlpha = 1; c.strokeStyle = T.base; c.lineWidth = s.w * 0.7; c.beginPath(); c.arc(s.a[0], s.a[1], s.w * 0.55, 0, Math.PI * 2 * (p * 2)); c.stroke(); continue; }
        var x = s.a[0], y = s.a[1], r = s.w;
        c.globalAlpha = 1; c.fillStyle = T.lo; c.beginPath(); c.arc(x + r * 0.12, y + r * 0.16, r, 0, Math.PI * 2); c.fill();
        c.fillStyle = T.base; c.beginPath(); c.arc(x - r * 0.1, y - r * 0.12, r * 0.8, 0, Math.PI * 2); c.fill();
        if (r > 1.6) { c.strokeStyle = T.lo; c.globalAlpha = 0.5; c.lineWidth = Math.max(0.5, r * 0.22); var ph = (x * 0.37 + y * 0.61) % Math.PI;
          c.beginPath(); c.arc(x, y, r * 0.5, ph, ph + 2.2); c.stroke(); c.beginPath(); c.arc(x, y, r * 0.78, ph + 3, ph + 4.8); c.stroke(); }
        c.fillStyle = T.hi; c.globalAlpha = 0.85; c.beginPath(); c.arc(x - r * 0.38, y - r * 0.42, Math.max(0.5, r * 0.26), 0, Math.PI * 2); c.fill();
        continue;
      }
      var a = s.a, bb = S.headOf(s, p), dx = bb[0] - a[0], dy = bb[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      if (nx * LIGHT[0] + ny * LIGHT[1] < 0) { nx = -nx; ny = -ny; }
      var w = s.w, sheen = 0.35 + 0.65 * Math.abs(ux * LIGHT[1] - uy * LIGHT[0]);
      var inset = Math.min(L * 0.3, w * 0.25), a1 = [a[0] + ux * inset, a[1] + uy * inset], b1 = [bb[0] - ux * inset, bb[1] - uy * inset];
      c.globalAlpha = 1; c.strokeStyle = T.base; c.lineWidth = w; c.beginPath(); c.moveTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.stroke();
      c.lineWidth = w * 0.55; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(bb[0], bb[1]); c.stroke();
      c.strokeStyle = T.lo; c.globalAlpha = 0.6; c.lineWidth = w * 0.32; c.beginPath(); c.moveTo(a1[0] - nx * w * 0.32, a1[1] - ny * w * 0.32); c.lineTo(b1[0] - nx * w * 0.32, b1[1] - ny * w * 0.32); c.stroke();
      var step = Math.max(1.6, w * 1.05), n = Math.floor(L / step);
      if (n > 0 && w >= 1.2) {
        c.globalAlpha = 0.4; c.strokeStyle = T.lo; c.lineWidth = Math.max(0.45, w * 0.16); c.beginPath();
        for (var k = 1; k <= n; k++) { var m = k * step - step * 0.3, cx = a[0] + ux * m, cy = a[1] + uy * m, sx = (nx - ux * 0.7) * w * 0.42, sy = (ny - uy * 0.7) * w * 0.42; c.moveTo(cx - sx, cy - sy); c.lineTo(cx + sx, cy + sy); }
        c.stroke();
        c.globalAlpha = 0.28 + 0.5 * sheen; c.strokeStyle = T.hi; c.lineWidth = Math.max(0.45, w * 0.22); c.beginPath();
        for (var k2 = 0; k2 < n; k2++) { var m2 = k2 * step + step * 0.25, cx2 = a[0] + ux * m2 + nx * w * 0.16, cy2 = a[1] + uy * m2 + ny * w * 0.16; c.moveTo(cx2 - ux * step * 0.22, cy2 - uy * step * 0.22); c.lineTo(cx2 + ux * step * 0.22, cy2 + uy * step * 0.22); }
        c.stroke();
      } else { c.globalAlpha = 0.3 + 0.5 * sheen; c.strokeStyle = T.hi; c.lineWidth = Math.max(0.4, w * 0.25); c.beginPath(); c.moveTo(a1[0] + nx * w * 0.16, a1[1] + ny * w * 0.16); c.lineTo(b1[0] + nx * w * 0.16, b1[1] + ny * w * 0.16); c.stroke(); }
    }
    c.restore();
  };
  /* both passes, the usual call */
  S.sew = function (c, sts, lastP) { S.shadows(c, sts, lastP); S.threads(c, sts, lastP); };

  /* generators */
  S.stem = function (path, len, w, col, seed) {
    var L = polyLen(path), n = Math.max(2, Math.round(L / (len * 0.5))), s = resample(path, n + 2), r = S.rng(seed || 7), out = [];
    for (var i = 0; i + 2 < s.length; i++) { var a = s[i], b = s[i + 2], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, o = w * 0.28;
      out.push(flat([a[0] - (dy / l) * o, a[1] + (dx / l) * o], [b[0] + (dy / l) * o * 0.6 + (r() - 0.5) * 0.4, b[1] - (dx / l) * o * 0.6 + (r() - 0.5) * 0.4], w, col, 0.9)); }
    return out;
  };
  S.split = function (path, len, w, col, closed) {
    var pts = closed ? path.concat([path[0]]) : path, L = polyLen(pts), n = Math.max(2, Math.round(L / (len * 0.7))), s = resample(pts, n + 1), out = [];
    for (var i = 0; i + 1 < s.length; i++) { var a = i ? lerpP(s[i - 1], s[i], 0.62) : s[0]; out.push(flat(a, s[i + 1], w, col, 0.9)); }
    return out;
  };
  S.running = function (path, dash, gap, w, col) {
    var L = polyLen(path), n = Math.max(2, Math.round(L / 1.5)), s = resample(path, n), out = [], acc = 0, on = true, start = s[0];
    for (var i = 1; i < s.length; i++) { acc += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
      if (on && acc >= dash) { out.push(flat(start, s[i], w, col, 0.8)); on = false; acc = 0; } else if (!on && acc >= gap) { start = s[i]; on = true; acc = 0; } }
    return out;
  };
  S.straight = function (a, b, w, col) { return flat(a, b, w, col, 1); };
  /* satin: stitches laid ACROSS an axis, side by side; long spans split at the axis */
  S.satin = function (axis, half, gap, w, colour, o) {
    o = o || {}; var skew = o.skew || 0, splitAt = o.split || 26, L = polyLen(axis), n = Math.max(2, Math.round(L / gap)), s = resample(axis, n), out = [];
    for (var i = 0; i < n; i++) {
      var t = i / (n - 1), p = s[i], q = s[Math.min(n - 1, i + 1)], pr = s[Math.max(0, i - 1)], dx = q[0] - pr[0], dy = q[1] - pr[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, h = half(t); if (h < 0.6) continue;
      var e1 = [p[0] - uy * h + ux * skew * h, p[1] + ux * h + uy * skew * h], e2 = [p[0] + uy * h - ux * skew * h, p[1] - ux * h - uy * skew * h];
      if (2 * h > splitAt) { var mid = lerpP(e1, e2, 0.5 + (i % 2 ? 0.04 : -0.04)); out.push(flat(e1, mid, w, colour(t, -1))); out.push(flat(mid, e2, w, colour(t, 1))); }
      else out.push(flat(e1, e2, w, colour(t, 0)));
    }
    return out;
  };
  /* satin fill of a closed shape, stitches all lying at angle `ang` (radians), clipped by scanlines */
  S.satinFill = function (poly, ang, gap, w, colour) {
    var ca = Math.cos(ang), sa = Math.sin(ang), rot = poly.map(function (p) { return [p[0] * ca + p[1] * sa, -p[0] * sa + p[1] * ca]; });
    var ys = rot.map(function (p) { return p[1]; }), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys), out = [], row = 0;
    for (var y = y0 + gap * 0.5; y < y1; y += gap, row++) {
      var xs = [];
      for (var i = 0; i < rot.length; i++) { var a = rot[i], b = rot[(i + 1) % rot.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])); }
      xs.sort(function (p, q) { return p - q; });
      for (var k = 0; k + 1 < xs.length; k += 2) {
        var xa = xs[k], xb = xs[k + 1], len = xb - xa, parts = Math.max(1, Math.ceil(len / 24));
        for (var m = 0; m < parts; m++) { var u0 = xa + (len * m) / parts + (m ? (row % 2 ? 2 : -2) : 0), u1 = xa + (len * (m + 1)) / parts;
          var A = [u0 * ca - y * sa, u0 * sa + y * ca], B = [u1 * ca - y * sa, u1 * sa + y * ca]; out.push(flat(A, B, w, colour((y - y0) / (y1 - y0 || 1), row))); }
      }
    }
    return out;
  };
  S.knots = function (cx, cy, rx, ry, r0, colour, seed) {
    var r = S.rng(seed || 3), out = [], step = r0 * 1.7, rowi = 0;
    for (var y = -ry; y <= ry; y += step * 0.87, rowi++) for (var x = -rx; x <= rx; x += step) {
      var px = x + ((rowi % 2) * step) / 2 + (r() - 0.5) * r0 * 0.5, py = y + (r() - 0.5) * r0 * 0.5; if ((px / rx) * (px / rx) + (py / ry) * (py / ry) > 1) continue;
      out.push(knot([cx + px, cy + py], r0 * (0.9 + r() * 0.2), colour(px / rx, py / ry)));
    }
    return out;
  };
  /* cross stitch: one X per cell, the top leg always the same way, as a stitcher works a row */
  S.cross = function (x, y, s, w, col) { return [flat([x, y + s], [x + s, y], w, col), flat([x, y], [x + s, y + s], w, col)]; };

  /* appliqué: a cut piece of cloth sewn down with a running stitch just inside its edge */
  S.applique = function (c, path, colour, thread, o) {
    o = o || {}; S.cloth(c, path, colour, o);
    if (thread) { var inner = S.offset(path, S.area(path) > 0 ? (o.inset || 2.2) : -(o.inset || 2.2), true); S.sew(c, S.running(inner.concat([inner[0]]), o.dash || 3.2, o.gap || 2.6, o.tw || 0.9, thread)); }
  };

  /* an offscreen canvas at device scale, drawing in CSS pixels */
  S.layer = function (w, h, scale) {
    var c = document.createElement("canvas"); c.width = Math.max(1, Math.ceil(w * scale)); c.height = Math.max(1, Math.ceil(h * scale));
    var x = c.getContext("2d"); x.scale(scale, scale); return { canvas: c, ctx: x, w: w, h: h, scale: scale };
  };

  /* silver thread colours and the beads, coins and pompoms of the dress */
  S.SILVER = "#d9dee2"; S.SILVER2 = "#aeb6bd";
  S.bead = function (x, y, r) { return knot([x, y], r, S.SILVER); };
  S.coin = function (x, y, r, seed) { var out = S.satin([[x - r, y], [x + r, y]], function (t) { return Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2))) * r; }, Math.max(0.9, r * 0.32), Math.max(0.6, r * 0.28), function () { return S.SILVER; }); out.push(knot([x, y], Math.max(0.5, r * 0.22), S.SILVER2)); return out; };
  S.pompom = function (x, y, r, col, seed) { return S.knots(x, y, r, r, Math.max(0.8, r * 0.2), function (u, v) { return (u * u + v * v) > 0.55 ? mix(col, "#1a120c", 0.18) : col; }, seed || 9); };

  /* reduced motion, once */
  S.reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  /* a canvas that fits its box, redraws on resize, and runs a frame loop only while visible */
  S.stage = function (canvas, draw, o) {
    o = o || {}; var st = { canvas: canvas, ctx: canvas.getContext("2d"), w: 0, h: 0, dpr: 1, t: 0, on: false, dirty: true, raf: 0, last: 0 };
    var fit = function () { var b = canvas.getBoundingClientRect(); var d = Math.min(2, window.devicePixelRatio || 1); var W = Math.round(b.width), H = Math.round(b.height);
      if (W !== st.w || H !== st.h || d !== st.dpr) { st.w = W; st.h = H; st.dpr = d; canvas.width = Math.round(W * d); canvas.height = Math.round(H * d); st.dirty = true; if (o.resize) o.resize(st); } };
    var frame = function (ms) {
      st.raf = 0; if (!st.on) return;
      var dt = st.last ? Math.min(0.05, (ms - st.last) / 1000) : 0.016; st.last = ms; st.t += S.reduced ? 0 : dt;
      fit(); st.ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); draw(st, dt);
      st.raf = requestAnimationFrame(frame);
    };
    st.kick = function () { if (st.on && !st.raf) st.raf = requestAnimationFrame(frame); };
    st.redraw = function () { fit(); st.ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0); draw(st, 0); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { es.forEach(function (e) { st.on = e.isIntersecting; st.last = 0; if (st.on) st.kick(); }); }, { rootMargin: "120px" }).observe(canvas);
    else { st.on = true; st.kick(); }
    document.addEventListener("visibilitychange", function () { if (document.hidden) { st.on = false; } else { st.on = true; st.last = 0; st.kick(); } });
    window.addEventListener("resize", function () { st.dirty = true; if (!st.raf) st.redraw(); });
    return st;
  };

  /* a small silver jingle, made on a tap only */
  var AC = null;
  S.audio = function () { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } } if (AC && AC.state === "suspended") AC.resume(); return AC; };
  S.ting = function (seed, delay, gain) {
    var a = S.audio(); if (!a) return; var r = S.rng(seed || 1), t = a.currentTime + (delay || 0);
    [1, 2.76, 5.4].forEach(function (m, i) { var f = 1700 + r() * 1700, o = a.createOscillator(), g = a.createGain(); o.type = "sine"; o.frequency.value = (f * m) / (i ? 1.9 : 1);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime((gain || 0.05) / (i + 1), t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5 + r() * 0.5); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 1.1); });
  };
  S.jingle = function (n, seed) { for (var i = 0; i < n; i++) S.ting((seed || 1) * 31 + i, i * 0.045 + (i % 3) * 0.013, 0.04); };
  S.creak = function () { var a = S.audio(); if (!a) return; var t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); var f = a.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 600; o.connect(f); f.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.45); };

  window.STITCH = S;
})();
