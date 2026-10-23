/* pleats.js — a Hmong pleated skirt that twirls. Blue Hmong (Hmoob Ntsuab): a band of plain hemp, a band
   of indigo batik drawn in wax, a band of appliqué and cross stitch, a pale hem; White Hmong (Hmoob Dawb):
   plain white hemp, pleated tight. From Victoria Vorreiter, "Hmong Threads of Life" (Asian Textiles 65, 2016).
   The skirt is folds round a cone: each fold two facets, lit and shaded; the batik marks ride on the cloth,
   so they travel round as she turns. Drag sideways or press Twirl. */
(function () {
  "use strict";
  var S = window.STITCH, F = window.FEST, C = F.C;
  var T = {
    twirl: { en: "Twirl", th: "หมุน" },
    blue: { en: "Blue Hmong", th: "ม้งน้ำเงิน" }, white: { en: "White Hmong", th: "ม้งขาว" },
    sayBlue: { en: "Blue Hmong skirt: hemp drawn in hot wax and dyed in indigo, a band of appliqué and cross stitch, then pleated by hand. Up to a year of work.", th: "กระโปรงม้งน้ำเงิน: ใยกัญชงเขียนลายด้วยขี้ผึ้งร้อนแล้วย้อมคราม มีแถบผ้าปะและปักครอสติช แล้วจับจีบด้วยมือ ใช้เวลาทำได้ถึงหนึ่งปี" },
    sayWhite: { en: "White Hmong skirt: plain white hemp in tight pleats, held with running threads until the day it is worn.", th: "กระโปรงม้งขาว: ใยกัญชงสีขาวล้วน จับจีบถี่ เย็บเนาไว้จนถึงวันที่สวมใส่" },
    label: { en: "A Hmong woman's pleated skirt, twirling", th: "กระโปรงจีบของหญิงม้ง กำลังหมุน" }
  };
  var lang = function () { return document.documentElement.dataset.lang === "th" ? "th" : "en"; };

  window.TOYS.pleats = function (root) {
    var cv = document.createElement("canvas"), ctl = document.createElement("div"), say = document.createElement("p");
    ctl.className = "ctl"; say.className = "say"; say.setAttribute("aria-live", "polite"); cv.setAttribute("role", "img");
    root.appendChild(cv); root.appendChild(ctl); root.appendChild(say);
    var bT = document.createElement("button"), bB = document.createElement("button"), bW = document.createElement("button");
    [bT, bB, bW].forEach(function (b) { b.type = "button"; ctl.appendChild(b); });
    var kind = "blue", spin = { phi: 0, w: 0 }, body = null, weave = null;
    function words() { var l = lang(); bT.textContent = T.twirl[l]; bB.textContent = T.blue[l]; bW.textContent = T.white[l]; bB.setAttribute("aria-pressed", kind === "blue"); bW.setAttribute("aria-pressed", kind === "white"); say.textContent = kind === "blue" ? T.sayBlue[l] : T.sayWhite[l]; cv.setAttribute("aria-label", T.label[l]); }
    function fit() { var w = root.clientWidth - 20; cv.style.width = w + "px"; cv.style.height = Math.round(Math.min(window.innerHeight * 0.6, w * 1.15, 620)) + "px"; }

    var G = {};
    function geom(st) {
      var h = st.h, w = st.w, u = h / 8.7; G = { u: u, cx: w / 2, top: h * 0.03 };
      G.headY = G.top + u * 1.75; G.sh = G.headY + u * 0.6; G.waist = G.sh + u * 1.55; G.len = u * 2.5; G.rw = u * 0.62; G.rh0 = u * 1.05;
      G.foot = G.waist + u * 3.9;
    }
    function bakeBody(st) {
      var u = G.u, cx = G.cx, L = S.layer(st.w, st.h, st.dpr), c = L.ctx, P = function (x, y) { return [cx + x * u, y]; };
      /* legs in dark blue leggings, black shoes */
      [-1, 1].forEach(function (s) {
        S.cloth(c, [P(s * 0.22 - 0.16, G.waist + u * 1.6), P(s * 0.22 + 0.16, G.waist + u * 1.6), P(s * 0.24 + 0.13, G.foot - u * 0.15), P(s * 0.24 - 0.13, G.foot - u * 0.15)], "#1b2340", { pitch: 1.4, grain: 0.35 });
        S.applique(c, S.curve([P(s * 0.24 - 0.18, G.foot - u * 0.18), P(s * 0.24 + 0.18, G.foot - u * 0.18), P(s * 0.24 + 0.3, G.foot), P(s * 0.24 - 0.2, G.foot + u * 0.04)], true, 5), "#151515", "#444", { pitch: 1, grain: 0.3, inset: 1, dash: 2, gap: 1.5, tw: 0.6 });
      });
      /* jacket */
      var jk = S.curve([P(-0.95, G.sh + u * 0.05), P(-0.85, G.waist), P(0.85, G.waist), P(0.95, G.sh + u * 0.05), P(0.3, G.sh - u * 0.12), P(-0.3, G.sh - u * 0.12)], true, 6);
      S.applique(c, jk, kind === "blue" ? "#1b2748" : "#141414", "#3b4160", { pitch: 1.4, grain: 0.35, inset: 1.4, dash: 3, gap: 2, tw: 0.7 });
      var sts = [];
      [-1, 1].forEach(function (s) { var pts = []; for (var i = 0; i <= 6; i++) pts.push(P(s * (0.14 + (i % 2) * 0.16), G.sh - u * 0.05 + i * u * 0.24)); sts = sts.concat(S.split(pts, 4, Math.max(1, u * 0.06), C.red)); });
      S.sew(c, sts);
      /* arms out a little, as when she turns: banded cuffs */
      [-1, 1].forEach(function (s) { var a = P(s * 0.85, G.sh + u * 0.1), b = P(s * 1.45, G.waist - u * 0.1), dx = b[0] - a[0], dy = b[1] - a[1], Ls = Math.hypot(dx, dy), nx = -dy / Ls, ny = dx / Ls, hw = u * 0.22;
        S.cloth(c, [[a[0] + nx * hw, a[1] + ny * hw], [b[0] + nx * hw * 0.8, b[1] + ny * hw * 0.8], [b[0] - nx * hw * 0.8, b[1] - ny * hw * 0.8], [a[0] - nx * hw, a[1] - ny * hw]], kind === "blue" ? "#1b2748" : "#141414", { pitch: 1.3, grain: 0.35 });
        var cuff = []; [0.72, 0.8, 0.88].forEach(function (t, q) { var x = a[0] + dx * t, y = a[1] + dy * t; cuff.push(S.straight([x + nx * hw * 0.85, y + ny * hw * 0.85], [x - nx * hw * 0.85, y - ny * hw * 0.85], Math.max(1, u * 0.07), q === 1 ? "#f4f4f4" : C.blue)); }); S.sew(c, cuff);
        var hand = P(s * 1.52, G.waist + u * 0.02); S.cloth(c, [[hand[0] - u * 0.12, hand[1] - u * 0.12], [hand[0] + u * 0.12, hand[1] - u * 0.12], [hand[0] + u * 0.1, hand[1] + u * 0.16], [hand[0] - u * 0.1, hand[1] + u * 0.16]], C.skin, { pitch: 1, grain: 0.12, shadow: false }); });
      /* head and headdress */
      var Ph = function (x, y) { return [cx + x * u, G.headY + (y + 2.9) * u]; };
      S.cloth(c, [Ph(-0.15, -2.62), Ph(0.15, -2.62), Ph(0.17, -2.38), Ph(-0.17, -2.38)], C.skinLo, { pitch: 1, grain: 0.1, shadow: false });
      F.face(c, Ph, u);
      if (kind === "blue") {
        for (var ring = 0; ring < 7; ring++) { var y = -3.25 - ring * 0.2, half = 0.62 - ring * 0.045, x0 = -half + ring * 0.05;
          for (var k = 0; k < 10; k++) { var xa = x0 + (k * 2 * half) / 10, xb = xa + (2 * half) / 10; S.cloth(c, [Ph(xa, y), Ph(xb, y), Ph(xb + 0.03, y - 0.2), Ph(xa + 0.03, y - 0.2)], (k + ring) % 2 ? "#151515" : "#f4f4f4", { pitch: 1, grain: 0.25, shadow: ring === 0 }); } }
        var hs = []; for (var b = 0; b < 12; b++) hs.push(S.knot(Ph(-0.6 + b * 0.11, -3.22), Math.max(0.6, u * 0.05), [C.red, C.yellow, C.green, C.white][b % 4])); S.sew(c, hs);
      } else {
        var tb = S.curve([Ph(-0.66, -3.15), Ph(-0.7, -3.6), Ph(-0.4, -3.9), Ph(0, -3.95), Ph(0.4, -3.9), Ph(0.7, -3.6), Ph(0.66, -3.15), Ph(0, -3.25)], true, 6);
        S.applique(c, tb, "#161616", "#3a3a3a", { pitch: 1, grain: 0.3, inset: 1, dash: 2, gap: 1.5, tw: 0.6 });
        var ws = []; [[-0.3, -3.55, C.red], [0, -3.62, C.yellow], [0.3, -3.55, C.pink]].forEach(function (p, z) { ws = ws.concat(S.pompom(Ph(p[0], p[1])[0], Ph(p[0], p[1])[1], Math.max(1.2, u * 0.16), p[2], 80 + z)); });
        for (var cn = 0; cn < 9; cn++) ws = ws.concat(S.coin(Ph(-0.5 + cn * 0.125, -3.2)[0], Ph(0, -3.2)[1], Math.max(0.8, u * 0.06)));
        S.sew(c, ws);
      }
      body = L;
    }

    /* the skirt, drawn each frame: folds round a cone */
    function skirt(c, st) {
      var u = G.u, cx = G.cx, phi = spin.phi + (S.reduced ? 0 : 0.22 * Math.sin(st.t * 0.9)), flare = Math.min(1, Math.abs(spin.w) / 7);
      var white = kind === "white", N = white ? 160 : 112, rw = G.rw, rh = G.rh0 + flare * u * 1.7;
      var drop = Math.sqrt(Math.max(u * u * 0.4, G.len * G.len - (rh - rw) * (rh - rw)));
      var tilt = 0.24, yW = G.waist, yH = yW + drop;
      var BANDS = white ? [[0, 1, "#ebe2cc"]] : [[0, 0.22, "#d9cba9"], [0.22, 0.7, "#1b2748"], [0.7, 0.97, "#e0568a"], [0.97, 1, "#ece2c6"]];
      var fac = [];
      for (var j = 0; j < N; j++) {
        var a0 = phi + (j * Math.PI * 2) / N, a1 = phi + ((j + 1) * Math.PI * 2) / N, am = (a0 + a1) / 2;
        if (Math.cos(am) < -0.15) continue;
        fac.push({ j: j, a0: a0, a1: a1, z: Math.cos(am) });
      }
      fac.sort(function (p, q) { return p.z - q.z; });
      var pt = function (a, s, out) { var r = rw + (rh - rw) * s, k = out ? 1 : 0.9; return [cx + Math.sin(a) * r * k, yW + drop * s + Math.cos(a) * r * tilt * (s * 0.9 + 0.1)]; };
      fac.forEach(function (f) {
        var outer0 = f.j % 2 === 0, lit = outer0 ? 1 : 0.78, side = 0.55 + 0.45 * Math.max(0, f.z), k = lit * side;
        BANDS.forEach(function (b) {
          var p0 = pt(f.a0, b[0], outer0), p1 = pt(f.a1, b[0], !outer0), p2 = pt(f.a1, b[1], !outer0), p3 = pt(f.a0, b[1], outer0);
          c.fillStyle = S.mix(b[2], "#0b0a12", 1 - k); c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.lineTo(p3[0], p3[1]); c.closePath(); c.fill();
        });
        if (white) { if (outer0) { var q0 = pt(f.a0, 0.05, true), q1 = pt(f.a0, 0.98, true); c.strokeStyle = "rgba(255,255,255," + (0.25 * f.z) + ")"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(q0[0], q0[1]); c.lineTo(q1[0], q1[1]); c.stroke(); } return; }
        /* batik marks travel with the cloth: crosses, zigzags and squares, short straight strokes */
        if (outer0) {
          var pleat = f.j / 2, mark = pleat % 3, lw = Math.max(0.8, u * 0.035);
          c.strokeStyle = S.mix("#e7ecf5", "#0b0a12", 1 - side); c.lineWidth = lw;
          [0.32, 0.46, 0.6].forEach(function (s, q) {
            var m = pt((f.a0 + f.a1) / 2, s, true), d = u * 0.07; c.beginPath();
            if ((mark + q) % 3 === 0) { c.moveTo(m[0] - d, m[1]); c.lineTo(m[0] + d, m[1]); c.moveTo(m[0], m[1] - d); c.lineTo(m[0], m[1] + d); }
            else if ((mark + q) % 3 === 1) { c.moveTo(m[0] - d, m[1] - d * 0.6); c.lineTo(m[0], m[1] + d * 0.6); c.lineTo(m[0] + d, m[1] - d * 0.6); }
            else { c.rect(m[0] - d * 0.6, m[1] - d * 0.6, d * 1.2, d * 1.2); }
            c.stroke();
          });
          /* the thin red appliqué zigzag under the batik, cream diamonds and coloured squares in the bottom band */
          var z0 = pt(f.a0, 0.685, true), z1 = pt(f.a1, 0.71, false); c.strokeStyle = S.mix("#c23b2e", "#0b0a12", 1 - side); c.lineWidth = Math.max(1, u * 0.05); c.beginPath(); c.moveTo(z0[0], z0[1]); c.lineTo(z1[0], z1[1]); c.stroke();
          var dm = pt((f.a0 + f.a1) / 2, 0.84, true), dd = u * 0.07; c.fillStyle = S.mix(["#f1e6c8", "#2b59c3", "#e8b93a", "#3e8e5b"][pleat % 4], "#0b0a12", 1 - side);
          c.beginPath(); c.moveTo(dm[0], dm[1] - dd); c.lineTo(dm[0] + dd * 0.7, dm[1]); c.lineTo(dm[0], dm[1] + dd); c.lineTo(dm[0] - dd * 0.7, dm[1]); c.closePath(); c.fill();
        }
      });
      /* the apron in front, lifting a little as she turns; red sash tails swing out behind */
      var sw = Math.max(-1, Math.min(1, spin.w / 6));
      if (!white || true) {
        c.save(); c.translate(cx, yW); c.rotate(-sw * 0.35);
        var ap = [[-u * 0.42, 0], [u * 0.42, 0], [u * 0.5 + sw * u * 0.2, drop * 0.98], [-u * 0.5 + sw * u * 0.2, drop * 0.98]];
        S.cloth(c, ap, "#0a0a0c", { pitch: 1.3, grain: 0.15 });
        var ax = []; for (var q = 0; q < 6; q++) ax = ax.concat(S.cross(-u * 0.38 + q * u * 0.13, drop * 0.66, u * 0.1, Math.max(0.6, u * 0.03), [C.red, C.yellow, C.green][q % 3])); S.sew(c, ax);
        c.fillStyle = white ? "#d24b7a" : "#c23b2e"; c.fillRect(-u * 0.4, drop * 0.78, u * 0.8 + sw * u * 0.1, u * 0.08);
        c.restore();
      }
      [-1, 1].forEach(function (s) {
        var base = [cx + s * rw * 0.9, yW + u * 0.05], out = s * (0.4 + Math.abs(sw) * 1.2) * u, tip = [base[0] + out + sw * u * 0.8, yW + drop * (0.9 - Math.abs(sw) * 0.35)];
        c.strokeStyle = white ? "#e8577f" : "#c8352e"; c.lineWidth = Math.max(2, u * 0.13); c.lineCap = "round";
        c.beginPath(); c.moveTo(base[0], base[1]); c.quadraticCurveTo(base[0] + out * 0.4, (base[1] + tip[1]) / 2, tip[0], tip[1]); c.stroke();
      });
      /* the waistband */
      c.fillStyle = white ? "#1a1a1a" : "#2b2b48"; c.fillRect(cx - rw * 1.05, yW - u * 0.08, rw * 2.1, u * 0.16);
    }

    var lay = null;
    var st = S.stage(cv, function (st, dt) {
      if (st.dirty || !body) { geom(st); bakeBody(st); lay = S.layer(st.w, st.h, st.dpr); weave = lay.ctx.createPattern(S.weave(2.2, 11), "repeat"); st.dirty = false; }
      spin.w *= 1 - Math.min(0.9, dt * 0.55); spin.phi += spin.w * dt;
      var c = st.ctx; c.clearRect(0, 0, st.w, st.h);
      /* a floor of woven mat under her */
      c.fillStyle = "rgba(120,90,50,.18)"; c.beginPath(); c.ellipse(G.cx, G.foot + G.u * 0.05, G.u * 2.2, G.u * 0.28, 0, 0, Math.PI * 2); c.fill();
      var L = lay.ctx; L.setTransform(1, 0, 0, 1, 0, 0); L.clearRect(0, 0, lay.canvas.width, lay.canvas.height); L.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
      skirt(L, st);
      L.save(); L.setTransform(1, 0, 0, 1, 0, 0); L.globalCompositeOperation = "source-atop"; L.globalAlpha = 0.28; L.fillStyle = weave; L.fillRect(0, 0, lay.canvas.width, lay.canvas.height); L.restore();
      c.drawImage(body.canvas, 0, 0, st.w, st.h);
      c.drawImage(lay.canvas, 0, 0, st.w, st.h);
    }, { resize: function () { fit(); } });

    function twirl(dir) { spin.w = Math.max(-9, Math.min(9, spin.w + 4.5 * (dir || 1))); S.jingle(3, 9); st.kick(); }
    bT.addEventListener("click", function () { twirl(1); });
    bB.addEventListener("click", function () { kind = "blue"; body = null; st.dirty = true; words(); twirl(1); });
    bW.addEventListener("click", function () { kind = "white"; body = null; st.dirty = true; words(); twirl(1); });
    var drag = null;
    cv.addEventListener("pointerdown", function (e) { drag = { x: e.clientX, t: performance.now() }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; var now = performance.now(), dx = e.clientX - drag.x, dtm = Math.max(8, now - drag.t); spin.w = Math.max(-9, Math.min(9, spin.w + (dx / dtm) * 1.6)); drag = { x: e.clientX, t: now, moved: true }; st.kick(); });
    cv.addEventListener("pointerup", function () { if (drag && !drag.moved) twirl(1); drag = null; });
    fit(); words(); document.addEventListener("langchange", words);
    window.addEventListener("resize", function () { fit(); st.dirty = true; st.kick(); });
  };
})();
