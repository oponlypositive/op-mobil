// OP istemci uyarlayıcısı (Supabase arka ucu). TEK KAYNAK: public/bulut/op-api.js (eski bulut/istemci/ kopyası kaldırıldı).
// app.js'teki `api(yol, govde, yontem)` çağrılarının YERİNE geçer (yalnız OP_YAPI.arkaUc === "supabase" iken yüklenir):
// AYNI yol dizgilerini (/api/akis, /api/oge/:id/begen …) ve AYNI dönüş biçimlerini korur; içeride supabase-js çağrıları vardır.
// Hata sözleşmesi: hata → `Error(mesaj)` + `e.durum` (HTTP benzeri) + `e.filtre` (çift filtre takıldıysa true) + `e.bekleSn` (hız sınırı).
// supabase-js: public/vendor/supabase.umd.js (sabit sürüm, kendi sitemizden); app.js bu dosyayı import etmeden ÖNCE <script> ile yükler
// ve `globalThis.supabase` olarak bulunur. Ayrıntı: ../../bulut/MIMARI.md bölüm 7.
import { denetle } from "./moderasyon.mjs";

const YAPI = globalThis.OP_YAPI || {};
const AYAR = { url: YAPI.supabaseUrl || "", anahtar: YAPI.supabaseAnahtar || "", site: YAPI.site || "" };
if (!AYAR.url || !AYAR.anahtar) console.error("OP_YAPI.supabaseUrl / supabaseAnahtar tanımlı değil (yapilandirma.js)");
if (!globalThis.supabase?.createClient) console.error("supabase-js yüklenmedi (vendor/supabase.umd.js)");
export const sb = globalThis.supabase.createClient(AYAR.url || "http://localhost", AYAR.anahtar || "yok", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
});
const SITE = () => (AYAR.site || location.origin).replace(/\/$/, "");
// Mağaza uygulamasında (Capacitor) e-posta bağlantıları site yerine uygulamanın özel adresine döner (org.onlypositive.app://…); web davranışı aynı kalır.
const NATIF = YAPI.platform === "ios" || YAPI.platform === "android";
const DONUS_UYG = "org.onlypositive.app://";
const DONUS = (uygulama, web) => (NATIF ? DONUS_UYG + uygulama : web);

// ---- dil: app.js `localStorage["op-dil"]` (JSON) kullanır
const dil = () => {
  try { const v = JSON.parse(localStorage.getItem("op-dil")); if (v === "tr" || v === "en") return v; } catch { /* yok say */ }
  return (navigator.language || "tr").startsWith("tr") ? "tr" : "en";
};

