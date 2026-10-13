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

  // ---- kapsayıcı (mp4/mov) üst verisi: süre ve boyut dosyanın kendisinden okunur; tarayıcının videoyu ÇÖZMESİNE gerek kalmaz.
  // iPhone'da (Safari/Chrome, özellikle düşük güç modunda) gizli <video> meta veri ve kare vermeyebiliyor → sağlam video "açılamıyor" diye reddediliyordu (2026-10-13).
  const oku = async (dosya, bas, uzunluk) => new DataView(await dosya.slice(bas, bas + uzunluk).arrayBuffer());
  const dort = (dv, o) => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
  /** -> { sure, en, boy } | null (moov bulunamazsa ya da biçim beklenmedikse) */
  async function kapsayiciOku(dosya) {
    try {
      let konum = 0, moov = null;
      for (let i = 0; i < 64 && konum + 8 <= dosya.size; i++) {            // üst düzey kutular: ftyp, mdat, moov, ...
        const b = await oku(dosya, konum, Math.min(16, dosya.size - konum));
        let boyut = b.getUint32(0); const ad = dort(b, 4); let baslik = 8;
        if (boyut === 1) { boyut = b.getUint32(8) * 4294967296 + b.getUint32(12); baslik = 16; }
        else if (boyut === 0) boyut = dosya.size - konum;
        if (boyut < baslik) return null;
        if (ad === "moov") { if (boyut > 8 * 1024 * 1024) return null; moov = await oku(dosya, konum + baslik, boyut - baslik); break; }
        konum += boyut;
      }
      if (!moov) return null;
      let sure = 0, en = 0, boy = 0;
      const gez = (bas, son, derinlik) => {
        let o = bas;
        while (o + 8 <= son) {
          const boyut = moov.getUint32(o), ad = dort(moov, o + 4);
          if (boyut < 8 || o + boyut > son) break;
          const g = o + 8;
          if (ad === "mvhd") {
            const s1 = moov.getUint8(g) === 1;
            const olcek = moov.getUint32(g + (s1 ? 20 : 12));
            const d = s1 ? moov.getUint32(g + 24) * 4294967296 + moov.getUint32(g + 28) : moov.getUint32(g + 16);
            if (olcek > 0) sure = d / olcek;
          } else if (ad === "tkhd") {
            const s1 = moov.getUint8(g) === 1, m = g + (s1 ? 52 : 40);     // 3x3 dönüşüm matrisi, ardından genişlik/yükseklik (16.16)
            const w = moov.getUint32(m + 36) / 65536, h = moov.getUint32(m + 40) / 65536;
            if (w > 0 && h > 0 && !en) {
              const a = moov.getInt32(m), bb = moov.getInt32(m + 4);
              const dik = a === 0 && bb !== 0;                               // 90°/270° döndürülmüş (dikey çekim): boyutlar yer değiştirir
              en = Math.round(dik ? h : w); boy = Math.round(dik ? w : h);
            }
          } else if (ad === "trak" && derinlik < 3) gez(g, o + boyut, derinlik + 1);
          o += boyut;
        }
      };
      gez(0, moov.byteLength, 0);
      return sure > 0 && en > 0 && boy > 0 ? { sure, en, boy } : null;
    } catch { return null; }
  }

  /** <video> ile en iyi çabayla: { sure, en, boy, cv (kare çizildiyse) }. Olmazsa boş alanlar; ASLA fırlatmaz. */
  async function tarayiciyaSor(dosya, bilinen) {
    const url = URL.createObjectURL(dosya);
    const v = document.createElement("video");
    v.muted = true; v.defaultMuted = true; v.playsInline = true; v.preload = "auto"; v.setAttribute("playsinline", ""); v.setAttribute("webkit-playsinline", ""); v.setAttribute("muted", "");
    v.style.cssText = "position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none";
    const bekle = (ms) => new Promise((c) => setTimeout(c, ms));
    const durt = async () => { try { await v.play(); } catch { /* engellenebilir */ } };
    const s = { sure: 0, en: 0, boy: 0, cv: null, asama: "bas" };
    try {
      (document.body || document.documentElement).appendChild(v);
      const hazir = olay(v, "loadedmetadata", bilinen ? 3500 : 20000).then(() => true, () => false);
      v.src = url;
      try { v.load(); } catch { /* yok */ }
      const z = setTimeout(durt, 1200);
      const metaGeldi = await hazir; clearTimeout(z);
      s.asama = metaGeldi ? "meta" : "metayok";
      for (let i = 0; i < 20 && metaGeldi && !(Number.isFinite(v.duration) && v.duration > 0); i++) await bekle(100);
      if (Number.isFinite(v.duration) && v.duration > 0) s.sure = v.duration;
      if (v.readyState < 2 || !v.videoWidth) { await durt(); for (let i = 0; i < 30 && (v.readyState < 2 || !v.videoWidth); i++) await bekle(100); }
      try { v.pause(); } catch { /* yok */ }
      s.en = v.videoWidth || 0; s.boy = v.videoHeight || 0;
      if (s.en && s.boy) {
        s.asama = "boyut";
        const sure = s.sure || (bilinen ? bilinen.sure : 0), t = Math.min(1, sure / 2);
        if (sure && Math.abs(v.currentTime - t) > 0.05) { const kare = olay(v, "seeked", 5000).catch(() => null); try { v.currentTime = t; } catch { /* yok */ } await kare; }
        if (v.readyState < 2) await olay(v, "loadeddata", 3000).catch(() => null);
        const o = Math.min(1, 720 / Math.max(s.en, s.boy));
        const cv = document.createElement("canvas");
        cv.width = Math.max(1, Math.round(s.en * o)); cv.height = Math.max(1, Math.round(s.boy * o));
        try { cv.getContext("2d").drawImage(v, 0, 0, cv.width, cv.height); s.cv = cv; s.asama = "kare"; } catch { /* kare yok */ }
      }
    } catch { /* en iyi çaba */ }
    finally { try { v.pause(); v.removeAttribute("src"); v.load(); v.remove(); } catch { /* yok */ } URL.revokeObjectURL(url); }
    return s;
  }

  /** Seçilen dosyayı tarayıcıda denetler ve küçük resim üretir: { tur, sure_sn, en, boy, boyut, poster: Blob }. Aşım/sorunda hata(kod) fırlatır. */
  async function incele(dosya) {
    const tur = turBul(dosya);
    if (!tur) throw hata("tur");
    if (dosya.size > SINIR.bayt) throw hata("buyuk");
    if (!(dosya.size > 0)) throw hata("acilamaz", { asama: "bos" });
    const k = tur === "video/webm" ? null : await kapsayiciOku(dosya);     // mp4/mov: süre ve boyut dosyadan
    if (k && k.sure > SINIR.sureSn + 0.5) throw hata("uzun");
    const b = await tarayiciyaSor(dosya, k);
    const sure = (k && k.sure) || b.sure, en = b.en || (k ? k.en : 0), boy = b.boy || (k ? k.boy : 0);
    if (!(sure > 0) || !en || !boy) throw hata("acilamaz", { asama: (k ? "k1" : "k0") + "-" + b.asama });   // ne dosyadan ne tarayıcıdan okunabildi
    if (sure > SINIR.sureSn + 0.5) throw hata("uzun");
    let cv = b.cv;
    if (!cv) {                                                             // kare alınamadı (iPhone düşük güç modu vb.): düz koyu kapak; video yine yüklenir
      const o = Math.min(1, 720 / Math.max(en, boy));
      cv = document.createElement("canvas");
      cv.width = Math.max(1, Math.round(en * o)); cv.height = Math.max(1, Math.round(boy * o));
      const c2 = cv.getContext("2d");
      c2.fillStyle = "#14262C"; c2.fillRect(0, 0, cv.width, cv.height);
      c2.fillStyle = "#E7C873"; const r = Math.min(cv.width, cv.height) / 9, cx = cv.width / 2, cy = cv.height / 2;
      c2.beginPath(); c2.moveTo(cx - r * 0.7, cy - r); c2.lineTo(cx + r, cy); c2.lineTo(cx - r * 0.7, cy + r); c2.closePath(); c2.fill();
    }
    let poster = null;
    for (const q of [0.82, 0.7, 0.55, 0.4]) { poster = await jpegBlob(cv, q); if (poster && poster.size <= SINIR.posterBayt) break; }
    if (!poster || poster.size > SINIR.posterBayt) throw hata("acilamaz", { asama: "kapak" });
    return { tur, sure_sn: Math.max(1, Math.round(sure * 10) / 10), en, boy, boyut: dosya.size, poster };
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
