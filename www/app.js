// OP – Only Positive · tek sayfa uygulama (bağımlılıksız, sade X iskeleti)
"use strict";
const $ = (s, k = document) => k.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const guvenliUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const sakla = { al(k, v) { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch { return v; } },
  koy(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

// ---------- sabitler ----------
const AVATARLAR = ["🌞", "🌻", "🐱", "🐶", "🦊", "🐼", "🐨", "🦄", "🐸", "🐙", "🦋", "🌈", "🍉", "🍓", "🚀", "⭐", "🎈", "🎨"];
const RENKLER = ["#CDE7EC", "#F3E3B3", "#E6D5F2", "#D5ECD9", "#F6D5D0", "#D9DEE8"];
const KATEGORI = { bilim: ["Bilim", "Science"], saglik: ["Sağlık", "Health"], doga: ["Doğa", "Nature"], hayvanlar: ["Hayvanlar", "Animals"], iyilik: ["İyilik", "Kindness"],
  sanat: ["Sanat", "Arts"], spor: ["Spor", "Sports"], teknoloji: ["Teknoloji", "Tech"], mahalle: ["Mahalle", "Neighborhood"],
  felsefe: ["Felsefe", "Philosophy"], edebiyat: ["Edebiyat", "Literature"], siir: ["Şiir", "Poetry"], mitoloji: ["Mitoloji", "Mythology"], gokbilim: ["Gökbilim", "Astronomy"] };
const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Trabzon", "Samsun", "Muğla", "Diğer"];
const T = {
  tr: { senin: "Senin İçin", takip: "Takip", yakin: "Yakınımda", ana: "Ana Sayfa", kesfet: "Keşfet", bildirim: "Bildirimler", profil: "Profil",
    yeniGonderi: "Yeni gönderi", ne: "Bugün iyi olan ne?", paylas: "Paylaş", yanitYaz: "Yanıtını yaz", yanitla: "Yanıtla", yeniden: "Yeniden paylaş", begen: "Beğen",
    gonderi: "Gönderi", yenidenDedi: "yeniden paylaştı", bosAkis: "Henüz burada bir şey yok.", bosTakip: "Takip ettiklerinin gönderileri burada görünür.",
    bosBildirim: "Henüz bildirim yok.", bosYanit: "Henüz yanıt yok.", kaynak: "Kaynak", foto: "Fotoğraf", devami: "Devamını göster", video: "Video", sesAc: "Sesi aç", sesKapat: "Sesi kapat", oynat: "Oynat", ayarlar: "Ayarlar", tema: "Tema", oto: "Otomatik",
    acik: "Açık", koyu: "Koyu", dil: "Dil", cikis: "Profili bu cihazdan sil", duzenle: "Profili düzenle", kaydet: "Kaydet", geri: "Geri", kapat: "Kapat",
    takipEt: "Takip et", takipte: "Takipte", takipSay: "Takip", takipciSay: "Takipçi", editor: "OP editörü", resmi: "Resmi hesap", haber: "haber",
    sehir: "Şehrin", sehirSec: "Yakınındakileri görmek için şehrini seç.", yanit: "Yanıt", yeniPay: "Yeniden paylaşım", begeni: "Beğeni",
    bildirimMetin: { begen: "gönderini beğendi", yanit: "gönderine yanıt verdi", yay: "gönderini yeniden paylaştı", takip: "seni takip etti" },
    kayit: "Kaydet", kayitlar: "Kaydedilenler", bosKayit: "Kaydettiğin gönderiler burada durur. Yalnız sen görürsün.", kaydedildi: "Kaydedildi", kayitKalkti: "Kaydedilenlerden çıkarıldı",
    disari: "Paylaş", kopyala: "Bağlantıyı kopyala", sununla: "Şununla paylaş", eposta: "Mail", hikaye: "Hikâye", igYapistir: "Bağlantı kopyalandı. Instagram'da yapıştır.",
    paylasildi: "Paylaşıldı", kopyalandi: "Bağlantı kopyalandı", yok: "Bulunamadı", hata: "Bağlantı sorunu",
    katildi: (a) => `${a} tarihinde katıldı`, say: (n, k) => `${n} ${k}`, silOnay: "Profilin bu cihazdan silinsin mi?",
    gonderiYayinla: "Gönderi yayınla", emoji: "Emoji", gundem: "İyi gündem", dahaFazla: "Daha fazla göster", takipOner: "Kimi takip etmeli", bosOner: "Önerilecek hesap kalmadı.",
    hesapMenu: "Hesap menüsü", menu: "Menü", kosul: "Koşullar", gizlilik: "Gizlilik", cerez: "Çerezler", kurallar: "Kurallar", iletisim: "İletişim", cikisYapYerel: "Profili düzenle", acikTema: "Açık tema", koyuTema: "Koyu tema", yanMenu: "Ana menü",
    duzenlendi: "düzenlendi", gonDuzenle: "Düzenle", gonSil: "Sil", silGonSor: "Bu gönderi silinsin mi? Geri alınamaz.", silYanSor: "Bu yanıt silinsin mi? Geri alınamaz.", silindi: "Silindi",
    vazgec: "Vazgeç", duzKalan: "Kalan süre", duzBitti: "Düzenleme süresi doldu", duzKaydedildi: "Gönderi güncellendi" },
  en: { senin: "For You", takip: "Following", yakin: "Nearby", ana: "Home", kesfet: "Explore", bildirim: "Notifications", profil: "Profile",
    yeniGonderi: "New post", ne: "What's good today?", paylas: "Post", yanitYaz: "Post your reply", yanitla: "Reply", yeniden: "Repost", begen: "Like",
    gonderi: "Post", yenidenDedi: "reposted", bosAkis: "Nothing here yet.", bosTakip: "Posts from people you follow show up here.",
    bosBildirim: "No notifications yet.", bosYanit: "No replies yet.", kaynak: "Source", foto: "Photo", devami: "Show more", video: "Video", sesAc: "Turn sound on", sesKapat: "Turn sound off", oynat: "Play", ayarlar: "Settings", tema: "Theme", oto: "Auto",
    acik: "Light", koyu: "Dark", dil: "Language", cikis: "Remove profile from this device", duzenle: "Edit profile", kaydet: "Save", geri: "Back", kapat: "Close",
    takipEt: "Follow", takipte: "Following", takipSay: "Following", takipciSay: "Followers", editor: "OP editor", resmi: "Official account", haber: "stories",
    sehir: "Your city", sehirSec: "Pick your city to see what's nearby.", yanit: "Replies", yeniPay: "Reposts", begeni: "Likes",
    bildirimMetin: { begen: "liked your post", yanit: "replied to your post", yay: "reposted your post", takip: "followed you" },
    kayit: "Bookmark", kayitlar: "Bookmarks", bosKayit: "Posts you bookmark are kept here. Only you can see them.", kaydedildi: "Bookmarked", kayitKalkti: "Removed from bookmarks",
    disari: "Share", kopyala: "Copy link", sununla: "Share via", eposta: "Mail", hikaye: "Stories", igYapistir: "Link copied. Paste it in Instagram.",
    paylasildi: "Posted", kopyalandi: "Link copied", yok: "Not found", hata: "Connection problem",
    katildi: (a) => `Joined ${a}`, say: (n, k) => `${n} ${k}`, silOnay: "Remove your profile from this device?",
    gonderiYayinla: "Post", emoji: "Emoji", gundem: "Good news today", dahaFazla: "Show more", takipOner: "Who to follow", bosOner: "No more accounts to suggest.",
    hesapMenu: "Account menu", menu: "Menu", kosul: "Terms", gizlilik: "Privacy", cerez: "Cookies", kurallar: "Rules", iletisim: "Contact", cikisYapYerel: "Edit profile", acikTema: "Light theme", koyuTema: "Dark theme", yanMenu: "Main menu",
    duzenlendi: "edited", gonDuzenle: "Edit", gonSil: "Delete", silGonSor: "Delete this post? This can't be undone.", silYanSor: "Delete this reply? This can't be undone.", silindi: "Deleted",
    vazgec: "Cancel", duzKalan: "Time left", duzBitti: "Editing time is over", duzKaydedildi: "Post updated" },
};

// ---------- arka uç seçimi (yapilandirma.js): "yerel" = server.js + cihaz anahtarı (bugünkü akış), "supabase" = bulut (gerçek giriş) ----------
const YAPI = window.OP_YAPI || { arkaUc: "yerel" };
const NATIF = YAPI.platform === "ios" || YAPI.platform === "android";   // mağaza uygulaması (Capacitor); web'de hep false → web davranışı değişmez. İşareti mobil/hazirla.mjs + mobil.js koyar
const BULUT = YAPI.arkaUc === "supabase";
let OPB = null;   // bulut/op-api.js modülü (yalnız supabase modunda yüklenir)
// geçici BETA ibaresi: tek yer = public/yapilandirma.js `beta: { acik }` (acik:false → etiket + şerit tamamen kalkar)
const BETA = YAPI.beta && YAPI.beta.acik ? YAPI.beta : null;
const IL_EPOSTA = "op.onlypositive@gmail.com";
// bulut moduna özgü metinler (yerel modda hiç kullanılmaz)
const B = {
  tr: { girisYap: "Giriş yap", kayitOl: "Kayıt ol", gozAt: "Önce göz at", cikisYap: "Çıkış yap", epostaAlan: "E-posta", sifre: "Şifre", sifreIpucu: "En az 8 karakter",
    girisBaslik: "Tekrar hoş geldin", kayitBaslik: "Hesabını oluştur", profilTamamla: "Profilini tamamla", hesapYokMu: "Hesabın yok mu? Kayıt ol", hesapVarMi: "Hesabın var mı? Giriş yap",
    yas18: "18 yaşından büyüğüm", kosulKutu: () => `<a href="/yasal/kosullar" target="_blank" rel="noopener">Kullanım Koşulları</a>, <a href="/yasal/gizlilik" target="_blank" rel="noopener">Gizlilik Politikası</a> ve <a href="/yasal/cerezler" target="_blank" rel="noopener">Çerez Politikası</a>'nı okudum, kabul ediyorum`,
    sifremiUnuttum: "Şifremi unuttum", sifreSifirla: "Şifreni sıfırla", sifreSifirlaMetin: "E-postanı yaz, sıfırlama bağlantısını gönderelim.", baglantiGonder: "Bağlantı gönder",
    sifreSifirlaTamam: "Bu e-posta ile bir hesap varsa sıfırlama bağlantısı gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.", yeniSifre: "Yeni şifre", sifreKaydet: "Şifreyi kaydet", sifreGuncel: "Şifren güncellendi",
    dogrulaBaslik: "E-postanı doğrula", dogrulaMetin: (e) => `${e} adresine bir doğrulama bağlantısı gönderdik. Bağlantıya dokununca hesabın hazır olur.`, dogrulaTekrar: "Yeniden gönder", dogrulaTekrarTamam: "Doğrulama e-postası yeniden gönderildi.", dogrulaGiris: "Doğruladım, giriş yap",
    eksikAlan: "E-posta ve şifreni yaz.", sifreKural: "Şifre en az 8 karakter olmalı.", onayGerek: "Devam etmek için iki kutuyu da işaretlemelisin.", eposta_gecersiz: "E-postanı kontrol eder misin?", adEksik: "Adını yazar mısın?", handleHata: "Kullanıcı adı 3-20 harf, rakam ya da _ olmalı.",
    girisGerekMetin: "Bunu yapmak için giriş yapman gerekiyor.", yanitGirisYap: "Yanıtlamak için giriş yap", gezintiYok: "Takip ettiklerinin gönderilerini görmek için giriş yap.",
    menu: "Daha fazla", sikayetEt: "Şikâyet et", sikayetBaslik: "Neden şikâyet ediyorsun?", sikayetAyrinti: "Eklemek istediğin bir şey var mı? (isteğe bağlı)", sikayetGonder: "Şikâyet et",
    sikayetAlindi: "Şikâyetin alındı. Teşekkürler; bu içeriği artık görmeyeceksin.", sikayetAlindiProfil: "Şikâyetin alındı. Teşekkürler.",
    nedenler: { spam: "Spam", nefret: "Nefret ya da taciz", siyaset_din_etnik: "Siyaset, din ya da etnik kimlik", siddet: "Şiddet", kaba: "Kaba dil", reklam: "Reklam", cocuk: "Çocuk güvenliği", diger: "Diğer" },
    engelle: (h) => `@${h} kullanıcısını engelle`, engeliKaldir: (h) => `@${h} engelini kaldır`, engelSor: (h) => `@${h} engellensin mi? Gönderilerini görmezsin, o da seninkileri göremez.`, engelEvet: "Engelle",
    engellendi: "Kullanıcı engellendi", engelKalkti: "Engel kaldırıldı", engellenenler: "Engellenenler", bosEngel: "Kimseyi engellemedin.", kaldir: "Kaldır",
    hesabiSil: "Hesabımı sil", silUyari: "Hesabın ve tüm verilerin (gönderilerin, yanıtların, fotoğrafların) kalıcı olarak silinir. Bu geri alınamaz.", devam: "Devam", vazgec: "Vazgeç",
    silYaz: "SİL", silOnayYaz: (k) => `Onaylamak için aşağıya <b>${k}</b> yaz.`, silKalici: "Hesabı kalıcı olarak sil", hesapSilindi: "Hesabın silindi. Hoşça kal 🌱",
    yasalKosul: "Kullanım Koşulları", yasalGizlilik: "Gizlilik Politikası", yasalCerez: "Çerez Politikası", yasalKurallar: "OP Kuralları", iletisim: "İletişim", ayarNot: "Sadece iyi haber: siyaset, din, etnik kimlik ve şiddet yok.", betaSurum: "Beta sürümü", yenidenDene: "Yeniden dene" },
  en: { girisYap: "Sign in", kayitOl: "Sign up", gozAt: "Just browse", cikisYap: "Sign out", epostaAlan: "Email", sifre: "Password", sifreIpucu: "At least 8 characters",
    girisBaslik: "Welcome back", kayitBaslik: "Create your account", profilTamamla: "Complete your profile", hesapYokMu: "No account? Sign up", hesapVarMi: "Have an account? Sign in",
    yas18: "I am over 18 years old", kosulKutu: () => `I have read and accept the <a href="/yasal/kosullar" target="_blank" rel="noopener">Terms of Use</a>, the <a href="/yasal/gizlilik" target="_blank" rel="noopener">Privacy Policy</a> and the <a href="/yasal/cerezler" target="_blank" rel="noopener">Cookie Policy</a>`,
    sifremiUnuttum: "Forgot password", sifreSifirla: "Reset your password", sifreSifirlaMetin: "Enter your email and we'll send a reset link.", baglantiGonder: "Send link",
    sifreSifirlaTamam: "If an account exists for this email, a reset link has been sent. Check your inbox (and spam folder).", yeniSifre: "New password", sifreKaydet: "Save password", sifreGuncel: "Your password was updated",
    dogrulaBaslik: "Confirm your email", dogrulaMetin: (e) => `We sent a confirmation link to ${e}. Tap it and your account is ready.`, dogrulaTekrar: "Resend", dogrulaTekrarTamam: "Confirmation email sent again.", dogrulaGiris: "I confirmed, sign in",
    eksikAlan: "Enter your email and password.", sifreKural: "Your password must be at least 8 characters.", onayGerek: "Please tick both boxes to continue.", eposta_gecersiz: "Please check your email.", adEksik: "Please enter your name.", handleHata: "Username must be 3-20 letters, numbers or _.",
    girisGerekMetin: "You need to sign in to do that.", yanitGirisYap: "Sign in to reply", gezintiYok: "Sign in to see posts from people you follow.",
    menu: "More", sikayetEt: "Report", sikayetBaslik: "Why are you reporting this?", sikayetAyrinti: "Anything to add? (optional)", sikayetGonder: "Report",
    sikayetAlindi: "Thanks, your report was received. You won't see this anymore.", sikayetAlindiProfil: "Thanks, your report was received.",
    nedenler: { spam: "Spam", nefret: "Hate or harassment", siyaset_din_etnik: "Politics, religion or ethnicity", siddet: "Violence", kaba: "Rude language", reklam: "Advertising", cocuk: "Child safety", diger: "Other" },
    engelle: (h) => `Block @${h}`, engeliKaldir: (h) => `Unblock @${h}`, engelSor: (h) => `Block @${h}? You won't see their posts and they won't see yours.`, engelEvet: "Block",
    engellendi: "User blocked", engelKalkti: "User unblocked", engellenenler: "Blocked accounts", bosEngel: "You haven't blocked anyone.", kaldir: "Unblock",
    hesabiSil: "Delete my account", silUyari: "Your account and all your data (posts, replies, photos) will be permanently deleted. This can't be undone.", devam: "Continue", vazgec: "Cancel",
    silYaz: "DELETE", silOnayYaz: (k) => `Type <b>${k}</b> below to confirm.`, silKalici: "Delete account permanently", hesapSilindi: "Your account was deleted. Goodbye 🌱",
    yasalKosul: "Terms of Use", yasalGizlilik: "Privacy Policy", yasalCerez: "Cookie Policy", yasalKurallar: "OP Rules", iletisim: "Contact", ayarNot: "Only good news: no politics, religion, ethnicity or violence.", betaSurum: "Beta version", yenidenDene: "Try again" },
};
const bt = (k, ...a) => { const v = B[D.dil]?.[k] ?? B.tr[k] ?? k; return typeof v === "function" ? v(...a) : v; };

// ---------- durum ----------
const D = {
  ben: BULUT ? null : sakla.al("op-ben", null),   // bulutta kimlik = Supabase oturumu (basla()'da yüklenir)
  cihaz: sakla.al("op-cihaz", null) || (() => { const c = Math.random().toString(36).slice(2) + Date.now().toString(36); sakla.koy("op-cihaz", c); return c; })(),
  dil: sakla.al("op-dil", (navigator.language || "tr").startsWith("tr") ? "tr" : "en"),
  sekme: "senin", ogeler: [], detay: null, okunmamis: 0, cizim: 0,
};
let G = { sayfa: "akis", kategori: "", handle: null, id: null, odak: false };   // şu anki görünüm
const yigin = [];                                                                // geri gidilecek görünümler
const t = (k, ...a) => { const v = T[D.dil][k] ?? T.tr[k] ?? k; return typeof v === "function" ? v(...a) : v; };
const di = () => (D.dil === "en" ? 1 : 0);
const tema = sakla.al("op-tema", "acik");   // varsayılan açık zemin (sahip kararı); "" = telefonun ayarına uy
if (tema) document.documentElement.dataset.tema = tema; else delete document.documentElement.dataset.tema;

async function api(yol, govde, yontem) {
  if (BULUT) return OPB.api(yol, govde, yontem);
  const ayr = yol.includes("?") ? "&" : "?";
  const r = await fetch(`${yol}${ayr}ben=${encodeURIComponent(D.ben?.handle || "")}&dil=${D.dil}`, {
    method: yontem || (govde ? "POST" : "GET"), headers: { "X-OP-Cihaz": D.cihaz, ...(govde ? { "Content-Type": "application/json" } : {}) }, body: govde ? JSON.stringify(govde) : undefined });
  const v = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(v.hata || t("hata")); e.filtre = v.filtre; e.durum = r.status; throw e; }
  return v;
}
function tost(m) { const e = document.createElement("div"); e.className = "tost"; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }

// ---------- BETA etiketi + kapatılabilir bilgi şeridi ----------
const betaEtiket = () => (BETA ? '<span class="beta-et" title="Beta">BETA</span>' : "");
const IL_EPOSTA_BETA = "op.onlypositive@gmail.com";
function betaMetin(dil, bag) {
  return dil === "en" ? `This is a beta. Coming very soon to web, the App Store and Google Play. ${bag("Tell us what's missing")}`
    : `Beta sürümüdür. Çok yakında web, App Store ve Google Play'de. ${bag("Eksik gördüğünü bize yaz")}`;
}
const betaAnahtar = () => betaMetin("tr", (x) => x) + "|" + betaMetin("en", (x) => x);   // metin değişirse anahtar değişir → şerit yeniden gösterilir
function betaSeritHtml() {
  if (!BETA || sakla.al("op-beta-kapali", null) === betaAnahtar()) return "";
  const bag = (x) => `<a href="mailto:${IL_EPOSTA_BETA}">${x}</a>`;
  return `<div class="beta-serit" role="note">${betaEtiket()}<p>${betaMetin(D.dil, bag)}</p><button class="beta-kapat" data-e="beta-kapat" aria-label="${t("kapat")}">✕</button></div>`;
}

// ---------- çizim parçaları ----------
const IK = {   // satır içi çizgi ikonlar
  ana: '<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>',
  kesfet: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  bildirim: '<path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 003.4 0"/>',
  profil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
  yanit: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>',
  yay: '<path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 013-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 01-3 3H3"/>',
  begen: '<path d="M12 21s-7.5-4.8-9.6-9.6A5.3 5.3 0 0112 6.2a5.3 5.3 0 019.6 5.2C19.500 16.200 12 21 12 21z"/>',
  paylas: '<path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/>',
  kayit: '<path d="M6 3h12a1 1 0 011 1v17l-7-5-7 5V4a1 1 0 011-1z"/>',
  baglanti: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
  eposta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  ucak: '<path d="M21 3L3 10.500l7 2.500 2.500 7z"/><path d="M21 3L10 13"/>',
  geri: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  yaz: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  foto: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  sag: '<path d="M9 6l6 6-6 6"/>',
  ayarlar: '<path d="M4 7h10"/><path d="M18 7h2"/><circle cx="16" cy="7" r="2"/><path d="M4 17h2"/><path d="M10 17h10"/><circle cx="8" cy="17" r="2"/>',
  emoji: '<circle cx="12" cy="12" r="9"/><path d="M8.500 14a4 4 0 007 0"/><path d="M9 9.500h.01"/><path d="M15 9.500h.01"/>',
  k_bilim: '<path d="M9 3h6"/><path d="M10 3v6L4.5 19a1.5 1.5 0 001.3 2.2h12.4a1.5 1.5 0 001.3-2.2L14 9V3"/><path d="M7.5 15h9"/>',
  k_saglik: '<path d="M12 21s-7.5-4.8-9.6-9.6A5.3 5.3 0 0112 6.2a5.3 5.3 0 019.6 5.2C19.5 16.2 12 21 12 21z"/><path d="M12 9.5v5"/><path d="M9.5 12h5"/>',
  k_doga: '<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19c3-5 6-7.5 10-9"/>',
  k_hayvanlar: '<circle cx="7" cy="10" r="1.8"/><circle cx="12" cy="7" r="1.8"/><circle cx="17" cy="10" r="1.8"/><path d="M12 12.5c-3 0-5 2.6-5 4.5 0 1.8 1.6 2.5 3 2 .8-.3 1.3-.5 2-.5s1.2.2 2 .5c1.4.5 3-.2 3-2 0-1.9-2-4.5-5-4.5z"/>',
  k_iyilik: '<path d="M12 11s-3.2-2-3.2-4.4A2.1 2.1 0 0112 5.5a2.1 2.1 0 013.2 1.1C15.2 9 12 11 12 11z"/><path d="M3 15l3.5-1.5c1.5-.6 3-.2 4.5.5l2.5 1.5h3a1.5 1.5 0 010 3h-6"/><path d="M3 13.5v6"/>',
  k_sanat: '<path d="M12 3a9 9 0 100 18c1.4 0 2-1 1.5-2.2-.5-1.2.2-2.3 1.5-2.3H17a4 4 0 004-4c0-5-4-9.5-9-9.5z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  k_spor: '<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 6H5.5a2.5 2.5 0 002.8 3.8"/><path d="M16 6h2.5a2.5 2.5 0 01-2.8 3.8"/><path d="M12 13v4"/><path d="M9 20h6"/><path d="M10 17h4v3"/>',
  k_teknoloji: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>',
  k_mahalle: '<path d="M3 20v-9l5-4 5 4v9"/><path d="M13 20v-7l4-3 4 3v7"/><path d="M2 20h20"/><path d="M7 20v-4h2v4"/>',
  k_felsefe: '<path d="M12 4L4 9h16z"/><path d="M5 9h14"/><path d="M7 9v8"/><path d="M12 9v8"/><path d="M17 9v8"/><path d="M4 20h16"/>',
  k_edebiyat: '<path d="M4 5.5A2.5 2.5 0 016.5 3H20v16H6.5A2.5 2.5 0 004 21.5z"/><path d="M4 19V5.5"/><path d="M8.5 7.5H16"/>',
  k_siir: '<path d="M20.5 3.5C14 4 9 8 8 15l-1.5 5.5"/><path d="M20.5 3.5c.5 6.5-3.5 11-10 11.5"/><path d="M9 15h5"/>',
  k_mitoloji: '<path d="M9 3h6"/><path d="M10 3.5c0 2-3 3-3 7 0 4.5 2 7.5 5 10.5 3-3 5-6 5-10.5 0-4-3-5-3-7"/><path d="M7.5 10H6a2 2 0 000 4h1.5"/><path d="M16.5 10H18a2 2 0 010 4h-1.5"/>',
  k_gokbilim: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/><path d="M17 3v4"/><path d="M15 5h4"/>',
  editor: '<path d="M12 20h9"/><path d="M16.500 3.500a2.100 2.100 0 013 3L7 19l-4 1 1-4z"/>',
};
const ikon = (ad, boy = 22, dolu = false) => `<svg class="ik" width="${boy}" height="${boy}" viewBox="0 0 24 24" fill="${dolu ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[ad]}</svg>`;
const zamanYaz = (z) => {
  const s = (Date.now() - new Date(z)) / 1000, en = D.dil === "en";
  if (s < 60) return en ? "now" : "şimdi"; if (s < 3600) return Math.floor(s / 60) + (en ? "m" : " dk");
  if (s < 86400) return Math.floor(s / 3600) + (en ? "h" : " sa"); return Math.floor(s / 86400) + (en ? "d" : " g");
};
const avatarHtml = (k, sinif = "") => k?.resmi ? `<span class="avatar logo ${sinif}"><img src="icons/op.svg" alt=""></span>`   // resmi hesabın profil fotoğrafı = OP logosu
  : `<span class="avatar ${sinif}" style="--bg:${esc(k?.renk || "#F3E3B3")}">${esc(k?.avatar || "🌞")}</span>`;
const rozetHtml = (k) => k?.editor ? `<span class="rozet" title="${t("editor")}" aria-label="${t("editor")}">${ikon("editor", 14)}</span>`
  : k?.resmi ? `<span class="rozet" title="${t("resmi")}" aria-label="${t("resmi")}"><svg class="ik" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.500 12.500l3 3 6-6.500" fill="none" stroke="var(--zemin)" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : "";
// bulut: başkasının gönderi/yanıt/profilinde "•••" menüsü (yerel sunucuda karşılığı yok → hiç görünmez)
const DUZENLE_SN = Number(YAPI.duzenleSn) > 0 ? Number(YAPI.duzenleSn) : 60;   // gönderi düzenleme penceresi; süreyi asıl SUNUCU denetler, burada yalnız geri sayım gösterilir
const kalanSn = (z) => { const s = DUZENLE_SN - (Date.now() - Date.parse(z)) / 1000; return Number.isFinite(s) ? Math.ceil(s) : 0; };
const sureYaz = (sn) => `${Math.floor(Math.max(0, sn) / 60)}:${String(Math.max(0, sn) % 60).padStart(2, "0")}`;
function menuDug(tur, id, yazar, o = {}) {
  if (!D.ben || !yazar?.handle) return "";
  const kendi = yazar.handle === D.ben.handle;
  if (kendi ? o.haber : !BULUT) return "";
  return `<button class="menu-dug" data-e="menu" data-t="${tur}" data-id="${esc(id)}" data-h="${esc(yazar.handle)}" data-ed="${yazar.editor || yazar.resmi ? 1 : 0}"${kendi ? ` data-own="1" data-z="${esc(o.zaman || "")}"` : ""} aria-label="${bt("menu")}">•••</button>`;
}
const sayi = (n) => (n ? `<span>${n}</span>` : "");
function eylemHtml(o) {
  return `<div class="eylemler">
    <button class="eylem" data-e="yanit" data-id="${o.id}" aria-label="${t("yanitla")}">${ikon("yanit", 20)}${sayi(o.yanitSayisi)}</button>
    <button class="eylem yay ${o.yaydimMi ? "aktif" : ""}" data-e="yay" data-id="${o.id}" aria-label="${t("yeniden")}" aria-pressed="${!!o.yaydimMi}">${ikon("yay", 20)}${sayi(o.yaySayisi)}</button>
    <button class="eylem begen ${o.begendimMi ? "aktif" : ""}" data-e="begen" data-id="${o.id}" aria-label="${t("begen")}" aria-pressed="${!!o.begendimMi}">${ikon("begen", 20, o.begendimMi)}${sayi(o.begeniSayisi)}</button>
    <button class="eylem kayit ${o.kaydettimMi ? "aktif" : ""}" data-e="kaydet" data-id="${o.id}" aria-label="${t("kayit")}" aria-pressed="${!!o.kaydettimMi}">${ikon("kayit", 20, o.kaydettimMi)}</button>
    <button class="eylem" data-e="paylas" data-id="${o.id}" aria-label="${t("disari")}">${ikon("paylas", 20)}</button>
  </div>`;
}
function metinHtml(o, buyuk) {
  if (!o.haber) return o.metin ? `<div class="metin ${buyuk ? "buyuk" : ""}">${esc(o.metin)}</div>` : "";
  const [baslik, ...gerisi] = String(o.metin).split("\n\n");
  const uzun = !buyuk && String(o.metin).length > 280;   // akışta uzun haber ~5 satırda kesilir; detay sayfasında tam metin
  return `<div class="metin ${buyuk ? "buyuk" : ""} ${uzun ? "kirp" : ""}"><b class="baslik-metin">${esc(baslik)}</b>${gerisi.length ? `<br><br>${esc(gerisi.join("\n\n"))}` : ""}</div>` +
    (uzun ? `<button class="devami" data-e="devam" data-id="${o.id}">${t("devami")}</button>` : "");
}
function lisansSatiri(ad, g) {   // "Fotoğraf: sahibi · lisans · sağlayıcı" (bağlantılar yalnız http/https)
  const bag = (url, x) => (guvenliUrl(url) ? `<a href="${esc(guvenliUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(x)}</a>` : esc(x));
  const parcalar = [g.sahibi && bag(g.kaynak_url, g.sahibi), g.lisans && bag(g.lisans_url, g.lisans), g.saglayici && esc(g.saglayici)].filter(Boolean);
  return parcalar.length ? `<div class="lisans">${ad}: ${parcalar.join(" · ")}</div>` : "";
}
function videoHtml(v, detay) {   // akış: sessiz otomatik oynatma (ekrana girince), dokununca ses; detay: kontrollü oynatıcı
  const ortak = `src="${esc(v.url)}" ${v.poster ? `poster="${esc(v.poster)}"` : ""} playsinline`;
  if (detay) return `<div class="video-kap detay"><video class="haber-video" ${ortak} controls preload="metadata"></video></div>`;
  return `<div class="video-kap durdu" data-e="video-ses" role="button" tabindex="0" aria-label="${t("sesAc")}"><video class="haber-video" data-oto="1" ${ortak} muted loop preload="none"></video>
    <span class="video-rozet" aria-hidden="true"></span></div>`;
}
// görselsiz haber için OP tasarım kartı (yalnız CSS/SVG, dosya yok): 16:9, kategoriye göre sakin tek ton, çizgi ikon + etiket + başlık + OP logosu
const HK_TON = { bilim: "petrol", teknoloji: "petrol", spor: "petrol", saglik: "yesil", doga: "yesil", hayvanlar: "yesil", iyilik: "altin", sanat: "altin", mahalle: "altin",
  edebiyat: "altin", siir: "altin", felsefe: "derin", mitoloji: "derin", gokbilim: "derin" };
