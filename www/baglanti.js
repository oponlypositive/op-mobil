// OP bağlantı çekirdeği — TEK KAYNAK: public/baglanti.js. Aynı kod üç yerde çalışır:
//   tarayıcı  : <script src="baglanti.js"> → window.OP_BAGLANTI   (tıklanabilir bağlantı, kısaltma, kart doğrulama)
//   Node      : require("./public/baglanti.js") (yerel sunucu + testler)
//   Deno/Edge : bulut/functions/_shared/baglanti-cekirdek.js BİREBİR KOPYASI (yayın derlemesi özetleri karşılaştırır) → globalThis.OP_BAGLANTI
// İçerik: izleme parametresi temizliği, YouTube kimliği, metinden bağlantı bulma, SSRF denetimi (söz dizimi + IP), güvenli sayfa çekme,
// Open Graph ayrıştırma, YouTube oEmbed. Ağ çağrısı yapan işlevler `fetch`'i DIŞARIDAN alır (testte taklit, sunucuda gerçek).
(function (kok) {
  "use strict";
  const IZLEME = /^(utm_[a-z0-9_]*|si|fbclid|gclid|dclid|gbraid|wbraid|igshid|msclkid|mc_cid|mc_eid|ttclid|twclid|yclid|_ga|_gl)$/i;
  const YT_ID = /^[A-Za-z0-9_-]{11}$/;
  const MAKS_ADRES = 2000;

  // ---------- adres temizliği ----------
  function ayristir(ham) {
    let u; try { u = new URL(String(ham ?? "").trim()); } catch { return null; }
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    if (u.username || u.password) return null;   // kullanıcı:şifre@ biçimi (oltalama) kabul edilmez
    return u;
  }
  /** http(s) adresi, izleme parametreleri atılmış hâliyle döndürür; geçersizse null. */
  function temizle(ham) {
    const u = ayristir(ham); if (!u) return null;
    for (const k of [...u.searchParams.keys()]) if (IZLEME.test(k)) u.searchParams.delete(k);
    const s = u.href;
    return s.length > MAKS_ADRES ? null : s;
  }
  /** YouTube video kimliği (watch, youtu.be, shorts, live, embed, v; m./music./nocookie); değilse null. */
  function ytKimlik(ham) {
    const u = ayristir(ham); if (!u) return null;
    const h = u.hostname.toLowerCase().replace(/^www\./, "");
    if (h === "youtu.be") { const id = u.pathname.split("/")[1] || ""; return YT_ID.test(id) ? id : null; }
    if (!["youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com"].includes(h)) return null;
    const p = u.pathname.split("/").filter(Boolean);
    if (p[0] === "watch") { const id = u.searchParams.get("v") || ""; return YT_ID.test(id) ? id : null; }
    if (["shorts", "live", "embed", "v"].includes(p[0])) return YT_ID.test(p[1] || "") ? p[1] : null;
    return null;
  }
  const ytAdres = (id) => `https://www.youtube.com/watch?v=${id}`;
  const ytKapak = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const ytGomme = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1`;

  // ---------- metinden bağlantı bulma ----------
  const SON_NOKTA = ".,;:!?'’”»…\"";
  /** [{ bas, son, ham }]: metindeki http(s) bağlantıları (sondaki noktalama ve dengesiz kapanış parantezi bağlantıdan sayılmaz). */
  function bul(metin) {
    const s = String(metin ?? ""), cikti = [], re = /https?:\/\/[^\s<>"'`]+/gi; let m;
    while ((m = re.exec(s))) {
      let t = m[0];
      for (;;) {
        const son = t[t.length - 1];
        if (SON_NOKTA.includes(son)) { t = t.slice(0, -1); continue; }
        if ((son === ")" && (t.match(/\(/g) || []).length < (t.match(/\)/g) || []).length)
          || (son === "]" && (t.match(/\[/g) || []).length < (t.match(/\]/g) || []).length)
          || son === "}") { t = t.slice(0, -1); continue; }
        break;
      }
      if (t.length > 8) cikti.push({ bas: m.index, son: m.index + t.length, ham: t });
    }
    return cikti;
  }
  /** Metindeki İLK geçerli bağlantı: { ham, temiz } ya da null. */
  function ilkBaglanti(metin) {
    for (const b of bul(metin)) { const temiz = temizle(b.ham); if (temiz) return { ham: b.ham, temiz }; }
    return null;
  }
  /** Görünen kısa metin: alan adı (www'suz) + yolun başı; en çok `en` karakter. */
  function kisalt(ham, en = 32) {
    const u = ayristir(temizle(ham) || ham); if (!u) return String(ham ?? "").slice(0, en);
    let s = u.hostname.replace(/^www\./, "") + (u.pathname === "/" ? "" : u.pathname) + u.search;
    try { s = decodeURI(s); } catch { /* ham kalır */ }
    return s.length > en ? s.slice(0, en - 1) + "…" : s;
  }
  /** Düz metni HTML'e çevirir (esc: kaçış işlevi); bağlantılar güvenli <a> olur. */
  function bagla(metin, esc) {
    const s = String(metin ?? ""); let h = "", i = 0;
    for (const b of bul(s)) {
      const temiz = temizle(b.ham); if (!temiz) continue;
      h += esc(s.slice(i, b.bas)) + `<a class="bag" href="${esc(temiz)}" target="_blank" rel="noopener noreferrer nofollow" data-bag="1">${esc(kisalt(temiz))}</a>`;
      i = b.son;
    }
    return h + esc(s.slice(i));
  }

  // ---------- SSRF denetimi ----------
  const YASAK_SON = /\.(local|localhost|internal|intranet|lan|home|corp|private|localdomain|onion|test|example|invalid|arpa)$/;
  const IZINLI_PORT = new Set(["", "80", "443"]);
  /** Alan adı söz dizimi: IP (her yazım), tek etiket, yerel/özel son ekler reddedilir. */
  function alanAdiGecerli(h0) {
    const h = String(h0 || "").toLowerCase().replace(/\.$/, "");
    if (!h || h.length > 253 || h.includes(":") || h.startsWith("[")) return false;
    if (/^[0-9.]+$/.test(h) || /(^|\.)0x[0-9a-f]*$/i.test(h) || /(^|\.)\d+$/.test(h)) return false;   // IPv4 (ondalık/onaltılık/sekizlik) ve sayısal son etiket
    if (!h.includes(".") || h === "localhost" || YASAK_SON.test(h)) return false;
    const e = h.split(".");
    if (!/^([a-z]{2,}|xn--[a-z0-9-]+)$/.test(e[e.length - 1])) return false;
    return e.every((x) => /^[a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9_])?$/.test(x));
  }
  /** { ok, host } — yalnız http/https, 80/443, kimlik bilgisi yok, geçerli genel alan adı. */
  function adresDenetle(ham) {
    const u = ayristir(ham); if (!u) return { ok: false };
    if (!IZINLI_PORT.has(u.port)) return { ok: false };
    if (!alanAdiGecerli(u.hostname)) return { ok: false };
    return { ok: true, host: u.hostname.toLowerCase().replace(/\.$/, "") };
  }
  function ozelV4(a, b) {   // ilk iki sekizli
    return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168) || (a === 192 && b === 0) || (a === 198 && (b === 18 || b === 19 || b === 51)) || (a === 203 && b === 0);
  }
  function v6Parcala(ip0) {   // 8 onaltılık parça ya da null
    let s = String(ip0).toLowerCase().split("%")[0];
    const nokta = s.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
    if (nokta) {
      const o = nokta.slice(1).map(Number); if (o.some((x) => x > 255)) return null;
      s = s.slice(0, nokta.index) + ((o[0] << 8) | o[1]).toString(16) + ":" + ((o[2] << 8) | o[3]).toString(16);
    }
    const cift = s.split("::"); if (cift.length > 2) return null;
    const sol = cift[0] ? cift[0].split(":") : [], sag = cift.length === 2 && cift[1] ? cift[1].split(":") : [];
    let p;
    if (cift.length === 2) { const eksik = 8 - sol.length - sag.length; if (eksik < 1) return null; p = [...sol, ...Array(eksik).fill("0"), ...sag]; } else p = sol;
    if (p.length !== 8 || !p.every((x) => /^[0-9a-f]{1,4}$/.test(x))) return null;
    return p.map((x) => parseInt(x, 16));
  }
  /** IP adresi özel/yerel/ayrılmış mı? Çözümlenemeyen metin de "özel" sayılır (güvenli taraf). */
  function ozelIp(ip) {
    const s = String(ip ?? "").trim();
    const v4 = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (v4) { const o = v4.slice(1).map(Number); return o.some((x) => x > 255) || ozelV4(o[0], o[1]); }
    const p = v6Parcala(s); if (!p) return true;
    if (p.every((x) => x === 0) || (p.slice(0, 7).every((x) => x === 0) && p[7] === 1)) return true;   // :: ve ::1
    if ((p[0] & 0xfe00) === 0xfc00 || (p[0] & 0xffc0) === 0xfe80 || (p[0] & 0xff00) === 0xff00) return true;   // fc00::/7, fe80::/10, ff00::/8
    if (p[0] === 0x2001 && p[1] === 0x0db8) return true;
    if (p[0] === 0x0100 && p[1] === 0 && p[2] === 0 && p[3] === 0) return true;
    if (p.slice(0, 5).every((x) => x === 0) && (p[5] === 0xffff || p[5] === 0)) return ozelV4(p[6] >> 8, p[6] & 255);   // ::ffff:a.b.c.d ve ::a.b.c.d
    if (p[0] === 0x64 && p[1] === 0xff9b) return ozelV4(p[6] >> 8, p[6] & 255);   // NAT64
    if (p[0] === 0x2002) return ozelV4(p[1] >> 8, p[1] & 255);   // 6to4
    return false;
  }

  // ---------- düz metne indirgeme + Open Graph ----------
  const ADLI = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", middot: "·", copy: "©", laquo: "«", raquo: "»" };
  const KONTROL = new RegExp("[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF9-\uFFFC]", "g");
  function kodNokta(n) { return n > 0 && n <= 0x10FFFF && !(n >= 0xD800 && n <= 0xDFFF) ? String.fromCodePoint(n) : " "; }
  /** HTML parçasını düz metne indirger: etiket yok, kontrol/yön karakteri yok, boşluklar tek; en çok `maks` karakter (kesilirse …). */
  function duz(ham, maks) {
    let s = String(ham ?? "").replace(/<[^>]*>/g, " ");
    s = s.replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|([a-z]{2,8}));/gi, (m, d, x, ad) => (d ? kodNokta(+d) : x ? kodNokta(parseInt(x, 16)) : ADLI[ad.toLowerCase()] ?? m));
    s = s.replace(/[<>]/g, "").replace(KONTROL, " ").replace(/\s+/g, " ").trim();
    if (maks && s.length > maks) s = s.slice(0, maks - 1).trimEnd() + "…";
    return s;
  }
  function ogAyristir(html0, sayfaUrl) {
    let html = String(html0 ?? "");
    const k = html.search(/<\/head\s*>/i); html = k > 0 ? html.slice(0, k) : html.slice(0, 200000);
    html = html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, "");
    const meta = {};
    for (const m of html.matchAll(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
      const a = {};
      for (const x of m[0].matchAll(/([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) a[x[1].toLowerCase()] = x[2] ?? x[3] ?? x[4] ?? "";
      const ad = String(a.property || a.name || "").toLowerCase();
      if (ad && a.content != null && !(ad in meta)) meta[ad] = a.content;
    }
    const t = html.match(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/i);
    const baslik = duz(meta["og:title"] || meta["twitter:title"] || (t && t[1]) || "", 140);
    const aciklama = duz(meta["og:description"] || meta["twitter:description"] || meta["description"] || "", 200);
    let gorsel = "";
    const gh = meta["og:image:secure_url"] || meta["og:image"] || meta["twitter:image"] || meta["twitter:image:src"] || "";
    if (gh) { try { const g = new URL(duz(gh, 1000).replace(/\s/g, ""), sayfaUrl); if (g.protocol === "https:" && g.href.length <= MAKS_ADRES && !g.username && !g.password) gorsel = g.href; } catch { /* görselsiz */ } }
    let host = ""; try { host = new URL(sayfaUrl).hostname.replace(/^www\./, ""); } catch { /* boş */ }
    const site = duz(meta["og:site_name"] || host, 60) || host;
    const ot = String(meta["og:type"] || "").toLowerCase();
    return { baslik, aciklama, gorsel, site, tur: ot.startsWith("video") ? "video" : ot === "article" ? "makale" : "genel" };
  }

  // ---------- güvenli sayfa çekme ----------
  async function sinirliOku(r, azami) {
    if (!r.body || !r.body.getReader) { const s = await r.text(); return s.slice(0, azami); }
    const okur = r.body.getReader(), parcalar = []; let n = 0;
    for (;;) {
      const { done, value } = await okur.read(); if (done) break;
      parcalar.push(value); n += value.length;
      if (n >= azami) { try { await okur.cancel(); } catch { /* yok say */ } break; }
    }
    const b = new Uint8Array(Math.min(n, azami)); let o = 0;
    for (const p of parcalar) { const ek = p.subarray(0, Math.max(0, b.length - o)); b.set(ek, o); o += ek.length; }
    const cs = (String(r.headers.get("content-type") || "").match(/charset=["']?([\w-]+)/i) || [])[1] || "utf-8";
    try { return new TextDecoder(cs, { fatal: false }).decode(b); } catch { return new TextDecoder("utf-8", { fatal: false }).decode(b); }
  }
  /**
   * Yönlendirmeleri ELLE izleyerek (en çok 3) sayfayı çeker; her adımda söz dizimi + (varsa) DNS/IP denetimi yapılır.
   * Yalnız 200 + text/html; toplam süre `zamanAsimi` ms; en çok `azamiBayt` bayt okunur. Dönüş: { html, son } ya da null. Gövde asla dışarı verilmez.
   */
  async function sayfaCek(ham, { fetch: f = globalThis.fetch, dnsCoz = null, zamanAsimi = 5000, azamiBayt = 300 * 1024, yonlendirme = 3 } = {}) {
    const bitis = Date.now() + zamanAsimi; let adres = ham;
    for (let adim = 0; adim <= yonlendirme; adim++) {
      const g = adresDenetle(adres); if (!g.ok) return null;
      if (dnsCoz) {
        let ipler; try { ipler = await dnsCoz(g.host); } catch { return null; }
        if (Array.isArray(ipler) && (ipler.length === 0 || ipler.some(ozelIp))) return null;
      }
      const kalan = bitis - Date.now(); if (kalan <= 0) return null;
      const ctrl = new AbortController(), zt = setTimeout(() => ctrl.abort(), kalan);
      try {
        let r;
        try { r = await f(adres, { method: "GET", redirect: "manual", signal: ctrl.signal, headers: { "User-Agent": "OP-BaglantiOnizleme/1.0 (+https://onlypositive.org)", Accept: "text/html" } }); } catch { return null; }
        if ([301, 302, 303, 307, 308].includes(r.status)) {
          const loc = r.headers.get("location"); try { await r.body?.cancel?.(); } catch { /* yok say */ }
          if (!loc) return null;
          try { adres = new URL(loc, adres).href; } catch { return null; }
          continue;
        }
        if (r.status !== 200) { try { await r.body?.cancel?.(); } catch { /* yok say */ } return null; }
        if (!/^text\/html\b/i.test(r.headers.get("content-type") || "")) { try { await r.body?.cancel?.(); } catch { /* yok say */ } return null; }
        return { html: await sinirliOku(r, azamiBayt), son: adres };
      } catch { return null; } finally { clearTimeout(zt); }
    }
    return null;
  }

  // ---------- YouTube oEmbed ----------
  async function youtubeKarti(url, id, f) {
    const kart = { url, site: "YouTube", baslik: "", aciklama: "", gorsel: ytKapak(id), tur: "youtube", yt_id: id };
    const ctrl = new AbortController(), zt = setTimeout(() => ctrl.abort(), 4000);
    try {
      const r = await f(`https://www.youtube.com/oembed?url=${encodeURIComponent(ytAdres(id))}&format=json`, { signal: ctrl.signal, headers: { Accept: "application/json" } });
      if (r.ok) {
        const ham = (await r.text()).slice(0, 20000), j = JSON.parse(ham);
        kart.baslik = duz(j.title, 140); kart.aciklama = duz(j.author_name, 100);
        if (typeof j.thumbnail_url === "string" && new RegExp(`^https://i\\.ytimg\\.com/vi/${id}/[a-z0-9_]+\\.jpg$`, "i").test(j.thumbnail_url)) kart.gorsel = j.thumbnail_url;
      }
    } catch { /* yalnız kimlik + kapak */ } finally { clearTimeout(zt); }
    return kart;
  }

  /**
   * Bir bağlantı için kart verisi: { url, site, baslik, aciklama, gorsel, tur, yt_id? } ya da null.
   * denetle(metin) → { ok } verilirse başlık/açıklama/site POZİTİFLİK süzgecinden geçer; takılan alan boşaltılır (kart alan adıyla kalır; gönderi reddedilmez).
   * Genel sitelerde görsel TUTULMAZ (genelGorsel kapalı): CSP img-src genişletilmez, uzak görsel vekili bu turda yok.
   */
  async function onizle(ham, { fetch: f = globalThis.fetch, dnsCoz = null, denetle = null, genelGorsel = false } = {}) {
    const url = temizle(ham); if (!url) return null;
    const yt = ytKimlik(url); let k;
    if (yt) k = await youtubeKarti(url, yt, f);
    else {
      const s = await sayfaCek(url, { fetch: f, dnsCoz }); if (!s) return null;
      const og = ogAyristir(s.html, s.son);
      if (!og.baslik && !og.aciklama && !(genelGorsel && og.gorsel)) return null;
      k = { url, site: og.site, baslik: og.baslik, aciklama: og.aciklama, gorsel: genelGorsel ? og.gorsel : "", tur: og.tur };
    }
    if (denetle) for (const a of ["baslik", "aciklama", "site"]) if (k[a] && !denetle(k[a]).ok) k[a] = "";
    if (!k.site) { try { k.site = new URL(url).hostname.replace(/^www\./, ""); } catch { k.site = ""; } }
    return k;
  }

  /** Güvenilmeyen kart nesnesini (veritabanı/ağ) arayüz için temizler: yalnız http(s) adres, görsel yalnız YouTube kapağı; geçersizse null. */
  function kartTemizle(o) {
    if (!o || typeof o !== "object") return null;
    const url = temizle(o.url); if (!url) return null;
    const yt = o.tur === "youtube" ? (YT_ID.test(String(o.yt_id || "")) ? String(o.yt_id) : ytKimlik(url)) : null;
    if (o.tur === "youtube" && !yt) return null;
    const tur = yt ? "youtube" : ["video", "makale"].includes(o.tur) ? o.tur : "genel";
    return { url, site: duz(o.site, 60), baslik: duz(o.baslik, 140), aciklama: duz(o.aciklama, 200), tur, ...(yt ? { yt_id: yt, gorsel: ytKapak(yt) } : { gorsel: "" }) };
  }

  const API = { IZLEME, temizle, ytKimlik, ytAdres, ytKapak, ytGomme, bul, ilkBaglanti, kisalt, bagla, alanAdiGecerli, adresDenetle, ozelIp, duz, ogAyristir, sayfaCek, onizle, kartTemizle };
  if (typeof module === "object" && module && module.exports) module.exports = API;
  kok.OP_BAGLANTI = API;
})(typeof globalThis !== "undefined" ? globalThis : this);
