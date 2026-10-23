/* story.js — a Hmong story cloth (paj ntaub tib neeg) of daily life, stitched as you watch.
   Border after the Library of Congress cloths: black binding, an orange margin, a white rule, a sawtooth
   of grey and orange triangles, a white rule, a blue field. Figures in flat satin stitch: people in black
   with pink and red hats, round-crowned trees, a grey roof, rice, chickens, a pig, the New Year ball toss,
   a river with a boat. Each part is stitched one stitch at a time; tap for the next. */
(function () {
  "use strict";
  var S = window.STITCH;
  var lang = function () { return document.documentElement.dataset.lang === "th" ? "th" : "en"; };
  var T = {
    next: { en: "Stitch the next part", th: "ปักส่วนต่อไป" }, again: { en: "Start again", th: "เริ่มใหม่" },
    intro: { en: "A story cloth of daily life: figures in satin stitch inside a border of triangles. Tap to stitch the next part.", th: "ผ้าเล่าเรื่องชีวิตประจำวัน ตัวละครปักด้วยฝีเข็มแบบซาติน ล้อมด้วยขอบลายสามเหลี่ยม แตะเพื่อปักส่วนต่อไป" },
    done: { en: "Finished. Story cloths like this one were first stitched in Thai refugee camps such as Ban Vinai in the late 1970s and sold abroad.", th: "เสร็จแล้ว ผ้าเล่าเรื่องแบบนี้เริ่มปักกันในค่ายผู้ลี้ภัยในไทย เช่น บ้านวินัย ช่วงปลายทศวรรษ 1970 แล้วขายไปต่างประเทศ" },
    label: { en: "A Hmong story cloth being stitched", th: "ผ้าเล่าเรื่องของม้งกำลังถูกปัก" }
  };
  var PARTS = [
    { id: "hills", en: "The mountains", th: "ภูเขา" },
    { id: "trees", en: "Trees with round crowns", th: "ต้นไม้พุ่มกลม" },
    { id: "house", en: "A house with a grey roof", th: "บ้านหลังคาสีเทา" },
    { id: "rice", en: "Rice on the terraces", th: "นาข้าวขั้นบันได" },
    { id: "basket", en: "A woman carrying a basket", th: "ผู้หญิงแบกตะกร้า" },
    { id: "hoe", en: "A man with a hoe", th: "ผู้ชายถือจอบ" },
    { id: "hens", en: "Chickens", th: "ไก่" },
    { id: "pig", en: "A pig", th: "หมู" },
    { id: "ball", en: "New Year: a cloth ball tossed between two (pov pob)", th: "ปีใหม่ม้ง: โยนลูกช่วงผ้า (pov pob)" },
    { id: "river", en: "The river and a boat", th: "แม่น้ำและเรือ" }
  ];
  var K = { black: "#1a1a1a", pink: "#e5588a", red: "#d43a2f", green: "#3f9a4b", green2: "#2f7a3a", lime: "#8cc44f", yellow: "#f0c93b", purple: "#7b3f98", white: "#f4f4f4", grey: "#8e8e9c", brown: "#8a5a2b", skin: "#d39a6a", river: "#bcd3e6", orange: "#d8622b", field: "#23408a" };

  window.TOYS.story = function (root) {
    var cv = document.createElement("canvas"), ctl = document.createElement("div"), say = document.createElement("p");
    ctl.className = "ctl"; say.className = "say"; say.setAttribute("aria-live", "polite"); cv.setAttribute("role", "img");
    root.appendChild(cv); root.appendChild(ctl); root.appendChild(say);
    var bN = document.createElement("button"), bA = document.createElement("button"); [bN, bA].forEach(function (b) { b.type = "button"; ctl.appendChild(b); });
    var done = null, parts = [], cur = -1, idx = 0, prog = 0, wait = 0, finished = false, fld = null;
    function words() { var l = lang(); bN.textContent = T.next[l]; bA.textContent = T.again[l]; cv.setAttribute("aria-label", T.label[l]); say.textContent = finished ? T.done[l] : cur >= 0 ? PARTS[cur][l] : T.intro[l]; }
    function fit() { var w = root.clientWidth - 20; cv.style.width = w + "px"; cv.style.height = Math.round(Math.min(window.innerHeight * 0.58, w * 0.78, 560)) + "px"; }

    /* figures, in field units: X(x) and Y(y) map 0..1 to the blue field */
    function build(st) {
      var w = st.w, h = st.h, m = Math.min(w, h) * 0.075, tooth = Math.min(w, h) * 0.05, inset = m + tooth + 6;
      fld = { x: inset, y: inset, w: w - 2 * inset, h: h - 2 * inset };
      var X = function (x) { return fld.x + x * fld.w; }, Y = function (y) { return fld.y + y * fld.h; }, Pt = function (x, y) { return [X(x), Y(y)]; };
      var u = Math.min(fld.w, fld.h), sw = Math.max(1, u * 0.012), gap = Math.max(1.4, u * 0.012);
      var sat = function (poly, ang, col) { return S.satinFill(poly.map(function (p) { return Pt(p[0], p[1]); }), ang, gap, sw, typeof col === "function" ? col : function () { return col; }); };
      /* a person in satin stitch: hat, head, a jacket with its arms, a skirt (woman) or trousers (man), feet */
      var person = function (x, y, s, hat, woman, extra, armUp) {
        var o = [], k = s * 1.15;
        /* legs and feet */
        if (woman) { o = o.concat(sat([[x - 0.024 * k, y - 0.045 * k], [x + 0.024 * k, y - 0.045 * k], [x + 0.03 * k, y + 0.035 * k], [x - 0.03 * k, y + 0.035 * k]], Math.PI / 2, woman === 2 ? K.white : "#2b3f8f"));
          o.push(S.straight(Pt(x - 0.01 * k, y + 0.035 * k), Pt(x - 0.012 * k, y + 0.065 * k), sw * 1.3, K.black), S.straight(Pt(x + 0.01 * k, y + 0.035 * k), Pt(x + 0.012 * k, y + 0.065 * k), sw * 1.3, K.black)); }
        else { o = o.concat(sat([[x - 0.02 * k, y - 0.045 * k], [x - 0.003 * k, y - 0.045 * k], [x - 0.008 * k, y + 0.06 * k], [x - 0.02 * k, y + 0.06 * k]], Math.PI / 2, K.black), sat([[x + 0.003 * k, y - 0.045 * k], [x + 0.02 * k, y - 0.045 * k], [x + 0.02 * k, y + 0.06 * k], [x + 0.008 * k, y + 0.06 * k]], Math.PI / 2, K.black)); }
        o.push(S.straight(Pt(x - 0.016 * k, y + 0.066 * k), Pt(x - 0.004 * k, y + 0.066 * k), sw * 1.6, K.black), S.straight(Pt(x + 0.004 * k, y + 0.066 * k), Pt(x + 0.016 * k, y + 0.066 * k), sw * 1.6, K.black));
        /* jacket, a sash of colour at the waist */
        o = o.concat(sat([[x - 0.018 * k, y - 0.1 * k], [x + 0.018 * k, y - 0.1 * k], [x + 0.022 * k, y - 0.045 * k], [x - 0.022 * k, y - 0.045 * k]], 0, K.black));
        o.push(S.straight(Pt(x - 0.022 * k, y - 0.05 * k), Pt(x + 0.022 * k, y - 0.05 * k), sw * 1.5, woman ? K.pink : K.red));
        /* arms */
        o.push(S.straight(Pt(x - 0.018 * k, y - 0.095 * k), Pt(x - 0.032 * k, y - (armUp ? 0.13 : 0.055) * k), sw * 1.4, K.black));
        o.push(S.straight(Pt(x + 0.018 * k, y - 0.095 * k), Pt(x + 0.032 * k, y - (armUp ? 0.13 : 0.055) * k), sw * 1.4, K.black));
        /* head and hat */
        o.push(S.knot(Pt(x, y - 0.118 * k), Math.max(1.6, u * 0.016 * k), K.skin));
        o = o.concat(sat([[x - 0.02 * k, y - 0.132 * k], [x + 0.02 * k, y - 0.132 * k], [x + 0.012 * k, y - 0.152 * k], [x - 0.012 * k, y - 0.152 * k]], 0, hat));
        return o.concat(extra || []);
      };
      parts = [
        /* hills: three green peaks along the top */
        sat([[0.0, 0.32], [0.16, 0.08], [0.34, 0.32]], 1.05, K.green).concat(sat([[0.24, 0.32], [0.46, 0.02], [0.68, 0.32]], 1.05, K.green2), sat([[0.58, 0.32], [0.8, 0.1], [1.0, 0.32]], 1.05, K.green)),
        /* trees: a trunk of straight stitches, a crown of knots */
        [[0.08, 0.42], [0.36, 0.4], [0.62, 0.42], [0.92, 0.4]].reduce(function (o, t, i) { o.push(S.straight(Pt(t[0], t[1]), Pt(t[0], t[1] - 0.07), sw * 1.6, K.brown)); return o.concat(S.knots(X(t[0]), Y(t[1] - 0.1), u * 0.035, u * 0.035, Math.max(1.3, u * 0.011), function (a, b) { return b < 0 ? K.lime : K.green; }, 40 + i)); }, []),
        /* the house: walls, a grey roof, a dark door */
        sat([[0.14, 0.62], [0.32, 0.62], [0.32, 0.48], [0.14, 0.48]], Math.PI / 2, "#c49a62").concat(sat([[0.11, 0.49], [0.35, 0.49], [0.28, 0.38], [0.18, 0.38]], 0.35, K.grey), sat([[0.21, 0.62], [0.25, 0.62], [0.25, 0.53], [0.21, 0.53]], Math.PI / 2, "#3a2a1a")),
        /* rice: terrace bands stepping up the slope, tufts of green and ripening gold on each */
        (function () { var o = []; for (var r = 0; r < 4; r++) { var y0 = 0.56 - r * 0.05, x0 = 0.6 + r * 0.02;
            o = o.concat(sat([[x0, y0], [0.98, y0 - 0.01], [0.98, y0 - 0.032], [x0 + 0.01, y0 - 0.026]], 0.05, r % 2 ? "#5f8f2c" : "#4f7f26"));
            for (var k = 0; k < 10; k++) { var x = x0 + 0.02 + k * ((0.95 - x0) / 10), y = y0 - 0.03; var col = r < 2 ? K.lime : K.yellow; o.push(S.straight(Pt(x, y), Pt(x - 0.006, y - 0.022), sw * 1.1, col), S.straight(Pt(x, y), Pt(x + 0.006, y - 0.022), sw * 1.1, col)); } }
          return o; })(),
        /* a woman with a basket on her back */
        person(0.42, 0.7, 1, K.pink, 1, sat([[0.445, 0.56], [0.49, 0.56], [0.485, 0.64], [0.45, 0.64]], 0.5, K.brown).concat([S.straight(Pt(0.425, 0.6), Pt(0.455, 0.565), sw * 1.2, K.brown)])),
        /* a man with a hoe */
        person(0.53, 0.72, 1, K.red, 0, [S.straight(Pt(0.565, 0.6), Pt(0.61, 0.74), sw * 1.5, K.brown), S.straight(Pt(0.61, 0.74), Pt(0.64, 0.73), sw * 2.6, K.grey)]),
        /* chickens: body, tail fan, comb, beak, two yellow legs */
        [[0.07, 0.69], [0.14, 0.725]].reduce(function (o, q, i) { o = o.concat(S.knots(X(q[0]), Y(q[1]), u * 0.04, u * 0.028, Math.max(1.4, u * 0.011), function () { return i ? "#b5651d" : K.white; }, 60 + i));
          o.push(S.knot(Pt(q[0] + 0.034, q[1] - 0.03), Math.max(1.6, u * 0.016), i ? "#b5651d" : K.white), S.knot(Pt(q[0] + 0.034, q[1] - 0.048), Math.max(1.4, u * 0.011), K.red), S.straight(Pt(q[0] + 0.044, q[1] - 0.03), Pt(q[0] + 0.06, q[1] - 0.024), sw * 1.4, K.yellow));
          [-0.05, -0.04, -0.03].forEach(function (d, k) { o.push(S.straight(Pt(q[0] - 0.03, q[1] - 0.01), Pt(q[0] + d - 0.02, q[1] - 0.06 + k * 0.012), sw * 1.5, i ? K.brown : K.grey)); });
          o.push(S.straight(Pt(q[0] - 0.005, q[1] + 0.026), Pt(q[0] - 0.005, q[1] + 0.05), sw * 1.2, K.yellow), S.straight(Pt(q[0] + 0.012, q[1] + 0.026), Pt(q[0] + 0.012, q[1] + 0.05), sw * 1.2, K.yellow)); return o; }, []),
        /* a pig: round body, head with ear and snout, four legs, a curled tail */
        (function () { var o = sat(S.curve([[0.19, 0.745], [0.215, 0.718], [0.26, 0.712], [0.30, 0.722], [0.318, 0.745], [0.30, 0.772], [0.25, 0.778], [0.21, 0.772]], true, 4), 0.3, "#2b2b2b");
          o = o.concat(sat([[0.30, 0.725], [0.335, 0.728], [0.343, 0.752], [0.30, 0.758]], 0.3, "#2b2b2b"), sat([[0.305, 0.722], [0.318, 0.70], [0.328, 0.726]], 0.3, "#1f1f1f"));
          [0.215, 0.235, 0.285, 0.302].forEach(function (x) { o.push(S.straight(Pt(x, 0.772), Pt(x, 0.805), sw * 1.9, "#1f1f1f")); });
          o.push(S.knot(Pt(0.345, 0.745), Math.max(1.6, u * 0.012), K.pink), S.knot(Pt(0.322, 0.737), Math.max(1.2, u * 0.006), K.white), S.straight(Pt(0.19, 0.735), Pt(0.172, 0.72), sw * 1.2, "#1f1f1f"), S.straight(Pt(0.172, 0.72), Pt(0.183, 0.704), sw * 1.2, "#1f1f1f")); return o; })(),
        /* New Year: two in festival dress, the ball between them */
        person(0.72, 0.78, 1, K.purple, 0, null, true).concat(person(0.86, 0.78, 1, K.pink, 2, null, true)),
        /* the river: rows of pale running stitch, a long boat, a rower in red */
        (function () { var o = []; for (var r = 0; r < 4; r++) { var pts = []; for (var k = 0; k <= 20; k++) pts.push(Pt(k / 20, 0.88 + r * 0.03 + Math.sin(k * 0.9 + r) * 0.008)); o = o.concat(S.running(pts, 6, 3, sw, r % 2 ? K.white : K.river)); }
          o = o.concat(sat([[0.36, 0.9], [0.56, 0.9], [0.52, 0.94], [0.4, 0.94]], 0, K.brown));
          o.push(S.knot(Pt(0.46, 0.86), Math.max(1.3, u * 0.012), K.skin)); o = o.concat(sat([[0.445, 0.87], [0.475, 0.87], [0.48, 0.9], [0.44, 0.9]], 0, K.red));
          o.push(S.straight(Pt(0.47, 0.88), Pt(0.53, 0.96), sw * 1.3, K.brown)); return o; })()
      ];
      /* the border and the blue field, sewn at once */
      done = S.layer(w, h, st.dpr); var c = done.ctx;
      S.cloth(c, [[0, 0], [w, 0], [w, h], [0, h]], "#141414", { pitch: 1.8, grain: 0.3, shadow: false });
      S.cloth(c, [[4, 4], [w - 4, 4], [w - 4, h - 4], [4, h - 4]], K.orange, { pitch: 1.8, grain: 0.35, shadow: false });
      c.fillStyle = "#f4f4f4"; c.fillRect(m - 2, m - 2, w - 2 * m + 4, h - 2 * m + 4);
      S.cloth(c, [[m, m], [w - m, m], [w - m, h - m], [m, h - m]], K.grey, { pitch: 1.6, grain: 0.35, shadow: false });
      var tri = function (a, b, cpt, col) { S.cloth(c, [a, b, cpt], col, { pitch: 1.6, grain: 0.35, shadow: false }); };
      var n = Math.max(6, Math.round((w - 2 * m) / (tooth * 1.1))), sx = (w - 2 * m) / n, ny = Math.max(4, Math.round((h - 2 * m) / (tooth * 1.1))), sy = (h - 2 * m) / ny;
      for (var i = 0; i < n; i++) { tri([m + i * sx, m], [m + (i + 1) * sx, m], [m + (i + 0.5) * sx, m + tooth], K.orange); tri([m + i * sx, h - m], [m + (i + 1) * sx, h - m], [m + (i + 0.5) * sx, h - m - tooth], K.orange); }
      for (var j = 0; j < ny; j++) { tri([m, m + j * sy], [m, m + (j + 1) * sy], [m + tooth, m + (j + 0.5) * sy], K.orange); tri([w - m, m + j * sy], [w - m, m + (j + 1) * sy], [w - m - tooth, m + (j + 0.5) * sy], K.orange); }
      c.fillStyle = "#f4f4f4"; c.fillRect(inset - 4, inset - 4, fld.w + 8, fld.h + 8);
      S.cloth(c, [[inset, inset], [w - inset, inset], [w - inset, h - inset], [inset, h - inset]], K.field, { pitch: 1.8, grain: 0.4, shadow: false });
      S.sew(c, S.running([[inset + 3, inset + 3], [w - inset - 3, inset + 3], [w - inset - 3, h - inset - 3], [inset + 3, h - inset - 3], [inset + 3, inset + 3]], 4, 3, 1, "#dfe6f2"));
      /* parts already stitched stay stitched across a resize */
      for (var p = 0; p < Math.min(cur, parts.length); p++) S.sew(c, parts[p]);
      if (cur >= 0 && cur < parts.length) S.sew(c, parts[cur].slice(0, idx));
    }
    function nextPart() { if (cur >= 0 && cur < parts.length && idx < parts[cur].length) { S.sew(done.ctx, parts[cur].slice(idx)); idx = parts[cur].length; } if (cur + 1 >= parts.length) { finished = true; words(); return; } cur++; idx = 0; prog = 0; wait = 0; words(); st.kick(); }
    function reset() { cur = -1; idx = 0; prog = 0; finished = false; done = null; st.dirty = true; words(); st.kick(); }

    var st = S.stage(cv, function (st, dt) {
      if (st.dirty || !done) { build(st); st.dirty = false; }
      var c = st.ctx;
      if (!finished && cur >= 0 && cur < parts.length) {
        var list = parts[cur], speed = S.reduced ? 1e9 : 55;
        prog += dt * speed;
        while (prog >= 1 && idx < list.length) { S.sew(done.ctx, [list[idx]]); idx++; prog -= 1; }
        if (idx >= list.length) { wait += dt; if (wait > 2.4 && cur < parts.length - 1) nextPart(); else if (wait > 2.4) { finished = true; words(); } }
      } else if (cur < 0) { wait += dt; if (wait > 1.2) nextPart(); }
      c.clearRect(0, 0, st.w, st.h); c.drawImage(done.canvas, 0, 0, st.w, st.h);
      /* the stitch in progress, the needle at its head, the working thread trailing */
      if (!finished && cur >= 0 && cur < parts.length && idx < parts[cur].length) {
        var s = parts[cur][idx], p = Math.min(1, prog); S.sew(c, [s], p); var hd = S.headOf(s, p);
        c.save(); c.strokeStyle = "#cfd6db"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hd[0], hd[1]); c.lineTo(hd[0] + 9, hd[1] - 13); c.stroke();
        c.strokeStyle = s.c; c.lineWidth = 1; c.beginPath(); c.moveTo(hd[0] + 8, hd[1] - 12); c.quadraticCurveTo(hd[0] + 26, hd[1] - 4 + Math.sin(st.t * 3) * 4, hd[0] + 34, hd[1] + 16); c.stroke(); c.restore();
      }
      /* once the ball toss is sewn, the ball flies between them */
      if (cur > 8 || finished) { var k = (Math.sin(st.t * 1.6) + 1) / 2, x = fld.x + fld.w * (0.765 + k * 0.05), y = fld.y + fld.h * (0.665 - Math.sin(k * Math.PI) * 0.045);
        c.save(); c.fillStyle = "#f0c93b"; c.beginPath(); c.arc(x, y, Math.max(2.5, fld.h * 0.014), 0, Math.PI * 2); c.fill(); c.strokeStyle = "#d43a2f"; c.lineWidth = 1; c.stroke(); c.restore(); }
    }, { resize: function () { fit(); } });
    bN.addEventListener("click", function () { if (finished) reset(); else nextPart(); });
    bA.addEventListener("click", reset);
    cv.addEventListener("pointerdown", function () { if (finished) reset(); else nextPart(); });
    fit(); words(); document.addEventListener("langchange", words);
    window.addEventListener("resize", function () { fit(); st.dirty = true; st.kick(); });
  };
})();
