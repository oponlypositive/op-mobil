// OP mobil köprüsü (Capacitor). mobil/hazirla.mjs bunu esbuild ile www/mobil.js olarak paketler; index.html'de yapilandirma.js'ten SONRA, app.js'ten ÖNCE yüklenir.
// Görev: platform işareti (OP_YAPI.platform = ios|android), dış bağlantılar sistem/uygulama içi tarayıcıda, yerel paylaşım, Android geri tuşu,
// e-posta/derin bağlantı dönüşü, durum çubuğu stili, klavye, açılış ekranını kapatma. Web sürümünde bu dosya YOKTUR.
import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { App } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import { Share } from "@capacitor/share";
import { Keyboard } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";

const yok = () => {};
const UYG_SEMA = "org.onlypositive.app:";
// Gerçek cihazda Capacitor platformu; tarayıcıda deneme için yalnız window.__OP_PLATFORM_TEST ("ios"|"android") kabul edilir.
const gercek = Capacitor.isNativePlatform() ? Capacitor.getPlatform() : null;
const deneme = ["ios", "android"].includes(window.__OP_PLATFORM_TEST) ? window.__OP_PLATFORM_TEST : null;
const platform = gercek || deneme;
const kok = document.documentElement;

if (platform) {
  window.OP_YAPI = { ...(window.OP_YAPI || {}), platform };
  kok.classList.add("mobil", "mobil-" + platform);
}

let aciliyor = false;   // tarayıcı (web) uygulamasında Browser.open window.open çağırır: özyinelemeyi kes
const tarayicidaAc = (url) => {
  if (aciliyor) return;
  aciliyor = true; if (window.OP_MOBIL) window.OP_MOBIL.sonDisBaglanti = url;
  Browser.open({ url }).catch(() => { location.href = url; }).finally(() => { aciliyor = false; });
};

window.OP_MOBIL = {
  platform,
  /** Yerel paylaşım sayfası (iOS/Android sistem paylaşımı). */
  async paylas({ title, text, url }) {
    if (gercek) return Share.share({ title, text, url, dialogTitle: title });
    if (navigator.share) return navigator.share({ title, text, url });
    throw new Error("paylaşım yok");
  },
};

if (platform) {
  // ---- dış bağlantılar: http(s) → uygulama içi tarayıcı (SFSafariViewController / Chrome Custom Tabs); mailto/sms/tel/instagram: sistem açar
  document.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a[href]");
    if (!a || e.defaultPrevented) return;
    let u; try { u = new URL(a.href, location.href); } catch { return; }
    if (u.origin === location.origin) {
      if (u.pathname.startsWith("/yasal/") && !u.pathname.endsWith(".html")) { e.preventDefault(); location.href = u.pathname + ".html" + u.search + u.hash; }   // paketteki yasal sayfalar
      return;
    }
    if (u.protocol === "http:" || u.protocol === "https:") { e.preventDefault(); tarayicidaAc(u.href); }
  }, true);
  const eskiAc = window.open ? window.open.bind(window) : null;
  window.open = (url, ...r) => {
    try { const u = new URL(url, location.href); if (u.protocol === "http:" || u.protocol === "https:") { tarayicidaAc(u.href); return null; } } catch { /* aşağı */ }
    return eskiAc ? eskiAc(url, ...r) : null;
  };

  // ---- sistem çubukları: uygulama temasına uy (koyu temada açık simgeler)
  const temaUy = () => {
    const t = kok.dataset.tema, koyu = t === "koyu" || (t === undefined && matchMedia("(prefers-color-scheme: dark)").matches);
    SystemBars.setStyle({ style: koyu ? SystemBarsStyle.Dark : SystemBarsStyle.Light }).catch(yok);
  };
  temaUy();
  new MutationObserver(temaUy).observe(kok, { attributes: true, attributeFilter: ["data-tema"] });
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", temaUy);

  // ---- klavye: açıkken alt menü gizlenir (style.css html.klavye)
  Keyboard.addListener("keyboardWillShow", () => kok.classList.add("klavye")).catch(yok);
  Keyboard.addListener("keyboardWillHide", () => kok.classList.remove("klavye")).catch(yok);

  // ---- uygulamaya dönüş bağlantıları
  const uygHazir = () => new Promise((coz) => { let n = 0; const t = setInterval(() => { if (window.OP_UYG || ++n > 100) { clearInterval(t); coz(!!window.OP_UYG); } }, 100); });
  async function baglantiIsle(ham) {
    let u; try { u = new URL(ham); } catch { return; }
    if (!(await uygHazir())) return;
    if (u.protocol === UYG_SEMA) {   // org.onlypositive.app://giris?code=… | …://sifre-yenile?code=… (Supabase PKCE dönüşü)
      const q = new URLSearchParams(u.search), h = new URLSearchParams(u.hash.replace(/^#/, ""));
      const hata = q.get("error_description") || h.get("error_description");
      if (hata) return window.OP_UYG.bildir(hata);
      const kod = q.get("code");
      if (kod) return window.OP_UYG.kodGirisi(kod);
      return;
    }
    const g = (u.hash || "").match(/^#g=([a-z0-9-]+)$/);   // https://onlypositive.org/#g=<id> (paylaşılan gönderi)
    if (g) window.OP_UYG.gonderiAc(g[1]);
  }
  if (gercek) {
    App.addListener("appUrlOpen", (o) => baglantiIsle(o.url)).catch(yok);
    App.getLaunchUrl().then((o) => o?.url && baglantiIsle(o.url)).catch(yok);
    // ---- Android geri tuşu: önce uygulama içi (pencere/yığın), sonra arka plana
    App.addListener("backButton", ({ canGoBack }) => {
      if (window.OP_UYG) { if (!window.OP_UYG.geri()) App.minimizeApp().catch(() => App.exitApp()); }
      else if (canGoBack) history.back(); else App.exitApp();
    }).catch(yok);
  }
  window.OP_MOBIL.baglantiIsle = baglantiIsle;

  // ---- açılış ekranı: uygulama ilk ekranı çizince kapat (en geç 4 sn)
  let kapandi = false;
  const splashKapat = () => { if (kapandi) return; kapandi = true; SplashScreen.hide({ fadeOutDuration: 200 }).catch(yok); };
  const izle = setInterval(() => { if (document.querySelector("#uygulama > *")) { clearInterval(izle); setTimeout(splashKapat, 150); } }, 80);
  setTimeout(() => { clearInterval(izle); splashKapat(); }, 4000);
}