// ---- hata iletileri (TR/EN). Anahtar = sunucu/RPC kodu ya da sunucunun Türkçe iletisi.
const M = {
  giris_gerek: ["Önce giriş yapman gerekiyor.", "Please sign in first."],
  bulunamadi: ["Bulunamadı", "Not found"],
  olmadi: ["Olmadı", "That didn't work"],
  cok_hizli: ["Biraz hızlısın ☁️ Birazdan tekrar dener misin?", "You're a bit fast ☁️ Please try again in a moment."],
  genel: ["Bir şeyler ters gitti, tekrar dener misin?", "Something went wrong, please try again."],
  ag: ["Bağlantı yok gibi görünüyor, tekrar dener misin?", "You seem to be offline, please try again."],
  foto_jpeg: ["Fotoğraf JPEG olmalı.", "The photo must be a JPEG."],
  foto_yuklenemedi: ["Fotoğraf yüklenemedi, tekrar dener misin?", "The photo couldn't be uploaded, please try again."],
  foto_buyuk: ["Fotoğraf çok büyük (en çok 700 KB).", "The photo is too large (700 KB max)."],
  yas: ["OP yalnız 18 yaş ve üzeri içindir. Devam etmek için yaşını onaylaman gerekiyor.", "OP is for people aged 18 and over. Please confirm your age to continue."],
  kosul: ["Devam etmek için kullanım koşullarını ve gizlilik metnini kabul etmelisin.", "Please accept the Terms of Use and the Privacy Policy to continue."],
  sifre: ["Şifre en az 8 karakter olmalı.", "Your password must be at least 8 characters."],
  eposta_dogrula: ["E-postanı doğrulaman gerekiyor. Gelen kutunu (ve spam klasörünü) kontrol eder misin?", "You need to confirm your email. Please check your inbox (and spam folder)."],
  giris_hatali: ["E-posta ya da şifre hatalı.", "Incorrect email or password."],
  zaten_var: ["Bu e-posta ile zaten bir hesap var. Giriş yapmayı dener misin?", "An account with this email already exists. Try signing in."],
  hiz_auth: ["Biraz hızlısın ☁️ Birazdan tekrar dener misin?", "You're a bit fast ☁️ Please try again in a moment."],
  captcha: ["Doğrulama tamamlanamadı, tekrar dener misin?", "Verification couldn't be completed, please try again."],
  eposta_gonderilemedi: ["E-posta şu an gönderilemiyor (e-posta servisi henüz hazır olmayabilir). Biraz sonra tekrar dene ya da op.onlypositive@gmail.com adresine yaz.",
    "We can't send emails right now (the email service may not be ready yet). Try again later or write to op.onlypositive@gmail.com."],
  eposta_gecersiz: ["E-postanı kontrol eder misin? 🙂", "Please check your email 🙂"],
  oturum_yok: ["Oturum süresi doldu, yeniden giriş yapar mısın?", "Your session has expired, please sign in again."],
};
// Sunucunun (Edge Function) Türkçe iletileri → EN karşılık (tam eşleşme); eşleşmeyen sunucu iletisi olduğu gibi gösterilir.
const SUNUCU_EN = {
  "Adını yazar mısın?": "Please enter your name.", "Bir neden seçer misin?": "Please pick a reason.", "Bir şey yaz.": "Write something.",
  "Boş paylaşım olmaz.": "A post can't be empty.", "Alıntıya bir şey yaz ya da medya ekle.": "Add a comment or media to your quote.", "Alıntılanan gönderi geçersiz.": "The post you're quoting isn't available.", "Fotoğraf bulunamadı, tekrar yükler misin?": "We couldn't find the photo, please upload it again.",
  "Fotoğraf geçersiz.": "The photo isn't valid.", "Video geçersiz.": "The video isn't valid.", "Video bulunamadı, tekrar yükler misin?": "We couldn't find the video, please upload it again.",
  "Video çok büyük (en çok 40 MB).": "The video is too large (40 MB max).", "Video en çok 60 sn olabilir.": "A video can be 60 seconds at most.", "Bir gönderide fotoğraf ya da video olur.": "A post can have a photo or a video, not both.", "Kendi içeriğini şikâyet edemezsin.": "You can't report your own content.",
  "Kullanıcı adı 3-20 harf/rakam/_ olmalı.": "Your username must be 3-20 letters, numbers or _.",
  "Bu kullanıcı adı alınmış, başka bir tane dener misin?": "That username is taken, would you try another one?",
  "Silmeyi onaylaman gerekiyor.": "Please confirm the deletion.", "Bulunamadı": "Not found",
  "Düzenleme süresi doldu.": "The editing time is over.", "Haber gönderileri düzenlenemez.": "News posts can't be edited.",
  "Yalnız kendi gönderini düzenleyebilirsin.": "You can only edit your own posts.", "Haber gönderileri silinemez.": "News posts can't be deleted.",
  "Yalnız kendi içeriğini silebilirsin.": "You can only delete your own content.", "Silme isteği geçersiz.": "That delete request isn't valid.", "Şikâyet geçersiz.": "That report isn't valid.",
  "Bu hesap adına işlem yapılamaz.": "This account can't be used for that.", "Bu hesap silinemez.": "This account can't be deleted.",
  "Önce giriş yap.": "Please sign in first.", "Oturum geçersiz, yeniden giriş yap.": "Your session is invalid, please sign in again.",
  "Önce e-postanı doğrula.": "Please confirm your email first.", "Önce profil oluştur.": "Please create your profile first.",
  "Önce 18+ ve koşul onayını ver.": "Please confirm you're 18+ and accept the terms first.",
  "Hesabın askıya alınmış. op.onlypositive@gmail.com adresine yazabilirsin.": "Your account is suspended. You can write to op.onlypositive@gmail.com.",
  "Bu cümle biraz bulutlu görünüyor 🌥️ Daha nazik bir dille tekrar yazar mısın?": "That sounds a bit cloudy 🌥️ Could you say it in a kinder way?",
  "Bu biraz siyasete kayıyor ☁️ OP'de siyaset konuşmuyoruz; içindeki güzel anı anlatmaya ne dersin?": "That's drifting toward politics ☁️ We don't talk politics on OP; how about sharing the nice moment inside it?",
  "OP'de inanç konularını herkesin kendine bırakıyoruz 🌿 Paylaşımını bu kısım olmadan dener misin?": "On OP we leave matters of belief to everyone's own heart 🌿 Could you try without that part?",
  "OP'de herkes sadece insan 🤗 Kimlik vurgusu olmadan paylaşmayı dener misin?": "On OP everyone is simply a person 🤗 Could you share without emphasising identity?",
  "Bu konu biraz ağır geldi ☁️ OP'de sadece iyi haberler var; içindeki umut veren tarafı anlatır mısın?": "That feels a little heavy ☁️ OP is only good news; could you share the hopeful side of it?",
};
const ileti = (k) => (M[k] || M.genel)[dil() === "en" ? 1 : 0];
function hataYap(mesaj, durum = 400, filtre = false, bekleSn = 0) { const e = new Error(mesaj || ileti("genel")); e.durum = durum; e.filtre = filtre; e.bekleSn = bekleSn; return e; }
const DURUM = { giris_gerek: 401, bulunamadi: 404, olmadi: 400, cok_hizli: 429 };
function rpcHatasi(error) {
  const kod = String(error?.message || "").trim();
  if (M[kod] && DURUM[kod]) return hataYap(ileti(kod), DURUM[kod]);
  if (kod === "eposta_gecersiz") return hataYap(ileti(kod), 400);
  if (/Failed to fetch|NetworkError|Load failed/i.test(kod)) return hataYap(ileti("ag"), 0);
  return hataYap(ileti("genel"), 500);
}
const bekleMetni = (sn) => {   // hız sınırı bekleme süresi
  const dk = Math.ceil(sn / 60);
  return dil() === "en" ? ` (about ${dk >= 60 ? Math.ceil(dk / 60) + " h" : dk + " min"})` : ` (yaklaşık ${dk >= 60 ? Math.ceil(dk / 60) + " saat" : dk + " dk"})`;
};
async function fonksiyonHatasi(error) {   // FunctionsHttpError: gövde { hata, filtre, bekleSn }
  const r = error?.context;
  if (r && typeof r.json === "function") {
    const v = await r.json().catch(() => ({}));
    const durum = r.status || 500;
    let mesaj = v.hata || ileti("genel");
    if (dil() === "en" && SUNUCU_EN[mesaj]) mesaj = SUNUCU_EN[mesaj];
    if (durum === 429) mesaj = ileti("cok_hizli") + (v.bekleSn ? bekleMetni(v.bekleSn) : "");
    return hataYap(mesaj, durum, !!v.filtre, Number(v.bekleSn) || 0);
  }
  return hataYap(ileti("ag"), 0);
}
async function rpc(ad, parametre) {
  const { data, error } = await sb.rpc(ad, parametre);
  if (error) throw rpcHatasi(error);
  return data;
}
async function fonksiyon(ad, govde) {
  const { data, error } = await sb.functions.invoke(ad, { body: govde });
  if (error) throw await fonksiyonHatasi(error);
  return data;
}