const HK_ALINTI = new Set(["felsefe", "edebiyat", "siir", "mitoloji"]);   // tırnaklı alıntı düzeni
const yazarAdiMi = (x) => x.length <= 40 && x.split(/\s+/).length <= 5 && !/[.!?;:"“”,]/.test(x);
function haberKartHtml(o) {
  const kat = KATEGORI[o.kategori] ? o.kategori : "iyilik", [baslik, ...gerisi] = String(o.metin || "").split("\n\n"), alinti = HK_ALINTI.has(kat);
  let govde = baslik, yazar = "";
  if (alinti) {
    const oz = gerisi.join(" ").trim();
    if (oz && yazarAdiMi(baslik)) { govde = oz.length > 170 ? oz.slice(0, 167).trimEnd() + "…" : oz; yazar = baslik; }   // başlık yazar adıysa: alıntı ortada, yazar altta
    govde = `“${govde}”`;
  }
  return `<div class="hk ${alinti ? "alinti" : ""}" data-ton="${HK_TON[kat]}" data-kategori="${kat}" aria-hidden="true"><div class="hk-ust">${ikon("k_" + kat, 26)}<span class="hk-et">${esc(KATEGORI[kat][di()])}</span></div>
    <div class="hk-baslik">${esc(govde)}</div><div class="hk-alt"><span class="hk-yazar">${yazar ? "— " + esc(yazar) : ""}</span><img class="hk-logo" src="icons/op.svg" alt=""></div></div>`;
}
function ekHtml(o, detay) {   // video (varsa, fotoğrafın yerine) ya da görsel (yoksa OP tasarım kartı) + (haberde) lisans satırı + kaynak kartı
  let h = "";
  if (o.foto) h += `<img class="gorsel" src="${esc(o.foto)}" alt="" loading="lazy">`;
  if (o.haber) {
    const g = o.gorsel, v = o.video;
    if (v && v.url) h += videoHtml(v, detay) + lisansSatiri(t("video"), v);
    else if (g && g.url) h += `<img class="gorsel" src="${esc(g.url)}" alt="" loading="lazy">` + lisansSatiri(t("foto"), g);
    else h += haberKartHtml(o);
    const link = guvenliUrl(o.link);
    h += `<${link ? `a href="${esc(link)}" target="_blank" rel="noopener noreferrer"` : "div"} class="kaynak-kart"><span>📍 ${esc(o.yer)}${o.yer ? " · " : ""}${t("kaynak")}: ${esc(o.kaynak)}</span>${link ? " ↗" : ""}</${link ? "a" : "div"}>`;
  }
  return h;
}
function satirHtml(o) {
  const y = o.yazar;
  return `<article class="satir" data-oge="${o.id}">
    ${o.yenidenPaylasan ? `<div class="baglam">${ikon("yay", 14)} ${esc(o.yenidenPaylasan)} ${t("yenidenDedi")}</div>` : ""}
    <div class="satir-ic"><span class="sol" data-profil="${esc(y?.handle)}">${avatarHtml(y)}</span>
      <div class="govde"><div class="kim"><span class="ad" data-profil="${esc(y?.handle)}">${esc(y?.ad)}</span>${rozetHtml(y)}
        <span class="gri kisa" data-profil="${esc(y?.handle)}">@${esc(y?.handle)}</span><span class="gri zaman">· ${zamanYaz(o.zaman)}</span>${o.duzenlendi ? `<span class="gri duzenlendi">· ${t("duzenlendi")}</span>` : ""}${menuDug("gonderi", o.id, y, o)}</div>
        ${metinHtml(o)}${ekHtml(o)}${eylemHtml(o)}</div></div></article>`;
}
function detayGonHtml(o) {
  const y = o.yazar, sayac = [[o.yanitSayisi, t("yanit")], [o.yaySayisi, t("yeniPay")], [o.begeniSayisi, t("begeni")]].filter(([n]) => n);
  const zaman = new Date(o.zaman).toLocaleString(D.dil === "en" ? "en-GB" : "tr-TR", { dateStyle: "medium", timeStyle: "short" });
  return `<article class="detay-gon" data-oge="${o.id}" data-gor="detay">
    <div class="detay-ust"><span data-profil="${esc(y?.handle)}">${avatarHtml(y)}</span>
      <div class="detay-kim" data-profil="${esc(y?.handle)}"><div class="ad">${esc(y?.ad)}${rozetHtml(y)}</div><div class="gri">@${esc(y?.handle)}</div></div>${menuDug("gonderi", o.id, y, o)}</div>
    ${metinHtml(o, true)}${ekHtml(o, true)}
    <div class="gri detay-zaman">${esc(zaman)}${o.sehir ? " · 📍" + esc(o.sehir) : ""}${o.duzenlendi ? " · " + esc(t("duzenlendi")) : ""}</div>
    ${sayac.length ? `<div class="sayilar">${sayac.map(([n, ad]) => `<span><b>${n}</b> ${ad}</span>`).join("")}</div>` : ""}${eylemHtml(o)}</article>`;
}
const yanitHtml = (y) => `<article class="satir yanit" data-yanit="${esc(y.id)}"><div class="satir-ic"><span class="sol" data-profil="${esc(y.yazar?.handle)}">${avatarHtml(y.yazar)}</span>
  <div class="govde"><div class="kim"><span class="ad" data-profil="${esc(y.yazar?.handle)}">${esc(y.yazar?.ad)}</span>${rozetHtml(y.yazar)}
  <span class="gri kisa">@${esc(y.yazar?.handle)}</span><span class="gri zaman">· ${zamanYaz(y.zaman)}</span>${menuDug("yanit", y.id, y.yazar, y)}</div><div class="metin">${esc(y.metin)}</div></div></div></article>`;
const bosHtml = (m, ek = "") => `<div class="bos">${esc(m)}${ek}</div>`;
const iskelet = `<div class="iskelet"></div><div class="iskelet"></div><div class="iskelet"></div>`;

function ustHtml(geri, sekmeler) {
  return `<header class="ust"><div class="ust-sira">
      ${geri ? `<button class="ust-dug" data-e="geri" aria-label="${t("geri")}">${ikon("geri", 22)}</button>`
        : `<button class="ust-dug" data-e="cekmece" aria-haspopup="dialog" aria-label="${t("yanMenu")}">${avatarHtml(D.ben, "kucuk")}</button>`}
      <button class="logo" data-e="ust-yenile" aria-label="OP"><img src="icons/op.svg" alt="OP">${betaEtiket()}</button><span class="ust-dug" aria-hidden="true"></span></div>
    ${sekmeler ? `<nav class="sekmeler" role="tablist">${["senin", "takip", "yakin"].map(s => `<button role="tab" aria-selected="${D.sekme === s}" class="sekme ${D.sekme === s ? "secili" : ""}" data-e="sekme" data-s="${s}"><span>${t(s)}</span></button>`).join("")}</nav>` : ""}</header>`;
}
function altHtml() {
  const secili = G.sayfa === "akis" && G.kategori ? "kesfet" : G.sayfa === "profil" && G.handle === D.ben?.handle ? "profil" : G.sayfa;
  const b = (s) => `<button class="${secili === s ? "secili" : ""}" data-e="git" data-s="${s}" aria-label="${t(s === "akis" ? "ana" : s)}">${ikon(s === "akis" ? "ana" : s, 25)}${s === "bildirim" && D.okunmamis ? '<i class="nokta"></i>' : ""}</button>`;
  return `<nav class="alt">${["akis", "kesfet", "bildirim", "profil"].map(b).join("")}</nav>`;
}
const fabHtml = () => `<button class="fab" data-e="yaz" aria-label="${t("yeniGonderi")}">${ikon("yaz", 26)}</button>`;
function kabuk(govde, { geri = false, sekmeler = false, alt = true, fab = true, ekstra = "" } = {}) {
  return ustHtml(geri, sekmeler) + `<div class="icerik sayfa">${govde}</div>` + (alt ? altHtml() : "") + (fab ? fabHtml() : "") + ekstra;
}

// ---------- sayfalar ----------
const kok = () => $("#uygulama");
async function akisCiz(my) {
  const kat = G.kategori, geri = !!kat, bas = kat ? `<h1 class="baslik">${KATEGORI[kat][di()]}</h1>` : "";
  const secenek = { geri, sekmeler: !kat }, yz = kat ? "" : betaSeritHtml() + yazKutuHtml();
  const goster = (h) => { kok().innerHTML = kabuk(h, secenek); yazKur(); };
  if (BULUT && !D.ben && D.sekme === "takip" && !kat) { goster(yz + bosHtml(bt("gezintiYok"), `<br><br><button class="dug" data-e="giris-ac">${bt("girisYap")}</button>`)); return; }
  if (D.sekme === "yakin" && !kat && !D.ben?.sehir) {
    goster(yz + bosHtml(t("sehirSec"), `<br><br><button class="dug" data-e="profil-duzenle">${t("duzenle")}</button>`)); return;
  }
  goster(yz + bas + iskelet);
  try {
    const [v] = await Promise.all([api(`/api/akis?${new URLSearchParams({ sekme: D.sekme, sehir: D.ben?.sehir || "", kategori: kat })}`), veriYukle()]);
    if (my !== D.cizim) return;
    D.ogeler = v.ogeler;
    const sat = v.ogeler.map(satirHtml), kart = kat ? "" : onerilenHtml("akis");
    if (kart && sat.length) sat.splice(Math.min(5, sat.length), 0, kart);   // ~5. gönderiden sonra yatay "Kimi takip etmeli" şeridi (takip edilmeyen OP hesabı yoksa hiç yok)
    goster(yz + bas + (sat.length ? sat.join("") : bosHtml(D.sekme === "takip" && !kat ? t("bosTakip") : t("bosAkis"))));
  } catch (e) { if (my === D.cizim) goster(yz + bosHtml(e.message, `<br><br><button class="dug ikincil" data-e="ust-yenile">↻</button>`)); }
}
async function kesfetCiz(my) {
  await veriYukle();
  if (my !== D.cizim) return;
  const say = D.katSay || {};
  kok().innerHTML = kabuk(`<h1 class="baslik">${t("kesfet")}</h1><div class="kesfet-ust">${gundemHtml("kesfet")}${onerilenHtml("kesfet")}</div>` + Object.entries(KATEGORI).map(([id, ad]) =>
    `<button class="liste-satir" data-e="kategori" data-k="${id}"><span class="ad">${ad[di()]}</span><span class="gri">${t("say", say[id] || 0, t("haber"))}</span>${ikon("sag", 18)}</button>`).join(""));
}
async function onerilenCiz(my) {   // "Kimi takip etmeli" → Daha fazla göster: tüm OP hesapları
  const v = await api("/api/onerilen?tum=1").catch(() => ({ kullanicilar: [] }));
  if (my !== D.cizim) return;
  kok().innerHTML = kabuk(`<h1 class="baslik">${t("takipOner")}</h1>` + (v.kullanicilar?.length ? v.kullanicilar.map(k => oneriSatir(k, true)).join("") : bosHtml(t("bosOner"))), { geri: true });
}
async function bildirimCiz(my) {
  const v = await api("/api/bildirimler?okundu=1").catch(() => ({ bildirimler: [] }));
  if (my !== D.cizim) return;
  D.okunmamis = 0;
  const bm = T[D.dil].bildirimMetin, tur = { begen: "begen", yanit: "yanit", yay: "yay", takip: "profil" };
  kok().innerHTML = kabuk(`<h1 class="baslik">${t("bildirim")}</h1>` + (v.bildirimler.length ? v.bildirimler.map(b =>
    `<div class="satir bildirim ${b.okundu ? "" : "yeni"}" data-e="bil-ac" data-t="${esc(b.tur)}" data-h="${esc(b.tur === "takip" ? b.kimden?.handle : b.hedef)}"><div class="satir-ic"><span class="bil-ik">${ikon(tur[b.tur] || "begen", 22, b.tur === "begen")}</span>
      <div class="govde">${avatarHtml(b.kimden, "kucuk")}<div class="bil-metin"><b>${esc(b.kimden?.ad)}</b> ${bm[b.tur] || ""}${b.tur === "yanit" && b.ek ? `<div class="gri">${esc(b.ek)}</div>` : ""}
      <div class="gri">${zamanYaz(b.zaman)}</div></div></div></div></div>`).join("") : bosHtml(t("bosBildirim"))));
}
async function kayitCiz(my) {
  const bas = `<h1 class="baslik">${t("kayitlar")}</h1>`;
  kok().innerHTML = kabuk(bas + iskelet, { geri: true });
  const v = await api("/api/kayitlar").catch(() => ({ ogeler: [] }));
  if (my !== D.cizim) return;
  D.ogeler = v.ogeler;
  kok().innerHTML = kabuk(bas + (v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("bosKayit"))), { geri: true });
}
async function profilCiz(my) {
  const handle = G.handle || D.ben?.handle, benim = !!D.ben && handle === D.ben.handle;
  if (!handle) { girisIste(); return; }
  const v = await api(`/api/kullanici/${encodeURIComponent(handle)}`).catch(() => null);
  if (my !== D.cizim) return;
  if (!v) { kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: yigin.length > 0 }); return; }
  const k = v.kullanici; D.ogeler = v.gonderiler;
  const katildi = new Date(k.katilma).toLocaleDateString(D.dil === "en" ? "en-GB" : "tr-TR", { month: "long", year: "numeric" });
  const etiket = k.editor ? t("editor") : k.resmi ? t("resmi") : "";
  kok().innerHTML = kabuk(`<div class="kapak" style="--bg:${esc(k.renk)}"></div>
    <div class="profil-ust">${avatarHtml(k, "dev")}<div class="bosluk"></div>
      ${benim ? `<button class="dug ikincil" data-e="profil-duzenle">${t("duzenle")}</button>`
        : `${BULUT && D.ben && !k.editor && !k.resmi ? `<button class="menu-dug" data-e="menu" data-t="profil" data-id="" data-h="${esc(k.handle)}" data-ed="0" data-eng="${v.engelliMi ? 1 : 0}" aria-label="${bt("menu")}">•••</button>` : ""}<button class="dug ${v.takipEdiyorMu ? "ikincil" : ""}" data-e="takip" data-h="${esc(k.handle)}">${v.takipEdiyorMu ? t("takipte") : t("takipEt")}</button>`}</div>
    <div class="profil-bilgi"><h2 class="ad">${esc(k.ad)}${rozetHtml(k)}</h2><div class="gri">@${esc(k.handle)}</div>
      ${etiket ? `<div class="etiket">${esc(etiket)}</div>` : ""}
      ${k.bio ? `<p class="bio">${esc(k.bio)}</p>` : ""}
      <div class="gri meta">${k.sehir ? `<span>📍 ${esc(k.sehir)}</span>` : ""}<span>${esc(t("katildi", katildi))}</span></div>
      <div class="istatistik"><span><b>${k.takipSayisi}</b> ${t("takipSay")}</span><span><b>${k.takipci}</b> ${t("takipciSay")}</span></div></div>
    <div class="profil-gonderiler">${v.gonderiler.length ? v.gonderiler.map(satirHtml).join("") : bosHtml(t("bosAkis"))}</div>`,
    { geri: !benim || yigin.length > 0, fab: true });
}
async function detayCiz(my) {
  const v = await api(`/api/oge/${G.id}`).catch(() => null);
  if (my !== D.cizim) return;
  if (!v) { kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: true, alt: false, fab: false }); return; }
  D.detay = v;
  const bar = BULUT && !D.ben ? `<div class="yanit-kutu"><button class="dug tam" data-e="giris-ac">${bt("yanitGirisYap")}</button></div>` : `<div class="yanit-kutu"><div id="ipucu"></div><form class="yanit-bar" data-e="yanit-gonder" data-id="${v.oge.id}">${avatarHtml(D.ben, "kucuk")}
    <input id="yanit-metin" maxlength="280" placeholder="${t("yanitYaz")}" autocomplete="off" enterkeyhint="send" aria-label="${t("yanitYaz")}">
    <button class="dug kucuk" id="yanit-dug" disabled>${t("yanitla")}</button></form></div>`;
  kok().innerHTML = kabuk(`<h1 class="baslik gizli-baslik">${t("gonderi")}</h1>` + detayGonHtml(v.oge) +
    `<div id="yanit-liste">${v.yanitlar.length ? v.yanitlar.map(yanitHtml).join("") : ""}</div>` + (v.yanitlar.length ? "" : `<div class="bos az" id="yanit-bos">${t("bosYanit")}</div>`),
    { geri: true, alt: false, fab: false, ekstra: bar });
  const i = $("#yanit-metin"); if (!i) return; let z;
  i.addEventListener("input", () => { $("#yanit-dug").disabled = !i.value.trim(); clearTimeout(z); z = setTimeout(canliDenetle, 600, i, "#ipucu"); });
  i.closest("form").addEventListener("submit", e => { e.preventDefault(); yanitGonder(v.oge.id); });
  if (G.odak) { G.odak = false; i.focus({ preventScroll: true }); }
}
function ciz(basa = true) {
  const my = ++D.cizim; sheetKapat(); kok().onclick = kok().onkeydown = kok().onchange = null;
  yanCiz(); veriYukle().then(() => { if (my === D.cizim) sagCiz(); });
  const s = G.sayfa, is = s === "onerilen" ? onerilenCiz(my) : s === "akis" ? akisCiz(my) : s === "kesfet" ? kesfetCiz(my) : s === "bildirim" ? bildirimCiz(my) : s === "profil" ? profilCiz(my) : s === "kayit" ? kayitCiz(my) : detayCiz(my);
  if (basa) scrollTo(0, 0);
  return is.then(() => { if (!basa && my === D.cizim) scrollTo(0, G.scroll || 0); });
}
function gotur(y, ekle) {   // ekle: alt sayfa (geri okuyla dönülür); değilse kök sayfa
  if (ekle) { G.scroll = scrollY; yigin.push(G); history.pushState({ op: 1 }, ""); } else yigin.length = 0;
  G = { kategori: "", handle: null, id: null, odak: false, ...y };
  return ciz(true);
}
window.addEventListener("popstate", () => { if (yigin.length) { G = yigin.pop(); ciz(false); } });

