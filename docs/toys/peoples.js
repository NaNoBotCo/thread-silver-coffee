/* peoples.js — six portraits, each a quilt square: Akha, Hmong, Iu Mien, Lahu, Lisu, Pgaz K'Nyau (Karen).
   Women's festival dress, from Vorreiter's "Hmong Threads of Life" (2016) and museum records (ACM Singapore).
   Tap a portrait or its name: the silver rings and the square says what that people is known for. */
(function () {
  "use strict";
  var S = window.STITCH, F = window.FEST;
  var C = F.C, BANDS = F.BANDS;
  var W = function (u, k) { return Math.max(0.45, u * k); };

  var PEOPLE = [
    { id: "akha", bg: "#f6c445", en: "Akha", th: "อาข่า",
      say: { en: "Akha: silver and appliqué. Each subgroup has its own headdress: Ulo a tall cone, Loimi a studded dome with a silver plate behind, Pawmee broad with side flaps of coins.", th: "อาข่า: เครื่องเงินและผ้าปะ แต่ละสายมีหมวกของตัวเอง Ulo เป็นกรวยสูง Loimi เป็นโดมปุ่มเงินมีแผ่นเงินด้านหลัง Pawmee กว้าง มีปีกข้างประดับเหรียญ" } },
    { id: "hmong", bg: "#3fa7d6", en: "Hmong", th: "ม้ง",
      say: { en: "Hmong: batik drawn in wax and dyed in indigo, pleated hemp skirts, reverse appliqué. A Blue Hmong festival headdress winds checkered strips in rings to a peak.", th: "ม้ง: ผ้าเขียนเทียนย้อมคราม กระโปรงใยกัญชงจับจีบ และผ้าปะกลับ หมวกงานเทศกาลของม้งน้ำเงินพันผ้าลายตารางเป็นวงซ้อนขึ้นเป็นยอด" } },
    { id: "mien", bg: "#f2a2b8", en: "Iu Mien", th: "อิ้วเมี่ยน",
      say: { en: "Iu Mien: cross stitch worked from the back of the cloth, dense enough to read on both sides. A red ruff at the neck, a black turban.", th: "อิ้วเมี่ยน: ปักครอสติชจากด้านหลังผ้า แน่นจนอ่านลายได้ทั้งสองด้าน มีขนสีแดงรอบคอ และผ้าโพกหัวสีดำ" } },
    { id: "lahu", bg: "#8fd18b", en: "Lahu", th: "ลาหู่",
      say: { en: "Lahu: bands of appliqué and silver, arches of silver beads on the jacket, striped cuffs. Subgroups go by colour names — Lahu Na, Nyi, Shi — that the dress does not always match.", th: "ลาหู่: แถบผ้าปะและเครื่องเงิน ลูกปัดเงินเป็นซุ้มบนเสื้อ ปลายแขนเป็นลายทาง สายต่าง ๆ มีชื่อตามสี เช่น ลาหู่ดำ ลาหู่แดง ลาหู่เหลือง ซึ่งไม่ตรงกับสีชุดเสมอไป" } },
    { id: "lisu", bg: "#f28c28", en: "Lisu", th: "ลีซู",
      say: { en: "Lisu: strips of appliqué in many colours, and tassels — yarn on the turban's rim, streamers of a hundred or more strands at the back.", th: "ลีซู: แถบผ้าปะหลากสี และพู่ ไหมพรมรอบขอบผ้าโพก และพู่ห้อยด้านหลังนับร้อยเส้น" } },
    { id: "karen", bg: "#b9a4e0", en: "Pgaz K'Nyau (Karen)", th: "ปกาเกอะญอ",
      say: { en: "Pgaz K'Nyau (Karen): weaving on the backstrap loom. Unmarried women wear white; a married woman's dark blouse is sewn with Job's tears seeds.", th: "ปกาเกอะญอ: ทอผ้าด้วยกี่เอว หญิงที่ยังไม่แต่งงานใส่ชุดขาว หญิงแต่งงานแล้วใส่เสื้อสีเข้มปักลูกเดือย" } }
  ];

  /* the bust: shoulders and jacket under a face, then each people's own dress */
  function jacket(c, P, u, col, edge) {
    var j = S.curve([P(-1.15, -0.2), P(-1.12, -1.6), P(-0.9, -2.3), P(-0.3, -2.48), P(0.3, -2.48), P(0.9, -2.3), P(1.12, -1.6), P(1.15, -0.2)], false, 6).concat([P(1.2, 0.4), P(-1.2, 0.4)]);
    S.applique(c, j, col, edge || "#3b4160", { pitch: Math.max(1, u * 0.07), grain: 0.35, inset: W(u, 0.05), dash: W(u, 0.12), gap: W(u, 0.09), tw: W(u, 0.03) });
  }
  function neck(c, P, u) { S.cloth(c, [P(-0.15, -2.62), P(0.15, -2.62), P(0.17, -2.38), P(-0.17, -2.38)], C.skinLo, { pitch: 1, grain: 0.1, shadow: false }); }
  function bandsAcross(c, P, u, y0, n, step, cols, x0, x1) { var sts = []; for (var i = 0; i < n; i++) sts.push(S.straight(P(x0, y0 + i * step), P(x1, y0 + i * step), W(u, step * 0.9), cols[i % cols.length])); S.sew(c, sts); }

  var DRAW = {
    akha: function (c, P, u) {
      jacket(c, P, u, C.black);
      var sts = [];
      for (var row = 0; row < 3; row++) for (var q = 0; q < 6 - row; q++) sts = sts.concat(S.coin(P(-0.45 + row * 0.09 + q * 0.18, 0)[0], P(0, -1.9 + row * 0.26)[1], W(u, 0.075)));
      for (var st = 0; st < 3; st++) for (var b = 0; b < 11; b++) { var t = b / 10; sts.push(S.knot(P(-0.55 + t * 1.1, -2.3 + 0.6 * Math.sin(t * Math.PI) * (0.6 + st * 0.25)), W(u, 0.045), [C.red, C.white, C.yellow][st])); }
      S.sew(c, sts);
      F.sleeve(c, P(-1.0, -2.1), P(-1.2, -0.3), u, 2); F.sleeve(c, P(1.0, -2.1), P(1.2, -0.3), u, 5);
      neck(c, P, u); F.face(c, P, u); F.HATS.ulo(c, P, u, 7);
    },
    hmong: function (c, P, u) {
      jacket(c, P, u, "#1b2748");
      /* the lapel with its zigzag points, edged in red; blue bands at the cuffs */
      var sts = [];
      [-1, 1].forEach(function (s) { var pts = []; for (var i = 0; i <= 6; i++) pts.push(P(s * (0.18 + (i % 2) * 0.16), -2.4 + i * 0.3)); sts = sts.concat(S.split(pts, 3, W(u, 0.06), C.red)); });
      bandsAcross(c, P, u, -0.35, 3, 0.09, [C.blue, C.white, C.blue], -1.15, 1.15);
      S.sew(c, sts);
      neck(c, P, u); F.face(c, P, u);
      /* checkered strips wound in rings to a peak, a strand of beads round the base (Vorreiter 2016, p.21) */
      var hs = [];
      for (var ring = 0; ring < 7; ring++) { var y = -3.25 - ring * 0.2, half = 0.62 - ring * 0.085, half2 = half - 0.085;
        for (var k = 0; k < 10; k++) { var xa = -half + (k * 2 * half) / 10, xb = xa + (2 * half) / 10, xa2 = -half2 + (k * 2 * half2) / 10, xb2 = xa2 + (2 * half2) / 10; var poly = [P(xa, y), P(xb, y), P(xb2, y - 0.2), P(xa2, y - 0.2)];
          S.cloth(c, poly, (k + ring) % 2 ? "#151515" : "#f4f4f4", { pitch: 1, grain: 0.25, shadow: ring === 0 }); } }
      /* the peak crossing at the front */
      S.cloth(c, [P(-0.1, -4.65), P(0.1, -4.65), P(0, -4.95)], "#151515", { pitch: 1, grain: 0.25 });
      for (var b2 = 0; b2 < 12; b2++) hs.push(S.knot(P(-0.6 + b2 * 0.11, -3.22), W(u, 0.05), [C.red, C.yellow, C.green, C.white][b2 % 4]));
      S.sew(c, hs);
    },
    mien: function (c, P, u) {
      jacket(c, P, u, "#141414");
      /* a cross-stitched strip under the collar */
      var sts = [];
      for (var rw = 0; rw < 2; rw++) for (var i = 0; i < 7; i++) sts = sts.concat(S.cross(P(-0.6 + i * 0.2, 0)[0], P(0, -0.95 + rw * 0.22)[1], u * 0.15, W(u, 0.05), ["#1f8a8a", C.green, C.blue, C.red][(i + rw) % 4]));
      S.sew(c, sts);
      neck(c, P, u); F.face(c, P, u);
      /* the red ruff: wool, round the neck and down the front like a stole */
      var ruff = [];
      [-1, 1].forEach(function (s) { ruff = ruff.concat(S.knots(P(s * 0.42, -1.8)[0], P(0, -1.8)[1], u * 0.22, u * 0.7, W(u, 0.07), function () { return "#c8201f"; }, 30 + s)); });
      ruff = ruff.concat(S.knots(P(0, -2.38)[0], P(0, -2.38)[1], u * 0.62, u * 0.16, W(u, 0.07), function (x) { return Math.abs(x) > 0.8 ? "#a81816" : "#c8201f"; }, 33));
      S.sew(c, ruff);
      /* a black turban wound wide, silver strings across it */
      var tb = S.curve([P(-0.7, -3.15), P(-0.78, -3.6), P(-0.5, -3.95), P(0, -4.05), P(0.5, -3.95), P(0.78, -3.6), P(0.7, -3.15), P(0, -3.25)], true, 6);
      S.applique(c, tb, "#141414", "#3a3a3a", { pitch: 1, grain: 0.3, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.03) });
      var ts = []; for (var w = 0; w < 4; w++) ts = ts.concat(S.stem([P(-0.7, -3.3 - w * 0.17), P(0.7, -3.36 - w * 0.17)], W(u, 0.2), W(u, 0.05), "#2c2c2c", 40 + w));
      for (var s2 = 0; s2 < 2; s2++) for (var b = 0; b < 12; b++) ts.push(S.knot(P(-0.66 + b * 0.12, -3.45 - s2 * 0.3), W(u, 0.035), C.silver));
      S.sew(c, ts);
    },
    lahu: function (c, P, u) {
      jacket(c, P, u, "#121212");
      /* two tall arches of silver beads on the chest, square fasteners, striped cuffs */
      var sts = [];
      [0.66, 0.5, 0.34].forEach(function (R) { for (var b = 0; b <= 14; b++) { var th = (Math.PI * b) / 14; sts.push(S.knot(P(-R * Math.cos(th), -0.85 - R * 1.9 * Math.sin(th)), W(u, 0.06), C.silver)); } });
      for (var f = 0; f < 5; f++) { var y2 = -2.1 + f * 0.3; sts = sts.concat(S.satin([P(-0.07, y2), P(0.07, y2)], function () { return u * 0.07; }, W(u, 0.03), W(u, 0.03), function () { return C.silver; })); }
      bandsAcross(c, P, u, -0.38, 4, 0.08, [C.red, "#141414", C.yellow, C.white], -1.15, 1.15);
      S.sew(c, sts);
      neck(c, P, u); F.face(c, P, u);
      var tb = S.curve([P(-0.62, -3.15), P(-0.66, -3.55), P(-0.4, -3.85), P(0.1, -3.9), P(0.55, -3.7), P(0.66, -3.35), P(0.62, -3.12), P(0, -3.22)], true, 6);
      S.applique(c, tb, "#111", "#333", { pitch: 1, grain: 0.3, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.03) });
      var ts = []; for (var w = 0; w < 4; w++) ts = ts.concat(S.stem([P(-0.62, -3.25 - w * 0.15), P(0.6, -3.35 - w * 0.12)], W(u, 0.2), W(u, 0.05), "#2a2a2a", 50 + w));
      ts.push(S.knot(P(0.5, -3.7), W(u, 0.09), C.silver));
      S.sew(c, ts);
    },
    lisu: function (c, P, u) {
      jacket(c, P, u, "#1f8f6a", "#0f5a41");
      /* appliqué strips across the shoulders in many colours; a black sash */
      bandsAcross(c, P, u, -2.25, 8, 0.075, [C.red, C.yellow, "#151515", C.blue, C.pink, C.white, C.green, C.orange], -1.0, 1.0);
      bandsAcross(c, P, u, -0.5, 3, 0.12, ["#141414"], -1.15, 1.15);
      neck(c, P, u); F.face(c, P, u);
      /* the turban: a broad low black coil, yarn strands hanging from its rim, pompoms */
      var tb = S.curve([P(-0.95, -3.2), P(-0.98, -3.55), P(-0.6, -3.8), P(0, -3.85), P(0.6, -3.8), P(0.98, -3.55), P(0.95, -3.2), P(0, -3.3)], true, 6);
      S.applique(c, tb, "#141414", "#3a3a3a", { pitch: 1, grain: 0.3, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.03) });
      var ts = [], cols = [C.red, "#e83e8c", "#f2e27a", "#9cc7da", C.green];
      for (var k = 0; k < 15; k++) { var x = -0.92 + k * 0.13, side = Math.abs(x) > 0.46, len = 0.45 + (k % 3) * 0.14; if (!side) continue; ts.push(S.straight(P(x, -3.25), P(x * (side ? 1.06 : 1), -3.25 + len), W(u, 0.045), cols[k % 5])); }
      [[-0.75, -3.75, C.yellow], [-0.35, -3.88, "#e83e8c"], [0.1, -3.92, C.green], [0.5, -3.86, C.yellow], [0.85, -3.7, "#e83e8c"]].forEach(function (p, z) { ts = ts.concat(S.pompom(P(p[0], p[1])[0], P(p[0], p[1])[1], Math.max(1, u * 0.13), p[2], 60 + z)); });
      for (var b = 0; b < 14; b++) ts.push(S.knot(P(-0.88 + b * 0.135, -3.5), W(u, 0.04), C.white));
      S.sew(c, ts);
    },
    karen: function (c, P, u) {
      jacket(c, P, u, "#1c2a1f", "#0e1a12");
      /* rows of Job's tears seeds on the lower half; a maroon and yellow band */
      bandsAcross(c, P, u, -1.1, 5, 0.1, ["#7a2a35", "#e8b93a", "#7a2a35", "#7a2a35", "#e8b93a"], -1.12, 1.12);
      var sts = []; for (var r = 0; r < 3; r++) for (var k = 0; k < 14; k++) sts.push(S.knot(P(-1.0 + k * 0.155 + (r % 2) * 0.07, -0.55 + r * 0.16), W(u, 0.055), "#d9d4c8"));
      S.sew(c, sts);
      neck(c, P, u); F.face(c, P, u);
      /* a married woman's red head cloth with blue, green and yellow detail, white fringe, red tassels */
      var hc = S.curve([P(-0.72, -3.12), P(-0.76, -3.55), P(-0.5, -3.82), P(0, -3.9), P(0.5, -3.82), P(0.76, -3.55), P(0.72, -3.12), P(0, -3.2)], true, 6);
      var tail = [P(0.62, -3.3), P(0.82, -3.35), P(0.9, -2.55), P(0.68, -2.6)];
      S.applique(c, tail, "#c8202a", "#8e1219", { pitch: 1, grain: 0.3, inset: W(u, 0.03), dash: W(u, 0.08), gap: W(u, 0.07), tw: W(u, 0.03) });
      S.applique(c, hc, "#c8202a", "#8e1219", { pitch: 1, grain: 0.3, inset: W(u, 0.04), dash: W(u, 0.1), gap: W(u, 0.08), tw: W(u, 0.03) });
      var hs = []; [["#2b59c3", -3.5], ["#2f9e5b", -3.62], ["#f6c445", -3.74]].forEach(function (b) { hs.push(S.straight(P(-0.6, b[1]), P(0.6, b[1] - 0.05), W(u, 0.06), b[0])); });
      for (var f = 0; f < 10; f++) hs.push(S.straight(P(-0.62 + f * 0.13, -3.2), P(-0.62 + f * 0.13, -3.13), W(u, 0.04), "#f4f1ea"));
      for (var tl = 0; tl < 5; tl++) hs.push(S.straight(P(0.7 + tl * 0.045, -2.58), P(0.7 + tl * 0.05, -2.32), W(u, 0.045), tl % 2 ? "#f4f1ea" : "#e0303a"));
      S.sew(c, hs);
    }
  };

  window.TOYS.peoples = function (root) {
    var lang = function () { return document.documentElement.dataset.lang === "th" ? "th" : "en"; };
    var cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true");
    var ctl = document.createElement("div"); ctl.className = "ctl";
    var say = document.createElement("p"); say.className = "say"; say.setAttribute("aria-live", "polite");
    root.appendChild(cv); root.appendChild(ctl); root.appendChild(say);
    var btns = PEOPLE.map(function (p, i) { var b = document.createElement("button"); b.type = "button"; b.addEventListener("click", function () { pick(i); }); ctl.appendChild(b); return b; });
    function words() { var l = lang(); btns.forEach(function (b, i) { b.textContent = PEOPLE[i][l]; }); say.textContent = sel >= 0 ? PEOPLE[sel].say[l] : (l === "th" ? "แตะที่ภาพหรือชื่อ" : "Tap a portrait or a name."); }
    var sprites = [], cols = 3, rows = 2, cell = 0, sel = -1, wob = PEOPLE.map(function () { return { a: 0, v: 0 }; });
    function size() { var w = root.clientWidth - 20; var port = w < 620; cols = port ? 2 : 3; rows = port ? 3 : 2; var maxH = Math.min(window.innerHeight * 0.62, 640); cell = Math.min(w / cols, maxH / rows); cv.style.width = Math.round(cell * cols) + "px"; cv.style.height = Math.round(cell * rows) + "px"; cv.style.margin = "0 auto"; }
    function bake(st) {
      sprites = PEOPLE.map(function (p, i) {
        var L = S.layer(cell, cell, st.dpr), c = L.ctx, r = S.rng(90 + i);
        var pad = 4, sq = [[pad, pad], [cell - pad, pad], [cell - pad, cell - pad], [pad, cell - pad]];
        S.applique(c, sq, p.bg, S.mix(p.bg, "#000", 0.35), { pitch: 2, grain: 0.4, inset: 6, dash: 4, gap: 3, tw: 1 });
        var u = cell * 0.175, top = { akha: 0.5, hmong: 0.43, mien: 0.34, lahu: 0.34, lisu: 0.34, karen: 0.35 }[p.id], P = function (x, y) { return [cell / 2 + x * u, cell * top + (y + 3.32) * u]; };
        c.save(); c.beginPath(); c.rect(pad + 2, pad + 2, cell - 2 * pad - 4, cell - 2 * pad - 4); c.clip();
        DRAW[p.id](c, P, u);
        c.restore();
        /* silver spots for the glints */
        var SP = { akha: [[-0.3, -1.9], [0.2, -1.66], [0, -2.0], [-0.1, -1.66]], hmong: [[-0.4, -3.22], [0.3, -3.22], [0, -3.22], [-0.15, -3.22]], mien: [[-0.4, -3.45], [0.3, -3.75], [0.1, -3.45], [-0.2, -3.75]], lahu: [[-0.5, -1.4], [0.34, -1.3], [0, -1.5], [-0.34, -1.3]], lisu: [[-0.6, -3.5], [0.5, -3.5], [0, -3.5], [-0.2, -3.5]], karen: [] }[p.id];
        var spots = SP.map(function (q) { return P(q[0], q[1]); });
        return { L: L, spots: spots };
      });
    }
    var st = S.stage(cv, function (st, dt) {
      if (st.dirty || !sprites.length) { bake(st); st.dirty = false; }
      var c = st.ctx; c.clearRect(0, 0, st.w, st.h);
      PEOPLE.forEach(function (p, i) {
        var w = wob[i]; w.v += (-60 * w.a - 6 * w.v) * dt; w.a += w.v * dt;
        var x = (i % cols) * cell, y = Math.floor(i / cols) * cell, br = 1 + 0.006 * Math.sin(st.t * 1.4 + i);
        c.save(); c.translate(x + cell / 2, y + cell * 0.95); c.rotate(w.a * 0.06); c.scale(br + Math.abs(w.a) * 0.03, br + Math.abs(w.a) * 0.03);
        c.drawImage(sprites[i].L.canvas, -cell / 2, -cell * 0.95, cell, cell); c.restore();
        if (i === sel) { c.save(); c.strokeStyle = "#1d1a16"; c.lineWidth = 3; c.setLineDash([6, 4]); c.strokeRect(x + 3, y + 3, cell - 6, cell - 6); c.restore(); }
        /* a glint moves over the silver, one square at a time */
        var ph = (st.t * 0.8 + i * 0.37) % 1, spl = sprites[i].spots, sp = spl.length ? spl[Math.floor(st.t * 0.8 + i) % spl.length] : null;
        if (sp && !S.reduced && ph < 0.35) { var g = Math.sin((ph / 0.35) * Math.PI), gx = x + sp[0], gy = y + sp[1]; c.save(); c.globalAlpha = g; c.strokeStyle = "#fff"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(gx - 5 * g, gy); c.lineTo(gx + 5 * g, gy); c.moveTo(gx, gy - 5 * g); c.lineTo(gx, gy + 5 * g); c.stroke(); c.restore(); }
      });
    }, { resize: function () { size(); } });
    function pick(i) { sel = i; wob[i].v += 9; S.jingle(5, i + 2); btns.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); }); words(); st.kick(); }
    cv.addEventListener("pointerdown", function (e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top, i = Math.floor(y / cell) * cols + Math.floor(x / cell); if (i >= 0 && i < PEOPLE.length) pick(i); });
    size(); words();
    window.addEventListener("resize", function () { size(); st.dirty = true; st.kick(); });
    document.addEventListener("langchange", words);
  };
})();
