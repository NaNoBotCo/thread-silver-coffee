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

  /* the five makers: an email already laid out */
  function mailBody() {
    var a = document.getElementById("mail5"); if (!a) return;
    var th = h.dataset.lang === "th";
    var subj = th ? "ช่างห้าคนแรก" : "The first five makers";
    var body = th
      ? "ช่างห้าคนแรก\n\n1. ชื่อ / หมู่บ้าน / ทำอะไร / เบอร์ LINE\n2.\n3.\n4.\n5.\n\nส่วนแบ่งของ CCA ต่อการขาย: ___%\n"
      : "The first five makers\n\n1. Name / village / what they make / LINE number\n2.\n3.\n4.\n5.\n\nCCA's share of each sale: ___%\n";
    a.href = "mailto:nan@motdang.net?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body);
  }
  setLang(h.dataset.lang === "th" ? "th" : "en");
})();