// ---------- alt sayfalar ----------
function sheet(html) {
  sheetKapat();
  const p = document.createElement("div"); p.className = "perde"; p.dataset.e = "sheet-kapat";
  const s = document.createElement("div"); s.className = "sheet"; s.setAttribute("role", "dialog"); s.setAttribute("aria-modal", "true"); s.innerHTML = html;
  document.body.append(p, s); return s;
}
function sheetKapat() {
  const cek = document.querySelector(".cekmece"), geri = D.odakGeri;
  document.querySelectorAll(".perde,.sheet,.cekmece").forEach(e => e.remove());
  if (cek) { D.odakGeri = null; if (geri?.isConnected) geri.focus({ preventScroll: true }); }   // çekmece kapanınca odak avatara döner
}
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { document.querySelectorAll(".hesap-menu:not([hidden])").forEach(m => { m.hidden = true; }); sheetKapat(); }
  if (e.key !== "Tab") return;
  const c = document.querySelector(".cekmece") || document.querySelector(".sheet"); if (!c) return;   // modal (çekmece/pencere) içinde odak tuzağı
  const f = [...c.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([hidden]),textarea:not([disabled]),select:not([disabled])')].filter(x => x.getClientRects().length);
  if (!f.length) return;
  const ilk = f[0], son = f[f.length - 1];
  if (!c.contains(document.activeElement)) { e.preventDefault(); ilk.focus(); }
  else if (e.shiftKey && document.activeElement === ilk) { e.preventDefault(); son.focus(); }
  else if (!e.shiftKey && document.activeElement === son) { e.preventDefault(); ilk.focus(); }
});

