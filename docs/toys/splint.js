/* splint.js — a silver ring splint on a finger, side view, palm down.
   Pressing the fingertip on the table: without a splint a lax middle joint (PIP) bends backward and the
   tip drops (the swan-neck shape); with the splint its two silver rings, joined under the middle joint,
   stop the backward bend and the finger still curls (Silver Ring Splint Co.: swan-neck model blocks
   hyperextension, leaves full bending). Drag down to press, up to curl. */
(function () {
  "use strict";
  var S = window.STITCH;
  var lang = function () { return document.documentElement.dataset.lang === "th" ? "th" : "en"; };
  var T = {
    press: { en: "Press on the table", th: "กดลงบนโต๊ะ" }, curl: { en: "Curl", th: "งอนิ้ว" },
    on: { en: "Splint on", th: "ใส่แหวนดาม" }, off: { en: "Splint off", th: "ถอดแหวนดาม" },
    sayOff: { en: "No splint: pressing on the table bends the middle joint backward and drops the tip. That is the swan-neck shape.", th: "ไม่ใส่แหวนดาม: เมื่อกดลงบนโต๊ะ ข้อนิ้วกลางแอ่นไปด้านหลังและปลายนิ้วงุ้มลง เรียกว่านิ้วรูปคอหงส์" },
    sayOn: { en: "Ring splint on: two silver rings meet under the middle joint and stop it bending backward. The finger still curls.", th: "ใส่แหวนดาม: แหวนเงินสองวงต่อกันใต้ข้อนิ้วกลาง กันไม่ให้ข้อแอ่นไปด้านหลัง แต่ยังงอนิ้วได้ตามปกติ" },
    label: { en: "A finger pressing on a table, with and without a silver ring splint", th: "นิ้วกดลงบนโต๊ะ เมื่อใส่และไม่ใส่แหวนเงินดามนิ้ว" }
  };
  var SKIN = "#c98e63", SKIN2 = "#a8714b", NAIL = "#e9c0b4";

  window.TOYS.splint = function (root) {
    var cv = document.createElement("canvas"), ctl = document.createElement("div"), say = document.createElement("p");
    ctl.className = "ctl"; say.className = "say"; say.setAttribute("aria-live", "polite"); cv.setAttribute("role", "img");
    root.appendChild(cv); root.appendChild(ctl); root.appendChild(say);
    var bP = document.createElement("button"), bC = document.createElement("button"), bS = document.createElement("button");
    [bS, bP, bC].forEach(function (b) { b.type = "button"; ctl.appendChild(b); });
    var on = false, load = 0, target = 0, hold = 0, ang = { m: 0, p: 0, d: 0 }, bg = null;
    function words() { var l = lang(); bP.textContent = T.press[l]; bC.textContent = T.curl[l]; bS.textContent = on ? T.off[l] : T.on[l]; bS.setAttribute("aria-pressed", on ? "true" : "false"); say.textContent = on ? T.sayOn[l] : T.sayOff[l]; cv.setAttribute("aria-label", T.label[l]); }
    function fit() { var w = Math.min(root.clientWidth - 20, 720); cv.style.width = w + "px"; cv.style.margin = "0 auto"; cv.style.height = Math.round(Math.min(window.innerHeight * 0.5, w * 0.62, 420)) + "px"; }

    function capsule(a, b, ta, tb) {
      var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux, out = [];
      for (var k = 0; k <= 8; k++) { var q = -Math.PI / 2 + (k / 8) * Math.PI; out.push([b[0] + (ux * Math.cos(q) + nx * Math.sin(q)) * tb, b[1] + (uy * Math.cos(q) + ny * Math.sin(q)) * tb]); }
      for (var k2 = 0; k2 <= 8; k2++) { var q2 = Math.PI / 2 + (k2 / 8) * Math.PI; out.push([a[0] + (ux * Math.cos(q2) + nx * Math.sin(q2)) * ta, a[1] + (uy * Math.cos(q2) + ny * Math.sin(q2)) * ta]); }
      return out;
    }
    var st = S.stage(cv, function (st, dt) {
      var w = st.w, h = st.h, c = st.ctx;
      if (st.dirty || !bg) {
        bg = S.layer(w, h, st.dpr); var b = bg.ctx;
        S.cloth(b, [[0, 0], [w, 0], [w, h], [0, h]], "#e9dcc2", { pitch: 2.4, grain: 0.35, shadow: false });
        st.dirty = false;
      }
      /* the load eases toward its target; idle, it presses and lets go every few seconds */
      if (hold > 0) hold -= dt; else if (!S.reduced) target = 0.85 * Math.max(0, Math.sin(st.t * 0.9)) * (Math.sin(st.t * 0.9) > 0 ? 1 : 0);
      load += (target - load) * Math.min(1, dt * 5);
      var press = Math.max(0, load), curl = Math.max(0, -load);
      var tp = on ? 4 * press : -30 * press, td = on ? 6 * press : 38 * press, tm = 6 * press;
      tp += 75 * curl; td += 55 * curl; tm += 35 * curl;
      ang.m += (tm - ang.m) * Math.min(1, dt * 9); ang.p += (tp - ang.p) * Math.min(1, dt * 9); ang.d += (td - ang.d) * Math.min(1, dt * 9);
      var rad = Math.PI / 180, M = [w * 0.26, h * 0.4], Lp = w * 0.25, Lm = w * 0.16, Ld = w * 0.12, t0 = Math.min(h * 0.1, w * 0.06);
      var a0 = ang.m * rad, a1 = a0 + ang.p * rad, a2 = a1 + ang.d * rad;
      var P = [M[0] + Math.cos(a0) * Lp, M[1] + Math.sin(a0) * Lp], D = [P[0] + Math.cos(a1) * Lm, P[1] + Math.sin(a1) * Lm], Tt = [D[0] + Math.cos(a2) * Ld, D[1] + Math.sin(a2) * Ld];
      c.clearRect(0, 0, w, h); c.drawImage(bg.canvas, 0, 0, w, h);
      /* the table rises to meet the fingertip as she presses */
      var tipLow = Tt[1] + t0 * 0.7, tableTop = h * 0.86 + (tipLow - h * 0.86) * Math.min(1, press * 1.15);
      S.applique(c, [[w * 0.55, tableTop], [w, tableTop], [w, h + 4], [w * 0.55, h + 4]], "#a8743a", "#c99a5b", { pitch: 1.8, grain: 0.4, inset: 3, dash: 5, gap: 3, tw: 0.9 });
      /* the back of the hand, the knuckle */
      var hand = S.curve([[-10, M[1] - t0 * 1.35], [M[0] * 0.5, M[1] - t0 * 1.45], [M[0] + t0 * 0.6, M[1] - t0 * 1.2], [M[0] + t0 * 0.9, M[1]], [M[0] + t0 * 0.3, M[1] + t0 * 1.1], [M[0] * 0.5, M[1] + t0 * 1.6], [-10, M[1] + t0 * 1.9]], false, 8).concat([[-10, M[1] + t0 * 1.9]]);
      S.cloth(c, hand, SKIN, { pitch: 1.4, grain: 0.18 });
      /* the three bones of the finger, each a padded piece */
      S.cloth(c, capsule(M, P, t0, t0 * 0.92), SKIN, { pitch: 1.4, grain: 0.18 });
      S.cloth(c, capsule(P, D, t0 * 0.92, t0 * 0.84), SKIN, { pitch: 1.4, grain: 0.18 });
      S.cloth(c, capsule(D, Tt, t0 * 0.84, t0 * 0.72), SKIN, { pitch: 1.4, grain: 0.18 });
      /* nail on the top of the tip; creases at the joints */
      var nx2 = -Math.sin(a2), ny2 = Math.cos(a2), nailA = [D[0] + Math.cos(a2) * Ld * 0.35 - nx2 * t0 * 0.7, D[1] + Math.sin(a2) * Ld * 0.35 - ny2 * t0 * 0.7], nailB = [Tt[0] - nx2 * t0 * 0.55, Tt[1] - ny2 * t0 * 0.55];
      var nl = [[nailA[0] + nx2 * t0 * 0.12, nailA[1] + ny2 * t0 * 0.12], [nailB[0] + nx2 * t0 * 0.1, nailB[1] + ny2 * t0 * 0.1], [nailB[0] - nx2 * t0 * 0.12, nailB[1] - ny2 * t0 * 0.12], [nailA[0] - nx2 * t0 * 0.1, nailA[1] - ny2 * t0 * 0.1]];
      S.cloth(c, nl, NAIL, { pitch: 1, grain: 0.1, shadow: false }); S.sew(c, [S.straight(nl[1], nl[2], 1.2, "#f7efe9")]);
      var crease = [];
      [[P, a0, a1, t0 * 0.92], [D, a1, a2, t0 * 0.84]].forEach(function (j) { var am = (j[1] + j[2]) / 2, nx = -Math.sin(am), ny = Math.cos(am);
        crease.push(S.straight([j[0][0] + nx * j[3] * 0.55, j[0][1] + ny * j[3] * 0.55], [j[0][0] + nx * j[3] * 0.95, j[0][1] + ny * j[3] * 0.95], 1, SKIN2));
        crease.push(S.straight([j[0][0] - nx * j[3] * 0.6 - Math.cos(am) * 3, j[0][1] - ny * j[3] * 0.6 - Math.sin(am) * 3], [j[0][0] - nx * j[3] * 0.85 + Math.cos(am) * 3, j[0][1] - ny * j[3] * 0.85 + Math.sin(am) * 3], 1, SKIN2)); });
      S.sew(c, crease);
      /* the splint: a ring round each bone either side of the middle joint, the two joined under it */
      if (on) {
        var sil = function () { return "#dfe4e8"; }, n0 = [-Math.sin(a0), Math.cos(a0)], n1 = [-Math.sin(a1), Math.cos(a1)];
        var r1 = [P[0] - Math.cos(a0) * Lp * 0.42, P[1] - Math.sin(a0) * Lp * 0.42], r2 = [P[0] + Math.cos(a1) * Lm * 0.45, P[1] + Math.sin(a1) * Lm * 0.45];
        var under = [P[0] + (n0[0] + n1[0]) * 0.5 * t0 * 1.05, P[1] + (n0[1] + n1[1]) * 0.5 * t0 * 1.05];
        var top1 = [r1[0] - n0[0] * t0 * 1.02, r1[1] - n0[1] * t0 * 1.02], top2 = [r2[0] - n1[0] * t0 * 0.95, r2[1] - n1[1] * t0 * 0.95];
        var sts = [];
        sts = sts.concat(S.satin([top1, r1, [r1[0] + n0[0] * t0 * 1.02, r1[1] + n0[1] * t0 * 1.02]], function () { return Math.max(1.6, t0 * 0.12); }, 1.2, 1.2, sil));
        sts = sts.concat(S.satin([top2, r2, [r2[0] + n1[0] * t0 * 0.95, r2[1] + n1[1] * t0 * 0.95]], function () { return Math.max(1.6, t0 * 0.12); }, 1.2, 1.2, sil));
        sts = sts.concat(S.satin([top1, under], function () { return Math.max(1.4, t0 * 0.1); }, 1.2, 1.1, sil), S.satin([under, top2], function () { return Math.max(1.4, t0 * 0.1); }, 1.2, 1.1, sil));
        sts.push(S.knot(under, Math.max(2, t0 * 0.16), "#eef1f3"));
        S.sew(c, sts);
      }
      /* how far the middle joint bends backward, as a small stitched gauge */
      var back = Math.max(0, -ang.p), gx = w * 0.04, gy = h * 0.1;
      c.save(); c.fillStyle = "#3b2c1c"; c.font = "600 " + Math.round(Math.max(12, h * 0.045)) + "px system-ui, sans-serif";
      c.fillText((lang() === "th" ? "ข้อนิ้วกลางแอ่น " : "middle joint bent back ") + Math.round(back) + "°", gx, gy); c.restore();
    }, { resize: function () { fit(); } });

    function act(v) { target = v; hold = 2.2; st.kick(); }
    bP.addEventListener("click", function () { act(1); });
    bC.addEventListener("click", function () { act(-1); });
    bS.addEventListener("click", function () { on = !on; words(); S.jingle(2, on ? 5 : 6); act(1); });
    var drag = null;
    cv.addEventListener("pointerdown", function (e) { drag = e.clientY; cv.setPointerCapture(e.pointerId); act(1); });
    cv.addEventListener("pointermove", function (e) { if (drag === null) return; var b = cv.getBoundingClientRect(); target = Math.max(-1, Math.min(1, (e.clientY - drag) / (b.height * 0.3) + 1)); hold = 2.2; });
    cv.addEventListener("pointerup", function () { drag = null; });
    fit(); words(); document.addEventListener("langchange", words);
    window.addEventListener("resize", function () { fit(); st.dirty = true; st.kick(); });
  };
})();
