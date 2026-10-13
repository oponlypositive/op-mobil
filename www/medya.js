// OP medya adaptörü (istemci): video + poster seçme/denetleme/yükleme/silme TEK yerden. Depolama katmanını soyutlar:
//   OP_YAPI.medya = "yerel"    → server.js  POST /api/medya (yerel deneme; arkaUc "yerel" iken varsayılan)
//   OP_YAPI.medya = "supabase" → Supabase Storage `video` kovası, XHR ile (yükleme yüzdesi + iptal). arkaUc "supabase" iken VARSAYILAN, CANLI
//   OP_YAPI.medya = "r2"       → Cloudflare R2, imzalı PUT (TASLAK, KAPALI: sunucuda `medya-imza` fonksiyonu yok; canlı varsayılmaz — bulut/MIMARI.md "Video / R2 geçişi")
// Seçim yapilandirma.js'ten gelir (yayın derlemesi OP_MEDYA ortam değişkeniyle yazar). Sunucu karşılığı: bulut/functions/_shared/medya.ts (aynı adaptör fikri).
// Hata sözleşmesi: Error + e.kod ∈ tur | buyuk | uzun | acilamaz | ag | iptal | yetki | yukleme | r2_kapali; iletiyi arayüz (app.js) kodundan üretir.
(() => {
  "use strict";
  const YAPI = window.OP_YAPI || {};
  const SINIR = { bayt: 40 * 1024 * 1024, sureSn: 60, posterBayt: 400 * 1024, turler: ["video/mp4", "video/quicktime", "video/webm"] };
  const UZANTI = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "image/jpeg": "jpg" };
  const UZ_TUR = { mp4: "video/mp4", m4v: "video/mp4", mov: "video/quicktime", webm: "video/webm" };
  const ARKA = YAPI.medya || (YAPI.arkaUc === "supabase" ? "supabase" : "yerel");
  const hata = (kod, ek) => Object.assign(new Error(kod), { kod }, ek);
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16)));

  /** Dosyanın video MIME türü (tarayıcı türü boşsa uzantıdan); desteklenmiyorsa "" */
  function turBul(d) {
    if (SINIR.turler.includes(d.type)) return d.type;
    const m = /\.([a-z0-9]+)$/i.exec(d.name || "");
    return (m && UZ_TUR[m[1].toLowerCase()]) || "";
  }
  const olay = (v, ad, ms) => new Promise((coz, red) => {
    const z = setTimeout(() => red(hata("acilamaz")), ms);
    v.addEventListener(ad, () => { clearTimeout(z); coz(); }, { once: true });
    v.addEventListener("error", () => { clearTimeout(z); red(hata("acilamaz")); }, { once: true });
  });
  const jpegBlob = (cv, kalite) => new Promise((coz) => cv.toBlob(coz, "image/jpeg", kalite));

  /** Seçilen dosyayı tarayıcıda denetler ve küçük resim üretir: { tur, sure_sn, en, boy, boyut, poster: Blob }. Aşım/sorunda hata(kod) fırlatır. */
  async function incele(dosya) {
    const tur = turBul(dosya);
    if (!tur) throw hata("tur");
    if (dosya.size > SINIR.bayt) throw hata("buyuk");
    if (!(dosya.size > 0)) throw hata("acilamaz");
    const url = URL.createObjectURL(dosya);
    try {
      const v = document.createElement("video");
      v.muted = true; v.playsInline = true; v.preload = "auto"; v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
      const hazir = olay(v, "loadedmetadata", 20000);
      v.src = url;
      await hazir;
      const sure = v.duration;
      if (!Number.isFinite(sure) || sure <= 0 || !v.videoWidth || !v.videoHeight) throw hata("acilamaz");   // çözülemeyen biçim (ör. HEVC) çoğu zaman burada yakalanır
      if (sure > SINIR.sureSn + 0.5) throw hata("uzun");
      const t = Math.min(1, sure / 2);
      const kare = olay(v, "seeked", 8000).catch(() => null);
      v.currentTime = t;
      await kare;
      if (v.readyState < 2) await olay(v, "loadeddata", 5000).catch(() => null);
      const o = Math.min(1, 720 / Math.max(v.videoWidth, v.videoHeight));
      const cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(v.videoWidth * o)); cv.height = Math.max(1, Math.round(v.videoHeight * o));
      try { cv.getContext("2d").drawImage(v, 0, 0, cv.width, cv.height); } catch { throw hata("acilamaz"); }
      let poster = null;
      for (const q of [0.82, 0.7, 0.55, 0.4]) { poster = await jpegBlob(cv, q); if (poster && poster.size <= SINIR.posterBayt) break; }
      if (!poster || poster.size > SINIR.posterBayt) throw hata("acilamaz");
      return { tur, sure_sn: Math.max(1, Math.round(sure * 10) / 10), en: v.videoWidth, boy: v.videoHeight, boyut: dosya.size, poster };
    } finally { URL.revokeObjectURL(url); }
  }

  function xhrGonder(yontem, url, basliklar, govde, ilerleme, sinyal) {
    return new Promise((coz, red) => {
      if (sinyal?.aborted) return red(hata("iptal"));
      const x = new XMLHttpRequest();
      x.open(yontem, url);
      for (const [k, v] of Object.entries(basliklar || {})) x.setRequestHeader(k, v);
      if (ilerleme && x.upload) x.upload.onprogress = (e) => { if (e.lengthComputable && e.total) ilerleme(e.loaded / e.total); };
      x.onload = () => coz({ durum: x.status, metin: x.responseText });
      x.onerror = () => red(hata("ag"));
      x.ontimeout = () => red(hata("ag"));
      x.onabort = () => red(hata("iptal"));
      sinyal?.addEventListener("abort", () => x.abort(), { once: true });
      x.timeout = 0;
      x.send(govde);
    });
  }
  const durumHatasi = (d) => hata(d === 413 ? "buyuk" : d === 415 ? "tur" : d === 401 || d === 403 || d === 429 ? "yetki" : "yukleme", { durum: d });

  // ---- arka uçlar. Hepsi: yukle(blob, { amac: "video"|"poster", ilerleme(0..1), sinyal, kimlik }) → { yol };  url(yol);  sil(yollar, kimlik)
  const ARKA_UCLAR = {
    yerel: {
      async yukle(blob, { amac, ilerleme, sinyal, kimlik }) {
        const q = new URLSearchParams({ tur: amac, ben: kimlik.handle || "" });
        const r = await xhrGonder("POST", `/api/medya?${q}`, { "Content-Type": blob.type, "X-OP-Cihaz": kimlik.cihaz || "" }, blob, ilerleme, sinyal);
        if (r.durum < 200 || r.durum >= 300) throw durumHatasi(r.durum);
        const v = JSON.parse(r.metin || "{}");
        if (!v.yol) throw hata("yukleme");
        return { yol: v.yol };
      },
      url: (yol) => `/uvideo/${encodeURI(yol)}`,
      async sil(yollar, kimlik) {
        await fetch(`/api/medya?ben=${encodeURIComponent(kimlik.handle || "")}`, { method: "DELETE", headers: { "Content-Type": "application/json", "X-OP-Cihaz": kimlik.cihaz || "" },
          body: JSON.stringify({ yollar }) }).catch(() => {});
      },
    },
    supabase: {
      async yukle(blob, { amac, ilerleme, sinyal, kimlik }) {
        const yol = `${kimlik.uid}/${uuid()}.${UZANTI[blob.type]}`;
        const fd = new FormData();   // supabase-js storage-js ile aynı gövde: cacheControl + boş adlı dosya parçası
        fd.append("cacheControl", "31536000");
        fd.append("", blob);
        const r = await xhrGonder("POST", `${YAPI.supabaseUrl}/storage/v1/object/video/${yol}`,
          { apikey: YAPI.supabaseAnahtar, Authorization: `Bearer ${kimlik.jeton}`, "x-upsert": "false" }, fd, ilerleme, sinyal);
        if (r.durum < 200 || r.durum >= 300) throw durumHatasi(r.durum);
        return { yol };
      },
      url: (yol) => `${YAPI.supabaseUrl}/storage/v1/object/public/video/${encodeURI(yol)}`,
      async sil(yollar, kimlik) {
        await fetch(`${YAPI.supabaseUrl}/storage/v1/object/video`, { method: "DELETE", headers: { apikey: YAPI.supabaseAnahtar, Authorization: `Bearer ${kimlik.jeton}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prefixes: yollar }) }).catch(() => {});
      },
    },
    r2: {   // TASLAK (KAPALI): sunucuda `medya-imza` Edge Function'ı (imzalı PUT adresi üretir) yazılıp YAPI.medya="r2" seçilince çalışır; şimdilik her çağrı r2_kapali verir.
      async yukle(blob, { amac, ilerleme, sinyal, kimlik }) {
        if (!YAPI.medyaImzaFonksiyonu) throw hata("r2_kapali");
        const imza = await fetch(`${YAPI.supabaseUrl}/functions/v1/${YAPI.medyaImzaFonksiyonu}`, { method: "POST", headers: { apikey: YAPI.supabaseAnahtar,
          Authorization: `Bearer ${kimlik.jeton}`, "Content-Type": "application/json" }, body: JSON.stringify({ amac, tur: blob.type, boyut: blob.size }) }).then((r) => (r.ok ? r.json() : null));
        if (!imza?.putUrl || !imza.yol) throw hata("r2_kapali");
        const r = await xhrGonder("PUT", imza.putUrl, { "Content-Type": blob.type }, blob, ilerleme, sinyal);
        if (r.durum < 200 || r.durum >= 300) throw durumHatasi(r.durum);
        return { yol: imza.yol };
      },
      url: (yol) => `${String(YAPI.medyaGenelUrl || "").replace(/\/$/, "")}/${encodeURI(yol)}`,
      async sil() { /* sunucu tarafı (gonderi-sil) siler; istemci yarım yüklemeyi R2'den silemez → yetim_videolar benzeri temizlik */ },
    },
  };
  const arka = ARKA_UCLAR[ARKA] || ARKA_UCLAR.yerel;

  window.OP_MEDYA = {
    SINIR, arkaUc: ARKA, incele,
    yukle: (blob, o) => arka.yukle(new Blob([blob], { type: o.amac === "poster" ? "image/jpeg" : (o.tur || blob.type) }), o),   // tür açıkça verilir (seçilen dosyanın türü boş olabilir)
    url: (yol) => (yol ? arka.url(yol) : ""),
    sil: (yollar, kimlik) => arka.sil(yollar.filter(Boolean), kimlik),
  };
})();