const taslak = { metin: "", foto: null };
const EMOJILER = ["😀", "😃", "😄", "😁", "😊", "🙂", "😍", "🥰", "😎", "🤩", "🥳", "🤗", "😇", "😂", "😌", "😉", "🙌", "👏", "👍", "💪",
  "🤝", "❤️", "🧡", "💛", "💚", "💙", "💜", "🌞", "🌻", "🌈", "⭐", "✨", "🎉", "🎈", "🌱", "🌿", "🍀", "🌸", "🐱", "🐶", "🦋"];
const genis = () => matchMedia("(min-width:700px)").matches;
// yazma bileşeni: TEK kod, iki yüz — akış tepesindeki satır içi kutu (≥700 px) ve alt-sayfa penceresi (mobil "+"); ikisi aynı `taslak` ve aynı gonderiPaylas'ı paylaşır
function yazAlani(sheetMi) {
  const id = (x) => (sheetMi ? `id="${x}"` : "");
  return `<textarea class="yaz-alan yz-metin" ${id("yaz-metin")} maxlength="280" rows="${sheetMi ? 5 : 2}" placeholder="${t("ne")}" aria-label="${t("ne")}">${esc(taslak.metin)}</textarea>
    <div class="yz-foto"></div><div class="yz-ipucu" ${id("ipucu")}></div>
    <div class="yz-emoji" hidden>${EMOJILER.map(e => `<button type="button" data-e="yz-emoji-ekle" data-m="${e}" aria-label="${e}">${e}</button>`).join("")}</div>
    <div class="alt-satir"><button type="button" class="yz-ik" data-e="yz-foto" aria-label="${t("foto")}">${ikon("foto", 22)}</button>
      <button type="button" class="yz-ik" data-e="yz-emoji" aria-label="${t("emoji")}" aria-expanded="false">${ikon("emoji", 22)}</button>
      <input type="file" accept="image/*" class="yz-dosya" ${id("foto-sec")} hidden>
      <div class="bosluk"></div><span class="sayac yz-sayac" ${id("sayac")}>280</span>
      ${sheetMi ? "" : `<button class="dug kucuk yz-gonder" data-e="paylas-gonder" disabled>${t("gonderiYayinla")}</button>`}</div>`;
}
function yazKutuHtml() {
  if (!genis()) return `<button class="yz-kisa" data-e="yaz" aria-label="${t("yeniGonderi")}">${avatarHtml(D.ben, "kucuk")}<span class="yz-yer">${t("ne")}</span><span class="yz-ik-s">${ikon("foto", 22)}</span></button>`;
  return `<div class="yazkutu" data-yz>${avatarHtml(D.ben)}<div class="yz-sag">${yazAlani(false)}</div></div>`;
}
function yazAc() {
  if (!D.ben) return;
  const s = sheet(`<div class="yz" data-yz><div class="sheet-ust"><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button><div class="bosluk"></div>
      <button class="dug yz-gonder" id="paylas-dug" data-e="paylas-gonder" disabled>${t("paylas")}</button></div>
    <div class="yaz-sira">${avatarHtml(D.ben)}<div class="yz-sag">${yazAlani(true)}</div></div></div>`);
  yazKur(); $(".yz-metin", s).focus({ preventScroll: true });
}
function yzGuncelle() {
  document.querySelectorAll("[data-yz]").forEach(k => {
    const m = $(".yz-metin", k), kalan = 280 - taslak.metin.length;
    if (m.value !== taslak.metin) m.value = taslak.metin;
    $(".yz-sayac", k).textContent = kalan; $(".yz-sayac", k).classList.toggle("az", kalan < 20);
    const g = $(".yz-gonder", k); if (g && !g.dataset.bekle) g.disabled = !taslak.metin.trim() && !taslak.foto;
    $(".yz-foto", k).innerHTML = taslak.foto ? `<div class="foto-onizle"><img src="${taslak.foto}" alt=""><button type="button" data-e="foto-sil" aria-label="${t("kapat")}">✕</button></div>` : "";
  });
}
function yazKur() {
  document.querySelectorAll("[data-yz]:not([data-bagli])").forEach(k => {
    k.dataset.bagli = "1";
    const m = $(".yz-metin", k); let z;
    m.addEventListener("focus", () => { if (girisGerekli()) m.blur(); });   // misafir: kutuya dokununca giriş/kayıt penceresi
    m.addEventListener("input", () => { taslak.metin = m.value; yzGuncelle(); clearTimeout(z); z = setTimeout(canliDenetle, 600, m, $(".yz-ipucu", k)); });
    $(".yz-dosya", k).addEventListener("change", async e => {
      const f = e.target.files[0]; e.target.value = ""; if (!f) return;
      try { taslak.foto = await fotoKucult(f); } catch { tost(t("hata")); }
      yzGuncelle();
    });
  });
  yzGuncelle();
}
async function canliDenetle(girdi, hedef) {
  const i = typeof hedef === "string" ? $(hedef) : hedef; if (!i) return;
  if (!girdi.value.trim()) { i.innerHTML = ""; return; }
  const v = await api("/api/denetle", { metin: girdi.value }).catch(() => ({ ok: true }));
  i.innerHTML = v.ok ? "" : `<div class="ipucu">${esc(v.mesaj)}</div>`;
}
function sikistir(c) {   // bulut: Storage kovası ≤700 KB JPEG kabul eder → kaliteyi, gerekirse ölçüyü düşür
  const sinir = 700 * 1024, bayt = (u) => Math.floor((u.length - 23) * 0.75);
  let cv = c;
  for (let tur = 0; tur < 8; tur++) {
    for (const q of [0.8, 0.7, 0.6, 0.5, 0.4]) { const u = cv.toDataURL("image/jpeg", q); if (bayt(u) <= sinir) return u; }
    const n = document.createElement("canvas"); n.width = Math.max(1, Math.round(cv.width * 0.85)); n.height = Math.max(1, Math.round(cv.height * 0.85));
    n.getContext("2d").drawImage(cv, 0, 0, n.width, n.height); cv = n;
  }
  return cv.toDataURL("image/jpeg", 0.4);
}
function fotoKucult(dosya) {
  return new Promise((coz, red) => {
    const r = new FileReader(); r.onerror = red;
    r.onload = () => { const img = new Image(); img.onerror = red; img.onload = () => {
      const o = Math.min(1, 1080 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * o); c.height = Math.round(img.height * o); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      coz(BULUT ? sikistir(c) : c.toDataURL("image/jpeg", 0.8)); }; img.src = r.result; };
    r.readAsDataURL(dosya);
  });
}
async function gonderiPaylas(k) {
  const d = $(".yz-gonder", k), ip = $(".yz-ipucu", k); d.disabled = true; d.dataset.bekle = "1";
  try {
    await api("/api/gonderi", { metin: taslak.metin, foto: taslak.foto });
    Object.assign(taslak, { metin: "", foto: null });
    sheetKapat(); tost(t("paylasildi"));
    D.sekme = "senin"; yigin.length = 0; G = { sayfa: "akis", kategori: "", handle: null, id: null, odak: false }; await ciz(true);   // kutu boşalır, yeni gönderi akışın tepesinde
  } catch (e) { delete d.dataset.bekle; yzGuncelle(); ip.innerHTML = `<div class="ipucu">${esc(e.message)}</div>`; }
}
async function yanitGonder(id) {
  const i = $("#yanit-metin"), metin = i.value.trim(); if (!metin) return;
  $("#yanit-dug").disabled = true;
  try {
    const v = await api(`/api/oge/${id}/yanit`, { metin });
    i.value = ""; $("#ipucu").innerHTML = "";
    $("#yanit-bos")?.remove(); $("#yanit-liste").insertAdjacentHTML("beforeend", yanitHtml(v.yanit));
    ogeGuncelle({ id, yanitSayisi: (D.detay.oge.yanitSayisi || 0) + 1 });
  } catch (e) { $("#yanit-dug").disabled = false; $("#ipucu").innerHTML = `<div class="ipucu">${esc(e.message)}</div>`; }
}
function ayarlarAc() { return BULUT ? ayarlarAcBulut() : ayarlarAcYerel(); }
function ayarlarAcYerel() {
  const tm = document.documentElement.dataset.tema || "";
  const grup = (liste, secili, e, anahtar) => `<div class="grup">${liste.map(([k, a]) => `<button class="dug ${secili === k ? "" : "ikincil"}" data-e="${e}" data-${anahtar}="${k}">${a}</button>`).join("")}</div>`;
  sheet(`<div class="sheet-ust"><h2>${t("ayarlar")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    <div class="alan"><label>${t("tema")}</label>${grup([["", t("oto")], ["acik", t("acik")], ["koyu", t("koyu")]], tm, "tema", "t")}</div>
    <div class="alan"><label>${t("dil")}</label>${grup([["tr", "Türkçe"], ["en", "English"]], D.dil, "dil", "d")}</div>
    <button class="dug ikincil tam" data-e="kayitlar">${ikon("kayit", 18)} ${t("kayitlar")}</button>
    <button class="dug ikincil tam" data-e="profil-duzenle">${t("duzenle")}</button>
    <p class="gri not">OP – Only Positive · ${D.dil === "en" ? "local test build. Only good news: no politics, religion, ethnicity or violence." : "yerel deneme sürümü. Sadece iyi haber: siyaset, din, etnik kimlik ve şiddet yok."}</p>
    <button class="dug ikincil tam" data-e="cikis">${t("cikis")}</button>`);
}

// ---------- haber videosu: ekrana girince sessiz oynat, çıkınca durdur, dokununca ses aç/kapat; veri tasarrufunda otomatik oynatma yok ----------
const veriTasarrufu = () => !!navigator.connection?.saveData;
const videoGozlem = "IntersectionObserver" in window ? new IntersectionObserver(kayitlar => {
  for (const k of kayitlar) {
    const v = k.target;
    if (k.isIntersecting && k.intersectionRatio >= 0.6) { if (!veriTasarrufu()) v.play().catch(() => {}); } else v.pause();
  }
}, { threshold: [0, 0.6] }) : null;
function videolariBagla() {
  document.querySelectorAll("video.haber-video[data-oto]:not([data-bagli])").forEach(v => { v.dataset.bagli = "1"; videoGozlem?.observe(v); });
}
let videoKare = 0;
new MutationObserver(() => { cancelAnimationFrame(videoKare); videoKare = requestAnimationFrame(videolariBagla); }).observe(document.body, { childList: true, subtree: true });
function videoDurumu(v) {
  const kap = v.closest(".video-kap"); if (!kap || kap.classList.contains("detay")) return;
  kap.classList.toggle("durdu", v.paused); kap.classList.toggle("sesli", !v.muted && !v.paused);
  kap.setAttribute("aria-label", t(v.muted ? "sesAc" : "sesKapat"));
}
["play", "pause", "volumechange"].forEach(ad => document.addEventListener(ad, e => { if (e.target.matches?.("video.haber-video")) videoDurumu(e.target); }, true));
function videoDokun(kap) {   // durmuşsa oynat (veri tasarrufu), oynuyorsa sesi aç/kapat
  const v = kap.querySelector("video"); if (!v) return;
  if (v.paused) v.play().catch(() => {}); else v.muted = !v.muted;
}