// ---- çıktı düzeltme: Storage yollarını tam URL'ye çevir (yerel sunucu /foto/… ve /haberfoto/… yolları veriyordu)
const depoUrl = (kova, yol) => `${AYAR.url}/storage/v1/object/public/${kova}/${encodeURI(yol)}`;
const medyaUrl = (yol) => (globalThis.OP_MEDYA ? globalThis.OP_MEDYA.url(yol) : depoUrl("video", yol));   // video + poster: medya adaptörü (public/medya.js) hangi depodaysa oradan
export function ogeDuzelt(o) {
  if (!o) return o;
  if (o.foto && !/^https?:/i.test(o.foto)) o.foto = depoUrl("foto", o.foto);
  if (o.video && !o.video.url) {   // depo biçimi { yol, poster_yol, sure_sn, en, boy, boyut, tur } → istemcinin ortak video biçimi { url, poster, sure_sn, … } (haber videosuyla aynı)
    const v = o.video;
    o.video = v.yol ? { ...v, url: medyaUrl(v.yol), poster: v.poster_yol ? medyaUrl(v.poster_yol) : "" } : null;
  }
  if (o.gorsel && o.gorsel.dosya) o.gorsel = { ...o.gorsel, url: depoUrl("haber-foto", o.gorsel.dosya) };
  if (o.alinti && !o.alinti.yok) ogeDuzelt(o.alinti);   // alıntı kartı (gecis-008): aynı yol → URL çevirisi
  return o;
}
const ogeleriDuzelt = (v) => { if (v?.ogeler) v.ogeler.forEach(ogeDuzelt); if (v?.gonderiler) v.gonderiler.forEach(ogeDuzelt); if (v?.oge) ogeDuzelt(v.oge); if (v?.gonderi) ogeDuzelt(v.gonderi); return v; };

