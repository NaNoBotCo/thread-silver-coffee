/* fest.js — the Akha swing festival, embroidered.
   The tall swing stands on the ridge: four poles lashed in pairs, a carved crosspiece, a liana
   rope with its loop (Chob Kacha-ananda, JSS 59.1, 1971). The wheel stands in front: four arms,
   each two poles lashed side by side, on an axle laid in the notches of two posts; seats as in
   NaN's photograph. Riders wear three of the Akha headdresses: Loimi (low studded dome, embossed
   back plate), Ulo (tall cone leaning back, coins down the front, red pompoms) and Pawmee (broad,
   side flaps of coins, long red bead strings). Tap the wheel to turn it, the swing to push it. */
(function () {
  "use strict";
  var S = window.STITCH;
  var C = { skin: "#c48a5f", skinLo: "#9c6743", hair: "#17120e", black: "#1d2030", black2: "#2b3047", red: "#d7263d", pink: "#e0457b", orange: "#f28c28",
    yellow: "#f6c445", green: "#2f9e5b", blue: "#2b59c3", sky: "#3fa7d6", purple: "#7b4bb7", white: "#f7f3eb", silver: "#d9dee2", silver2: "#aab3bb",
    wood: "#a8743a", wood2: "#6f4a22", woodHi: "#c99a5b", pole: "#cdb489", pole2: "#9c8458", rope: "#8a6a3a", grass: "#5f9e3c", grass2: "#3f7f2c", leaf: "#4e8f3a" };
  var BANDS = [C.red, C.yellow, C.green, C.white, C.blue, C.pink, C.orange, C.purple];
  var mx = function (a, b, t) { return S.mix(a, b, t); };

  function cmHour() { var d = new Date(); return (d.getUTCHours() + 7 + d.getUTCMinutes() / 60) % 24; }
  function skyOf(h) {
    if (h < 5.5 || h >= 19.3) return { top: "#1c2346", low: "#3a3f6b", night: true, k: 0.5 };
    if (h < 7) return { top: "#8fb3d9", low: "#f3c6a5", night: false, k: 0.82 };
    if (h < 16.5) return { top: "#8cc6e8", low: "#e4f2f6", night: false, k: 1 };
    if (h < 18.3) return { top: "#9cc2e2", low: "#f6d6a2", night: false, k: 0.93 };
    return { top: "#5d6fa6", low: "#f0a37c", night: false, k: 0.72 };
  }
  var dim = 1; function sh(col) { return dim >= 1 ? col : mx(col, "#151a33", 1 - dim); }
  var W = function (u, k) { return Math.max(0.45, u * k); };

  /* ---------------------------------------------------------------- headdresses, front view */
  function loimi(c, P, u, seed) {
    var sts = [];
    /* the embossed silver plate behind the dome, a married woman's, with red feathers at its top */
    var plate = [P(-0.62, -3.55), P(0.62, -3.55), P(0.52, -4.62), P(-0.52, -4.62)];
    S.cloth(c, plate, "#bfc6cc", { pitch: 1, grain: 0.2 });
    sts = sts.concat(S.satinFill(plate, 0, W(u, 0.07), W(u, 0.06), function (t, row) { return row % 3 === 0 ? "#eef1f3" : C.silver; }));
    for (var e = 0; e < 3; e++) for (var f = 0; f < 4; f++) sts.push(S.knot(P(-0.36 + f * 0.24, -4.42 + e * 0.26), W(u, 0.05), C.silver2));
    for (var q = 0; q < 9; q++) { var x = -0.5 + q * 0.125; sts.push(S.straight(P(x, -4.6), P(x * 1.25, -4.95 - (q % 2) * 0.08), W(u, 0.05), C.red)); }
    S.sew(c, sts); sts = [];
    /* bead tassels behind, falling past the shoulders: red, white, yellow, blue */
    [-0.74, -0.66, 0.66, 0.74].forEach(function (x, k) { for (var b = 0; b < 12; b++) sts.push(S.knot(P(x + (x > 0 ? 1 : -1) * b * 0.02, -3.45 + b * 0.16), W(u, 0.045), [C.red, C.white, C.yellow, C.blue][(b + k) % 4])); });
    /* the dome: indigo, studded in rows, a rim of larger silver balls */
    var dome = S.curve([P(-0.6, -3.22), P(-0.62, -3.6), P(-0.4, -3.92), P(0, -4.0), P(0.4, -3.92), P(0.62, -3.6), P(0.6, -3.22), P(0, -3.16)], true, 7);
    S.sew(c, sts); sts = [];
    S.applique(c, dome, C.black, C.silver2, { pitch: Math.max(0.9, u * 0.07), grain: 0.35, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.025) });
    for (var r = 0; r < 4; r++) { var y = -3.4 - r * 0.15, half = 0.5 - r * 0.07, n = Math.max(3, Math.round(half * 10)); for (var k2 = 0; k2 < n; k2++) sts.push(S.knot(P(-half + (2 * half * (k2 + 0.5)) / n, y), W(u, 0.055), (r + k2) % 2 ? C.silver : "#eef1f3")); }
    for (var b2 = 0; b2 < 9; b2++) sts.push(S.knot(P(-0.56 + b2 * 0.14, -3.22), W(u, 0.085), C.silver));
    /* two red pompoms at the plate's top corners */
    sts = sts.concat(S.pompom(P(-0.55, -4.62)[0], P(0, -4.62)[1], Math.max(1, u * 0.17), C.red, seed + 1), S.pompom(P(0.55, -4.62)[0], P(0, -4.62)[1], Math.max(1, u * 0.17), C.red, seed + 2));
    /* short coin pendants at the temples */
    [-0.52, 0.52].forEach(function (x) { for (var b = 0; b < 4; b++) sts.push(S.knot(P(x, -3.12 + b * 0.13), W(u, 0.045), b === 3 ? C.red : C.silver)); });
    S.sew(c, sts);
  }
  function ulo(c, P, u, seed) {
    var sts = [];
    /* red pompoms trailing down the back, seen at both sides */
    [-0.62, 0.62].forEach(function (x, k) { for (var b = 0; b < 4; b++) sts = sts.concat(S.pompom(P(x * (1 + b * 0.06), -3.3 + b * 0.42)[0], P(0, -3.3 + b * 0.42)[1], Math.max(0.9, u * 0.12), b % 2 ? C.pink : C.red, seed + k * 9 + b)); });
    S.sew(c, sts); sts = [];
    /* the tall cone, leaning back: diagonal red and white bead stripes with thin yellow and blue lines */
    var cone = S.curve([P(-0.6, -3.2), P(-0.56, -3.9), P(-0.44, -4.6), P(-0.3, -5.15), P(0.3, -5.15), P(0.44, -4.6), P(0.56, -3.9), P(0.6, -3.2), P(0, -3.14)], true, 6);
    S.cloth(c, cone, C.white, { pitch: Math.max(0.9, u * 0.07), grain: 0.25 });
    var stripes = []; for (var d = -8; d < 10; d++) { var col = [C.red, C.white, C.red, C.yellow, C.red, C.white, C.blue][((d % 7) + 7) % 7]; stripes.push({ d: d, col: col }); }
    var inside = function (x, y) { var t = (-3.2 - y) / 1.95, half = 0.6 - t * 0.3; return t >= 0 && t <= 1 && Math.abs(x) < half; };
    stripes.forEach(function (s) { for (var k = 0; k < 14; k++) { var x = -0.7 + k * 0.1, y = -3.25 - (k * 0.1 + s.d * 0.16 + 0.8) * 0.9; if (inside(x, y)) sts.push(S.knot(P(x, y), W(u, 0.05), s.col)); } });
    /* a column of large flat coins down the front edge */
    for (var cn = 0; cn < 7; cn++) sts = sts.concat(S.coin(P(0, -3.3 - cn * 0.27)[0], P(0, -3.3 - cn * 0.27)[1], Math.max(0.8, u * 0.11)));
    /* fat red pompoms on the crown, a dyed feather or two */
    sts = sts.concat(S.pompom(P(-0.2, -5.2)[0], P(0, -5.2)[1], Math.max(1.1, u * 0.2), C.red, seed + 3), S.pompom(P(0.18, -5.28)[0], P(0, -5.28)[1], Math.max(1.1, u * 0.22), C.red, seed + 4), S.pompom(P(0.02, -5.42)[0], P(0, -5.42)[1], Math.max(1, u * 0.15), C.pink, seed + 5));
    sts = sts.concat(S.stem([P(0.1, -5.4), P(0.32, -5.85)], W(u, 0.12), W(u, 0.05), C.orange, seed));
    S.sew(c, sts);
  }
  function pawmee(c, P, u, seed) {
    var sts = [];
    /* very long red bead strings from both sides, to the waist */
    [-1.02, -0.92, 0.92, 1.02].forEach(function (x, k) { for (var b = 0; b < 18; b++) sts.push(S.knot(P(x, -3.0 + b * 0.13), W(u, 0.05), b % 6 === 5 ? C.white : C.red)); });
    S.sew(c, sts); sts = [];
    /* side flaps, broader than the head, angled rows of coins */
    [-1, 1].forEach(function (s) {
      var flap = [P(s * 0.42, -4.05), P(s * 0.62, -4.08), P(s * 1.08, -3.0), P(s * 0.55, -2.95), P(s * 0.44, -3.3)];
      S.applique(c, flap, C.black, C.red, { pitch: Math.max(0.9, u * 0.07), grain: 0.35, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.03) });
      for (var r = 0; r < 4; r++) for (var k = 0; k < 3; k++) { var t = (r + 0.6) / 4.4, x = s * (0.5 + t * 0.38 + k * 0.12), y = -3.95 + t * 0.95; sts = sts.concat(S.coin(P(x, y)[0], P(x, y)[1], Math.max(0.7, u * 0.065))); }
      sts.push(S.knot(P(s * 0.62, -4.1), W(u, 0.09), C.silver));
    });
    /* the crown: a studded dome bordered in red */
    var dome = S.curve([P(-0.48, -3.3), P(-0.52, -3.75), P(-0.3, -4.12), P(0, -4.2), P(0.3, -4.12), P(0.52, -3.75), P(0.48, -3.3), P(0, -3.22)], true, 7);
    S.applique(c, dome, C.black, C.red, { pitch: Math.max(0.9, u * 0.07), grain: 0.35, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.035) });
    for (var r2 = 0; r2 < 4; r2++) { var y2 = -3.42 - r2 * 0.18, half = 0.4 - r2 * 0.06; for (var k2 = 0; k2 < 6; k2++) sts.push(S.knot(P(-half + (2 * half * (k2 + 0.5)) / 6, y2), W(u, 0.05), C.silver)); }
    S.sew(c, sts);
  }
  var HATS = [loimi, ulo, pawmee, loimi];

  function face(c, P, u) {
    var head = S.curve([P(-0.38, -3.2), P(-0.42, -2.95), P(-0.3, -2.62), P(0, -2.5), P(0.3, -2.62), P(0.42, -2.95), P(0.38, -3.2), P(0, -3.32)], true, 8);
    S.cloth(c, head, C.skin, { pitch: Math.max(0.8, u * 0.05), grain: 0.16, shadow: false });
    var w = W(u, 0.034), sts = [];
    sts.push(S.straight(P(-0.25, -3.07), P(-0.1, -3.09), w, C.hair), S.straight(P(0.1, -3.09), P(0.25, -3.07), w, C.hair));
    sts.push(S.straight(P(-0.24, -2.99), P(-0.11, -3.0), w * 1.1, C.hair), S.straight(P(0.11, -3.0), P(0.24, -2.99), w * 1.1, C.hair));
    sts.push(S.knot(P(-0.17, -2.975), W(u, 0.03), "#2a1d14"), S.knot(P(0.17, -2.975), W(u, 0.03), "#2a1d14"));
    sts.push(S.straight(P(0.02, -2.95), P(0.05, -2.8), w * 0.8, C.skinLo), S.straight(P(-0.03, -2.78), P(0.05, -2.78), w * 0.8, C.skinLo));
    sts.push(S.straight(P(-0.11, -2.68), P(0, -2.66), w, "#a2443a"), S.straight(P(0, -2.66), P(0.11, -2.68), w, "#a2443a"));
    S.sew(c, sts);
  }
  function sleeve(c, a, b, u, seed) {
    var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, h = u * 0.2;
    S.cloth(c, [[a[0] + nx * h, a[1] + ny * h], [b[0] + nx * h * 0.8, b[1] + ny * h * 0.8], [b[0] - nx * h * 0.8, b[1] - ny * h * 0.8], [a[0] - nx * h, a[1] - ny * h]], C.black, { pitch: Math.max(1, u * 0.08), grain: 0.35, shadow: false });
    var n = Math.max(4, Math.round(L / (u * 0.1))), sts = [];
    for (var i = 1; i < n; i++) { var t = i / n, x = a[0] + dx * t, y = a[1] + dy * t, k = h * (1 - t * 0.2) * 0.95; sts.push(S.straight([x + nx * k, y + ny * k], [x - nx * k, y - ny * k], Math.max(0.6, (L / n) * 0.8), BANDS[(i + seed) % BANDS.length])); }
    S.sew(c, sts);
  }
  /* a hand gripping a post: the fingers wrap round it toward us, the thumb over the top */
  function grip(c, p, u, side) {
    var r = u * 0.14, sts = [];
    S.cloth(c, [[p[0] - r, p[1] - r * 0.9], [p[0] + r, p[1] - r * 0.9], [p[0] + r * 0.95, p[1] + r * 0.9], [p[0] - r * 0.95, p[1] + r * 0.9]], C.skin, { pitch: 1, grain: 0.12, shadow: false });
    for (var f = 0; f < 3; f++) { var y = p[1] - r * 0.45 + f * r * 0.45; sts.push(S.straight([p[0] - r * 0.85, y], [p[0] + r * 0.85, y], W(u, 0.022), C.skinLo)); }
    sts.push(S.straight([p[0] - side * r * 0.2, p[1] - r * 0.95], [p[0] + side * r * 0.75, p[1] - r * 0.6], W(u, 0.05), C.skinLo));
    S.sew(c, sts);
  }
  function legs(c, P, u, seed, kneeY, ankY, xs, shoeCol) {
    [-1, 1].forEach(function (s) {
      var k = P(s * xs, kneeY), an = P(s * xs * 0.95, ankY);
      S.cloth(c, [[k[0] - u * 0.2, k[1]], [k[0] + u * 0.2, k[1]], [an[0] + u * 0.16, an[1]], [an[0] - u * 0.16, an[1]]], C.black, { pitch: Math.max(1, u * 0.08), grain: 0.3 });
      var sts = [], rows = 9;
      for (var i = 0; i < rows; i++) { var t = (i + 0.6) / rows, y = k[1] + (an[1] - k[1]) * t, x = k[0] + (an[0] - k[0]) * t, hw = u * (0.19 - t * 0.03); sts.push(S.straight([x - hw, y], [x + hw, y], Math.max(0.7, ((an[1] - k[1]) / rows) * 0.75), BANDS[(i * 3 + seed + (s > 0 ? 1 : 0)) % BANDS.length])); }
      S.sew(c, sts);
      var f = [an[0], an[1] + u * 0.12], shoe = S.curve([[f[0] - u * 0.2, f[1] - u * 0.14], [f[0] + u * 0.2, f[1] - u * 0.14], [f[0] + u * 0.24, f[1] + u * 0.12], [f[0], f[1] + u * 0.2], [f[0] - u * 0.24, f[1] + u * 0.12]], true, 6);
      S.applique(c, shoe, shoeCol, mx(shoeCol, "#888", 0.5), { pitch: 1, grain: 0.3, inset: W(u, 0.04), dash: 1.4, gap: 1.1, tw: 0.5 });
    });
  }
  function dress(c, P, u, seed, hipY) {
    /* short black skirt, flat in front, a white beaded panel hanging at the front */
    var sk = [P(-0.78, hipY - 0.5), P(0.78, hipY - 0.5), P(0.86, hipY + 0.32), P(-0.86, hipY + 0.32)];
    S.applique(c, sk, C.black, C.black2, { pitch: Math.max(1, u * 0.08), grain: 0.35, inset: W(u, 0.05), dash: 1.6, gap: 1.2, tw: 0.5 });
    var pl = [];
    for (var i = 0; i < 9; i++) { var x = -0.72 + i * 0.18; pl.push(S.straight(P(x, hipY - 0.42), P(x * 1.07, hipY + 0.3), W(u, 0.03), "#3b4160")); }
    for (var j = 0; j < 7; j++) for (var b = 0; b < 6; b++) pl.push(S.knot(P(-0.3 + j * 0.1, hipY - 0.4 + b * 0.13), W(u, 0.045), b === 5 ? C.pink : C.white));
    S.sew(c, pl);
    /* jacket: dark indigo, bands at the hem, silver coins and bead strands on the chest */
    var jacket = S.curve([P(-0.88, -2.28), P(-0.98, -1.4), P(-0.9, hipY - 0.5), P(0, hipY - 0.42), P(0.9, hipY - 0.5), P(0.98, -1.4), P(0.88, -2.28), P(0.3, -2.45), P(-0.3, -2.45)], true, 6);
    S.applique(c, jacket, C.black, C.black2, { pitch: Math.max(1, u * 0.08), grain: 0.35, inset: W(u, 0.05), dash: 1.8, gap: 1.3, tw: 0.55 });
    var js = [];
    for (var h = 0; h < 4; h++) { var y = hipY - 0.7 - h * 0.09; js.push(S.straight(P(-0.92, y), P(0.92, y), Math.max(0.7, u * 0.07), BANDS[(h * 2 + seed) % BANDS.length])); }
    for (var row = 0; row < 3; row++) for (var q = 0; q < 5 - row; q++) js = js.concat(S.coin(P(-0.36 + row * 0.09 + q * 0.18, 0)[0], P(0, -2.05 + row * 0.24)[1], Math.max(0.8, u * 0.07)));
    for (var st = 0; st < 3; st++) for (var b2 = 0; b2 < 9; b2++) { var tt = b2 / 8; js.push(S.knot(P(-0.45 + tt * 0.9, -2.32 + 0.55 * Math.sin(tt * Math.PI) * (0.6 + st * 0.25)), W(u, 0.04), [C.red, C.white, C.yellow][st])); }
    S.sew(c, js);
  }
  /* a rider on a seat, front view: hips at (ox, oy), hands on the seat's posts */
  /* an open hand, palm toward us, fingers up: a wave */
  function openHand(c, p, u) {
    var r = u * 0.13, sts = [];
    S.cloth(c, [[p[0] - r, p[1] - r * 0.4], [p[0] + r, p[1] - r * 0.4], [p[0] + r * 0.85, p[1] + r], [p[0] - r * 0.85, p[1] + r]], C.skin, { pitch: 1, grain: 0.12, shadow: false });
    for (var f = 0; f < 4; f++) { var x = p[0] - r * 0.75 + f * r * 0.5; sts.push(S.straight([x, p[1] - r * 0.3], [x + (f - 1.5) * r * 0.08, p[1] - r * 1.25], W(u, 0.07), C.skin)); }
    sts.push(S.straight([p[0] + r * 0.9, p[1] + r * 0.2], [p[0] + r * 1.45, p[1] - r * 0.35], W(u, 0.07), C.skin));
    S.sew(c, sts);
  }
  /* pose 0: both hands on the posts; 1: the right hand up, waving; 2: hands on the plank beside her */
  function rider(c, ox, oy, u, seed, hat, pose) {
    var P = function (x, y) { return [ox + x * u, oy + y * u]; };
    legs(c, P, u, seed, 0.25, 2.05, 0.42, seed % 3 ? "#2b2b2b" : "#e8e2d6");
    dress(c, P, u, seed, 0);
    [-1, 1].forEach(function (s) {
      var shd = P(s * 0.82, -2.18), el = P(s * 1.12, -1.25), wr = P(s * 1.3, -1.9);
      if (pose === 1 && s > 0) { el = P(1.2, -1.75); wr = P(1.12, -2.85); }
      if (pose === 2) { el = P(s * 1.06, -1.25); wr = P(s * 0.98, -0.42); }
      sleeve(c, shd, el, u, seed + (s > 0 ? 3 : 0)); sleeve(c, el, wr, u * 0.9, seed + 5);
      if (pose === 1 && s > 0) openHand(c, P(1.12, -2.98), u);
      if (pose === 2) grip(c, P(s * 0.98, -0.32), u, -s);
    });
    S.cloth(c, [P(-0.14, -2.62), P(0.14, -2.62), P(0.16, -2.4), P(-0.16, -2.4)], C.skinLo, { pitch: 1, grain: 0.1, shadow: false });
    face(c, P, u);
    hat(c, P, u, seed);
  }
  /* a seat: plank, two side posts, the bar it hangs from */
  function seat(c, x, y, u, front) {
    var w = u * 1.42, h = u * 2.55, pw = Math.max(1.5, u * 0.17), sts = [];
    if (!front) {
      sts = sts.concat(S.stem([[x - w - pw, y - h], [x + w + pw, y - h]], Math.max(3, pw * 1.6), pw * 0.9, C.woodHi, 5));
      S.sew(c, sts);
      S.applique(c, [[x - w - pw * 1.2, y - pw * 0.2], [x + w + pw * 1.2, y - pw * 0.2], [x + w + pw * 1.2, y + pw * 1.2], [x - w - pw * 1.2, y + pw * 1.2]], C.wood, C.woodHi, { pitch: 1.4, grain: 0.35, inset: 0.8, dash: 2, gap: 1.4, tw: 0.6 });
      return;
    }
    sts = sts.concat(S.stem([[x - w, y - h], [x - w, y + u * 0.15]], Math.max(3, pw * 1.6), pw, C.wood, 3), S.stem([[x + w, y - h], [x + w, y + u * 0.15]], Math.max(3, pw * 1.6), pw, C.wood, 4));
    S.sew(c, sts);
  }
  /* the swinger: side view, sitting on the short stick through the rope's loop, both hands on the rope */
  function swinger(c, ox, oy, u, seed) {
    var P = function (x, y) { return [ox + x * u, oy + y * u]; }, sts = [];
    var hip = P(0, 0), knee = P(1.5, -0.05), ank = P(2.35, 0.95);
    [[hip, knee, 0.27], [knee, ank, 0.22]].forEach(function (seg, si) {
      var a = seg[0], b = seg[1], w = u * seg[2], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
      S.cloth(c, [[a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w * 0.85, b[1] + ny * w * 0.85], [b[0] - nx * w * 0.85, b[1] - ny * w * 0.85], [a[0] - nx * w, a[1] - ny * w]], C.black, { pitch: 1.2, grain: 0.3 });
      if (si === 1) { var n = 8; for (var i = 0; i < n; i++) { var t = (i + 0.5) / n, x = a[0] + dx * t, y = a[1] + dy * t; sts.push(S.straight([x + nx * w * 0.9, y + ny * w * 0.9], [x - nx * w * 0.9, y - ny * w * 0.9], Math.max(0.7, (L / n) * 0.7), BANDS[(i * 3 + seed) % BANDS.length])); } }
    });
    S.applique(c, S.curve([P(2.15, 0.88), P(2.65, 0.82), P(2.85, 1.02), P(2.6, 1.16), P(2.2, 1.12)], true, 5), "#f2ede4", "#bdb4a4", { pitch: 1, grain: 0.3, inset: 0.8, dash: 1.4, gap: 1.1, tw: 0.5 });
    S.applique(c, [P(-0.35, -0.55), P(0.75, -0.42), P(0.95, 0.25), P(-0.3, 0.3)], C.black, C.black2, { pitch: 1.2, grain: 0.35, inset: 0.9, dash: 1.6, gap: 1.2, tw: 0.5 });
    for (var f = 0; f < 6; f++) for (var b = 0; b < 4; b++) sts.push(S.knot(P(0.55 + f * 0.07, -0.3 + b * 0.14), W(u, 0.045), b === 3 ? C.pink : C.white));
    S.applique(c, S.curve([P(-0.55, -0.5), P(-0.62, -1.5), P(-0.4, -2.35), P(0.15, -2.45), P(0.5, -2.1), P(0.55, -1.0), P(0.6, -0.45)], true, 6), C.black, C.black2, { pitch: 1.2, grain: 0.35, inset: 0.9, dash: 1.8, gap: 1.3, tw: 0.55 });
    for (var h = 0; h < 4; h++) sts.push(S.straight(P(-0.6, -0.62 - h * 0.09), P(0.6, -0.55 - h * 0.09), Math.max(0.7, u * 0.07), BANDS[(h * 2 + seed) % BANDS.length]));
    for (var q = 0; q < 6; q++) sts = sts.concat(S.coin(P(0.42, 0)[0], P(0, -1.95 + q * 0.2)[1], Math.max(0.8, u * 0.07)));
    S.sew(c, sts);
    /* the stick she sits on, through the loop */
    S.sew(c, S.stem([P(-0.55, 0.32), P(0.55, 0.32)], 3, W(u, 0.12), C.wood2, 3));
    sleeve(c, P(0.05, -2.2), P(0.45, -2.95), u, seed); sleeve(c, P(0.45, -2.95), P(0.12, -3.75), u * 0.9, seed + 2);
    sleeve(c, P(-0.1, -2.15), P(0.3, -2.75), u * 0.95, seed + 4); sleeve(c, P(0.3, -2.75), P(0.1, -3.35), u * 0.85, seed + 6);
    grip(c, P(0.06, -3.82), u, 1); grip(c, P(0.05, -3.4), u, 1);
    var head = S.curve([P(0.05, -3.25), P(-0.3, -3.05), P(-0.32, -2.7), P(-0.05, -2.48), P(0.28, -2.55), P(0.4, -2.75), P(0.36, -2.9), P(0.42, -3.0), P(0.3, -3.2)], true, 6);
    S.cloth(c, head, C.skin, { pitch: 1, grain: 0.16, shadow: false });
    S.sew(c, [S.straight(P(0.2, -2.95), P(0.3, -2.96), W(u, 0.04), C.hair), S.knot(P(0.25, -2.92), W(u, 0.03), "#2a1d14"), S.straight(P(0.28, -2.66), P(0.36, -2.67), W(u, 0.035), "#a2443a")]);
    /* her Ulo cone in profile, leaning back, pompoms of many colours as in the photograph */
    var cone = S.curve([P(-0.42, -3.05), P(-0.75, -3.8), P(-0.95, -4.5), P(-0.6, -4.62), P(-0.1, -3.9), P(0.3, -3.25), P(0.0, -3.1)], true, 6);
    S.applique(c, cone, C.black, C.silver2, { pitch: 1.1, grain: 0.35, inset: 0.8, dash: 1.4, gap: 1.1, tw: 0.5 });
    var cs = [];
    for (var i2 = 0; i2 < 6; i2++) cs.push(S.knot(P(-0.05 - i2 * 0.15, -3.3 - i2 * 0.22), W(u, 0.08), i2 % 2 ? C.silver : "#eef1f3"));
    for (var i3 = 0; i3 < 5; i3++) cs.push(S.knot(P(-0.3 - i3 * 0.12, -3.2 - i3 * 0.24), W(u, 0.06), i3 % 2 ? C.red : C.white));
    [[-0.95, -4.75, C.red], [-0.7, -4.82, C.pink], [-1.1, -4.4, C.white], [-1.05, -3.95, C.sky], [-0.85, -3.55, C.yellow], [-0.62, -3.2, C.red]].forEach(function (pp, z) { cs = cs.concat(S.pompom(P(pp[0], pp[1])[0], P(pp[0], pp[1])[1], Math.max(1.2, u * 0.2), pp[2], seed + z)); });
    for (var bb = 0; bb < 9; bb++) cs.push(S.knot(P(-0.5 - bb * 0.02, -3.0 + bb * 0.14), W(u, 0.045), bb % 3 === 2 ? C.red : C.silver));
    S.sew(c, cs);
  }
  /* a woman standing to watch, a parasol over her */
  function watcher(c, ox, oy, u, seed, umbrella) {
    var P = function (x, y) { return [ox + x * u, oy + y * u]; };
    legs(c, P, u, seed, -2.0, -0.32, 0.24, "#2b2b2b");
    var Q = function (x, y) { return P(x, y - 2.3); };
    dress(c, Q, u, seed, 0);
    sleeve(c, Q(-0.82, -2.18), Q(-1.0, -1.25), u, seed); sleeve(c, Q(-1.0, -1.25), Q(-0.7, -0.75), u * 0.9, seed + 2);
    sleeve(c, Q(0.82, -2.18), Q(0.98, -1.3), u, seed + 4); sleeve(c, Q(0.98, -1.3), Q(1.05, -1.95), u * 0.9, seed + 1);
    grip(c, Q(1.06, -2.0), u, -1);
    S.cloth(c, [Q(-0.14, -2.62), Q(0.14, -2.62), Q(0.16, -2.4), Q(-0.16, -2.4)], C.skinLo, { pitch: 1, grain: 0.1, shadow: false });
    face(c, Q, u); loimi(c, Q, u, seed);
    if (umbrella) {
      var top = Q(1.06, -6.0);
      S.sew(c, S.stem([Q(1.06, -1.95), top], 3, W(u, 0.05), "#5b4a3a", seed));
      var can = S.curve([[top[0] - u * 1.7, top[1] + u * 0.75], [top[0] - u * 1.1, top[1] - u * 0.15], [top[0], top[1] - u * 0.45], [top[0] + u * 1.1, top[1] - u * 0.15], [top[0] + u * 1.7, top[1] + u * 0.75]], false, 8).concat([[top[0], top[1] + u * 0.55]]);
      S.applique(c, can, umbrella, mx(umbrella, "#fff", 0.45), { pitch: 1.4, grain: 0.3, inset: 1, dash: 2, gap: 1.4, tw: 0.6 });
      var rib = []; for (var q = -2; q <= 2; q++) rib = rib.concat(S.running([[top[0], top[1] - u * 0.4], [top[0] + q * u * 0.75, top[1] + u * 0.65]], 2, 1.6, 0.6, mx(umbrella, "#000", 0.25)));
      S.sew(c, rib);
    }
  }

  /* ---------------------------------------------------------------- the wheel's turning part */
  function wheelLayer(R, u, dpr) {
    var pad = u * 0.8, size = Math.ceil((R + pad) * 2), L = S.layer(size, size, dpr), c = L.ctx, cx = size / 2, cy = size / 2, bw = Math.max(2.5, u * 0.26);
    [0, Math.PI / 2].forEach(function (a, i) {
      /* each arm: two poles lashed side by side */
      [-1, 1].forEach(function (side) {
        var ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, off = side * bw * 0.62, ex = ca * R, ey = sa * R;
        var A = [cx - ex + nx * off, cy - ey + ny * off], B = [cx + ex + nx * off, cy + ey + ny * off];
        var path = [[A[0] + nx * bw * 0.5, A[1] + ny * bw * 0.5], [B[0] + nx * bw * 0.5, B[1] + ny * bw * 0.5], [B[0] - nx * bw * 0.5, B[1] - ny * bw * 0.5], [A[0] - nx * bw * 0.5, A[1] - ny * bw * 0.5]];
        S.cloth(c, path, side > 0 ? C.wood : mx(C.wood, C.wood2, 0.4), { pitch: 1.5, grain: 0.35, angle: (a * 180) / Math.PI });
        S.sew(c, S.stem([A, B], Math.max(4, bw * 1.4), Math.max(0.6, bw * 0.16), side > 0 ? C.woodHi : "#7b5428", 11 + i * 3 + side));
      });
    });
    var lash = [];
    for (var m = 0; m < 4; m++) { var aa = (m * Math.PI) / 2; [0.35, 0.7, 0.98].forEach(function (rr) { var px = cx + Math.cos(aa) * R * rr, py = cy + Math.sin(aa) * R * rr, nx = -Math.sin(aa), ny = Math.cos(aa), tx = Math.cos(aa), ty = Math.sin(aa);
      for (var w = 0; w < 3; w++) { var o = (w - 1) * bw * 0.32; lash.push(S.straight([px + tx * o - nx * bw * 1.3, py + ty * o - ny * bw * 1.3], [px + tx * (o + bw * 0.15) + nx * bw * 1.3, py + ty * (o + bw * 0.15) + ny * bw * 1.3], Math.max(0.7, bw * 0.24), C.rope)); } }); }
    lash = lash.concat(S.knots(cx, cy, bw * 1.6, bw * 1.6, Math.max(0.8, bw * 0.2), function (x, y) { return x * x + y * y > 0.5 ? C.wood2 : C.woodHi; }, 77));
    S.sew(c, lash);
    return { L: L, size: size };
  }

  /* ---------------------------------------------------------------- the scene */
  function mount(canvas) {
    var hour = cmHour(), sky = skyOf(hour);
    var state = { bg: null, front: null, wheel: null, riders: [], swinger: null, mist: [], g: null };
    var wheel = { a: 0.35, v: 0.14 }, swing = { a: 0.32, v: 0 };

    function layout(st) {
      var Wd = st.w, H = st.h, land = Wd >= H * 1.0, g = { land: land };
      g.ground = H * (land ? 0.87 : 0.84);
      if (land) { g.R = Math.min(H * 0.235, Wd * 0.14); g.wx = Wd * 0.75; g.wy = Math.min(g.ground - g.R * 1.78, H * 0.1 + g.R * 1.42); }
      else { g.R = Math.min(Wd * 0.27, H * 0.17); g.wx = Wd - g.R - g.R * 0.36 - 6; g.wy = g.ground - g.R * 1.8; }
      g.u = g.R * 0.155;
      g.hillY = H * (land ? 0.66 : 0.68);
      g.sx = Wd * (land ? 0.47 : 0.24);
      g.su = g.u * (land ? 0.8 : 0.72);
      g.top = land ? H * 0.22 : Math.max(H * 0.36, g.hillY - g.su * 18);
      g.base = g.hillY + g.su * 0.6;
      g.loop = g.base - g.su * 4.2;
      g.ropeL = g.loop - g.top - g.su * 0.6;
      g.spread = Math.min(Wd * (land ? 0.13 : 0.36), (g.base - g.top) * 0.62);
      return g;
    }
    function ridgeAt(ridge, x) { for (var i = 1; i < ridge.length; i++) if (ridge[i][0] >= x) { var a = ridge[i - 1], b = ridge[i], t = (x - a[0]) / ((b[0] - a[0]) || 1); return a[1] + (b[1] - a[1]) * t; } return ridge[ridge.length - 1][1]; }
    function poles(c, g, far) {
      /* one pair: two trunks from the ground to the knot, leafy tufts left at the tips, vine lashings */
      var apex = [g.sx + (far ? g.su * 0.5 : 0), g.top + (far ? g.su * 0.4 : 0)], lift = far ? -g.su * 0.6 : 0;
      var fl = [g.sx - g.spread + (far ? g.su * 1.2 : 0), g.base + lift], fr = [g.sx + g.spread - (far ? g.su * 0.6 : 0), g.base + lift], pw = Math.max(1.6, g.su * 0.2);
      var col = far ? C.pole2 : C.pole, hi = far ? "#8a7550" : "#e4d2ab", st = [];
      [fl, fr].forEach(function (foot, k) {
        var dx = apex[0] - foot[0], dy = apex[1] - foot[1], tip = [apex[0] + dx * 0.09, apex[1] + dy * 0.09];
        st = st.concat(S.stem([foot, tip], Math.max(5, pw * 2.2), pw, col, 1 + k + (far ? 4 : 0)), S.stem([[foot[0] + (k ? -1 : 1) * pw * 0.3, foot[1]], [tip[0], tip[1] + pw]], Math.max(5, pw * 2.2), pw * 0.4, hi, 3 + k));
        st = st.concat(S.knots(tip[0] + dx * 0.02, tip[1] - g.su * 0.3, g.su * 0.55, g.su * 0.4, Math.max(0.8, g.su * 0.09), function (x, y) { return y < 0 ? "#6fb04f" : C.leaf; }, 50 + k + (far ? 9 : 0)));
      });
      for (var w = 0; w < 6; w++) st.push(S.straight([apex[0] - pw * 2, apex[1] + w * pw * 0.6], [apex[0] + pw * 2, apex[1] + pw * 0.4 + w * pw * 0.6], Math.max(0.8, pw * 0.5), "#6d5a2c"));
      S.sew(c, st);
    }
    function bake(st) {
      var Wd = st.w, H = st.h, d = st.dpr, g = state.g = layout(st), r = S.rng(23);
      dim = sky.k;
      var L = S.layer(Wd, H, d), c = L.ctx;
      S.cloth(c, [[0, 0], [Wd, 0], [Wd, H], [0, H]], sky.top, { pitch: 3, grain: 0.22, shadow: false });
      var rows = Math.ceil(g.ground / 9), sts = [];
      for (var i = 0; i < rows; i++) { var y = i * 9 + 4, t = y / g.ground, col = mx(sky.top, sky.low, Math.pow(t, 1.3));
        for (var x = -10 + (i % 2) * 7; x < Wd + 10; x += 13 + r() * 4) sts.push(S.flat([x, y + (r() - 0.5) * 1.5], [x + 9 + r() * 5, y + (r() - 0.5) * 1.5], 2.3, col, 1)); }
      S.threads(c, sts);
      if (sky.night) { var ns = []; for (var k = 0; k < 70; k++) ns.push(S.knot([r() * Wd, r() * g.hillY * 0.7], 0.8 + r() * 0.8, k % 7 ? "#fdf6dc" : C.yellow)); S.sew(c, ns); }
      else { var sun = g.land ? [Wd * 0.6, H * 0.12] : [Wd * 0.86, H * 0.36]; S.sew(c, S.knots(sun[0], sun[1], H * 0.03, H * 0.03, 1.8, function (x, y) { return x * x + y * y > 0.55 ? C.orange : C.yellow; }, 5)); }
      var hills = [{ y: g.hillY - H * 0.16, amp: 0.09, col: "#7d95b8", seed: 3 }, { y: g.hillY - H * 0.07, amp: 0.07, col: "#4f8a8b", seed: 8 }, { y: g.hillY, amp: 0.05, col: "#3f7a45", seed: 13 }];
      var ridges = [];
      hills.forEach(function (hl, hi) {
        var rr = S.rng(hl.seed), pts = [], n = 9;
        for (var q = 0; q <= n; q++) pts.push([(Wd * q) / n, hl.y - H * hl.amp * (0.4 + 0.6 * Math.abs(Math.sin(q * 1.3 + hl.seed))) * (0.6 + rr() * 0.6)]);
        if (hi === 2) { var sxq = Math.round((g.sx / Wd) * n); for (var z = Math.max(0, sxq - 1); z <= Math.min(n, sxq + 1); z++) pts[z][1] = g.base + H * 0.004; }
        var ridge = S.curve(pts, false, 8); ridges.push(ridge);
        S.cloth(c, ridge.concat([[Wd, H], [0, H]]), sh(hl.col), { pitch: 2.6 - hi * 0.3, grain: 0.4, seed: 100 + hi });
        S.sew(c, S.running(ridge, 5, 3, 1.1, sh(mx(hl.col, "#fff", 0.35))));
        if (hi === 2) { var tr = []; for (var q2 = 0; q2 < 16; q2++) { var px = rr() * Wd; if (Math.abs(px - g.sx) < g.spread * 1.1) continue; var py = ridgeAt(ridge, px) + 4;
          tr = tr.concat(S.knots(px, py - 7, 6 + rr() * 4, 7 + rr() * 3, 1.6, function (u2, v2) { return v2 < -0.2 ? "#5aa055" : "#2f6a33"; }, 200 + q2)); } S.sew(c, tr); }
      });
      /* the far pair of the swing's poles, behind her, and the carved crosspiece joining the two pairs */
      poles(c, g, true);
      S.sew(c, S.stem([[g.sx, g.top + g.su * 0.5], [g.sx + g.su * 0.55, g.top + g.su * 0.95]], 3, Math.max(1.6, g.su * 0.26), C.wood2, 31));
      /* grass in front */
      var gpath = S.curve([[0, g.ground - 6], [Wd * 0.3, g.ground - 12], [Wd * 0.62, g.ground - 4], [Wd, g.ground - 10]], false, 10).concat([[Wd, H], [0, H]]);
      S.cloth(c, gpath, sh(C.grass), { pitch: 2.4, grain: 0.4, seed: 7 });
      var gs = []; for (var q3 = 0; q3 < Wd / 3; q3++) { var gx = r() * Wd, gy = g.ground + r() * (H - g.ground) * 0.9; gs.push(S.flat([gx, gy], [gx + (r() - 0.5) * 3, gy - 4 - r() * 5], 1, sh(r() < 0.5 ? C.grass2 : "#79b04f"))); }
      S.sew(c, gs);
      /* the wheel's two posts: the back one darker, an axle laid in their notches */
      var pw = Math.max(4, g.u * 0.5), base = g.ground + 4;
      [[g.u * 0.9, C.wood2, "#4f3418"], [0, C.wood, C.woodHi]].forEach(function (pp, k) {
        var x = g.wx + pp[0];
        S.applique(c, [[x - pw, g.wy + pw * 0.4], [x + pw, g.wy + pw * 0.4], [x + pw * 1.2, base - k * 2], [x - pw * 1.2, base - k * 2]], pp[1], pp[2], { pitch: 1.8, grain: 0.4, inset: 1.2, dash: 3, gap: 2, tw: 0.8 });
        S.sew(c, S.stem([[x - pw * 0.3, base - 2], [x - pw * 0.2, g.wy + pw * 1.2]], 6, Math.max(0.8, pw * 0.16), k ? "#8d5f2c" : "#3d2812", 9 + k));
      });
      S.sew(c, S.stem([[g.wx - g.u * 0.4, g.wy], [g.wx + g.u * 1.5, g.wy]], 4, Math.max(2, g.u * 0.32), C.wood2, 21));
      if (g.land) watcher(c, g.wx - g.R * 1.5, g.ground + g.u * 0.9, g.u * 0.85, 34, C.purple);
      state.bg = L;
      /* the near pair of poles, drawn after her each frame */
      var F = S.layer(Wd, H, d); poles(F.ctx, g, false); state.front = F;
      state.wheel = wheelLayer(g.R, g.u, d);
      state.riders = [0, 1, 2, 3].map(function (k) {
        var u = g.u, w = Math.ceil(u * 4.2), h = Math.ceil(u * 9.2), back = S.layer(w, h, d), fr = S.layer(w, h, d), ox = w / 2, oy = u * 6.2;
        var pose = [0, 1, 2, 0][k];
        seat(back.ctx, ox, oy, u, false); rider(back.ctx, ox, oy, u, 11 + k * 7, HATS[k], pose); seat(fr.ctx, ox, oy, u, true);
        if (pose !== 2) grip(fr.ctx, [ox - u * 1.42, oy - u * 1.95], u, 1);
        if (pose === 0) grip(fr.ctx, [ox + u * 1.42, oy - u * 1.95], u, -1);
        return { back: back, front: fr, w: w, h: h, ox: ox, pivot: oy - u * 2.55 };
      });
      var su = g.su, sw = Math.ceil(su * 4.6), shh = Math.ceil(su * 6.6), SL = S.layer(sw, shh, d);
      swinger(SL.ctx, su * 1.25, su * 5.0, su, 5);
      state.swinger = { L: SL, w: sw, h: shh, hx: su * 1.31, hy: su * 1.0 };
      state.mist = [0, 1].map(function (k) {
        var mw = Math.ceil(Wd * 0.6), mh = Math.ceil(H * 0.06), M = S.layer(mw, mh, d), rr = S.rng(60 + k), ms = [];
        for (var row = 0; row < 7; row++) { var y = mh * (0.2 + row * 0.1);
          for (var x = 0; x < mw; x += 10 + rr() * 8) { var tt = x / mw, thick = Math.sin(tt * Math.PI) * (1 - Math.abs(row - 3) / 4); if (rr() > thick * 0.9) continue; ms.push(S.flat([x, y + (rr() - 0.5) * 2], [x + 8 + rr() * 9, y + (rr() - 0.5) * 2], 2.2, "#ffffff", 1)); } }
        M.ctx.globalAlpha = 0.38; S.threads(M.ctx, ms); M.ctx.globalAlpha = 1;
        return { L: M, w: mw, h: mh, y: hills[k].y - H * 0.025, speed: 5 + k * 4, off: rr() * Wd };
      });
    }

    var st = S.stage(canvas, function (st, dt) {
      if (st.dirty || !state.bg) { bake(st); st.dirty = false; }
      var g = state.g, c = st.ctx, Wd = st.w, H = st.h;
      var base = S.reduced ? 0 : 0.14;
      wheel.v += (base - wheel.v) * Math.min(1, dt * 0.35); wheel.a += wheel.v * dt;
      var om = Math.sqrt(9.8 / Math.max(0.6, g.ropeL / 70));
      swing.v += (-om * om * Math.sin(swing.a)) * dt; swing.v *= 1 - dt * 0.06;
      if (!S.reduced && Math.abs(swing.a) < 0.12 && Math.abs(swing.v) < 0.75) swing.v += (swing.v >= 0 ? 1 : -1) * 0.6 * dt;
      swing.a = Math.max(-0.75, Math.min(0.75, swing.a + swing.v * dt));
      c.clearRect(0, 0, Wd, H);
      c.drawImage(state.bg.canvas, 0, 0, Wd, H);
      state.mist.forEach(function (m) { var x = ((m.off + st.t * m.speed) % (Wd + m.w)) - m.w; c.drawImage(m.L.canvas, x, m.y + Math.sin(st.t * 0.3 + m.off) * 3, m.w, m.h); });
      var apex = [g.sx, g.top + g.su * 0.6], end = [apex[0] + Math.sin(swing.a) * g.ropeL, apex[1] + Math.cos(swing.a) * g.ropeL];
      S.sew(c, S.stem([apex, end], 7, Math.max(1, g.su * 0.12), C.rope, 6));
      /* the short pull rope above her head */
      var pr = [apex[0] + g.su * 0.25 + Math.sin(swing.a * 0.6 + st.t * 0.7) * g.su * 0.4, apex[1] + g.su * 2.8];
      S.sew(c, S.stem([[apex[0] + g.su * 0.25, apex[1]], pr], 6, Math.max(0.8, g.su * 0.09), C.rope, 7));
      var sw = state.swinger; c.save(); c.translate(end[0], end[1]); c.rotate(-swing.a * 0.85);
      c.drawImage(sw.L.canvas, -sw.hx, -sw.hy - g.su * 3.8, sw.w, sw.h); c.restore();
      c.drawImage(state.front.canvas, 0, 0, Wd, H);
      var wl = state.wheel; c.save(); c.translate(g.wx, g.wy); c.rotate(wheel.a); c.drawImage(wl.L.canvas, -wl.size / 2, -wl.size / 2, wl.size, wl.size); c.restore();
      for (var k = 0; k < 4; k++) {
        var a = wheel.a + (k * Math.PI) / 2, ex = g.wx + Math.cos(a) * g.R * 0.97, ey = g.wy + Math.sin(a) * g.R * 0.97, rd = state.riders[k];
        var sway = -wheel.v * 0.45 + Math.sin(st.t * 1.6 + k * 1.3) * 0.025;
        c.save(); c.translate(ex, ey); c.rotate(sway); c.drawImage(rd.back.canvas, -rd.ox, -rd.pivot, rd.w, rd.h); c.drawImage(rd.front.canvas, -rd.ox, -rd.pivot, rd.w, rd.h); c.restore();
      }
      c.fillStyle = "#4f3418"; c.beginPath(); c.arc(g.wx, g.wy, Math.max(2, g.u * 0.2), 0, Math.PI * 2); c.fill();
    });

    function at(e) { var b = canvas.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; }
    canvas.addEventListener("pointerdown", function (e) {
      var p = at(e), g = state.g; if (!g) return;
      if (Math.hypot(p[0] - g.wx, p[1] - g.wy) < g.R * 1.5) push("wheel", p[0] < g.wx ? -1 : 1); else if (Math.abs(p[0] - g.sx) < g.spread * 1.1 && p[1] > g.top && p[1] < g.base) push("swing"); else push("wheel", 1);
    });
    function push(what, dir) {
      if (what === "wheel") { wheel.v = Math.max(-2.6, Math.min(2.6, wheel.v + 0.9 * (dir || 1))); S.jingle(4, 3); }
      else { swing.v += (swing.v >= 0 ? 1 : -1) * 0.8; if (Math.abs(swing.v) < 0.2) swing.v = 0.8; S.creak(); }
      st.kick();
    }
    return { push: push, stage: st };
  }

  window.FEST = { mount: mount, rider: rider, HATS: { loimi: loimi, ulo: ulo, pawmee: pawmee }, face: face, sleeve: sleeve, C: C, BANDS: BANDS };
})();