// ---------- etkileşim ----------
function ogeGuncelle(yeni) {
  const i = D.ogeler.findIndex(x => x.id === yeni.id); if (i >= 0) D.ogeler[i] = { ...D.ogeler[i], ...yeni };
  if (D.detay?.oge.id === yeni.id) D.detay.oge = { ...D.detay.oge, ...yeni };
  document.querySelectorAll(`[data-oge="${yeni.id}"]`).forEach(el => {
    const detay = el.dataset.gor === "detay", o = detay ? D.detay.oge : D.ogeler[i]; if (!o) return;
    const n = document.createElement("div"); n.innerHTML = detay ? detayGonHtml(o) : satirHtml(o); el.replaceWith(n.firstElementChild);
  });
}
async function etkilesim(tur, id) {
  try { ogeGuncelle((await api(`/api/oge/${id}/${tur}`, {})).oge); } catch (e) { hataGoster(e); }
}
function ogeBul(id) { return D.ogeler.find(x => x.id === id) || (D.detay?.oge.id === id ? D.detay.oge : null); }
async function kaydetDegistir(id) {
  try { const v = await api(`/api/oge/${id}/kaydet`, {}); ogeGuncelle(v.oge); tost(t(v.oge.kaydettimMi ? "kaydedildi" : "kayitKalkti")); } catch (e) { hataGoster(e); }
}
// marka logoları: simple-icons (CC0); yalnız "şurada paylaş" kısayolu olarak kullanılır
const LOGO = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};
const logo = (ad, boy = 26) => `<svg width="${boy}" height="${boy}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${LOGO[ad]}"/></svg>`;
// paylaşım menüsü: gönderinin OP bağlantısı; iki sıra halinde hedefler
const paylasBilgi = (o) => ({ url: `${NATIF ? (YAPI.site || "https://onlypositive.org").replace(/\/$/, "") : location.origin}/#g=${o.id}`, metin: String(o.metin || "").split("\n\n")[0].slice(0, 140) });
const mobilMi = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
function disariPaylas(id) {
  const o = ogeBul(id); if (!o) return;
  const { url, metin } = paylasBilgi(o), u = encodeURIComponent(url), m = encodeURIComponent(metin), um = encodeURIComponent(`${metin} ${url}`);
  const dug = (sinif, ic, ad, e, ek = "") => `<button class="p-oge" data-e="${e}" data-id="${o.id}" ${ek}><span class="p-daire ${sinif}">${ic}</span><span>${esc(ad)}</span></button>`;
  const bag = (sinif, ic, ad, h, yeni = true) => `<a class="p-oge" href="${esc(h)}" ${yeni ? 'target="_blank" rel="noopener noreferrer"' : ""}><span class="p-daire ${sinif}">${ic}</span><span>${esc(ad)}</span></a>`;
  const s = sheet(`<div class="sheet-ust"><h2>${t("disari")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div><div class="paylas-izgara">` +
    dug("p-notr", ikon("baglanti", 24), t("kopyala"), "paylas-kopyala") +
    bag("p-wa", logo("whatsapp"), "WhatsApp", `https://wa.me/?text=${um}`) +
    dug("p-ig", ikon("ucak", 24), "Direct", "paylas-ig", 'data-tur="direct"') +
    dug("p-ig", logo("instagram"), t("hikaye"), "paylas-ig", 'data-tur="hikaye"') +
    bag("p-x", logo("x", 22), "X", `https://twitter.com/intent/tweet?text=${m}&url=${u}`) +
    bag("p-tg", logo("telegram"), "Telegram", `https://t.me/share/url?url=${u}&text=${m}`) +
    bag("p-gmail", logo("gmail", 24), "Gmail", `https://mail.google.com/mail/?view=cm&fs=1&su=OP&body=${um}`) +
    bag("p-mail", ikon("eposta", 24), t("eposta"), `mailto:?subject=OP&body=${um}`, false) +
    bag("p-sms", ikon("yanit", 24), "SMS", `sms:?&body=${um}`, false) +
    dug("p-notr", ikon("paylas", 24), t("sununla"), "paylas-diger") + "</div>");
  s.addEventListener("click", e => { if (e.target.closest("a")) setTimeout(sheetKapat, 0); });
}
function baglantiKopyala(url) {
  const elle = () => {   // http üzerinden (yerel deneme) pano API'si yok
    const a = document.createElement("textarea"); a.value = url; a.setAttribute("readonly", ""); a.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(a); a.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch {} a.remove(); return ok ? Promise.resolve() : Promise.reject();
  };
  return navigator.clipboard?.writeText ? navigator.clipboard.writeText(url).catch(elle) : elle();
}
function paylasKopyala(id) {
  const o = ogeBul(id); if (!o) return;
  const { url } = paylasBilgi(o);
  sheetKapat(); baglantiKopyala(url).then(() => tost(t("kopyalandi"))).catch(() => tost(url));
}
// Instagram'ın web'den paylaşım adresi yok: bağlantı panoya alınır, Instagram açılır, kullanıcı yapıştırır
function paylasIg(id, tur) {
  const o = ogeBul(id); if (!o) return;
  const { url } = paylasBilgi(o);
  sheetKapat();
  baglantiKopyala(url).then(() => tost(t("igYapistir"))).catch(() => tost(url));
  setTimeout(() => {
    if (tur === "hikaye" && mobilMi()) location.href = "instagram://story-camera";
    else window.open(tur === "direct" ? "https://www.instagram.com/direct/inbox/" : "https://www.instagram.com/", "_blank", "noopener");
  }, 700);
}
function paylasDiger(id) {
  const o = ogeBul(id); if (!o) return;
  const { url, metin } = paylasBilgi(o);
  sheetKapat();
  if (NATIF && window.OP_MOBIL?.paylas) { window.OP_MOBIL.paylas({ title: "OP", text: metin, url }).catch(() => {}); return; }   // yerel paylaşım sayfası (Capacitor Share)
  if (navigator.share) navigator.share({ title: "OP", text: metin, url }).catch(() => {});
  else baglantiKopyala(url).then(() => tost(t("kopyalandi"))).catch(() => tost(url));   // sistem paylaşımı yalnız https'te var
}
function temaSec(k) {
  if (k) document.documentElement.dataset.tema = k; else delete document.documentElement.dataset.tema;
  sakla.koy("op-tema", k);
  if (document.querySelector(".sheet")) ayarlarAc(); else if (document.querySelector(".cekmece")) cekmeceAc(true);
}
document.addEventListener("click", async e => {
  if (!e.target.closest(".hesap-alan")) document.querySelectorAll(".hesap-menu:not([hidden])").forEach(m => { m.hidden = true; m.parentElement.querySelector(".hesap-kart")?.setAttribute("aria-expanded", "false"); });
  if (e.target.closest("a")) return;   // dış bağlantılar kendi işini yapar
  const el = e.target.closest("[data-e]");
  if (!el && e.target.closest(".duz")) return;   // yerinde düzenleme alanına dokunmak gönderiyi açmaz
  if (!el) {
    const profil = e.target.closest("[data-profil]");
    if (profil?.dataset.profil) return gotur({ sayfa: "profil", handle: profil.dataset.profil }, true);
    const satir = e.target.closest("[data-oge]");
    if (satir && satir.dataset.gor !== "detay") return gotur({ sayfa: "detay", id: satir.dataset.oge }, true);
    return;
  }
  const a = el.dataset;
  switch (a.e) {
    case "git": if (BULUT && !D.ben && (a.s === "bildirim" || a.s === "profil" || a.s === "kayit")) return girisIste(); return gotur({ sayfa: a.s, handle: a.s === "profil" ? D.ben.handle : null }, false);
    case "geri": return yigin.length ? history.back() : gotur({ sayfa: "akis" }, false);
    case "sekme": D.sekme = a.s; return ciz(true);
    case "ust-yenile": yigin.length = 0; G = { sayfa: "akis", kategori: "", handle: null, id: null, odak: false }; return ciz(true);
    case "kategori": return gotur({ sayfa: "akis", kategori: a.k }, true);
    case "begen": case "yay": if (girisGerekli()) return; return etkilesim(a.e, a.id);
    case "yanit": return gotur({ sayfa: "detay", id: a.id, odak: true }, true);
    case "kaydet": if (girisGerekli()) return; return kaydetDegistir(a.id);
    case "devam": return gotur({ sayfa: "detay", id: a.id }, true);
    case "video-ses": return videoDokun(el);
    case "kayitlar": sheetKapat(); return gotur({ sayfa: "kayit" }, true);
    case "paylas": return disariPaylas(a.id);
    case "paylas-kopyala": return paylasKopyala(a.id);
    case "paylas-ig": return paylasIg(a.id, a.tur);
    case "paylas-diger": return paylasDiger(a.id);
    case "bil-ac": return a.t === "takip" ? gotur({ sayfa: "profil", handle: a.h }, true) : gotur({ sayfa: "detay", id: a.h }, true);
    case "yaz": if (girisGerekli()) return; return yazAc();
    case "foto-sil": taslak.foto = null; return yzGuncelle();
    case "paylas-gonder": return gonderiPaylas(el.closest("[data-yz]"));
    case "yz-foto": if (girisGerekli()) return; return $(".yz-dosya", el.closest("[data-yz]")).click();
    case "yz-emoji": { if (girisGerekli()) return; const p = $(".yz-emoji", el.closest("[data-yz]")); p.hidden = !p.hidden; el.setAttribute("aria-expanded", String(!p.hidden)); return; }
    case "yz-emoji-ekle": {
      if (girisGerekli()) return;
      const m = $(".yz-metin", el.closest("[data-yz]")); if (m.value.length + a.m.length > 280) return;
      const b = m.selectionStart ?? m.value.length; m.setRangeText(a.m, b, m.selectionEnd ?? b, "end"); m.dispatchEvent(new Event("input")); m.focus(); return;
    }
    case "yaz-sol": {   // sol menü "Gönderi yayınla": akışta kutuya odaklan, başka sayfadaysak yazma penceresini aç
      if (girisGerekli()) return;
      const kutu = $("#uygulama .yazkutu .yz-metin");
      if (kutu && G.sayfa === "akis" && !G.kategori) { scrollTo(0, 0); return kutu.focus(); }
      return yazAc();
    }
    case "cekmece": return cekmeceAc();
    case "beta-kapat": sakla.koy("op-beta-kapali", betaAnahtar()); el.closest(".beta-serit")?.remove(); return;
    case "hesap-menu": { const m = el.parentElement.querySelector(".hesap-menu"); m.hidden = !m.hidden; el.setAttribute("aria-expanded", String(!m.hidden)); return; }
    case "onerilen-liste": return gotur({ sayfa: "onerilen" }, true);
    case "takip-oneri": return onerilenTakip(a.h);
    case "sheet-kapat": return sheetKapat();
    case "ayarlar": return ayarlarAc();
    case "tema": return temaSec(a.t);
    case "dil": D.dil = a.d; sakla.koy("op-dil", a.d); document.documentElement.lang = a.d; return ciz(false);
    case "cikis": if (confirm(t("silOnay"))) { sakla.koy("op-ben", null); D.ben = null; sheetKapat(); karsilamaCiz(0); } return;
    case "takip": { if (girisGerekli()) return; D.veriZ = 0; const v = await api(`/api/kullanici/${a.h}/takip`, {}).catch(hataGoster); if (v) ciz(false); return; }
    case "profil-duzenle": if (girisGerekli()) return; sheetKapat(); return karsilamaCiz(2, true);
    // ---- bulut: kimlik, güvenlik (yalnız supabase modunda düğmeleri var)
    case "giris-iste": case "giris-ac": sheetKapat(); return girisCiz();
    case "kayit-ac": sheetKapat(); D.profilModu = "kayit"; return karsilamaCiz(1);
    case "cikis-yap": return cikisYap();
    case "menu": return menuAc(a);
    case "duzenle": return duzenleBasla(a.id);
    case "duz-kaydet": return duzenleKaydet(el.closest(".duz"));
    case "duz-vazgec": return ogeGuncelle({ id: el.closest(".duz").dataset.id });
    case "sil-sor": return silSor(a.t, a.id);
    case "sil-evet": return silEvet(a.t, a.id, el);
    case "sikayet": return sikayetAc(a.t, a.id);
    case "sikayet-gonder": return sikayetGonder(el);
    case "engel-sor": return engelSor(a.h);
    case "engel-evet": return engelDegistir(a.h, el);
    case "engellenenler": return engellenenlerAc();
    case "engel-kaldir": return engelKaldir(a.h, el);
    case "hesap-sil-1": return hesapSil1();
    case "hesap-sil-2": return hesapSil2();
    case "hesap-sil-son": return hesapSilSon(el);
    case "yeniden-yukle": return location.reload();
  }
});

