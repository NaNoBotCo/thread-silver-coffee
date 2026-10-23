(function () {
  "use strict";
  var h = document.documentElement;
  function setLang(l) {
    h.dataset.lang = l; h.lang = l;
    try { localStorage.setItem("tsc-lang", l); } catch (e) {}
    [].forEach.call(document.querySelectorAll(".langsw button"), function (b) { b.setAttribute("aria-pressed", b.dataset.l === l ? "true" : "false"); });
    mailBody();
    document.dispatchEvent(new Event("langchange"));
  }
  [].forEach.call(document.querySelectorAll(".langsw button"), function (b) { b.addEventListener("click", function () { setLang(b.dataset.l); }); });

  /* the hero */
  var fest = null, cv = document.getElementById("fest");
  if (cv && window.FEST) {
    fest = window.FEST.mount(cv);
    var bw = document.getElementById("bWheel"), bs = document.getElementById("bSwing");
    if (bw) bw.addEventListener("click", function () { fest.push("wheel", 1); });
    if (bs) bs.addEventListener("click", function () { fest.push("swing"); });
  }

  /* each toy builds itself in its own box; a missing one leaves its box out */
  [].forEach.call(document.querySelectorAll(".toy[data-toy]"), function (el) {
    var f = window.TOYS && window.TOYS[el.dataset.toy];
    if (typeof f === "function") { try { f(el); } catch (e) { el.remove(); if (window.console) console.error(el.dataset.toy, e); } }
    else el.remove();
  });

  /* the first five makers: typed on the page, sent on LINE or by email, or copied */
  var form = document.getElementById("fiveForm"), open5 = document.getElementById("five");
  var line5 = document.getElementById("fiveLine"), mail5 = document.getElementById("fiveMail"), copy5 = document.getElementById("fiveCopy"), say5 = document.getElementById("fiveSay");
  function fiveText() {
    var th = h.dataset.lang === "th", rows = [];
    [].forEach.call(form.querySelectorAll("input[name=m]"), function (i, k) { rows.push((k + 1) + ". " + (i.value.trim() || "…")); });
    var share = document.getElementById("fiveShare").value || "";
    return (th ? "ช่างห้าคนแรกสำหรับตลาดของ CCA" : "The first five makers for CCA's market") + "\n\n" + rows.join("\n") + "\n\n" +
      (th ? "ส่วนแบ่งของ CCA ต่อการขาย: " : "CCA's share of each sale: ") + share + "%\n";
  }
  function mailBody() {
    if (!form) return;
    var th = h.dataset.lang === "th", t = fiveText();
    line5.href = "https://line.me/R/oaMessage/%40964yxgnk/?" + encodeURIComponent(t);
    mail5.href = "mailto:nan@motdang.net?subject=" + encodeURIComponent(th ? "ช่างห้าคนแรก" : "The first five makers") + "&body=" + encodeURIComponent(t);
    var first = form.querySelector("input[name=m]"), ph = first.getAttribute(th ? "data-th" : "data-en");
    [].forEach.call(form.querySelectorAll("input[name=m]"), function (i) { i.placeholder = ph; });
  }
  function showFive(focus) {
    if (!form) return;
    form.hidden = false; open5.setAttribute("aria-expanded", "true"); mailBody();
    if (focus) { form.scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(function () { form.querySelector("input[name=m]").focus({ preventScroll: true }); }, 400); }
  }
  if (form) {
    open5.addEventListener("click", function () { if (form.hidden) showFive(true); else { form.hidden = true; open5.setAttribute("aria-expanded", "false"); } });
    [].forEach.call(document.querySelectorAll("[data-open-five]"), function (b) { b.addEventListener("click", function () { showFive(true); }); });
    form.addEventListener("input", mailBody);
    form.addEventListener("submit", function (e) { e.preventDefault(); });
    copy5.addEventListener("click", function () {
      var t = fiveText(), th = h.dataset.lang === "th", ok = function () { say5.textContent = th ? "คัดลอกแล้ว วางใน LINE หรืออีเมลถึง nan@motdang.net" : "Copied. Paste it into LINE, or an email to nan@motdang.net."; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok, fallback); else fallback();
      function fallback() { var ta = document.createElement("textarea"); ta.value = t; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); ok(); } catch (e) { say5.textContent = t; } ta.remove(); }
    });
  }
  setLang(h.dataset.lang === "th" ? "th" : "en");
})();
