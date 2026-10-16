// OP arka plan temaları (20 seçenek: 10 açık + 10 koyu) — TEK KAYNAK. Üç yerde kullanılır:
//   tarayıcı: <head>'de eşzamanlı yüklenir (ilk boyamadan ÖNCE tercih uygulanır → yanıp sönme yok) → window.OP_TEMA
//   Node    : require("./public/temalar.js") — test/tema_kontrast.mjs her temanın okunaklılığını HESAPLAR
// Kayıt: yerel depo `op-tema` ("acik"|"koyu"|"" = sistem) + `op-zemin` ({acik, koyu}); oturum açıksa profilde de (profiles.gorunum). Varsayılan: açık=gokyuzu, koyu=okyanus.
// Paletler logo-secenekleri/arka-plan-secenekleri.html ile aynı adlar/renkler; okunaklılık eşiğini tutmayan tonlar hafifçe ayarlandı (kontrast betiği doğrular).
(function (kok) {
  "use strict";
  // id, ad(TR), ad(EN), mod, zemin(css), duraklar(gradyan uçları; düz renkte tek), metin, gri, çizgi, vurgu, avatar, yer tutucu
  const HAM = [
    ["krem", "Krem", "Cream", "acik", "#FAF6EE", ["#FAF6EE"], "#17282D", "#5F6D71", "#E8E1D3", "#1E4A54", "#F3E3B3", "linear-gradient(135deg,#CFE3D6,#F3E3B3)"],
    ["kum", "Kum", "Sand", "acik", "#F4EDE0", ["#F4EDE0"], "#1E2A2B", "#6A655A", "#E2D8C6", "#7A5A1E", "#E7C873", "linear-gradient(135deg,#E9D9B8,#D9C4A0)"],
    ["seftali", "Şeftali", "Peach", "acik", "#FFF1E8", ["#FFF1E8"], "#2A2422", "#7C645A", "#F4DDCF", "#AC4924", "#FFD2B8", "linear-gradient(135deg,#FFD9C2,#FFE9B8)"],
    ["gul", "Gül", "Rose", "acik", "#FDF0F2", ["#FDF0F2"], "#2A2226", "#7C626B", "#F3DDE2", "#B23A5E", "#F8C9D4", "linear-gradient(135deg,#F8C9D4,#FDE3C8)"],
    ["lavanta", "Lavanta", "Lavender", "acik", "#F3F0FA", ["#F3F0FA"], "#232230", "#69657E", "#E2DDF1", "#5B4BB0", "#D6CEF5", "linear-gradient(135deg,#D6CEF5,#CFE3F5)"],
    ["gokyuzu", "Gökyüzü", "Sky", "acik", "#EEF5FB", ["#EEF5FB"], "#1B2630", "#5A6C7B", "#DAE6F0", "#1E6DAE", "#C6DDF2", "linear-gradient(135deg,#C6DDF2,#D8F0E6)"],
    ["nane", "Nane", "Mint", "acik", "#EEF7F1", ["#EEF7F1"], "#1C2A24", "#5A6F63", "#D9EADF", "#1D7852", "#C4E6D2", "linear-gradient(135deg,#C4E6D2,#EAF1C0)"],
    ["limon", "Limon", "Lemon", "acik", "#FBF8E3", ["#FBF8E3"], "#27271C", "#6E6C4E", "#EDE8C6", "#6F6000", "#F2E88A", "linear-gradient(135deg,#F2E88A,#D4EBC0)"],
    ["gundogumu", "Gün doğumu", "Sunrise", "acik", "linear-gradient(180deg,#FFF3E2 0%,#FFE6DC 55%,#F6E4F0 100%)", ["#FFF3E2", "#FFE6DC", "#F6E4F0"], "#2A2422", "#785D53", "rgba(120,80,60,.16)", "#A64722", "#FFD2B8", "linear-gradient(135deg,#FFC9A8,#F6C6DA)"],
    ["beyaz", "Beyaz", "White", "acik", "#FFFFFF", ["#FFFFFF"], "#0F1419", "#536471", "#EFF3F4", "#1E4A54", "#F3E3B3", "linear-gradient(135deg,#E3EAEC,#F1F3F4)"],
    ["gecepetrol", "Gece petrol", "Night teal", "koyu", "#0F1E22", ["#0F1E22"], "#EAF1F2", "#8FA3A8", "#1E3237", "#E7C873", "#1E4A54", "linear-gradient(135deg,#1E4A54,#3A5B3F)"],
    ["lacivert", "Lacivert", "Navy", "koyu", "#0D1626", ["#0D1626"], "#E8EEF8", "#8C9BB5", "#1B2A44", "#7FB2FF", "#1E3A66", "linear-gradient(135deg,#1E3A66,#3B3470)"],
    ["erik", "Erik", "Plum", "koyu", "#1B1422", ["#1B1422"], "#F0E9F5", "#A593B3", "#2E2238", "#D9A7F2", "#4A2E63", "linear-gradient(135deg,#4A2E63,#63304C)"],
    ["orman", "Orman", "Forest", "koyu", "#0F1C16", ["#0F1C16"], "#E8F2EC", "#8FA899", "#1D3026", "#8FD9A8", "#1F4D36", "linear-gradient(135deg,#1F4D36,#4D5A22)"],
    ["kahve", "Kahve", "Coffee", "koyu", "#1E1713", ["#1E1713"], "#F3ECE6", "#AE9C8E", "#33271F", "#E7B47A", "#5A3D28", "linear-gradient(135deg,#5A3D28,#6B4A1E)"],
    ["sarap", "Şarap", "Wine", "koyu", "#201216", ["#201216"], "#F5E9EC", "#B5959C", "#371F26", "#F28FA8", "#5E2434", "linear-gradient(135deg,#5E2434,#5A3A1E)"],
    ["okyanus", "Okyanus", "Ocean", "koyu", "#0B1D24", ["#0B1D24"], "#E6F2F5", "#86A3AC", "#16323B", "#5FD0E0", "#145266", "linear-gradient(135deg,#145266,#1E4A54)"],
    ["komur", "Kömür", "Charcoal", "koyu", "#16181A", ["#16181A"], "#ECEEEF", "#9AA1A6", "#2A2E31", "#E7C873", "#3A4045", "linear-gradient(135deg,#3A4045,#2C3A3E)"],
    ["alacakaranlik", "Alacakaranlık", "Twilight", "koyu", "linear-gradient(180deg,#141B33 0%,#231A38 60%,#2E1B2E 100%)", ["#141B33", "#231A38", "#2E1B2E"], "#EEEAF6", "#A39BB8", "rgba(255,255,255,.10)", "#F2B8A0", "#3B3470", "linear-gradient(135deg,#3B3470,#6A3050)"],
    ["siyah", "Siyah", "Black", "koyu", "#000000", ["#000000"], "#E7E9EA", "#8B9298", "#2F3336", "#E7C873", "#1E4A54", "linear-gradient(135deg,#1A2A2E,#22262A)"],
  ];
  const VARSAYILAN = { acik: "gokyuzu", koyu: "okyanus" };

  // ---------- renk işlemleri (sRGB) ----------
  const rgb = (h) => { let x = String(h).replace("#", ""); if (x.length === 3) x = x.replace(/./g, "$&$&"); return [0, 2, 4].map((i) => parseInt(x.slice(i, i + 2), 16)); };
  const hex = (c) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
  const karisim = (a, b, oran) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * oran)); };   // a'ya b'den `oran` kadar
  const aydinlik = (h) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const kontrast = (a, b) => { const x = aydinlik(a), y = aydinlik(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };

  // açık/koyu tasarım kartı (haber kartı) tonları: [a, b, yazı, etiket, kenar]
  const HK = {
    acik: { petrol: ["#E4EEF0", "#D8E8EC", "#0E2A33", "#1D4753", "#CADDE2"], altin: ["#F8F0DC", "#F2E6C6", "#33270A", "#7A5A12", "#E6D8AE"], yesil: ["#E6F0E9", "#D8E8DE", "#0F2C20", "#2F6B52", "#C7DCCE"], derin: ["#E8EDF1", "#DBE3EA", "#14262F", "#3F5B73", "#CBD6E0"] },
    koyu: { petrol: ["#10262C", "#153038", "#E3F1F4", "#7CC4D3", "#1E3F49"], altin: ["#2A2312", "#342B14", "#F6EBCB", "#E2BE63", "#4A3D1C"], yesil: ["#11261C", "#163026", "#DFF0E6", "#7FCBA3", "#214536"], derin: ["#151D26", "#1B2631", "#E6ECF2", "#9BB6D0", "#2A3846"] },
  };

  const liste = HAM.map(([id, ad, adEn, mod, zemin, duraklar, metin, gri, cizgi, vurgu, avatar, yer]) => {
    const duz = duraklar[Math.floor((duraklar.length - 1) / 2)];   // gradyanda orta durak = çubuk/pencere zemini
    return { id, ad, adEn, mod, zemin, duraklar, duz, metin, gri, cizgi, vurgu, avatar, yer };
  });

  // SICAK kartlar (sahip 2026-10-16): aktivite (etkinlik kartı, Yakınındaki Aktiviteler, detay, tarih rozeti) ve anket kartları turuncu/amber/sarı tonlarda.
  // Her temanın kendi zemini (t.duz) ile karıştırılır → 20 temada ayrı değerler; renk, hedef zeminde eşiği geçene dek koyulaştırılır/açılır (metin ≥7, ikincil ≥4.5, vurgu ≥4.5, düğme yazısı ≥4.5, çubuk↔iz ≥3).
  const ayarla = (renk, zemin, esik) => {
    const yon = aydinlik(zemin) > 0.4 ? "#000000" : "#FFFFFF";
    for (let o = 0; o <= 1.0001; o += 0.02) { const c = karisim(renk, yon, o); if (kontrast(c, zemin) >= esik) return c; }
    return yon;
  };
  function sicak(t, koyu) {
    const zemin = koyu ? karisim("#33200A", t.duz, 0.28) : karisim("#FFF4E5", t.duz, 0.16);
    const yazi = ayarla(koyu ? "#FFF1DC" : "#2B1807", zemin, 7.5), yazi2 = ayarla(koyu ? "#E6B877" : "#8A4B0F", zemin, 4.8);
    const vurgu = ayarla(koyu ? "#FBBF24" : "#EA580C", zemin, 4.8), iz = karisim(zemin, yazi, 0.12);
    const bar = ayarla(vurgu, iz, 3.2), bar2 = ayarla(yazi2, iz, 3.2);
    return {
      "--sicak-zemin": zemin, "--sicak-kenar": karisim(koyu ? "#B45309" : "#F59E0B", t.duz, koyu ? 0.3 : 0.3), "--sicak-yazi": yazi, "--sicak-yazi2": yazi2,
      "--sicak-vurgu": vurgu, "--sicak-vurgu-yazi": kontrast("#FFFFFF", vurgu) >= kontrast("#1A0E02", vurgu) ? "#FFFFFF" : "#1A0E02",
      "--sicak-iz": iz, "--sicak-bar": bar, "--sicak-bar2": bar2,
    };
  }

  /** Bir temanın TÜM yüzey değişkenleri ({ "--zemin": "#…", … }). */
  function degiskenler(t) {
    const koyu = t.mod === "koyu";
    const yuzey = karisim(t.duz, t.metin, koyu ? 0.07 : 0.045);
    const yukselt = koyu ? karisim(t.duz, "#FFFFFF", 0.07) : karisim(t.duz, "#FFFFFF", 0.55);
    const vurguYazi = kontrast("#FFFFFF", t.vurgu) >= kontrast("#07090A", t.vurgu) ? "#FFFFFF" : "#07090A";
    const v = {
      "--zemin": t.duz, "--zemin-arka": t.zemin, "--yuzey": yuzey, "--yukselt": yukselt, "--yazi": t.metin, "--yazi2": t.gri, "--cizgi": t.cizgi,
      "--vurgu": t.vurgu, "--vurgu-yazi": vurguYazi, "--hata": koyu ? "#FF8A80" : "#B3261E", "--basari": koyu ? "#7FD6A0" : "#1B6E3C",
      "--avatar": t.avatar, "--yer": t.yer, "--perde": koyu ? "rgba(0,0,0,.62)" : "rgba(0,0,0,.45)", "--golge": koyu ? "rgba(0,0,0,.55)" : "rgba(0,0,0,.18)",
      "--bar": "color-mix(in srgb, " + t.duz + " 90%, transparent)", "color-scheme": koyu ? "dark" : "light",
    };
    Object.assign(v, sicak(t, koyu));
    const takim = HK[t.mod];
    for (const ton of Object.keys(takim)) {
      const [a, b, yazi, et, kenar] = takim[ton];
      v["--hk-" + ton + "-a"] = karisim(a, t.duz, 0.4); v["--hk-" + ton + "-b"] = karisim(b, t.duz, 0.4); v["--hk-" + ton + "-k"] = karisim(kenar, t.duz, 0.4);
      v["--hk-" + ton + "-yazi"] = yazi; v["--hk-" + ton + "-et"] = et;
    }
    return v;
  }

  // ---------- tarayıcı: tercih + uygulama ----------
  const API = { liste, VARSAYILAN, degiskenler, kontrast, karisim, aydinlik, HK, sicak };
  API.bul = (id, mod) => liste.find((t) => t.id === id && (!mod || t.mod === mod)) || null;
  API.varsayilan = (mod) => API.bul(VARSAYILAN[mod], mod);

  if (typeof document !== "undefined" && typeof localStorage !== "undefined") {
    const oku = (k, v) => { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch (e) { return v; } };
    const yaz = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* yok say */ } };
    const koyuSistem = () => { try { return matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) { return false; } };
    API.mod = () => { const at = document.documentElement.dataset.tema; if (at === "koyu" || at === "acik") return at; const m = oku("op-tema", "acik");   // öznitelik (uygulama/test) depodan önce gelir
      return m === "koyu" ? "koyu" : m === "" ? (koyuSistem() ? "koyu" : "acik") : "acik"; };   // çözümlenmiş mod
    API.tercih = () => {
      const z = oku("op-zemin", {}) || {};
      return { acik: API.bul(z.acik, "acik") ? z.acik : VARSAYILAN.acik, koyu: API.bul(z.koyu, "koyu") ? z.koyu : VARSAYILAN.koyu };
    };
    API.tercihYaz = (o) => { const t = API.tercih(); yaz("op-zemin", { acik: API.bul(o && o.acik, "acik") ? o.acik : t.acik, koyu: API.bul(o && o.koyu, "koyu") ? o.koyu : t.koyu }); };
    API.uygula = () => {
      const kokEl = document.documentElement, mod = API.mod(), tr = API.tercih(), t = API.bul(tr[mod], mod);
      kokEl.dataset.mod = mod; kokEl.dataset.zemin = t.id;
      const stil = degiskenler(t);
      for (const k of Object.keys(stil)) kokEl.style.setProperty(k, stil[k]);
      // theme-color: tek etiket (medya koşulsuz) = seçilen zemin
      let ilk = null;
      document.querySelectorAll('meta[name="theme-color"]').forEach((m) => { if (!ilk) ilk = m; else m.remove(); });
      if (!ilk) { ilk = document.createElement("meta"); ilk.name = "theme-color"; document.head.appendChild(ilk); }
      ilk.removeAttribute("media"); ilk.content = t.duz;
      return t;
    };
    API.zeminSec = (mod, id) => { if (!API.bul(id, mod)) return null; API.tercihYaz({ [mod]: id }); return API.uygula(); };
    // ilk boyamadan önce: data-tema (sakla "op-tema": "acik"|"koyu"|"" sistem) + zemin
    const m0 = oku("op-tema", "acik");
    if (m0 === "koyu" || m0 === "acik") document.documentElement.dataset.tema = m0; else if (m0 === "") delete document.documentElement.dataset.tema;
    API.uygula();
    try { new MutationObserver(() => { const m = API.mod(); if (document.documentElement.dataset.mod !== m) API.uygula(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-tema"] }); } catch (e) { /* yok say */ }
    try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (oku("op-tema", "acik") === "") API.uygula(); }); } catch (e) { /* eski tarayıcı */ }
  }
  if (typeof module === "object" && module && module.exports) module.exports = API;
  kok.OP_TEMA = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