// ---------- karşılama / profil oluşturma ----------
const yeniProfil = { ad: "", handle: "", avatar: "🌞", renk: "#F3E3B3", sehir: "", bio: "" };
function karsilamaCiz(adim = 0, duzenleme = false) {
  D.veriZ = 0;
  if (duzenleme && D.ben) Object.assign(yeniProfil, D.ben);
  const en = D.dil === "en", k = kok();
  const bulutKayit = BULUT && !duzenleme && adim === 2, epostali = bulutKayit && D.profilModu !== "profil";
  k.onclick = k.onkeydown = k.onchange = null; sheetKapat();
  if (adim === 0) D.profilModu = "kayit";
  const nokta = `<div class="adim-nokta">${[0, 1, 2].map(i => `<i class="${i === adim ? "aktif" : ""}"></i>`).join("")}</div>`;
  if (adim === 0) {
    k.innerHTML = `<div class="karsila sayfa"><div class="karsila-marka"><img class="karsila-logo" src="icons/op.svg" alt="OP">${betaEtiket()}</div>
      <h1>${en ? "Only good things here" : "Burada sadece iyi şeyler var"}</h1>
      <p>${en ? "Good news, happy moments and tiny joys." : "İyi haberler, güzel anlar, küçük mutluluklar."}</p>
      ${nokta}<button class="dug tam" data-k="1">${en ? "Get started" : "Başlayalım"}</button>
      ${BULUT ? `<button class="dug ikincil tam" data-k="giris">${bt("girisYap")}</button><button class="dug ikincil tam" data-k="gez">${bt("gozAt")}</button>` : ""}
      <button class="dug ikincil tam" data-dil="${en ? "tr" : "en"}">${en ? "Türkçe" : "English"}</button></div>`;
  } else if (adim === 1) {
    k.innerHTML = `<div class="karsila sayfa"><h1>${en ? "The OP promise" : "OP sözü"}</h1>
      <ul class="manifesto">${(en ? ["I share things that make people smile.", "I'm kind, even when I disagree.", "No politics, religion, ethnicity or violence.", "Small good things count too."]
        : ["İnsanları gülümseten şeyler paylaşırım.", "Farklı düşünsem de nazik olurum.", "Siyaset, din, etnik kimlik ve şiddet yok.", "Küçük iyilikler de sayılır."]).map(s => `<li>${s}</li>`).join("")}</ul>
      ${nokta}<button class="dug tam" data-k="2">${en ? "I promise" : "Söz veriyorum"}</button></div>`;
  } else {
    k.innerHTML = `<div class="karsila sayfa"><h1>${duzenleme ? t("duzenle") : bulutKayit ? (epostali ? bt("kayitBaslik") : bt("profilTamamla")) : (en ? "Create your profile" : "Profilini oluştur")}</h1>
      ${epostali ? `<div class="alan"><label for="p-eposta">${bt("epostaAlan")}</label><input id="p-eposta" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="120"></div>
      <div class="alan"><label for="p-sifre">${bt("sifre")}</label><input id="p-sifre" type="password" autocomplete="new-password" maxlength="72" placeholder="${bt("sifreIpucu")}"></div>` : ""}
      <div class="avatar-onizle" id="avatar-onizle">${avatarHtml(yeniProfil, "dev")}</div>
      <div class="avatar-sec">${AVATARLAR.map(a => `<button class="secenek ${yeniProfil.avatar === a ? "secili" : ""}" data-av="${a}" aria-label="${a}">${a}</button>`).join("")}</div>
      <div class="secenekler">${RENKLER.map(r => `<button class="secenek renk-sec ${yeniProfil.renk === r ? "secili" : ""}" data-rk="${r}" style="background:${r}" aria-label="${r}"></button>`).join("")}</div>
      <div class="alan"><label for="p-ad">${en ? "Name" : "Adın"}</label><input id="p-ad" maxlength="40" value="${esc(yeniProfil.ad)}" placeholder="${en ? "Sunny Sam" : "Güneşli Ayşe"}"></div>
      <div class="alan"><label for="p-handle">${en ? "Username" : "Kullanıcı adı"}</label><input id="p-handle" maxlength="20" value="${esc(yeniProfil.handle)}" ${duzenleme ? "disabled" : ""} placeholder="gunesli_ayse" autocapitalize="off" autocorrect="off"></div>
      <div class="alan"><label for="p-sehir">${t("sehir")}</label><select id="p-sehir"><option value="">—</option>${SEHIRLER.map(s => `<option ${yeniProfil.sehir === s ? "selected" : ""}>${s}</option>`).join("")}</select></div>
      <div class="alan"><label for="p-bio">Bio</label><input id="p-bio" maxlength="160" value="${esc(yeniProfil.bio)}" placeholder="${en ? "Plants, cats and sunsets" : "Bitkiler, kediler ve gün batımı"}"></div>
      ${bulutKayit ? `<label class="onay"><input type="checkbox" id="p-yas"><span>${bt("yas18")}</span></label><label class="onay"><input type="checkbox" id="p-kosul"><span>${bt("kosulKutu")}</span></label>` : ""}
      <div id="ipucu">${bulutKayit && D.profilHata ? `<div class="ipucu">${esc(D.profilHata)}</div>` : ""}</div>
      ${duzenleme ? "" : nokta}<button class="dug tam" data-k="bitir" ${bulutKayit ? "disabled" : ""}>${duzenleme ? t("kaydet") : bulutKayit ? (epostali ? bt("kayitOl") : t("kaydet")) : (en ? "Start" : "Başla")}</button>
      ${duzenleme ? `<button class="dug ikincil tam" data-k="vazgec">${t("geri")}</button>` : ""}
      ${epostali ? `<button class="dug ikincil tam" data-k="giris">${bt("hesapVarMi")}</button>` : bulutKayit ? `<button class="dug ikincil tam" data-k="cikis-bulut">${bt("cikisYap")}</button>` : ""}</div>`;
    D.profilHata = "";
    if (bulutKayit) k.onchange = () => { const y = $("#p-yas"), c = $("#p-kosul"), d = $('[data-k="bitir"]'); if (y && c && d) d.disabled = !(y.checked && c.checked); };
    const h = $("#p-handle"); h.addEventListener("input", () => { h.value = h.value.toLowerCase().replace(/[^a-z0-9_]/g, ""); });
    $("#p-ad").addEventListener("input", e => { if (!duzenleme && !h.dataset.elle) h.value = e.target.value.toLocaleLowerCase("tr").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 20); });
    h.addEventListener("keydown", () => { h.dataset.elle = "1"; });
  }
  scrollTo(0, 0);
  if (BULUT) k.onkeydown = e => { if (e.key === "Enter" && e.target.matches("input:not([type=checkbox])")) { e.preventDefault(); k.querySelector('[data-k="bitir"]')?.click(); } };
  k.onclick = async e => {
    const b = e.target.closest("button"); if (!b) return;
    if (BULUT && b.dataset.k === "giris") return girisCiz();
    if (BULUT && b.dataset.k === "gez") return gezintiBaslat();
    if (BULUT && b.dataset.k === "cikis-bulut") return cikisYap();
    if (b.dataset.dil) { D.dil = b.dataset.dil; sakla.koy("op-dil", D.dil); document.documentElement.lang = D.dil; return karsilamaCiz(adim); }
    if (b.dataset.av) { yeniProfil.avatar = b.dataset.av; k.querySelectorAll("[data-av]").forEach(x => x.classList.toggle("secili", x === b)); $("#avatar-onizle").innerHTML = avatarHtml(yeniProfil, "dev"); return; }
    if (b.dataset.rk) { yeniProfil.renk = b.dataset.rk; k.querySelectorAll("[data-rk]").forEach(x => x.classList.toggle("secili", x === b)); $("#avatar-onizle").innerHTML = avatarHtml(yeniProfil, "dev"); return; }
    if (b.dataset.k === "1" || b.dataset.k === "2") return karsilamaCiz(+b.dataset.k);
    if (b.dataset.k === "vazgec") { k.onclick = null; return ciz(false); }
    if (b.dataset.k === "bitir") {
      Object.assign(yeniProfil, { ad: $("#p-ad").value.trim(), handle: $("#p-handle").value.trim(), sehir: $("#p-sehir").value, bio: $("#p-bio").value.trim() });
      if (bulutKayit) return bulutKayitGonder(b, epostali);
      try {
        b.disabled = true;
        const v = await api("/api/kullanici", { ...yeniProfil, cihaz: D.cihaz, dil: D.dil });
        D.ben = { ...v.kullanici }; sakla.koy("op-ben", D.ben); k.onclick = null;
        if (duzenleme) ciz(false); else gotur({ sayfa: "akis" }, false);
      } catch (er) { b.disabled = false; $("#ipucu").innerHTML = `<div class="ipucu">${esc(er.message)}</div>`; }
    }
  };
}

