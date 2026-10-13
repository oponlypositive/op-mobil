// OP yasal sayfalar: dil + tema (uygulamayla aynı localStorage anahtarları: op-dil, op-tema; JSON). Yoksa tarayıcı dili / açık tema.
(function () {
  var oku = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var kok = document.documentElement;
  var tema = oku("op-tema"); if (tema === "koyu" || tema === "acik") kok.dataset.tema = tema; else if (tema === "") delete kok.dataset.tema;
  var dil = oku("op-dil"); if (dil !== "tr" && dil !== "en") dil = (navigator.language || "tr").slice(0, 2) === "tr" ? "tr" : "en";
  function uygula(d) {
    kok.dataset.dilSecili = d; kok.lang = d;
    document.querySelectorAll("[data-dil-sec]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.dilSec === d)); });
    document.querySelectorAll("[data-" + d + "]").forEach(function (e) { if (e.dataset[d]) e.textContent = e.dataset[d]; });
    var h = document.querySelector('section[data-dil="' + d + '"] h1'); if (h) document.title = h.textContent;
  }
  document.querySelectorAll("[data-dil-sec]").forEach(function (b) {
    b.addEventListener("click", function () { dil = b.dataset.dilSec; try { localStorage.setItem("op-dil", JSON.stringify(dil)); } catch (e) { /* yok say */ } uygula(dil); });
  });
  uygula(dil);
  // Geri: uygulamadan geldiysek (history var) bir adım geri; yoksa köke. Paket içinde kök index.html'dir.
  var g = document.getElementById("geri");
  if (g) g.addEventListener("click", function (e) {
    e.preventDefault();
    if (history.length > 1 && document.referrer) history.back(); else location.href = /^https?:$/.test(location.protocol) && location.hostname !== "localhost" ? "/" : "/index.html";
  });
  // sol kenardan sağa kaydırma = geri (uygulama içi yasal sayfalarda)
  var bx = null, by = 0;
  document.addEventListener("touchstart", function (e) { var t = e.touches[0]; bx = t.clientX < 24 ? t.clientX : null; by = t.clientY; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (bx === null) return; var t = e.changedTouches[0], dx = t.clientX - bx, dy = Math.abs(t.clientY - by); bx = null;
    if (dx > Math.min(120, innerWidth * 0.3) && dy < dx * 0.6 && g) g.click();
  }, { passive: true });
})();