// ---- fotoğraf yükleme (data URL → Storage `foto/<uid>/<uuid>.jpg`; istemcide zaten ≤1080 px JPEG ve ≤700 KB)
export const FOTO_BAYT_SINIRI = 700 * 1024;
async function fotoYukle(dataUrl) {
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || "");
  if (!m) throw hataYap(ileti("foto_jpeg"), 400);
  const bin = atob(m[1]); const bayt = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bayt[i] = bin.charCodeAt(i);
  if (bayt.length > FOTO_BAYT_SINIRI) throw hataYap(ileti("foto_buyuk"), 413);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) throw hataYap(ileti("giris_gerek"), 401);
  const yol = `${session.user.id}/${crypto.randomUUID()}.jpg`;
  const { error } = await sb.storage.from("foto").upload(yol, new Blob([bayt], { type: "image/jpeg" }), { contentType: "image/jpeg", upsert: false });
  if (error) throw hataYap(ileti("foto_yuklenemedi"), 400);
  return yol;
}

// ---- ANA UYARLAYICI: api("/api/…", govde, yontem) → yerel sunucunun JSON'u
export async function api(yol, govde, yontem) {
  const url = new URL(yol, "http://x"), p = url.pathname, q = url.searchParams, d = dil();
  const m = yontem || (govde ? "POST" : "GET");
  let r;

  if (m === "GET" && p === "/api/saglik") return rpc("saglik");

  if (m === "POST" && p === "/api/kullanici") {   // profil oluştur / güncelle (kimlik = oturum)
    const b = govde || {};
    return fonksiyon("profil-kaydet", { handle: b.handle, ad: b.ad, bio: b.bio, avatar: b.avatar, renk: b.renk, sehir: b.sehir, dil: b.dil || d,
      yasOnay: b.yasOnay === true, kosulOnay: b.kosulOnay === true, kosulSurumu: b.kosulSurumu });
  }
  if (m === "GET" && (r = p.match(/^\/api\/kullanici\/([a-z0-9_]+)$/))) {
    const v = await rpc("profil", { p_handle: r[1], p_dil: d });
    if (!v) throw hataYap(ileti("bulunamadi"), 404);
    return ogeleriDuzelt(v);
  }
  if (m === "POST" && (r = p.match(/^\/api\/kullanici\/([a-z0-9_]+)\/takip$/))) return rpc("takip_degistir", { p_handle: r[1] });
  if (m === "POST" && (r = p.match(/^\/api\/engelle\/([a-z0-9_]+)$/))) return rpc("engelle_degistir", { p_handle: r[1] });
  if (m === "GET" && p === "/api/engellenenler") return rpc("engellenenler", { p_dil: d });

  if (m === "GET" && p === "/api/akis") {
    return ogeleriDuzelt(await rpc("akis", { p_sekme: q.get("sekme") || "senin", p_sehir: q.get("sehir") || "", p_kategori: q.get("kategori") || "", p_dil: d }));
  }
  if (m === "GET" && p === "/api/kategoriler") return rpc("kategori_sayilari");
  if (m === "GET" && p === "/api/onerilen") return ogeleriDuzelt(await rpc("onerilen", { p_dil: d, p_tum: q.get("tum") === "1" }));   // gecis-005-onerilen.sql; yoksa istemci kutuyu gizler

  if (m === "POST" && p === "/api/gonderi") {
    const b = govde || {};
    let fotoYol = null;
    if (b.foto) fotoYol = await fotoYukle(b.foto);
    const video = b.video ? { yol: b.video.yol, posterYol: b.video.posterYol, sure_sn: b.video.sure_sn, en: b.video.en, boy: b.video.boy } : undefined;   // video + poster app.js'te medya adaptörüyle ZATEN yüklendi
    try { return ogeleriDuzelt(await fonksiyon("gonderi-olustur", { metin: b.metin, fotoYol, video, ...(b.alintiId ? { alintiId: b.alintiId } : {}) })); }
    catch (e) { if (fotoYol) await sb.storage.from("foto").remove([fotoYol]).catch(() => {}); throw e; }   // yarım kalan yüklemeyi temizle
  }
  if (m === "GET" && p === "/api/videolar") return ogeleriDuzelt(await rpc("videolar", { p_dil: d }));   // gecis-007-video.sql
  if (m === "POST" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})\/(begen|yay|kaydet)$/))) {
    return ogeleriDuzelt(await rpc("etkilesim_degistir", { p_id: r[1], p_tur: r[2], p_dil: d }));
  }
  if (m === "POST" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})\/duzenle$/))) {   // 1 dk içinde, yalnız sahibi, yalnız metin; süre sunucuda denetlenir
    return ogeleriDuzelt(await fonksiyon("gonderi-duzenle", { gonderiId: r[1], metin: (govde || {}).metin }));
  }
  if (m === "DELETE" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})$/))) return fonksiyon("gonderi-sil", { tur: "gonderi", id: r[1] });
  if (m === "DELETE" && (r = p.match(/^\/api\/yanit\/([0-9a-f-]{36})$/))) return fonksiyon("gonderi-sil", { tur: "yanit", id: r[1] });
  if (m === "GET" && p === "/api/kayitlar") return ogeleriDuzelt(await rpc("kayitlar", { p_dil: d }));
  if (m === "GET" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})$/))) {
    const v = await rpc("oge_detay", { p_id: r[1], p_dil: d });
    if (!v) throw hataYap(ileti("bulunamadi"), 404);
    return ogeleriDuzelt(v);
  }
  if (m === "GET" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})\/yanitlar$/))) {
    const v = await rpc("yanitlar", { p_id: r[1], p_dil: d });
    if (!v) throw hataYap(ileti("bulunamadi"), 404);
    return v;
  }
  if (m === "GET" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})\/alintilar$/))) {   // gecis-008: bu gönderiyi alıntılayanlar
    const v = await rpc("alintilar", { p_id: r[1], p_dil: d });
    if (!v) throw hataYap(ileti("bulunamadi"), 404);
    return ogeleriDuzelt(v);
  }
  if (m === "POST" && p === "/api/goruntule") return { sayilan: await rpc("goruntule", { p_idler: ((govde || {}).idler || []).slice(0, 50) }) };   // gecis-008: toplu görüntülenme (en çok 50 kimlik)
  if (m === "POST" && (r = p.match(/^\/api\/oge\/([0-9a-f-]{36})\/yanit$/))) return fonksiyon("yanit-olustur", { gonderiId: r[1], metin: (govde || {}).metin });
  if (m === "GET" && p === "/api/bildirimler") return rpc("bildirimler", { p_okundu: q.get("okundu") === "1", p_dil: d });

  if (m === "POST" && p === "/api/bekleme") {
    const b = govde || {};
    try { return await rpc("bekleme_ekle", { p_eposta: b.eposta, p_dil: b.dil === "en" ? "en" : "tr" }); }
    catch (e) { throw hataYap(M.eposta_gecersiz[b.dil === "en" ? 1 : 0], 400); }
  }
  if (m === "POST" && p === "/api/denetle") return denetle(String((govde || {}).metin || ""));   // yazarken canlı ipucu (yerel; ağ yok)

  // ---- yeni uçlar (mağaza şartları)
  if (m === "GET" && p === "/api/ben") return { kullanici: await rpc("ben") };
  if (m === "POST" && p === "/api/sikayet") {
    const b = govde || {};
    return fonksiyon("sikayet-et", { tur: b.tur, hedefId: b.hedefId, neden: b.neden, ayrinti: b.ayrinti });
  }
  if (m === "DELETE" && p === "/api/hesap") { const v = await fonksiyon("hesap-sil", { onay: true }); await sb.auth.signOut({ scope: "local" }).catch(() => {}); return v; }

  throw hataYap(ileti("bulunamadi"), 404);
}