// ---------- BULUT (supabase modu): oturum, giriş/kayıt, güvenlik menüleri. Yerel modda bu işlevlerin hiçbiri çağrılmaz. ----------
function hataGoster(e) { if (BULUT && e?.durum === 401) return girisIste(); tost(e?.message || t("hata")); }
function girisGerekli() { if (!BULUT || D.ben) return false; girisIste(); return true; }   // misafir etkileşime basınca kayıt/girişe yönlenir
function girisIste() {
  D.donus = { ...G };
  sheet(`<div class="sheet-ust"><h2>${bt("girisYap")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    <p class="gri">${bt("girisGerekMetin")}</p>
    <button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button>
    <button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button>`);
}
async function bulutYukle() {
  if (OPB) return;
  if (!globalThis.supabase) await new Promise((coz, red) => {
    const s = document.createElement("script"); s.src = "vendor/supabase.umd.js"; s.onload = coz; s.onerror = () => red(new Error("supabase-js")); document.head.appendChild(s);
  });
  OPB = await import("./bulut/op-api.js");
}
// Oturum açıksa profili getirir; yoksa bu e-postaya ait bekleyen kayıt taslağını (e-posta doğrulaması sırasında saklanan) sunucuya yazar.
async function kimlikHazirla() {
  let ben = null, oturum = null;
  try { oturum = await OPB.op.oturum(); ben = oturum ? await OPB.op.ben() : null; } catch { /* ağ: profil değişmez */ }
  if (oturum && !ben) {
    const tk = sakla.al("op-taslak", null);
    if (tk && String(tk.eposta || "").toLowerCase() === String(oturum.user?.email || "").toLowerCase()) {
      try { const v = await OPB.api("/api/kullanici", tk); ben = v.kullanici; sakla.koy("op-taslak", null); }
      catch (er) { D.profilHata = er.message; Object.assign(yeniProfil, { ad: tk.ad, handle: tk.handle, sehir: tk.sehir, bio: tk.bio || "", avatar: tk.avatar, renk: tk.renk }); }
    }
  }
  D.ben = ben; D.oturum = !!oturum;
  return ben;
}
function girisSonrasi() {   // giriş/kayıt tamam: önceki sayfaya (paylaşılan bağlantı vb.) ya da akışa dön
  D.veriZ = 0; const d = D.donus; D.donus = null; D.misafir = false;
  kok().onclick = kok().onkeydown = kok().onchange = null;
  gotur(d && d.sayfa ? d : { sayfa: "akis" }, false); bildirimYokla();
}
function profilGerek() { D.profilModu = "profil"; return karsilamaCiz(2); }   // oturum var, profil yok
function gezintiBaslat() { D.misafir = true; kok().onclick = kok().onkeydown = null; return gotur({ sayfa: "akis" }, false); }
async function cikisYap() {
  try { await OPB.op.cikisYap(); } catch { /* yok say */ }
  D.ben = null; D.oturum = false; D.donus = null; sheetKapat(); karsilamaCiz(0);
}
function authEkran(html, isle) {
  const k = kok(); sheetKapat();
  k.innerHTML = `<div class="karsila sayfa"><div class="karsila-marka"><img class="karsila-logo" src="icons/op.svg" alt="OP">${betaEtiket()}</div>${html}</div>`; scrollTo(0, 0);
  k.onclick = (e) => { const d = e.target.closest("button[data-k]"); if (d) isle(d.dataset.k, d); };
  k.onkeydown = (e) => { if (e.key === "Enter" && e.target.matches("input:not([type=checkbox])")) { e.preventDefault(); k.querySelector("[data-primary]")?.click(); } };
  k.onchange = null;
}
const ipucuYaz = (m) => { const i = $("#ipucu"); if (i) i.innerHTML = m ? `<div class="ipucu">${esc(m)}</div>` : ""; };
function girisCiz(eposta = "", mesaj = "") {
  authEkran(`<h1>${bt("girisBaslik")}</h1>
    <div class="alan"><label for="g-eposta">${bt("epostaAlan")}</label><input id="g-eposta" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="120" value="${esc(eposta)}"></div>
    <div class="alan"><label for="g-sifre">${bt("sifre")}</label><input id="g-sifre" type="password" autocomplete="current-password" maxlength="72"></div>
    <div id="ipucu">${mesaj ? `<div class="ipucu">${esc(mesaj)}</div>` : ""}</div>
    <button class="dug tam" data-k="giris-gonder" data-primary>${bt("girisYap")}</button>
    <button class="dug ikincil tam" data-k="sifremi-unuttum">${bt("sifremiUnuttum")}</button>
    <button class="dug ikincil tam" data-k="kayit">${bt("hesapYokMu")}</button>
    <button class="dug ikincil tam" data-k="gez">${bt("gozAt")}</button>`, async (kod, d) => {
    if (kod === "kayit") { D.profilModu = "kayit"; return karsilamaCiz(1); }
    if (kod === "gez") return gezintiBaslat();
    if (kod === "sifremi-unuttum") return sifreIsteCiz($("#g-eposta").value.trim());
    if (kod !== "giris-gonder") return;
    const ep = $("#g-eposta").value.trim(), sf = $("#g-sifre").value;
    if (!ep || !sf) return ipucuYaz(bt("eksikAlan"));
    d.disabled = true; ipucuYaz("");
    try {
      await OPB.op.girisYap({ eposta: ep, sifre: sf });
      const ben = await kimlikHazirla();
      if (ben) return girisSonrasi();
      profilGerek();
    } catch (er) { d.disabled = false; if (er.durum === 403) return dogrulaCiz(ep, er.message); ipucuYaz(er.message); }
  });
}
function dogrulaCiz(eposta, mesaj = "") {
  authEkran(`<h1>${bt("dogrulaBaslik")}</h1><p>${esc(bt("dogrulaMetin", eposta))}</p>
    <div id="ipucu">${mesaj ? `<div class="ipucu">${esc(mesaj)}</div>` : ""}</div>
    <button class="dug tam" data-k="giris" data-primary>${bt("dogrulaGiris")}</button>
    <button class="dug ikincil tam" data-k="tekrar">${bt("dogrulaTekrar")}</button>
    <button class="dug ikincil tam" data-k="gez">${bt("gozAt")}</button>`, async (kod, d) => {
    if (kod === "giris") return girisCiz(eposta);
    if (kod === "gez") return gezintiBaslat();
    if (kod === "tekrar") { d.disabled = true; try { await OPB.op.epostaTekrar(eposta); ipucuYaz(bt("dogrulaTekrarTamam")); } catch (er) { ipucuYaz(er.message); } d.disabled = false; }
  });
}
function sifreIsteCiz(eposta = "") {
  authEkran(`<h1>${bt("sifreSifirla")}</h1><p>${bt("sifreSifirlaMetin")}</p>
    <div class="alan"><label for="s-eposta">${bt("epostaAlan")}</label><input id="s-eposta" type="email" inputmode="email" autocomplete="email" autocapitalize="off" maxlength="120" value="${esc(eposta)}"></div>
    <div id="ipucu"></div>
    <button class="dug tam" data-k="gonder" data-primary>${bt("baglantiGonder")}</button>
    <button class="dug ikincil tam" data-k="giris">${bt("girisYap")}</button>`, async (kod, d) => {
    if (kod === "giris") return girisCiz($("#s-eposta").value.trim());
    const ep = $("#s-eposta").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(ep)) return ipucuYaz(bt("eposta_gecersiz"));
    d.disabled = true;
    try { await OPB.op.sifreSifirlaIste(ep); ipucuYaz(bt("sifreSifirlaTamam")); } catch (er) { ipucuYaz(er.message); }
    d.disabled = false;
  });
}
function sifreYenileCiz() {
  D.sifreYenileniyor = true;
  authEkran(`<h1>${bt("yeniSifre")}</h1>
    <div class="alan"><label for="y-sifre">${bt("yeniSifre")}</label><input id="y-sifre" type="password" autocomplete="new-password" maxlength="72" placeholder="${bt("sifreIpucu")}"></div>
    <div id="ipucu"></div><button class="dug tam" data-k="kaydet" data-primary>${bt("sifreKaydet")}</button>`, async (kod, d) => {
    const sf = $("#y-sifre").value;
    if (sf.length < 8) return ipucuYaz(bt("sifreKural"));
    d.disabled = true;
    try {
      await OPB.op.sifreYenile(sf); D.sifreYenileniyor = false; tost(bt("sifreGuncel"));
      const ben = await kimlikHazirla();
      if (ben) return girisSonrasi();
      profilGerek();
    } catch (er) { d.disabled = false; ipucuYaz(er.message); }
  });
}
// kayıt / profil tamamlama formunun gönderimi (karsilamaCiz adım 2, bulut dalı)
async function bulutKayitGonder(dugme, epostali) {
  const p = yeniProfil, eposta = epostali ? $("#p-eposta").value.trim() : "", sifre = epostali ? $("#p-sifre").value : "";
  if (epostali && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(eposta)) return ipucuYaz(bt("eposta_gecersiz"));
  if (epostali && sifre.length < 8) return ipucuYaz(bt("sifreKural"));
  if (!p.ad) return ipucuYaz(bt("adEksik"));
  if (!/^[a-z0-9_]{3,20}$/.test(p.handle)) return ipucuYaz(bt("handleHata"));
  if (!$("#p-yas")?.checked || !$("#p-kosul")?.checked) return ipucuYaz(bt("onayGerek"));
  const taslak = { ad: p.ad, handle: p.handle, sehir: p.sehir, bio: p.bio, avatar: p.avatar, renk: p.renk, dil: D.dil, yasOnay: true, kosulOnay: true, kosulSurumu: OPB.KOSUL_SURUMU };
  dugme.disabled = true; ipucuYaz("");
  try {
    if (epostali) {
      const r = await OPB.op.kayitOl({ eposta, sifre, yasOnay: true, kosulOnay: true });
      sakla.koy("op-taslak", { ...taslak, eposta: eposta.toLowerCase() });   // şifre ASLA saklanmaz; e-posta doğrulanıp giriş yapılınca profil bu taslakla oluşur
      if (r.dogrulamaGerek) return dogrulaCiz(eposta);
      if (await kimlikHazirla()) return girisSonrasi();
      return profilGerek();
    }
    const v = await OPB.api("/api/kullanici", taslak);
    D.ben = v.kullanici; sakla.koy("op-taslak", null); girisSonrasi();
  } catch (er) { dugme.disabled = false; ipucuYaz(er.message); }
}
function oturumOlayi(olay) {
  if (olay === "PASSWORD_RECOVERY") { D.sifreYenileniyor = true; sifreYenileCiz(); }
  else if (olay === "SIGNED_OUT" && D.ben) { D.ben = null; D.oturum = false; sheetKapat(); karsilamaCiz(0); }
}
async function baslaBulut() {
  document.documentElement.lang = D.dil;
  try { await bulutYukle(); }
  catch { kok().innerHTML = `<div class="karsila sayfa"><div class="karsila-marka"><img class="karsila-logo" src="icons/op.svg" alt="OP">${betaEtiket()}</div>${bosHtml(t("hata"), `<br><br><button class="dug" data-e="yeniden-yukle">${bt("yenidenDene")}</button>`)}</div>`; return; }
  OPB.op.oturumDinle(oturumOlayi);
  const sorgu = new URLSearchParams(location.search), sifreDonus = sorgu.has("sifre-yenile");
  const ben = await kimlikHazirla();   // getSession, URL'deki ?code= değişimini de bekler
  if (sorgu.has("code") || sifreDonus || sorgu.has("error_description")) history.replaceState(null, "", location.pathname + location.hash);
  setInterval(bildirimYokla, 20000);
  if (D.sifreYenileniyor) return;
  if (sifreDonus && D.oturum) return sifreYenileCiz();
  const m = location.hash.match(/^#g=([a-z0-9-]+)$/);
  if (m) G = { sayfa: "detay", kategori: "", handle: null, id: m[1], odak: false };   // paylaşılan bağlantı: girişsiz de açılır
  if (D.oturum && !ben) return profilGerek();
  if (!D.oturum && !m) return karsilamaCiz(0);
  ciz(true); bildirimYokla();
}

// ---- ayarlar (bulut)
function ayarlarAcBulut() {
  const tm = document.documentElement.dataset.tema || "", giris = !!D.ben;
  const grup = (liste, secili, e, anahtar) => `<div class="grup">${liste.map(([k, a]) => `<button class="dug ${secili === k ? "" : "ikincil"}" data-e="${e}" data-${anahtar}="${k}">${a}</button>`).join("")}</div>`;
  sheet(`<div class="sheet-ust"><h2>${t("ayarlar")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    <div class="alan"><label>${t("tema")}</label>${grup([["", t("oto")], ["acik", t("acik")], ["koyu", t("koyu")]], tm, "tema", "t")}</div>
    <div class="alan"><label>${t("dil")}</label>${grup([["tr", "Türkçe"], ["en", "English"]], D.dil, "dil", "d")}</div>
    ${giris ? `<button class="dug ikincil tam" data-e="kayitlar">${ikon("kayit", 18)} ${t("kayitlar")}</button>
      <button class="dug ikincil tam" data-e="profil-duzenle">${t("duzenle")}</button>
      <button class="dug ikincil tam" data-e="engellenenler">${bt("engellenenler")}</button>`
      : `<button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button>`}
    <p class="yasal-satir"><a href="/yasal/kosullar" target="_blank" rel="noopener">${bt("yasalKosul")}</a> · <a href="/yasal/gizlilik" target="_blank" rel="noopener">${bt("yasalGizlilik")}</a> · <a href="/yasal/cerezler" target="_blank" rel="noopener">${bt("yasalCerez")}</a> · <a href="/yasal/kurallar" target="_blank" rel="noopener">${bt("yasalKurallar")}</a> · <a href="mailto:${IL_EPOSTA}">${bt("iletisim")}</a></p>
    <p class="gri not">OP – Only Positive · ${BETA ? bt("betaSurum") + ". " : ""}${bt("ayarNot")}</p>
    ${giris ? `<button class="dug ikincil tam" data-e="cikis-yap">${bt("cikisYap")}</button><button class="dug ikincil tam tehlike" data-e="hesap-sil-1">${bt("hesabiSil")}</button>` : ""}`);
}

// ---- "•••" menüsü: şikâyet et / engelle (bulut + giriş yapmış kullanıcı)
const sheetUst = (baslik) => `<div class="sheet-ust"><h2>${esc(baslik)}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>`;
function menuAc(a) {
  let g = "";
  if (a.own === "1") {   // kendi içeriği: Düzenle (yalnız gönderi, 1 dk, geri sayımlı) + Sil
    const kalan = kalanSn(a.z);
    if (a.t === "gonderi" && kalan > 0) g += `<button class="liste-satir" data-e="duzenle" data-id="${esc(a.id)}" data-kz="${esc(a.z)}"><span class="ad">${esc(t("gonDuzenle"))} (<span class="kz-sure">${sureYaz(kalan)}</span>)</span></button>`;
    g += `<button class="liste-satir sil-satir" data-e="sil-sor" data-t="${esc(a.t)}" data-id="${esc(a.id)}"><span class="ad">${esc(t("gonSil"))}</span></button>`;
    sheet(sheetUst(bt("menu")) + g); return;
  }
  if (a.t !== "profil") g += `<button class="liste-satir" data-e="sikayet" data-t="${esc(a.t)}" data-id="${esc(a.id)}"><span class="ad">${bt("sikayetEt")}</span></button>`;
  if (a.ed !== "1") g += a.eng === "1"
    ? `<button class="liste-satir" data-e="engel-evet" data-h="${esc(a.h)}"><span class="ad">${esc(bt("engeliKaldir", a.h))}</span></button>`
    : `<button class="liste-satir" data-e="engel-sor" data-h="${esc(a.h)}"><span class="ad">${esc(bt("engelle", a.h))}</span></button>`;
  sheet(sheetUst(bt("menu")) + g);
}
// ---- kendi gönderisini 1 dk içinde yerinde düzenle · kendi gönderisini/yanıtını sil
function duzenleBasla(id) {
  sheetKapat();
  const o = ogeBul(id); if (!o || o.haber) return;
  if (kalanSn(o.zaman) <= 0) return tost(t("duzBitti"));
  document.querySelectorAll(`[data-oge="${id}"]`).forEach(el => {
    if ($(".duz", el)) return;
    const duz = document.createElement("div"); duz.className = "duz"; duz.dataset.id = id; duz.dataset.kz = o.zaman;
    duz.innerHTML = `<textarea class="yaz-alan duz-metin" maxlength="280" rows="3" aria-label="${esc(t("gonDuzenle"))}">${esc(o.metin)}</textarea>
      <div class="yz-ipucu duz-ipucu"></div>
      <div class="alt-satir"><span class="duz-sure gri">${t("duzKalan")}: <b class="kz-sure">${sureYaz(kalanSn(o.zaman))}</b></span><div class="bosluk"></div><span class="sayac duz-sayac">${280 - o.metin.length}</span>
        <span class="duz-dug"><button type="button" class="dug ikincil kucuk" data-e="duz-vazgec">${t("vazgec")}</button><button type="button" class="dug kucuk" data-e="duz-kaydet" disabled>${t("kaydet")}</button></span></div>`;
    const m = $(".metin", el);
    if (m) m.replaceWith(duz); else ($(".kim", el) || $(".detay-ust", el)).after(duz);
    const ta = $(".duz-metin", duz), kaydet = $('[data-e="duz-kaydet"]', duz); let z;
    ta.addEventListener("input", () => {
      const kalan = 280 - ta.value.length; $(".duz-sayac", duz).textContent = kalan; $(".duz-sayac", duz).classList.toggle("az", kalan < 20);
      const bos = !ta.value.trim() && !o.foto;
      kaydet.disabled = bos || ta.value.trim() === String(o.metin).trim() || duz.dataset.bitti === "1";
      clearTimeout(z); z = setTimeout(canliDenetle, 600, ta, $(".duz-ipucu", duz));
    });
    ta.addEventListener("keydown", e => { if (e.key === "Escape") { e.stopPropagation(); ogeGuncelle({ id }); } });
    ta.focus({ preventScroll: false }); ta.setSelectionRange(ta.value.length, ta.value.length);
  });
}
async function duzenleKaydet(duz) {
  if (!duz) return;
  const id = duz.dataset.id, ta = $(".duz-metin", duz), d = $('[data-e="duz-kaydet"]', duz);
  d.disabled = true;
  try {
    const v = await api(`/api/oge/${id}/duzenle`, { metin: ta.value.trim() });
    ogeGuncelle(v.gonderi); tost(t("duzKaydedildi"));
  } catch (e) {
    if (e.durum === 401) return hataGoster(e);
    if (e.durum === 403 || e.durum === 404) { ogeGuncelle({ id }); return tost(e.message); }   // süre doldu / artık düzenlenemez: eski metin görünür
    d.disabled = false; $(".duz-ipucu", duz).innerHTML = `<div class="ipucu">${esc(e.message)}</div>`;   // 422 filtre vb.: yazdığın kalır, düzeltip tekrar dene
  }
}
setInterval(() => {   // geri sayım: menüdeki "Düzenle (0:47)" ve açık düzenleme alanı; süre bitince menü öğesi kalkar, alan kapanır
  document.querySelectorAll("[data-kz]").forEach(el => {
    const k = kalanSn(el.dataset.kz), duz = el.classList.contains("duz");
    if (k > 0) { const s = $(".kz-sure", el); if (s) s.textContent = sureYaz(k); }
    else if (!duz) el.remove();
    else if (el.dataset.bitti !== "1") { el.dataset.bitti = "1"; $(".duz-sure", el).textContent = t("duzBitti"); $('[data-e="duz-kaydet"]', el).disabled = true; }
  });
}, 1000);
function silSor(tur, id) {
  sheet(sheetUst(t("gonSil")) + `<p class="gri">${esc(t(tur === "yanit" ? "silYanSor" : "silGonSor"))}</p>
    <button class="dug tam tehlike" data-e="sil-evet" data-t="${esc(tur)}" data-id="${esc(id)}">${t("gonSil")}</button><button class="dug ikincil tam" data-e="sheet-kapat">${t("vazgec")}</button>`);
}
async function silEvet(tur, id, dugme) {
  dugme.disabled = true;
  try { await api(tur === "yanit" ? `/api/yanit/${id}` : `/api/oge/${id}`, null, "DELETE"); }
  catch (er) { dugme.disabled = false; sheetKapat(); return hataGoster(er); }
  sheetKapat(); silindiSonrasi(tur, id);
}
function silindiSonrasi(tur, id) {
  tost(t("silindi"));
  if (tur === "gonderi") {
    D.ogeler = D.ogeler.filter(o => o.id !== id);
    document.querySelectorAll(`[data-oge="${id}"]`).forEach(el => el.remove());
    if (G.sayfa === "detay" && G.id === id) return yigin.length ? history.back() : gotur({ sayfa: "akis" }, false);
    return;
  }
  document.querySelectorAll(`[data-yanit="${id}"]`).forEach(el => el.remove());
  if (!D.detay) return;
  D.detay.yanitlar = (D.detay.yanitlar || []).filter(y => y.id !== id);
  ogeGuncelle({ id: D.detay.oge.id, yanitSayisi: Math.max(0, (D.detay.oge.yanitSayisi || 1) - 1) });   // sayaç düşer
  if (!$("#yanit-liste .satir") && !$("#yanit-bos")) $("#yanit-liste")?.insertAdjacentHTML("afterend", `<div class="bos az" id="yanit-bos">${t("bosYanit")}</div>`);
}
function sikayetAc(tur, id) {
  const s = sheet(sheetUst(bt("sikayetBaslik")) +
    `<div class="nedenler">${OPB.SIKAYET_NEDENLERI.map(n => `<label class="onay"><input type="radio" name="neden" value="${n}"><span>${esc(bt("nedenler")[n])}</span></label>`).join("")}</div>
    <div class="alan"><label for="sk-ayrinti">${bt("sikayetAyrinti")}</label><input id="sk-ayrinti" maxlength="500" autocomplete="off"></div>
    <div id="ipucu"></div><button class="dug tam" data-e="sikayet-gonder" data-t="${esc(tur)}" data-id="${esc(id)}" disabled>${bt("sikayetGonder")}</button>`);
  s.addEventListener("change", () => { s.querySelector('[data-e="sikayet-gonder"]').disabled = !s.querySelector('input[name="neden"]:checked'); });
}
async function sikayetGonder(dugme) {
  const neden = $('input[name="neden"]:checked')?.value; if (!neden) return;
  const ayrinti = $("#sk-ayrinti")?.value.trim() || undefined, { t: tur, id } = dugme.dataset;
  dugme.disabled = true;
  try { await api("/api/sikayet", { tur, hedefId: id, neden, ayrinti }); }
  catch (er) { dugme.disabled = false; if (er.durum === 401) return hataGoster(er); return ipucuYaz(er.message); }
  sheetKapat(); sikayetSonrasi(tur, id);
}
function sikayetSonrasi(tur, id) {   // şikâyet edende içerik hemen gizlenir (sunucu zaten böyle döner); listeden de çıkar
  if (tur === "gonderi") {
    D.ogeler = D.ogeler.filter(o => o.id !== id);
    document.querySelectorAll(`[data-oge="${id}"]`).forEach(el => el.remove());
    if (G.sayfa === "detay" && G.id === id) { tost(bt("sikayetAlindi")); return yigin.length ? history.back() : gotur({ sayfa: "akis" }, false); }
  } else if (tur === "yanit") document.querySelectorAll(`[data-yanit="${id}"]`).forEach(el => el.remove());
  tost(tur === "profil" ? bt("sikayetAlindiProfil") : bt("sikayetAlindi"));
}
function engelSor(h) {
  sheet(sheetUst(bt("engelle", h)) + `<p class="gri">${esc(bt("engelSor", h))}</p>
    <button class="dug tam" data-e="engel-evet" data-h="${esc(h)}">${bt("engelEvet")}</button><button class="dug ikincil tam" data-e="sheet-kapat">${bt("vazgec")}</button>`);
}
async function engelDegistir(h, dugme) {
  dugme.disabled = true;
  let v; try { v = await api(`/api/engelle/${encodeURIComponent(h)}`, {}); } catch (er) { dugme.disabled = false; sheetKapat(); return hataGoster(er); }
  sheetKapat();
  if (!v.engelliMi) { tost(bt("engelKalkti")); return G.sayfa === "profil" ? ciz(false) : undefined; }
  D.ogeler = D.ogeler.filter(o => o.yazar?.handle !== h);
  document.querySelectorAll(`article.satir:has(.sol[data-profil="${h}"])`).forEach(el => el.remove());
  tost(bt("engellendi"));
  if (G.sayfa === "profil" && G.handle === h) return yigin.length ? history.back() : gotur({ sayfa: "akis" }, false);
}
async function engellenenlerAc() {
  const s = sheet(sheetUst(bt("engellenenler")) + `<div id="eng-liste">${iskelet}</div>`);
  try {
    const v = await api("/api/engellenenler");
    $("#eng-liste", s).innerHTML = v.kullanicilar.length ? v.kullanicilar.map(k => `<div class="eng-satir" data-h="${esc(k.handle)}">${avatarHtml(k, "kucuk")}
      <div class="govde"><b>${esc(k.ad)}</b><div class="gri">@${esc(k.handle)}</div></div>
      <button class="dug ikincil kucuk" data-e="engel-kaldir" data-h="${esc(k.handle)}">${bt("kaldir")}</button></div>`).join("") : bosHtml(bt("bosEngel"));
  } catch (er) { $("#eng-liste", s).innerHTML = bosHtml(er.message); }
}
async function engelKaldir(h, dugme) {
  dugme.disabled = true;
  try {
    const v = await api(`/api/engelle/${encodeURIComponent(h)}`, {});
    if (v.engelliMi) { dugme.disabled = false; return; }   // yarış: tekrar engellendi → satır kalsın
    document.querySelector(`.eng-satir[data-h="${h}"]`)?.remove(); tost(bt("engelKalkti"));
    if (!document.querySelector(".eng-satir")) $("#eng-liste").innerHTML = bosHtml(bt("bosEngel"));
  } catch (er) { dugme.disabled = false; tost(er.message); }
}
// ---- hesabı sil: iki adımlı onay (App Store 5.1.1(v))
function hesapSil1() {
  sheet(sheetUst(bt("hesabiSil")) + `<p>${esc(bt("silUyari"))}</p>
    <button class="dug tam tehlike" data-e="hesap-sil-2">${bt("devam")}</button><button class="dug ikincil tam" data-e="sheet-kapat">${bt("vazgec")}</button>`);
}
function hesapSil2() {
  const s = sheet(sheetUst(bt("hesabiSil")) + `<p>${bt("silOnayYaz", bt("silYaz"))}</p>
    <div class="alan"><input id="sil-onay" autocomplete="off" autocapitalize="characters" aria-label="${esc(bt("silYaz"))}"></div><div id="ipucu"></div>
    <button class="dug tam tehlike" id="sil-son" data-e="hesap-sil-son" disabled>${bt("silKalici")}</button><button class="dug ikincil tam" data-e="sheet-kapat">${bt("vazgec")}</button>`);
  $("#sil-onay", s).addEventListener("input", e => { $("#sil-son", s).disabled = e.target.value.trim().toLocaleUpperCase(D.dil === "en" ? "en" : "tr") !== bt("silYaz"); });
}
async function hesapSilSon(dugme) {
  dugme.disabled = true;
  try { await api("/api/hesap", null, "DELETE"); }
  catch (er) { dugme.disabled = false; return ipucuYaz(er.message); }
  sakla.koy("op-taslak", null); D.ben = null; D.oturum = false; sheetKapat(); karsilamaCiz(0); tost(bt("hesapSilindi"));
}

// ---------- yan alanlar: sol menü (≥700 px), sağ sütun (≥1100 px), mobil çekmece, "İyi gündem" + "Kimi takip etmeli" (tek kod, her yerde aynı bileşen) ----------
const girisli = () => !BULUT || !!D.ben;
const MENU_TANIM = { akis: ["ana", "ana"], kesfet: ["kesfet", "kesfet"], bildirim: ["bildirim", "bildirim"], kayit: ["kayit", "kayitlar"], profil: ["profil", "profil"], ayarlar: ["ayarlar", "ayarlar"] };
const menuOgeleri = (sira) => sira.filter(s => girisli() || s === "akis" || s === "kesfet" || s === "ayarlar");   // misafirde girişsiz çalışmayan öğe yok
function solSecili() {
  if (G.sayfa === "akis") return G.kategori ? "kesfet" : "akis";
  if (G.sayfa === "profil") return !G.handle || G.handle === D.ben?.handle ? "profil" : "";
  return ["kesfet", "bildirim", "kayit"].includes(G.sayfa) ? G.sayfa : "";
}
const menuDugme = (s, sinif) => {
  const [ik, ad] = MENU_TANIM[s], sec = solSecili() === s, e = s === "ayarlar" ? 'data-e="ayarlar"' : `data-e="git" data-s="${s}"`;
  return `<button class="${sinif} ${sec ? "secili" : ""}" ${e} aria-label="${t(ad)}" ${sec ? 'aria-current="page"' : ""}>${ikon(ik, 26)}<span class="sol-ad">${t(ad)}</span>${s === "bildirim" && D.okunmamis ? '<i class="nokta"></i>' : ""}</button>`;
};
const yasalSatir = () => `<a href="/yasal/kosullar" target="_blank" rel="noopener">${t("kosul")}</a> · <a href="/yasal/gizlilik" target="_blank" rel="noopener">${t("gizlilik")}</a> · <a href="/yasal/cerezler" target="_blank" rel="noopener">${t("cerez")}</a> · <a href="/yasal/kurallar" target="_blank" rel="noopener">${t("kurallar")}</a> · <a href="mailto:${IL_EPOSTA}">${t("iletisim")}</a>`;
function hesapKartHtml() {
  if (!D.ben) return `<div class="sol-misafir"><button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button></div>`;
  return `<div class="hesap-alan"><button class="hesap-kart" data-e="hesap-menu" aria-haspopup="menu" aria-expanded="false" aria-label="${t("hesapMenu")}">${avatarHtml(D.ben, "kucuk")}
      <span class="hesap-bilgi"><b>${esc(D.ben.ad)}</b><span class="gri">@${esc(D.ben.handle)}</span></span><span class="hesap-uc" aria-hidden="true">•••</span></button>
    <div class="hesap-menu" role="menu" hidden><button role="menuitem" data-e="git" data-s="profil">${t("profil")}</button>
      ${BULUT ? `<button role="menuitem" data-e="cikis-yap">${bt("cikisYap")}</button>` : `<button role="menuitem" data-e="profil-duzenle">${t("duzenle")}</button>`}</div></div>`;
}
function solHtml() {
  return `<div class="sol-ic"><div class="sol-ust"><button class="sol-logo" data-e="ust-yenile" aria-label="OP"><img src="icons/op.svg" alt="OP"></button>${betaEtiket()}</div>
    <nav class="sol-menu" aria-label="${t("menu")}">${menuOgeleri(["akis", "kesfet", "bildirim", "kayit", "profil", "ayarlar"]).map(s => menuDugme(s, "sol-oge")).join("")}</nav>
    <button class="dug sol-yaz" data-e="yaz-sol" aria-label="${t("gonderiYayinla")}"><span class="yaz-ik">${ikon("yaz", 26)}</span><span class="yaz-ad">${t("gonderiYayinla")}</span></button>
    <div class="bosluk"></div>${hesapKartHtml()}</div>`;
}
const sagHtml = () => gundemHtml("sag") + onerilenHtml("sag") + `<footer class="yan-yasal">${yasalSatir()} · © OP</footer>`;
const genis2 = () => matchMedia("(min-width:1100px)").matches;
function solCiz() { const s = $("#sol"); if (s) s.innerHTML = genis() ? solHtml() : ""; }
function sagCiz() { const g = $("#sag"); if (g) g.innerHTML = genis2() ? sagHtml() : ""; }
function yanCiz() { solCiz(); sagCiz(); }
for (const q of ["(min-width:700px)", "(min-width:1100px)"]) matchMedia(q).addEventListener?.("change", () => {
  yanCiz();
  if (G.sayfa === "akis" && !G.kategori && kok().querySelector(".icerik") && !document.querySelector(".sheet,.cekmece")) ciz(false);
});

// veri: kategori sayıları (İyi gündem) + önerilen OP hesapları; 30 sn önbellek, uç yoksa (eski sunucu / SQL çalışmamış) ilgili kutu sessizce gizlenir
let veriSoz = null;
function veriYukle() {
  const kim = D.ben?.handle || "";
  if (veriSoz && D.veriKim === kim && Date.now() - (D.veriZ || 0) < 30000) return veriSoz;
  D.veriKim = kim; D.veriZ = Date.now();
  return (veriSoz = Promise.all([api("/api/kategoriler").then(v => v.kategoriler || {}, () => null), api("/api/onerilen").then(v => v.kullanicilar || [], () => null)])
    .then(([k, o]) => { D.katSay = k; D.onerilen = o; }));
}
function gundemHtml(tur) {
  const e = Object.entries(D.katSay || {}).filter(([k, n]) => n > 0 && KATEGORI[k]).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
  if (!e.length) return "";
  return `<section class="yan-kutu" data-gundem="${tur}" aria-label="${t("gundem")}"><h2>${t("gundem")}</h2>${e.map(([k, n]) =>
    `<button class="gundem-satir" data-e="kategori" data-k="${k}"><span class="ad">${KATEGORI[k][di()]}</span><span class="gri">${t("say", n, t("haber"))}</span></button>`).join("")}
    ${tur === "kesfet" ? "" : `<button class="yan-daha" data-e="git" data-s="kesfet">${t("dahaFazla")}</button>`}</section>`;
}
function oneriSatir(k, liste = false) {
  const h = esc(k.handle);
  return `<div class="oneri-satir"><span class="oneri-av" data-profil="${h}">${avatarHtml(k)}</span>
    <div class="oneri-bilgi" data-profil="${h}"><div class="ad">${esc(k.ad)}${rozetHtml(k)}</div><div class="gri">@${h}</div>${liste && k.bio ? `<div class="oneri-bio">${esc(k.bio)}</div>` : ""}</div>
    ${liste ? `<button class="dug kucuk ${k.takipEdiyorMu ? "ikincil" : ""}" data-e="takip" data-h="${h}">${k.takipEdiyorMu ? t("takipte") : t("takipEt")}</button>`
      : `<button class="dug kucuk" data-e="takip-oneri" data-h="${h}">${t("takipEt")}</button>`}</div>`;
}
function onerilenHtml(tur) {   // tur: sag | kesfet (3 satır) | akis (yatay kaydırmalı kartlar)
  const l = D.onerilen || [];
  if (!l.length) return "";
  if (tur === "akis") return `<section class="oneri-akis" data-oneri="akis" aria-label="${t("takipOner")}"><h2>${t("takipOner")}</h2><div class="oneri-sirit">${l.slice(0, 8).map(k =>
    `<div class="on-kart"><span data-profil="${esc(k.handle)}">${avatarHtml(k)}</span><div class="ad" data-profil="${esc(k.handle)}">${esc(k.ad)}${rozetHtml(k)}</div><div class="gri kisa">@${esc(k.handle)}</div>
      <button class="dug kucuk" data-e="takip-oneri" data-h="${esc(k.handle)}">${t("takipEt")}</button></div>`).join("")}</div></section>`;
  return `<section class="yan-kutu" data-oneri="${tur}" aria-label="${t("takipOner")}"><h2>${t("takipOner")}</h2>${l.slice(0, 3).map(k => oneriSatir(k)).join("")}
    <button class="yan-daha" data-e="onerilen-liste">${t("dahaFazla")}</button></section>`;
}
function onerilenDagit() {
  document.querySelectorAll("[data-oneri]").forEach(el => {
    const h = onerilenHtml(el.dataset.oneri); if (!h) return el.remove();
    const d = document.createElement("div"); d.innerHTML = h; el.replaceWith(d.firstElementChild);
  });
}
async function onerilenTakip(h) {
  if (girisGerekli()) return;
  const hepsi = document.querySelectorAll(`[data-e="takip-oneri"][data-h="${h}"]`);
  hepsi.forEach(b => { b.disabled = true; });
  try { await api(`/api/kullanici/${encodeURIComponent(h)}/takip`, {}); } catch (er) { hepsi.forEach(b => { b.disabled = false; }); return hataGoster(er); }
  hepsi.forEach(b => { b.textContent = t("takipte"); b.classList.add("ikincil"); });   // düğme değişir, kısa süre sonra hesap listeden düşer
  D.veriZ = 0;
  setTimeout(() => { D.onerilen = (D.onerilen || []).filter(x => x.handle !== h); onerilenDagit(); }, 900);
}
// mobil yan çekmece (avatara dokununca soldan açılır): hesap kartı + menü + tema kısayolu + yasal bağlantılar
function cekmeceHtml() {
  const k = D.ben, tm = document.documentElement.dataset.tema || "";
  const hesap = k ? `<button class="cek-hesap" data-e="git" data-s="profil">${avatarHtml(k)}<b class="ad">${esc(k.ad)}</b><span class="gri">@${esc(k.handle)}</span>
      <span class="cek-say gri">${typeof k.takipSayisi === "number" ? `<span><b>${k.takipSayisi}</b> ${t("takipSay")}</span> · <span><b>${k.takipci || 0}</b> ${t("takipciSay")}</span>` : ""}</span></button>`
    : `<div class="cek-misafir">${avatarHtml(null)}<button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button></div>`;
  return `<div class="cek-ust"><span class="cek-baslik">${t("yanMenu")}</span><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>${hesap}
    <nav class="cek-menu" aria-label="${t("menu")}">${menuOgeleri(["profil", "kayit", "bildirim", "kesfet", "ayarlar"]).map(s => menuDugme(s, "cek-oge")).join("")}
      ${BULUT && k ? `<button class="cek-oge" data-e="cikis-yap"><span class="sol-ad">${bt("cikisYap")}</span></button>` : ""}</nav>
    <div class="bosluk"></div><div class="grup cek-tema" role="group" aria-label="${t("tema")}"><button class="dug kucuk ${tm === "acik" ? "" : "ikincil"}" data-e="tema" data-t="acik" aria-pressed="${tm === "acik"}">${t("acikTema")}</button>
      <button class="dug kucuk ${tm === "koyu" ? "" : "ikincil"}" data-e="tema" data-t="koyu" aria-pressed="${tm === "koyu"}">${t("koyuTema")}</button></div>
    <p class="yan-yasal">${yasalSatir()}</p>`;
}
function cekmeceAc(yenile) {
  const onceki = yenile ? D.odakGeri : document.activeElement;
  sheetKapat();
  const p = document.createElement("div"); p.className = "perde"; p.dataset.e = "sheet-kapat";
  const c = document.createElement("aside"); c.className = "cekmece"; c.setAttribute("role", "dialog"); c.setAttribute("aria-modal", "true"); c.setAttribute("aria-label", t("yanMenu"));
  c.innerHTML = cekmeceHtml(); document.body.append(p, c); D.odakGeri = onceki;
  if (yenile) $('[data-e="tema"][aria-pressed="true"]', c)?.focus(); else $("button", c).focus({ preventScroll: true });
  if (D.ben && !yenile) api(`/api/kullanici/${encodeURIComponent(D.ben.handle)}`).then(v => {   // takip/takipçi sayıları güncel gelsin
    const say = $(".cek-say", c); if (say && c.isConnected && v?.kullanici) say.innerHTML = `<span><b>${v.kullanici.takipSayisi}</b> ${t("takipSay")}</span> · <span><b>${v.kullanici.takipci}</b> ${t("takipciSay")}</span>`;
  }).catch(() => {});
}

// ---------- başlangıç ----------
async function bildirimYokla() {
  if (!D.ben) return;
  const v = await api("/api/bildirimler").catch(() => null);
  if (v && v.okunmamis !== D.okunmamis) {
    D.okunmamis = v.okunmamis; const alt = $(".alt"); if (alt) alt.outerHTML = altHtml();
    solCiz();
  }
}
async function basla() {
  if (BULUT) return baslaBulut();
  document.documentElement.lang = D.dil;
  if (!D.ben) return karsilamaCiz(0);
  try { await api(`/api/kullanici/${D.ben.handle}`); }
  catch (e) {
    if (e.durum === 404) {   // sunucu verisi sıfırlandı (yerel deneme): profili yeniden kaydet; ağ hatasında profile dokunma
      await api("/api/kullanici", { ...D.ben, cihaz: D.cihaz, dil: D.dil }).catch(er => { if (er.durum === 409) { sakla.koy("op-ben", null); D.ben = null; } });
      if (!D.ben) return karsilamaCiz(0);
    }
  }
  const m = location.hash.match(/^#g=([a-z0-9-]+)$/);
  if (m) G = { sayfa: "detay", kategori: "", handle: null, id: m[1], odak: false };
  ciz(true); bildirimYokla(); setInterval(bildirimYokla, 20000);
}
if (!NATIF && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});   // mobil pakette SW yok: varlıklar paketin içinde
// mağaza uygulaması köprüsü (mobil/src/mobil.js kullanır): Android geri tuşu + paylaşılan bağlantıyla (#g=<id>) açılış
window.OP_UYG = {
  geri() {   // true = uygulama içinde işlendi; false = en üst düzey (Android: uygulamayı arka plana al)
    if (document.querySelector(".sheet,.cekmece")) { sheetKapat(); return true; }
    if (yigin.length) { history.back(); return true; }
    if (G.sayfa !== "akis") { gotur({ sayfa: "akis" }, false); return true; }
    return false;
  },
  async kodGirisi(kod) {   // e-postadaki bağlantıdan (org.onlypositive.app://…?code=) dönüş: PKCE kodu BU uygulamada değiştirilir (doğrulayıcı burada saklı)
    if (!OPB || !kod) return;
    try { await OPB.op.kodDegistir(kod); } catch (er) { return tost(er.message); }
    const ben = await kimlikHazirla();
    if (D.sifreYenileniyor) return;   // PASSWORD_RECOVERY olayı şifre yenileme ekranını açtı
    if (D.oturum && !ben) return profilGerek();
    girisSonrasi();
  },
  bildir: (m) => tost(m),
  gonderiAc(id) { if (!/^[a-z0-9-]+$/.test(String(id))) return; gotur({ sayfa: "detay", id }, false); },
};
basla();