// ---- GİRİŞ / KAYIT / ÇIKIŞ / ŞİFRE (yalnız e-posta + şifre; sosyal giriş yok)
export const KOSUL_SURUMU = "2026-10-13";
function girisHatasi(error) {
  const k = String(error?.message || "");
  if (/Email not confirmed/i.test(k)) return hataYap(ileti("eposta_dogrula"), 403);
  if (/Invalid login credentials/i.test(k)) return hataYap(ileti("giris_hatali"), 400);
  if (/already registered|User already/i.test(k)) return hataYap(ileti("zaten_var"), 409);
  if (/Password should be|weak/i.test(k)) return hataYap(ileti("sifre"), 400);
  if (/Error sending|sending (recovery|confirmation|magic|email)|smtp/i.test(k)) return hataYap(ileti("eposta_gonderilemedi"), 502);
  if (/rate limit|too many|over_email_send_rate_limit|security purposes/i.test(k) || error?.status === 429) return hataYap(ileti("hiz_auth"), 429);
  if (/captcha/i.test(k)) return hataYap(ileti("captcha"), 400);
  if (/Failed to fetch|NetworkError|Load failed/i.test(k)) return hataYap(ileti("ag"), 0);
  if (/session|JWT|token/i.test(k)) return hataYap(ileti("oturum_yok"), 401);
  return hataYap(ileti("genel"), 500);
}
export const op = {
  /** Kayıt: 18+ ve koşul onayı (iki kutu) ZORUNLU; ikisi de true değilse ve şifre <8 ise çağrı ağa çıkmaz. Dönüş: { dogrulamaGerek } */
  async kayitOl({ eposta, sifre, yasOnay, kosulOnay, captchaToken }) {
    if (yasOnay !== true) throw hataYap(ileti("yas"), 400);
    if (kosulOnay !== true) throw hataYap(ileti("kosul"), 400);
    if (String(sifre || "").length < 8) throw hataYap(ileti("sifre"), 400);
    const simdi = new Date().toISOString();
    const { data, error } = await sb.auth.signUp({ email: eposta, password: sifre, options: {
      emailRedirectTo: DONUS("giris", `${SITE()}/`), captchaToken,
      data: { dil: dil(), yas_onay_zamani: simdi, kosul_onay_zamani: simdi, kosul_surumu: KOSUL_SURUMU } } });   // dil: e-postalar kullanıcının dilinde gider (şablon .Data.dil'e bakar)   // kanıt kopyası; asıl kayıt profil-kaydet'te sunucu saatiyle
    if (error) throw girisHatasi(error);
    return { dogrulamaGerek: !data.session };
  },
  async epostaTekrar(eposta) {   // doğrulama e-postasını yeniden gönder
    const { error } = await sb.auth.resend({ type: "signup", email: eposta, options: { emailRedirectTo: DONUS("giris", `${SITE()}/`) } });
    if (error) throw girisHatasi(error);
    return { ok: true };
  },
  async girisYap({ eposta, sifre, captchaToken }) {
    const { error } = await sb.auth.signInWithPassword({ email: eposta, password: sifre, options: { captchaToken } });
    if (error) throw girisHatasi(error);
    return { ok: true };
  },
  async cikisYap() { await sb.auth.signOut(); return { ok: true }; },
  async sifreSifirlaIste(eposta, captchaToken) {   // kayıtlı olup olmadığı belli edilmez
    const { error } = await sb.auth.resetPasswordForEmail(eposta, { redirectTo: DONUS("sifre-yenile", `${SITE()}/?sifre-yenile=1`), captchaToken });
    if (error) throw girisHatasi(error);
    return { ok: true };
  },
  async sifreYenile(yeniSifre) {   // e-postadaki bağlantıdan gelen "recovery" oturumuyla
    if (String(yeniSifre || "").length < 8) throw hataYap(ileti("sifre"), 400);
    const { error } = await sb.auth.updateUser({ password: yeniSifre });
    if (error) throw girisHatasi(error);
    return { ok: true };
  },
  async kodDegistir(kod) {   // mobil: uygulamaya dönen bağlantıdaki PKCE kodunu oturuma çevirir
    const { error } = await sb.auth.exchangeCodeForSession(String(kod));
    if (error) throw girisHatasi(error);
    return { ok: true };
  },
  oturum: async () => (await sb.auth.getSession()).data.session,
  /** cb(olay, oturum); olay "PASSWORD_RECOVERY" ise şifre yenileme ekranını göster */
  oturumDinle: (cb) => sb.auth.onAuthStateChange((olay, oturum) => { setTimeout(() => cb(olay, oturum), 0); }).data.subscription,
  /** Oturum var ama profil yoksa null döner → profil oluşturma ekranını (kullanıcı adı) göster */
  ben: async () => rpc("ben"),
  hesapSil: () => api("/api/hesap", null, "DELETE"),
  sikayetEt: (tur, hedefId, neden, ayrinti) => api("/api/sikayet", { tur, hedefId, neden, ayrinti }),
  engelle: (handle) => api(`/api/engelle/${encodeURIComponent(handle)}`, {}),
  engellenenler: () => api("/api/engellenenler"),
};
export const SIKAYET_NEDENLERI = ["spam", "nefret", "siyaset_din_etnik", "siddet", "kaba", "reklam", "cocuk", "diger"];
