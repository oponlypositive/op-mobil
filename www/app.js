// OP – Only Positive · tek sayfa uygulama (bağımlılıksız, sade X iskeleti)
"use strict";
// gecis-019: yazı serileri + çoklu kayıt listeleri + iç huzur kategorileri + Takip/Yakınımda düzeltmesi (bölümler "gecis-019" ile işaretli)
const $ = (s, k = document) => k.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const guvenliUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const BG = window.OP_BAGLANTI || null;   // bağlantı çekirdeği (public/baglanti.js): tıklanabilir bağlantı, kart doğrulama
const bagla = (m) => (BG ? BG.bagla(m, esc) : esc(m));   // düz metin → güvenli HTML (http/https bağlantıları <a>)
// @etiket (gecis-017): AYNI düzenli ifade sunucuda (SQL etiket_cikar / yerel sunucu). '@' bir harf/rakam/_/@/./ karakterinden sonra gelmez (a@b.com e-posta, bağlantı yolu), handle 2-20 harf/rakam/_.
const ETIKET_RE = /(^|[^A-Za-z0-9_@./])@([A-Za-z0-9_]{2,20})(?![A-Za-z0-9_])/g;
// Metin → güvenli HTML: bağlantılar bagla() ile, SUNUCUNUN doğruladığı etiketler (var olan hesaplar; `etiketler` dizisi) profile giden bağlantı olur; olmayan handle düz metin kalır. Bağlantı içindeki @ etiket sayılmaz.
function baglaEtiket(m, etiketler) {
  const s = String(m ?? "");
  if (!etiketler || !etiketler.length) return bagla(s);
  const var_ = new Set(etiketler.map(x => String(x).toLowerCase()));
  const parca = (t) => {   // bağlantısız metin parçası
    let h = "", i = 0, r; ETIKET_RE.lastIndex = 0;
    while ((r = ETIKET_RE.exec(t))) {
      const hd = r[2].toLowerCase(); if (!var_.has(hd)) continue;
      const bas = r.index + r[1].length;
      h += esc(t.slice(i, bas)) + `<span class="bahset" data-e="etiket" data-h="${esc(hd)}" role="link" tabindex="0">@${esc(r[2])}</span>`;
      i = bas + 1 + r[2].length;
    }
    return h + esc(t.slice(i));
  };
  if (!BG) return parca(s);
  let h = "", i = 0;
  for (const b of BG.bul(s)) {
    if (!BG.temizle(b.ham)) continue;
    h += parca(s.slice(i, b.bas)) + bagla(b.ham); i = b.son;
  }
  return h + parca(s.slice(i));
}
const sakla = { al(k, v) { try { const x = localStorage.getItem(k); return x === null ? v : JSON.parse(x); } catch { return v; } },
  koy(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };

// ---------- sabitler ----------
const AVATARLAR = ["🌞", "🌻", "🐱", "🐶", "🦊", "🐼", "🐨", "🦄", "🐸", "🐙", "🦋", "🌈", "🍉", "🍓", "🚀", "⭐", "🎈", "🎨"];
const RENKLER = ["#CDE7EC", "#F3E3B3", "#E6D5F2", "#D5ECD9", "#F6D5D0", "#D9DEE8"];
const KATEGORI = { huzur: ["İç Huzur", "Inner Peace"], gelisim: ["Kişisel Gelişim", "Personal Growth"], yasam: ["Sağlıklı Yaşam", "Healthy Living"],   // gecis-019: iç huzur teması, Keşfet ve ilgi seçiminde ÖNDE
  bilim: ["Bilim", "Science"], saglik: ["Sağlık", "Health"], doga: ["Doğa", "Nature"], hayvanlar: ["Hayvanlar", "Animals"], iyilik: ["İyilik", "Kindness"],
  sanat: ["Sanat", "Arts"], spor: ["Spor", "Sports"], teknoloji: ["Teknoloji", "Tech"], mahalle: ["Mahalle", "Neighborhood"],
  felsefe: ["Felsefe", "Philosophy"], edebiyat: ["Edebiyat", "Literature"], siir: ["Şiir", "Poetry"], mitoloji: ["Mitoloji", "Mythology"], gokbilim: ["Gökbilim", "Astronomy"],
  resim: ["Resim", "Paintings"], sohbet: ["Sorular", "Questions"], mutfak: ["Mutfak", "Kitchen"], oyun: ["Oyun", "Games"], tarih: ["Tarih", "History"] };   // sohbet kategorisi çipte "Sorular" (genel "sohbet" sözcüğüyle çakışmasın)
const KAT_ACIKLAMA = { huzur: ["Sakinlik, nefes ve dikkat", "Calm, breath and attention"], gelisim: ["Küçük alışkanlıklar ve öğrenme", "Small habits and learning"], yasam: ["Uyku, beslenme ve hareket", "Sleep, food and movement"], bilim: ["Keşifler ve buluşlar", "Discoveries and breakthroughs"], saglik: ["Sağlık ve iyileşme", "Health and recovery"], doga: ["Doğa ve çevre", "Nature and environment"],
  hayvanlar: ["Hayvanlar ve patili dostlar", "Animals and pets"], iyilik: ["Küçük ve büyük iyilikler", "Acts of kindness"], sanat: ["Sanat, müzik, tasarım", "Art, music, design"],
  spor: ["Spor başarıları ve güzel anlar", "Sports wins and great moments"], teknoloji: ["Teknoloji ve yenilikler", "Technology and innovation"], mahalle: ["Mahalle ve şehirlerden", "From neighborhoods and cities"],
  felsefe: ["Felsefe: düşünür sözleri", "Philosophy: thinkers' quotes"], edebiyat: ["Edebiyat alıntıları", "Literary quotes"], siir: ["Şiir", "Poetry"], mitoloji: ["Mitoloji ve eski anlatılar", "Mythology and old tales"], gokbilim: ["Gökbilim ve uzay", "Astronomy and space"] , resim: ["Ünlü tablolar ve öyküleri", "Famous paintings and their stories"], sohbet: ["Topluluğa küçük sorular", "Small questions for the community"], mutfak: ["Tarifler ve içecekler", "Recipes and drinks"], oyun: ["Nostaljik ve geleneksel oyunlar", "Nostalgic and traditional games"], tarih: ["Tarihten güzel anlar", "Lovely moments from history"] };
// Alt konular (ör. spor dalları, kadın/erkek ligleri, kişisel gelişim) için yer: { spor: [["kadin-sporlari", ["Kadın sporları", "Women's sports"]], ...] }. Haber hattı `alt_konu` etiketi üretince doldurulur; bkz. rapor.
const ILGI_ALT = {};
// Hazır (henüz bağlı değil; haber hattı `alt_konu` üretip sunucu "kategori.alt" anahtarını kabul edince ILGI_ALT'a taşınır): resim → manzara, portre, naturmort, gunluk-yasam, soyut, hayvan; sohbet → hava-yer, gunun-sorusu, kultur, oneri
const ILGI_ALT_HAZIR = { resim: [["manzara", ["Manzara", "Landscape"]], ["portre", ["Portre", "Portrait"]], ["naturmort", ["Natürmort", "Still life"]], ["gunluk-yasam", ["Günlük yaşam", "Everyday life"]], ["soyut", ["Soyut", "Abstract"]], ["hayvan", ["Hayvan", "Animal"]]],
  tarih: [["ronesans", ["Rönesans", "Renaissance"]], ["misir", ["Mısır", "Egypt"]], ["cin", ["Çin", "China"]], ["mezoamerika", ["Mezoamerika", "Mesoamerica"]], ["sumer", ["Sümer", "Sumer"]], ["anadolu", ["Anadolu", "Anatolia"]], ["hint-vadisi", ["Hint Vadisi", "Indus Valley"]], ["yunan-roma", ["Yunan ve Roma", "Greece and Rome"]]],
  mutfak: [["icecek", ["İçecek", "Drinks"]]], edebiyat: [["turk-klasik", ["Türk klasikleri", "Turkish classics"]]],
  sohbet: [["hava-yer", ["Hava ve yer", "Weather and place"]], ["gunun-sorusu", ["Günün sorusu", "Question of the day"]], ["kultur", ["Kültür", "Culture"]], ["oneri", ["Öneri", "Recommendations"]]] };
const SEHIRLER = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya", "Gaziantep", "Kocaeli", "Mersin", "Eskişehir", "Trabzon", "Samsun", "Muğla", "Diğer"];
const videoMb = () => (window.OP_MEDYA && window.OP_MEDYA.SINIR && window.OP_MEDYA.SINIR.mb) || 40;   // video boyut sınırı (MB): medya arka ucuna göre (medya.js SINIR)
const T = {
  tr: { yeniHap: (n) => `${n >= 100 ? "99+" : n} yeni gönderi`, yenileniyor: "Yenileniyor", cekYenile: "Yenilemek için aşağı çek", geriAl: "Geri al", yenilenemedi: "Yenilenemedi, tekrar dener misin?",
    ilgiBaslik: "İlgi alanlarım", ilgiNot: "Akışını sana göre ayarla. “Gösterme” dediğin konular Senin İçin akışında çıkmaz; takip ettiklerin ve kendi gönderilerin etkilenmez.",
    ilgiDaha: "Daha çok", ilgiNormal: "Normal", ilgiGosterme: "Gösterme", ilgiSoru: "Nelerden hoşlanırsın?", ilgiSoruNot: "Seçtiklerini akışında daha çok göstereceğiz. Dilediğin zaman Ayarlar > İlgi alanlarım'dan değiştirebilirsin.",
    ilgiDevam: "Devam", ilgiGec: "Şimdilik geç", ilgiHata: "İlgi alanların kaydedilemedi, tekrar dener misin?", azGoster: "Bu konudan daha az göster", azGosterTamam: (k) => `“${k}” artık Senin İçin akışında gösterilmeyecek`,
    titresim: "Dokunma titreşimi", titresimNot: "Beğeni, kaydetme gibi dokunuşlarda hafif titreşim (telefonun destekliyorsa).",
    yaziBoyutu: "Yazı boyutu", yaziKucuk: "Küçük", yaziNormal: "Normal", yaziBuyuk: "Büyük",
    senin: "Senin İçin",    takip: "Takip", yakin: "Yakınımda", ana: "Ana Sayfa", kesfet: "Keşfet", bildirim: "Bildirimler", profil: "Profil",
    yeniGonderi: "Yeni gönderi", ne: "Bugün iyi olan ne?", paylas: "Paylaş", yanitYaz: "Yanıtını yaz", yanitla: "Yanıtla", yeniden: "Yeniden paylaş", begen: "Beğen",
    gonderi: "Gönderi", yenidenDedi: "yeniden paylaştı", bosAkis: "Henüz burada bir şey yok.", bosTakip: "Takip ettiklerinin gönderileri burada görünür.",
    bosBildirim: "Henüz bildirim yok.", bosYanit: "Henüz yanıt yok.", kaynak: "Kaynak", foto: "Fotoğraf", devami: "Devamını göster", video: "Video", sesAc: "Sesi aç", sesKapat: "Sesi kapat", oynat: "Oynat", ayarlar: "Ayarlar", tema: "Tema", oto: "Otomatik",
    acik: "Açık", koyu: "Koyu", dil: "Dil", cikis: "Profili bu cihazdan sil", duzenle: "Profili düzenle", kaydet: "Kaydet", geri: "Geri", kapat: "Kapat",
    takipEt: "Takip et", takipte: "Takipte", takipSay: "Takip", takipciSay: "Takipçi", editor: "OP editörü", resmi: "Resmi hesap", haber: "sohbet",
    sehir: "Şehrin", sehirSec: "Yakınındakileri görmek için şehrini seç.", yanit: "Yanıt", yeniPay: "Yeniden paylaşım", begeni: "Beğeni",
    bildirimMetin: { begen: "gönderini beğendi", yanit: "gönderine yanıt verdi", yay: "gönderini yeniden paylaştı", takip: "seni takip etti" },
    kayit: "Kaydet", kayitlar: "Kaydedilenler", bosKayit: "Kaydettiğin gönderiler burada durur. Yalnız sen görürsün.", kaydedildi: "Kaydedildi", kayitKalkti: "Kaydedilenlerden çıkarıldı",
    disari: "Paylaş", kopyala: "Bağlantıyı kopyala", sununla: "Şununla paylaş", eposta: "Mail", hikaye: "Hikâye", igYapistir: "Bağlantı kopyalandı. Instagram'da yapıştır.",
    paylasildi: "Paylaşıldı", kopyalandi: "Bağlantı kopyalandı", yok: "Bulunamadı", hata: "Bağlantı sorunu",
    katildi: (a) => `${a} tarihinde katıldı`, say: (n, k) => `${n} ${k}`, silOnay: "Profilin bu cihazdan silinsin mi?",
    gonderiYayinla: "Gönderi yayınla", emoji: "Emoji", gundem: "İyi gündem", dahaFazla: "Daha fazla göster", takipOner: "Kimi takip etmeli", bosOner: "Önerilecek hesap kalmadı.",
    hesapMenu: "Hesap menüsü", menu: "Menü", kosul: "Koşullar", gizlilik: "Gizlilik", cerez: "Çerezler", kurallar: "Kurallar", destek: "Destek", iletisim: "İletişim", cikisYapYerel: "Profili düzenle", acikTema: "Açık tema", koyuTema: "Koyu tema", yanMenu: "Ana menü",
    duzenlendi: "düzenlendi", gonDuzenle: "Düzenle", gonSil: "Sil", silGonSor: "Bu gönderi silinsin mi? Geri alınamaz.", silYanSor: "Bu yanıt silinsin mi? Geri alınamaz.", silindi: "Silindi",
    vazgec: "Vazgeç", duzKalan: "Kalan süre", duzBitti: "Düzenleme süresi doldu", duzKaydedildi: "Gönderi güncellendi" },
  en: { yeniHap: (n) => `${n >= 100 ? "99+" : n} new post${n === 1 ? "" : "s"}`, yenileniyor: "Refreshing", cekYenile: "Pull down to refresh", geriAl: "Undo", yenilenemedi: "Couldn't refresh, please try again.",
    ilgiBaslik: "My interests", ilgiNot: "Tune your feed. Topics you set to “Hide” won't show in For You; people you follow and your own posts aren't affected.",
    ilgiDaha: "More", ilgiNormal: "Normal", ilgiGosterme: "Hide", ilgiSoru: "What do you enjoy?", ilgiSoruNot: "We'll show more of what you pick. You can change it anytime in Settings > My interests.",
    ilgiDevam: "Continue", ilgiGec: "Skip for now", ilgiHata: "Couldn't save your interests, please try again.", azGoster: "Show less of this topic", azGosterTamam: (k) => `“${k}” won't show in For You any more`,
    titresim: "Touch vibration", titresimNot: "A light vibration when you like, bookmark and so on (if your phone supports it).",
    yaziBoyutu: "Text size", yaziKucuk: "Small", yaziNormal: "Normal", yaziBuyuk: "Large",
    senin: "For You",    takip: "Following", yakin: "Nearby", ana: "Home", kesfet: "Explore", bildirim: "Notifications", profil: "Profile",
    yeniGonderi: "New post", ne: "What's good today?", paylas: "Post", yanitYaz: "Post your reply", yanitla: "Reply", yeniden: "Repost", begen: "Like",
    gonderi: "Post", yenidenDedi: "reposted", bosAkis: "Nothing here yet.", bosTakip: "Posts from people you follow show up here.",
    bosBildirim: "No notifications yet.", bosYanit: "No replies yet.", kaynak: "Source", foto: "Photo", devami: "Show more", video: "Video", sesAc: "Turn sound on", sesKapat: "Turn sound off", oynat: "Play", ayarlar: "Settings", tema: "Theme", oto: "Auto",
    acik: "Light", koyu: "Dark", dil: "Language", cikis: "Remove profile from this device", duzenle: "Edit profile", kaydet: "Save", geri: "Back", kapat: "Close",
    takipEt: "Follow", takipte: "Following", takipSay: "Following", takipciSay: "Followers", editor: "OP editor", resmi: "Official account", haber: "conversations",
    sehir: "Your city", sehirSec: "Pick your city to see what's nearby.", yanit: "Replies", yeniPay: "Reposts", begeni: "Likes",
    bildirimMetin: { begen: "liked your post", yanit: "replied to your post", yay: "reposted your post", takip: "followed you" },
    kayit: "Bookmark", kayitlar: "Bookmarks", bosKayit: "Posts you bookmark are kept here. Only you can see them.", kaydedildi: "Bookmarked", kayitKalkti: "Removed from bookmarks",
    disari: "Share", kopyala: "Copy link", sununla: "Share via", eposta: "Mail", hikaye: "Stories", igYapistir: "Link copied. Paste it in Instagram.",
    paylasildi: "Posted", kopyalandi: "Link copied", yok: "Not found", hata: "Connection problem",
    katildi: (a) => `Joined ${a}`, say: (n, k) => `${n} ${k}`, silOnay: "Remove your profile from this device?",
    gonderiYayinla: "Post", emoji: "Emoji", gundem: "Good conversations today", dahaFazla: "Show more", takipOner: "Who to follow", bosOner: "No more accounts to suggest.",
    hesapMenu: "Account menu", menu: "Menu", kosul: "Terms", gizlilik: "Privacy", cerez: "Cookies", kurallar: "Rules", destek: "Support", iletisim: "Contact", cikisYapYerel: "Edit profile", acikTema: "Light theme", koyuTema: "Dark theme", yanMenu: "Main menu",
    duzenlendi: "edited", gonDuzenle: "Edit", gonSil: "Delete", silGonSor: "Delete this post? This can't be undone.", silYanSor: "Delete this reply? This can't be undone.", silindi: "Deleted",
    vazgec: "Cancel", duzKalan: "Time left", duzBitti: "Editing time is over", duzKaydedildi: "Post updated" },
};
Object.assign(T.tr, { pfSec: "Fotoğraf seç", pfKaldir: "Fotoğrafı kaldır", pfKirp: "Fotoğrafı ayarla", pfYakin: "Yakınlaştır", pfKullan: "Kullan", pfAcilamaz: "Fotoğraf açılamadı.", pfIpucu: "Sürükleyerek konumlandır; fotoğraf kare olarak kırpılır.", pfAlan: "Profil fotoğrafı", cevapYaz: "Cevabını yaz", paylasimYaz: "Paylaşım yaz", anket: "Anket", anketEkle: "Anket ekle", anketSecenek: (n) => `Seçenek ${n}`, anketSecenekEkle: "+ Seçenek ekle", anketSure: "Anket süresi", gun1: "1 gün", gun3: "3 gün", gun7: "7 gün", anketKaldir: "Anketi kaldır", oyAd: "oy", sonuclandi: "Sonuçlandı", kalanGun: (n) => `${n} gün kaldı`, kalanSaat: (n) => `${n} saat kaldı`, kalanDk: (n) => `${n} dk kaldı`, anketUyum: "Anketle fotoğraf, video ya da alıntı birlikte paylaşılamaz.", anketOyHata: "Oyun kaydedilemedi, tekrar dener misin?", seciliSecenek: "seçtiğin",   // video (gecis-007): yükleme, oynatıcı, Videolar akışı, otomatik oynatma tercihi
  videolar: "Videolar", bosVideo: "Henüz video yok. İlk videoyu sen paylaşabilirsin.", videoEkle: "Video ekle",
  videoHatirlat: () => `Yalnız kendi çektiğin, pozitif videolar. En çok 60 sn ve ${videoMb()} MB; mp4 (H.264) en uyumlusu.`,
  videoBuyuk: () => `Video çok büyük (en çok ${videoMb()} MB).`, videoUzun: "Video çok uzun (en çok 60 sn).", videoTur: "Bu video biçimi desteklenmiyor. mp4, mov ya da webm seç.",
  videoAcilamaz: "Bu video bu cihazda açılamıyor. iPhone'da kamerayı Ayarlar > Kamera > Biçimler > En Uyumlu (H.264) yap ya da mp4 bir video seç.",
  videoHazirlaniyor: "Hazırlanıyor…", videoYukleniyor: "Yükleniyor", videoYuklenemedi: "Video yüklenemedi, tekrar dener misin?",
  videoYetki: "Çok sık video yükledin ya da oturumun süresi doldu. Biraz sonra tekrar dene.", iptal: "İptal", tekrarDene: "Tekrar dene",
  videoFotoDegis: "Bir gönderide fotoğraf ya da video olur.", videoAcilamadi: "Video açılamadı", duraklat: "Duraklat", tamEkran: "Tam ekran", videoIlerleme: "Video ilerlemesi",
  otoVideo: "Videoları otomatik oynat", otoAcik: "Açık", otoKapali: "Kapalı", otoVideoNot: "Videolar sessiz oynar. Veri tasarrufu ya da hareketi azalt açıksa hiç kendiliğinden oynamaz.",
});
Object.assign(T.en, { pfSec: "Choose photo", pfKaldir: "Remove photo", pfKirp: "Adjust photo", pfYakin: "Zoom", pfKullan: "Use photo", pfAcilamaz: "The photo couldn't be opened.", pfIpucu: "Drag to position; the photo is cropped to a square.", pfAlan: "Profile photo", cevapYaz: "Write your answer", paylasimYaz: "Write a post", anket: "Poll", anketEkle: "Add poll", anketSecenek: (n) => `Option ${n}`, anketSecenekEkle: "+ Add option", anketSure: "Poll length", gun1: "1 day", gun3: "3 days", gun7: "7 days", anketKaldir: "Remove poll", oyAd: "votes", sonuclandi: "Final results", kalanGun: (n) => `${n} day${n > 1 ? "s" : ""} left`, kalanSaat: (n) => `${n} hour${n > 1 ? "s" : ""} left`, kalanDk: (n) => `${n} min left`, anketUyum: "A poll can't be combined with a photo, video or quote.", anketOyHata: "Your vote couldn't be saved, please try again.", seciliSecenek: "your choice",
  videolar: "Videos", bosVideo: "No videos yet. Be the first to share one.", videoEkle: "Add video",
  videoHatirlat: () => `Only videos you filmed yourself, and positive ones. Up to 60 s and ${videoMb()} MB; mp4 (H.264) works best.`,
  videoBuyuk: () => `The video is too large (${videoMb()} MB max).`, videoUzun: "The video is too long (60 seconds max).", videoTur: "This video format isn't supported. Pick an mp4, mov or webm file.",
  videoAcilamaz: "This video can't be opened on this device. On iPhone set Settings > Camera > Formats > Most Compatible (H.264) or pick an mp4 video.",
  videoHazirlaniyor: "Preparing…", videoYukleniyor: "Uploading", videoYuklenemedi: "The video couldn't be uploaded, please try again.",
  videoYetki: "You uploaded videos too often, or your session has expired. Please try again in a bit.", iptal: "Cancel", tekrarDene: "Try again",
  videoFotoDegis: "A post can have a photo or a video, not both.", videoAcilamadi: "Couldn't open the video", duraklat: "Pause", tamEkran: "Full screen", videoIlerleme: "Video progress",
  otoVideo: "Autoplay videos", otoAcik: "On", otoKapali: "Off", otoVideoNot: "Videos play muted. They never autoplay when data saver or reduced motion is on.",
});

Object.assign(T.tr, {   // alıntılı paylaşım + görüntülenme (gecis-008)
  alintila: "Alıntıla", yenidenGeriAl: "Yeniden paylaşımı geri al", alintilar: "Alıntılar", alintiYorum: "Yorum ekle", alintiYok: "Bu gönderi görüntülenemiyor", alintiSilindi: "Bu gönderi silinmiş",
  alintiIcerir: "Alıntı içerir", goruntulenme: "Görüntülenme", goruntulenmeAria: (n) => `${n} görüntülenme`, bosAlinti: "Henüz alıntı yok.", yenidenMenu: "Yeniden paylaş seçenekleri",
});
Object.assign(T.en, {
  alintila: "Quote", yenidenGeriAl: "Undo repost", alintilar: "Quotes", alintiYorum: "Add a comment", alintiYok: "This post is unavailable", alintiSilindi: "This post was deleted",
  alintiIcerir: "Contains a quote", goruntulenme: "Views", goruntulenmeAria: (n) => `${n} views`, bosAlinti: "No quotes yet.", yenidenMenu: "Repost options",
});
T.tr.bildirimMetin.alinti = "gönderini alıntıladı"; T.en.bildirimMetin.alinti = "quoted your post";
T.tr.bildirimMetin.bahset = "senden bahsetti"; T.en.bildirimMetin.bahset = "mentioned you";   // @etiket (gecis-017)

// gecis-019: yazı serileri + çoklu kayıt listeleri
Object.assign(T.tr, { seriSekme: "Yazı serileri", gonderiSekme: "Gönderiler", seri: "Seri", yeniSeri: "Yeni seri", seriAd: "Seri adı", seriAciklama: "Açıklama (isteğe bağlı)", ustSeri: "Üst seri (isteğe bağlı)", ustYok: "Yok (ana seri)",
  seriOlustur: "Oluştur", seriDuzenle: "Adı ve açıklamayı düzenle", seriSil: "Seriyi sil", seriSilSor: "Bu seri silinsin mi? Alt seriler de silinir; gönderilerin silinmez, yalnız seriden çıkar.", seriSilindi: "Seri silindi",
  seriBos: "Henüz yazı serin yok. Gönderilerini bir seride toplayabilirsin.", seriBosBaskasi: "Henüz yazı serisi yok.", seriBosGonderi: "Bu seride henüz gönderi yok.", seriAltEkle: "Alt seri ekle",
  seriyeEkle: "Seriye ekle", seridenCikar: "Seriden çıkar", seriEklendi: "Seriye eklendi", seriCikarildi: "Seriden çıkarıldı", seriSec: "Hangi seriye?", seriKaydedildi: "Seri kaydedildi",
  seriGonderi: (n) => `${n} gönderi`, seriSayi: (n) => `${n} seri`, seriSira: (n) => (n ? `Sıra ${n}` : "Seri"), seriAra: (a) => `Seri: ${a}. Seriyi aç`, seriAltBaslik: "Alt seriler", seriGonderiler: "Gönderiler", seriPaylas: "Seriyi paylaş",
  seriAdKisa: "Seri adı en az 2 karakter olmalı.", seriYolu: "Seri yolu", seriYokListe: "Henüz serin yok; aşağıdan ilkini oluştur.",
  listeyeEkle: "Listeye ekle", tumu: "Tümü", yeniListe: "Yeni liste", listeAd: "Liste adı", listeOlustur: "Oluştur", listeBos: "Bu listede henüz gönderi yok. Bir gönderiyi kaydedip “Listeye ekle”ye dokun.",
  listeAdlandir: "Yeniden adlandır", listeSil: "Listeyi sil", listeSilSor: "Bu liste silinsin mi? Gönderiler kaydedilenlerden çıkmaz.", listeSilindi: "Liste silindi", listeSecici: "Listeye ekle", listeAdKisa: "Liste adı yaz.", listeYok: "Henüz listen yok; aşağıdan oluştur.",
  listeAdlandirildi: "Liste güncellendi", kayitListelerim: "Kayıt listeleri" });
Object.assign(T.en, { seriSekme: "Series", gonderiSekme: "Posts", seri: "Series", yeniSeri: "New series", seriAd: "Series name", seriAciklama: "Description (optional)", ustSeri: "Parent series (optional)", ustYok: "None (top level)",
  seriOlustur: "Create", seriDuzenle: "Edit name and description", seriSil: "Delete series", seriSilSor: "Delete this series? Sub-series are deleted too; your posts are NOT deleted, they just leave the series.", seriSilindi: "Series deleted",
  seriBos: "You have no series yet. You can gather your posts in a series.", seriBosBaskasi: "No series yet.", seriBosGonderi: "No posts in this series yet.", seriAltEkle: "Add sub-series",
  seriyeEkle: "Add to series", seridenCikar: "Remove from series", seriEklendi: "Added to the series", seriCikarildi: "Removed from the series", seriSec: "Which series?", seriKaydedildi: "Series saved",
  seriGonderi: (n) => `${n} post${n === 1 ? "" : "s"}`, seriSayi: (n) => `${n} series`, seriSira: (n) => (n ? `No. ${n}` : "Series"), seriAra: (a) => `Series: ${a}. Open the series`, seriAltBaslik: "Sub-series", seriGonderiler: "Posts", seriPaylas: "Share series",
  seriAdKisa: "The series name needs at least 2 characters.", seriYolu: "Series path", seriYokListe: "You have no series yet; create your first one below.",
  listeyeEkle: "Add to list", tumu: "All", yeniListe: "New list", listeAd: "List name", listeOlustur: "Create", listeBos: "No posts in this list yet. Bookmark a post and tap “Add to list”.",
  listeAdlandir: "Rename", listeSil: "Delete list", listeSilSor: "Delete this list? The posts stay in your bookmarks.", listeSilindi: "List deleted", listeSecici: "Add to list", listeAdKisa: "Write a list name.", listeYok: "You have no lists yet; create one below.",
  listeAdlandirildi: "List updated", kayitListelerim: "Bookmark lists" });
Object.assign(T.tr, { etiketOneri: "Hesap önerileri", botKuyruk: (ad) => `${ad} sorunu aldı; yanıtı biraz zaman alabilir.`, botGunluk: "Bugün OP hesaplarına en fazla 5 soru sorabilirsin; yarın yine bekleriz.",
  botYogun: (ad) => `${ad} şu an çok soru aldı; biraz sonra tekrar dener misin?`, botKonu: (ad) => `${ad} bir konuda en fazla 2 kez yanıt verir.`, botNot: "Bu bir OP içerik hesabıdır, yanıtları yapay zekâ yazar." });
Object.assign(T.en, { etiketOneri: "Account suggestions", botKuyruk: (ad) => `${ad} got your question; the reply may take a little while.`, botGunluk: "You can ask OP accounts up to 5 questions a day; we'll be happy to see you again tomorrow.",
  botYogun: (ad) => `${ad} has received a lot of questions right now; please try again in a little while.`, botKonu: (ad) => `${ad} replies at most twice on one topic.`, botNot: "This is an OP content account; its replies are written by AI." });
Object.assign(T.tr, { baglantiKaldir: "Bağlantı önizlemesini kaldır", ytAc: "YouTube'da aç", ytOynat: "Videoyu oynat", gorunum: "Görünüm", sistem: "Sistem", acikZemin: "Açık tema zemini", koyuZemin: "Koyu tema zemini" });
Object.assign(T.en, { baglantiKaldir: "Remove link preview", ytAc: "Open on YouTube", ytOynat: "Play video", gorunum: "Appearance", sistem: "System", acikZemin: "Light theme background", koyuZemin: "Dark theme background" });

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
    yasalKosul: "Kullanım Koşulları", yasalGizlilik: "Gizlilik Politikası", yasalCerez: "Çerez Politikası", yasalKurallar: "OP Kuralları", yasalDestek: "Destek", silAyrinti: "Ayrıntı", iletisim: "İletişim", ayarNot: "Sadece iyi sohbet: siyaset, din, etnik kimlik ve şiddet yok.", betaSurum: "Beta sürümü", yenidenDene: "Yeniden dene" },
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
    yasalKosul: "Terms of Use", yasalGizlilik: "Privacy Policy", yasalCerez: "Cookie Policy", yasalKurallar: "OP Rules", yasalDestek: "Support", silAyrinti: "Details", iletisim: "Contact", ayarNot: "Only good conversations: no politics, religion, ethnicity or violence.", betaSurum: "Beta version", yenidenDene: "Try again" },
};
const bt = (k, ...a) => { const v = B[D.dil]?.[k] ?? B.tr[k] ?? k; return typeof v === "function" ? v(...a) : v; };

// ---------- durum ----------
const D = {
  ben: BULUT ? null : sakla.al("op-ben", null),   // bulutta kimlik = Supabase oturumu (basla()'da yüklenir)
  cihaz: sakla.al("op-cihaz", null) || (() => { const c = Math.random().toString(36).slice(2) + Date.now().toString(36); sakla.koy("op-cihaz", c); return c; })(),
  dil: sakla.al("op-dil", (navigator.language || "tr").startsWith("tr") ? "tr" : "en"),
  sekme: "senin", ogeler: [], detay: null, okunmamis: 0, cizim: 0, onb: {}, yanitOnb: {}, akis: null,
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
function tost(m, ms = 2600) { const e = document.createElement("div"); e.className = "tost"; e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), ms); }

// ---------- @etiket önerisi (yazma kutusu, yanıt kutusu, yerinde düzenleme) ----------
// '@' + en az 1 harf: sunucuda ön ek araması (api /api/kullanici-ara), en çok 6; takip ettiklerim önce. Klavye: ↑/↓ + Enter, Esc kapatır; dokunmatik/fare: öneriye dokun. ARIA: combobox + listbox + aria-activedescendant.
const EO = { girdi: null, liste: [], sec: 0, no: 0, z: 0, kutu: null, onbellek: new Map() };
function etiketJeton(g) {   // imlecin bulunduğu @parça: { bas, son, q } ya da null
  const c = g.selectionStart ?? g.value.length, onc = g.value.slice(0, c), m = /(^|[^A-Za-z0-9_@./])@([A-Za-z0-9_]{1,20})$/.exec(onc);
  return m ? { bas: m.index + m[1].length, son: c, q: m[2] } : null;
}
function etiketOnerKur(g) {
  if (!g || g.dataset.etiketKurulu) return; g.dataset.etiketKurulu = "1";
  g.setAttribute("role", "combobox"); g.setAttribute("aria-autocomplete", "list"); g.setAttribute("aria-haspopup", "listbox"); g.setAttribute("aria-expanded", "false");
  const ara = () => etiketAra(g);
  g.addEventListener("input", ara); g.addEventListener("click", ara);
  g.addEventListener("keyup", e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) ara(); });
  g.addEventListener("blur", () => setTimeout(() => { if (EO.girdi === g && document.activeElement !== g) etiketKapat(); }, 160));
}
function etiketAra(g) {
  const j = etiketJeton(g); if (!j || !D.ben) return etiketKapat();
  EO.girdi = g; clearTimeout(EO.z); const no = ++EO.no, q = j.q.toLowerCase(), onb = EO.onbellek.get(q);
  if (onb) return etiketCiz(g, onb);
  EO.z = setTimeout(async () => {
    try {
      const v = await api(`/api/kullanici-ara?q=${encodeURIComponent(q)}`); if (no !== EO.no) return;   // eski yanıt atılır
      const l = v.kullanicilar || []; EO.onbellek.set(q, l); if (EO.onbellek.size > 40) EO.onbellek.delete(EO.onbellek.keys().next().value);
      etiketCiz(g, l);
    } catch { if (no === EO.no) etiketKapat(); }
  }, 180);
}
function etiketCiz(g, liste) {
  if (!liste.length || !g.isConnected || document.activeElement !== g) return etiketKapat();
  EO.liste = liste; EO.sec = 0;
  let k = EO.kutu;
  if (!k) {
    k = EO.kutu = document.createElement("div"); k.id = "bahset-liste"; k.className = "bahset-liste"; k.setAttribute("role", "listbox");
    k.addEventListener("mousedown", e => e.preventDefault());   // yazma kutusu odağı kaybolmasın
    k.addEventListener("click", e => { const o = e.target.closest("[data-i]"); if (o) etiketSec(+o.dataset.i); });
    document.body.appendChild(k);
  }
  k.setAttribute("aria-label", t("etiketOneri"));
  k.innerHTML = liste.map((u, i) => `<div class="bahset-oge" role="option" id="bahset-o${i}" data-i="${i}" aria-selected="${i === 0}">${avatarHtml(u, "kucuk")}
    <span class="bahset-ad"><b class="ad">${esc(u.ad)}</b>${rozetHtml(u)}<span class="gri"> @${esc(u.handle)}</span></span>${u.takipEdiyorMu ? `<span class="gri bahset-takip">${t("takipte")}</span>` : ""}</div>`).join("");
  const r = g.getBoundingClientRect(), vv = window.visualViewport, vh = vv ? vv.height : innerHeight, vt = vv ? vv.offsetTop : 0;
  const gen = Math.min(Math.max(r.width, 240), 360, innerWidth - 16);
  k.hidden = false; k.style.width = gen + "px"; k.style.left = Math.max(8, Math.min(r.left, innerWidth - gen - 8)) + "px";
  const h = k.offsetHeight, alt = vt + vh - r.bottom, ust = r.top - vt;
  if (alt >= h + 10 || alt >= ust) { k.style.bottom = "auto"; k.style.top = (r.bottom + 6) + "px"; } else { k.style.top = "auto"; k.style.bottom = (innerHeight - r.top + 6) + "px"; }
  g.setAttribute("aria-expanded", "true"); g.setAttribute("aria-controls", "bahset-liste"); g.setAttribute("aria-activedescendant", "bahset-o0");
}
function etiketVurgu() {
  EO.kutu?.querySelectorAll("[role=option]").forEach((o, i) => { o.setAttribute("aria-selected", String(i === EO.sec)); if (i === EO.sec) o.scrollIntoView({ block: "nearest" }); });
  EO.girdi?.setAttribute("aria-activedescendant", "bahset-o" + EO.sec);
}
function etiketKapat() {
  clearTimeout(EO.z); EO.no++;
  if (EO.kutu) EO.kutu.hidden = true;
  if (EO.girdi) { EO.girdi.setAttribute("aria-expanded", "false"); EO.girdi.removeAttribute("aria-activedescendant"); }
  EO.liste = [];
}
function etiketSec(i) {
  const g = EO.girdi, u = EO.liste[i], j = g && etiketJeton(g); if (!u || !j) return etiketKapat();
  const sonra = g.value.slice(j.son), bosluk = /^\s/.test(sonra), ek = "@" + u.handle + (bosluk ? "" : " "), yeni = g.value.slice(0, j.bas) + ek + sonra;
  if (g.maxLength > 0 && yeni.length > g.maxLength) return etiketKapat();
  g.value = yeni; const c = j.bas + ek.length + (bosluk ? 1 : 0); g.setSelectionRange(c, c);
  etiketKapat(); g.dispatchEvent(new Event("input", { bubbles: true })); g.focus();
}
document.addEventListener("keydown", e => {   // pencere/Esc kısayollarından ÖNCE (yakalama aşaması): liste açıkken ok/Enter/Esc yalnız listeyi yönetir
  if (!EO.kutu || EO.kutu.hidden || e.target !== EO.girdi || !EO.liste.length) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); e.stopImmediatePropagation(); EO.sec = (EO.sec + (e.key === "ArrowDown" ? 1 : -1) + EO.liste.length) % EO.liste.length; etiketVurgu(); }
  else if (e.key === "Enter") { e.preventDefault(); e.stopImmediatePropagation(); etiketSec(EO.sec); }
  else if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); etiketKapat(); }
}, true);
// OP içerik hesabı etiketlendiyse gönderi/yanıt cevabındaki bot durumlarından tek satır bilgi ("" = söylenecek bir şey yok)
function botBilgi(v) {
  const b = (v?.bot || []).filter(x => x.durum !== "zaten"), ad = (x) => (D.dil === "en" ? x.adEn : x.ad) || x.handle;
  if (!b.length) return "";
  const k = b.filter(x => x.durum === "kuyruk");
  if (k.length) return t("botKuyruk", k.map(ad).join(", "));
  const g = b.find(x => x.durum === "gunluk_sinir"); if (g) return t("botGunluk");
  const y = b.find(x => x.durum === "bot_yogun"); if (y) return t("botYogun", ad(y));
  const z = b.find(x => x.durum === "konu_sinir"); return z ? t("botKonu", ad(z)) : "";
}

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
  anket: '<path d="M5 20V10"/><path d="M12 20V4"/><path d="M19 20v-7"/>',
  baglanti: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.700-5.700l-1 1"/><path d="M14 10a4 4 0 00-5.700 0l-3 3a4 4 0 005.700 5.700l1-1"/>',
  eposta: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  ucak: '<path d="M21 3L3 10.500l7 2.500 2.500 7z"/><path d="M21 3L10 13"/>',
  geri: '<path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>',
  yaz: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  foto: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  sag: '<path d="M9 6l6 6-6 6"/>',
  video: '<rect x="2.500" y="5.500" width="13" height="13" rx="3"/><path d="M15.500 10.500L21 7.500v9l-5.500-3"/>',
  oynat: '<path d="M8 5.500v13l11-6.500z"/>',
  gorunum: '<path d="M5 21V12"/><path d="M12 21V4"/><path d="M19 21v-6.500"/>',
  alinti: '<path d="M7 8H5.500A1.500 1.500 0 004 9.500V13a1.500 1.500 0 001.500 1.500H8V17a3 3 0 01-3 3"/><path d="M17 8h-1.500A1.500 1.500 0 0014 9.500V13a1.500 1.500 0 001.500 1.500H18V17a3 3 0 01-3 3"/>',
  duraklat: '<path d="M8 5v14"/><path d="M16 5v14"/>',
  ses: '<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z"/><path d="M15.500 9a4.500 4.500 0 010 6"/><path d="M18 6.500a8 8 0 010 11"/>',
  sessiz: '<path d="M4 9.500v5h3.500L12 18.500v-13L7.500 9.500z"/><path d="M16 9.500l5 5"/><path d="M21 9.500l-5 5"/>',
  tam: '<path d="M4 9V4h5"/><path d="M20 9V4h-5"/><path d="M4 15v5h5"/><path d="M20 15v5h-5"/>',
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
  k_resim: '<rect x="3" y="4" width="18" height="16" rx="1.500"/><rect x="6" y="7" width="12" height="10" rx=".500"/><path d="M6 15l3.500-3.500 3 3 2-2L18 15"/><circle cx="15" cy="10" r="1"/>',
  k_sohbet: '<path d="M4 5.500A2.500 2.500 0 016.500 3h11A2.500 2.500 0 0120 5.500v8a2.500 2.500 0 01-2.500 2.500H11l-4.500 4v-4H6.500A2.500 2.500 0 014 13.500z"/><path d="M8.500 8h7"/><path d="M8.500 11.500h4"/>',
  k_mutfak: '<path d="M4 11h16v3a6 6 0 01-6 6h-4a6 6 0 01-6-6z"/><path d="M3 11h18"/><path d="M9 8c0-1 1-1 1-2s-1-1-1-2"/><path d="M14 8c0-1 1-1 1-2s-1-1-1-2"/>',
  k_oyun: '<rect x="4" y="4" width="16" height="16" rx="3.500"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="15" r="1"/>',
  k_tarih: '<path d="M9 3h6"/><path d="M10 3.500c0 1.500-2.500 2.500-2.500 6 0 5 1.500 8 4.500 11.500 3-3.500 4.500-6.500 4.500-11.500 0-3.500-2.500-4.500-2.500-6"/><path d="M8 11h8"/>',
  k_genel: '<circle cx="12" cy="12" r="9"/><path d="M8.500 12.500l2.500 2.500 4.500-5"/>',
  k_huzur: '<path d="M3 9c2.500-2 4.500-2 7 0s4.500 2 7 0c1.500-1.200 2.700-1.500 4-1.500"/><path d="M3 15c2.500-2 4.500-2 7 0s4.500 2 7 0c1.500-1.200 2.700-1.500 4-1.500"/>',
  k_gelisim: '<path d="M12 21v-9"/><path d="M12 12c0-4 3-6.500 7-6.500 0 4-3 6.500-7 6.500z"/><path d="M12 15.500c0-3-2.200-5-5.500-5 0 3 2.200 5 5.500 5z"/>',
  k_yasam: '<path d="M12 7.500c-1.500-1.500-4-1.800-5.500 0C4.500 10 5.500 15.500 8 18.500c1.200 1.400 2.500 1.600 4 .8 1.500.8 2.800.6 4-.8 2.500-3 3.500-8.500 1.500-11-1.500-1.800-4-1.500-5.500 0z"/><path d="M12 7.500c0-2 .8-3.500 2.500-4.500"/>',
  tik: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  seri: '<path d="M12 3l9 4.500-9 4.500-9-4.500z"/><path d="M3 12l9 4.500 9-4.500"/><path d="M3 16.500l9 4.500 9-4.500"/>',
  liste: '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3.500 6h.01"/><path d="M3.500 12h.01"/><path d="M3.500 18h.01"/>',
  k_gokbilim: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/><path d="M17 3v4"/><path d="M15 5h4"/>',
  editor: '<path d="M12 20h9"/><path d="M16.500 3.500a2.100 2.100 0 013 3L7 19l-4 1 1-4z"/>',
};
const ikon = (ad, boy = 22, dolu = false) => `<svg class="ik" width="${boy}" height="${boy}" viewBox="0 0 24 24" fill="${dolu ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IK[ad]}</svg>`;
const zamanYaz = (z) => {
  const s = (Date.now() - new Date(z)) / 1000, en = D.dil === "en";
  if (s < 60) return en ? "now" : "şimdi"; if (s < 3600) return Math.floor(s / 60) + (en ? "m" : " dk");
  if (s < 86400) return Math.floor(s / 3600) + (en ? "h" : " sa"); return Math.floor(s / 86400) + (en ? "d" : " g");
};
// profil fotoğrafı: bulutta Storage yolu ("<uid>/<uuid>.jpg") → tam adres; yerelde /foto/…; önizlemede data:/blob:. Editör/resmi hesaplar emoji/logo avatarında kalır.
const fotoUrl = (f) => (!f ? "" : /^(https?:|\/|data:|blob:)/.test(f) ? f : BULUT ? `${String(YAPI.supabaseUrl || "").replace(/\/$/, "")}/storage/v1/object/public/foto/${encodeURI(f)}` : "");
const avatarHtml = (k, sinif = "") => {
  if (k?.resmi) return `<span class="avatar logo ${sinif}"><img src="icons/op.svg" alt=""></span>`;   // resmi hesabın profil fotoğrafı = OP logosu
  const src = k?.editor ? "" : fotoUrl(k?.fotoVeri || k?.foto);
  return `<span class="avatar ${sinif}${src ? " fotolu" : ""}" style="--bg:${esc(k?.renk || "#F3E3B3")}">${esc(k?.avatar || "🌞")}${src ? `<img class="av-foto" src="${esc(src)}" alt="" loading="lazy" decoding="async">` : ""}</span>`;
};
document.addEventListener("error", (e) => { if (e.target.matches?.("img.av-foto")) e.target.remove(); }, true);   // yüklenemezse altındaki emoji avatar görünür
const rozetHtml = (k) => k?.editor ? `<span class="rozet" title="${t("editor")}" aria-label="${t("editor")}">${ikon("editor", 14)}</span>`
  : k?.resmi ? `<span class="rozet" title="${t("resmi")}" aria-label="${t("resmi")}"><svg class="ik" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M7.500 12.500l3 3 6-6.500" fill="none" stroke="var(--zemin)" stroke-width="2.400" stroke-linecap="round" stroke-linejoin="round"/></svg></span>` : "";
// bulut: başkasının gönderi/yanıt/profilinde "•••" menüsü (yerel sunucuda karşılığı yok → hiç görünmez)
const DUZENLE_SN = Number(YAPI.duzenleSn) > 0 ? Number(YAPI.duzenleSn) : 60;   // gönderi düzenleme penceresi; süreyi asıl SUNUCU denetler, burada yalnız geri sayım gösterilir
const kalanSn = (z) => { const s = DUZENLE_SN - (Date.now() - Date.parse(z)) / 1000; return Number.isFinite(s) ? Math.ceil(s) : 0; };
const sureYaz = (sn) => `${Math.floor(Math.max(0, sn) / 60)}:${String(Math.max(0, sn) % 60).padStart(2, "0")}`;
function menuDug(tur, id, yazar, o = {}) {
  if (!D.ben || !yazar?.handle) return "";
  const kendi = yazar.handle === D.ben.handle;
  if (kendi ? o.haber : (!BULUT && !(tur === "gonderi" && o.haber && KATEGORI[o.kategori]))) return "";
  return `<button class="menu-dug" data-e="menu" data-t="${tur}" data-id="${esc(id)}" data-h="${esc(yazar.handle)}" data-k="${esc(o.haber && KATEGORI[o.kategori] ? o.kategori : "")}" data-ed="${yazar.editor || yazar.resmi ? 1 : 0}"${kendi ? ` data-own="1" data-z="${esc(o.zaman || "")}"` : ""} aria-label="${bt("menu")}">•••</button>`;
}
const sayi = (n) => (n ? `<span>${n}</span>` : "");
function kisaSayi(n) {   // 1,2 B · 1,6 Mn (TR) / 1.2K · 1.6M (EN); aşağı yuvarlar
  n = Math.max(0, Number(n) || 0);
  if (n < 1000) return String(n);
  const en = D.dil === "en", bir = (v) => { const x = (Math.floor(v * 10) / 10).toFixed(1); return en ? x.replace(/\.0$/, "") : x.replace(".", ",").replace(/,0$/, ""); };
  const bicim = (v) => (v >= 100 ? String(Math.floor(v)) : bir(v));
  return n < 1e6 ? bicim(n / 1e3) + (en ? "K" : " B") : bicim(n / 1e6) + (en ? "M" : " Mn");
}
function eylemHtml(o) {
  const toplamYay = (o.yaySayisi || 0) + (o.alintiSayisi || 0), gor = o.goruntulenme || 0;   // X gibi: yeniden paylaşım + alıntı toplamı (ayrımı detayda)
  return `<div class="eylemler">
    <button class="eylem" data-e="yanit" data-id="${o.id}" aria-label="${t("yanitla")}">${ikon("yanit", 20)}${sayi(o.yanitSayisi)}</button>
    <button class="eylem yay ${o.yaydimMi ? "aktif" : ""}" data-e="yay" data-id="${o.id}" aria-label="${t("yeniden")}" aria-haspopup="dialog" aria-pressed="${!!o.yaydimMi}">${ikon("yay", 20)}${sayi(toplamYay)}</button>
    <button class="eylem begen ${o.begendimMi ? "aktif" : ""}" data-e="begen" data-id="${o.id}" aria-label="${t("begen")}" aria-pressed="${!!o.begendimMi}">${ikon("begen", 20, o.begendimMi)}${sayi(o.begeniSayisi)}</button>
    <span class="eylem gor" role="img" aria-label="${esc(gor ? t("goruntulenmeAria", kisaSayi(gor)) : t("goruntulenme"))}">${ikon("gorunum", 20)}${gor ? `<span>${kisaSayi(gor)}</span>` : ""}</span>
    <button class="eylem kayit ${o.kaydettimMi ? "aktif" : ""}" data-e="kaydet" data-id="${o.id}" aria-label="${t("kayit")}" aria-pressed="${!!o.kaydettimMi}">${ikon("kayit", 20, o.kaydettimMi)}</button>
    <button class="eylem" data-e="paylas" data-id="${o.id}" aria-label="${t("disari")}">${ikon("paylas", 20)}</button>
  </div>`;
}
// OP tasarım kartı YALNIZ alıntı (felsefe/edebiyat/şiir/mitoloji) ve soru (sohbet) gönderilerinde; görselsiz sıradan haberde kart yok, başlık + metin yeter
// (sahip 2026-10-14: kesik başlıklı boş kart "anlamsız"; içerik böyle görselle verilmemeli)
const kartGorunur = (o) => !!o.haber && !(o.video && o.video.url) && !(o.gorsel && o.gorsel.url) && (HK_ALINTI.has(o.kategori) || o.kategori === "sohbet");
function metinHtml(o, buyuk) {
  if (!o.haber) return o.metin ? `<div class="metin ${buyuk ? "buyuk" : ""}">${baglaEtiket(o.metin, o.etiketler)}</div>` : "";
  const [baslik, ...gerisi] = String(o.metin).split("\n\n");
  if (!buyuk && kartGorunur(o)) {   // başlık kartta zaten var: akışta tekrar yazılmaz (alıntı/gökbilim kartında metnin tamamı kartta)
    if (HK_ALINTI.has(KATEGORI[o.kategori] ? o.kategori : "genel")) return "";
    return gerisi.length ? `<div class="metin">${esc(gerisi.join("\n\n"))}</div>` : "";
  }
  const uzun = !buyuk && String(o.metin).length > 420;   // akışta uzun haber ~8 satırda kesilir; detay sayfasında tam metin
  return `<div class="metin ${buyuk ? "buyuk" : ""} ${uzun ? "kirp" : ""}"><b class="baslik-metin">${esc(baslik)}</b>${gerisi.length ? `<br><br>${esc(gerisi.join("\n\n"))}` : ""}</div>` +
    (uzun ? `<button class="devami" data-e="devam" data-id="${o.id}">${t("devami")}</button>` : "");
}
function lisansSatiri(ad, g) {   // "Fotoğraf: sahibi · lisans · sağlayıcı" (bağlantılar yalnız http/https)
  const bag = (url, x) => (guvenliUrl(url) ? `<a href="${esc(guvenliUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(x)}</a>` : esc(x));
  const parcalar = [g.sahibi && bag(g.kaynak_url, g.sahibi), g.lisans && bag(g.lisans_url, g.lisans), g.saglayici && esc(g.saglayici)].filter(Boolean);
  return parcalar.length ? `<div class="lisans">${ad}: ${parcalar.join(" · ")}</div>` : "";
}
const videoOran = (v) => (v.en > 0 && v.boy > 0 ? Math.min(16 / 9, Math.max(0.8, v.en / v.boy)) : 0);   // kullanıcı videosunda gerçek oran (4:5 ile 16:9 arası); haberde 16:9
function videoHtml(v, detay) {   // akış: sessiz otomatik oynatma + kendi denetim çubuğu; detay: tarayıcının kontrollü oynatıcısı. Haber ve kullanıcı videosu AYNI oynatıcı
  const ortak = `src="${esc(v.url)}" ${v.poster ? `poster="${esc(v.poster)}"` : ""} playsinline preload="metadata"`;
  const oran = videoOran(v), kap = `video-kap${oran ? " ar" : ""}`, stil = oran ? ` style="--ar:${oran.toFixed(4)}"` : "";
  const sure = `<span class="video-sure"${v.sure_sn > 0 ? "" : " hidden"}>${v.sure_sn > 0 ? sureYaz(Math.round(v.sure_sn)) : ""}</span>`;
  const hata = `<div class="video-hata" role="alert"><span>${esc(t("videoAcilamadi"))}</span><button type="button" class="dug kucuk ikincil" data-e="video-yeniden">${esc(t("tekrarDene"))}</button></div>`;
  if (detay) return `<div class="${kap} detay"${stil}><video class="haber-video" ${ortak} controls></video>${sure}${hata}</div>`;
  const dug = (e, ad, ic) => `<button type="button" class="vb" data-e="${e}" aria-label="${esc(ad)}">${ic}</button>`;
  return `<div class="${kap} durdu sessiz-ik" data-e="video-ses" role="button" tabindex="0" aria-label="${t("oynat")}"${stil}><video class="haber-video" data-oto="1" ${ortak} muted loop></video>
    ${sure}<span class="video-buyuk" aria-hidden="true">${ikon("oynat", 30, true)}</span>
    <div class="video-bar">${dug("video-oynat", t("oynat"), `<span class="ik-oynat">${ikon("oynat", 20, true)}</span><span class="ik-duraklat">${ikon("duraklat", 20)}</span>`)}
      <div class="video-ilerleme" data-e="video-ara" role="progressbar" aria-label="${esc(t("videoIlerleme"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>
      ${dug("video-ses-dugme", t("sesAc"), `<span class="ik-sessiz">${ikon("sessiz", 20)}</span><span class="ik-sesli">${ikon("ses", 20)}</span>`)}
      ${dug("video-tam", t("tamEkran"), ikon("tam", 20))}</div>${hata}</div>`;
}
// görselsiz haber için OP tasarım kartı (yalnız CSS/SVG, dosya yok): 16:9, kategoriye göre sakin tek ton, çizgi ikon + etiket + başlık + OP logosu
const HK_TON = { bilim: "petrol", teknoloji: "petrol", spor: "petrol", saglik: "yesil", doga: "yesil", hayvanlar: "yesil", iyilik: "altin", sanat: "altin", mahalle: "altin",
  edebiyat: "altin", siir: "altin", felsefe: "derin", mitoloji: "derin", gokbilim: "derin", resim: "altin", sohbet: "petrol", mutfak: "altin", oyun: "yesil", tarih: "derin", huzur: "petrol", gelisim: "altin", yasam: "yesil", genel: "petrol" };
const HK_ALINTI = new Set(["felsefe", "edebiyat", "siir", "mitoloji"]);   // tırnaklı alıntı düzeni
const yazarAdiMi = (x) => x.length <= 40 && x.split(/\s+/).length <= 5 && !/[.!?;:"“”,]/.test(x);
function haberKartHtml(o, detay = false) {
  const kat = KATEGORI[o.kategori] ? o.kategori : "genel", [baslik, ...gerisi] = String(o.metin || "").split("\n\n"), alinti = HK_ALINTI.has(kat);
  let govde = baslik, yazar = "";
  if (alinti) {
    const oz = gerisi.join(" ").trim();
    if (oz && yazarAdiMi(baslik)) { govde = oz.length > 170 ? oz.slice(0, 167).trimEnd() + "…" : oz; yazar = baslik; }   // başlık yazar adıysa: alıntı ortada, yazar altta
    govde = `“${govde}”`;
  }
  const soru = kat === "sohbet";   // soru kartı: soru metni büyükçe; akışta altında "Cevabını yaz" (detayı açıp yanıt alanına odaklanır)
  if (soru) return `<div class="hk soru" data-ton="${HK_TON[kat]}" data-kategori="${kat}"><div class="hk-ust">${ikon("k_" + kat, 26)}<span class="hk-et">${esc(KATEGORI[kat]?.[di()] || "OP")}</span></div>
    <div class="hk-baslik">${esc(String(o.metin || "").trim())}</div><div class="hk-alt">${detay ? "<span></span>" : `<button type="button" class="hk-cevap" data-e="soru-cevapla" data-id="${esc(o.id)}">${esc(t("cevapYaz"))}</button>`}<img class="hk-logo" src="icons/op.svg" alt=""></div></div>`;
  return `<div class="hk ${alinti ? "alinti" : ""}" data-ton="${HK_TON[kat]}" data-kategori="${kat}" aria-hidden="true"><div class="hk-ust">${ikon("k_" + kat, 26)}<span class="hk-et">${esc(KATEGORI[kat]?.[di()] || "OP")}</span></div>
    <div class="hk-baslik">${esc(govde)}</div><div class="hk-alt"><span class="hk-yazar">${yazar ? "— " + esc(yazar) : ""}</span><img class="hk-logo" src="icons/op.svg" alt=""></div></div>`;
}
// ARMASIZ SKOR KARTI (gecis-018): maç SONUCU haberlerinde fotoğraf/video yoksa. İki takım adı + büyük skor (+ organizasyon · aşama); kulüp arması/logosu YOK, görsel dosyası YOK (yalnız CSS).
// Kazanan taraf hafif vurgulu (daha koyu + kalın), beraberlikte vurgu yok. k = { tur:"skor", taraf1, taraf2, skor1, skor2, organizasyon?, asama? } (taraf1 <-> skor1 aynı takım)
const skorKartiMi = (k) => !!k && k.tur === "skor" && typeof k.taraf1 === "string" && typeof k.taraf2 === "string" && Number.isInteger(k.skor1) && Number.isInteger(k.skor2);
function skorKartHtml(k, { detay = false, kucuk = false } = {}) {
  const w = k.skor1 > k.skor2 ? 1 : k.skor2 > k.skor1 ? 2 : 0, ust = [k.organizasyon, k.asama].filter(Boolean).join(" · ");
  const etiket = `${k.taraf1} ${k.skor1}, ${k.taraf2} ${k.skor2}` + (ust ? ` (${ust})` : "");
  const takim = (ad, n) => `<div class="sk-takim${w === n ? " kazanan" : ""}"><span>${esc(ad)}</span></div>`;
  const sayi = (v, n) => `<span class="sk-sayi${w === n ? " kazanan" : ""}">${v}</span>`;
  const dikey = Math.max(k.taraf1.length, k.taraf2.length) > 16;   // uzun takım adı: yan yana sığmaz → takım / skor / takım dikey dizilir (adlar 2 satıra kadar)
  return `<div class="hk skor${dikey ? " dikey" : ""}${kucuk ? " kucuk" : ""}${detay ? " detay" : ""}" data-ton="petrol" data-kategori="spor" role="img" aria-label="${esc(etiket)}">
    <div class="hk-ust" aria-hidden="true">${ikon("k_spor", 22)}<span class="hk-et">${esc(ust || KATEGORI.spor[di()])}</span></div>
    <div class="sk-sahne" aria-hidden="true">${takim(k.taraf1, 1)}<div class="sk-skor${w === 0 ? " esit" : ""}">${sayi(k.skor1, 1)}<span class="sk-ayrac">–</span>${sayi(k.skor2, 2)}</div>${takim(k.taraf2, 2)}</div>
    <div class="hk-alt" aria-hidden="true"><span></span><img class="hk-logo" src="icons/op.svg" alt=""></div></div>`;
}
// ---- gecis-020: SKOR LİSTESİ (kart.tur "skorlar") + PUAN TABLOSU (kart.tur "puan"). Sahip kuralı 2026-10-14: "Skor paylaşıyorsan mutlaka liste halinde paylaş, puan durumundan söz ediyorsan mutlaka puan durumunu alta koy."
// skorlar = başlıklı sade <ol> (taraf1 skor1–skor2 taraf2, kazanan kalın); puan = gerçek <table> + <caption> (Sıra · Takım · O · P · A; O/A yalnız veri varsa). Arma/logo/kulüp rengi YOK; yalnız .hk ton değişkenleri.
// Fotoğraf/video varsa ALTINA eklenir (tek maçlık "skor" kartı eski davranışta: yalnız görsel yoksa). k.kismi (tablonun yalnız ilk satırları kanıtlandı) → "İlk N takım" notu.
Object.assign(T.tr, { sonuclarBaslik: "Maç sonuçları", puanBaslik: "Puan durumu", puanSira: "Sıra", puanTakim: "Takım", puanO: "O", puanOAd: "Oynanan", puanP: "P", puanPAd: "Puan", puanA: "A", puanAAd: "Averaj", puanIlk: (n) => "İlk " + n + " takım", kazandi: "kazandı", daha: (n) => "+" + n + " maç daha" });
Object.assign(T.en, { sonuclarBaslik: "Match results", puanBaslik: "Standings", puanSira: "Rank", puanTakim: "Team", puanO: "P", puanOAd: "Played", puanP: "Pts", puanPAd: "Points", puanA: "GD", puanAAd: "Goal difference", puanIlk: (n) => "Top " + n + " teams", kazandi: "won", daha: (n) => "+" + n + " more matches" });
const skorlarKartiMi = (k) => !!k && k.tur === "skorlar" && Array.isArray(k.maclar) && k.maclar.length >= 2 && k.maclar.every((m) => !!m && typeof m.taraf1 === "string" && typeof m.taraf2 === "string" && Number.isInteger(m.skor1) && Number.isInteger(m.skor2));
const puanKartiMi = (k) => !!k && k.tur === "puan" && Array.isArray(k.satirlar) && k.satirlar.length >= 3 && k.satirlar.every((r) => !!r && typeof r.takim === "string" && Number.isInteger(r.sira) && Number.isInteger(r.puan));
const listeKartiMi = (k) => skorlarKartiMi(k) || puanKartiMi(k);
function skorlarHtml(k, { kucuk = false } = {}) {
  const ust = [k.organizasyon, k.asama].filter(Boolean).join(" · "), liste = k.maclar.slice(0, kucuk ? 3 : 12), fazla = k.maclar.length - liste.length;
  const mac = (m) => {
    const w = m.skor1 > m.skor2 ? 1 : m.skor2 > m.skor1 ? 2 : 0;
    const takim = (ad, n) => `<span class="kt-takim${w === n ? " kazanan" : ""}">${esc(ad)}${w === n ? `<span class="kt-sr"> (${esc(t("kazandi"))})</span>` : ""}</span>`;
    const sayi = (v, n) => `<span class="kt-sayi${w === n ? " kazanan" : ""}">${v}</span>`;
    return `<li class="kt-mac">${takim(m.taraf1, 1)}<span class="kt-skor">${sayi(m.skor1, 1)}<span class="kt-ayrac">–</span>${sayi(m.skor2, 2)}</span>${takim(m.taraf2, 2)}</li>`;
  };
  return `<div class="hk kt skorlar${kucuk ? " kucuk" : ""}" data-ton="petrol" data-kategori="spor">
    <div class="hk-ust">${ikon("k_spor", 22)}<span class="hk-et">${esc(t("sonuclarBaslik"))}</span></div>${ust ? `<div class="kt-alt">${esc(ust)}</div>` : ""}
    <ol class="kt-liste" aria-label="${esc(t("sonuclarBaslik") + (ust ? " — " + ust : ""))}">${liste.map(mac).join("")}</ol>${fazla > 0 ? `<div class="kt-alt kt-daha">${esc(t("daha", fazla))}</div>` : ""}</div>`;
}
function puanHtml(k, { kucuk = false } = {}) {
  const liste = k.satirlar.slice(0, kucuk ? 4 : 20), kesik = liste.length < k.satirlar.length || k.kismi === true;
  const oVar = liste.every((r) => Number.isInteger(r.oynanan)), aVar = liste.every((r) => Number.isInteger(r.averaj));
  const alt = [k.organizasyon, k.tarih_notu].filter(Boolean).join(" · ");
  const sutun = (sinif, kisa, uzun) => `<th scope="col" class="kt-sayisal ${sinif}"><span aria-hidden="true">${esc(kisa)}</span><span class="kt-sr">${esc(uzun)}</span></th>`;
  const averaj = (v) => (v > 0 ? "+" + v : v < 0 ? "−" + Math.abs(v) : "0");
  const bas = `<tr><th scope="col" class="kt-sira"><span aria-hidden="true">#</span><span class="kt-sr">${esc(t("puanSira"))}</span></th><th scope="col" class="kt-tak">${esc(t("puanTakim"))}</th>${oVar ? sutun("", t("puanO"), t("puanOAd")) : ""}${sutun("kt-puan", t("puanP"), t("puanPAd"))}${aVar ? sutun("kt-av", t("puanA"), t("puanAAd")) : ""}</tr>`;
  const satir = (r) => `<tr><td class="kt-sira">${r.sira}</td><th scope="row" class="kt-tak">${esc(r.takim)}</th>${oVar ? `<td class="kt-sayisal">${r.oynanan}</td>` : ""}<td class="kt-sayisal kt-puan">${r.puan}</td>${aVar ? `<td class="kt-sayisal kt-av">${averaj(r.averaj)}</td>` : ""}</tr>`;
  return `<div class="hk kt puan${kucuk ? " kucuk" : ""}${oVar ? " ovar" : ""}${aVar ? " avar" : ""}" data-ton="petrol" data-kategori="spor">
    <table class="kt-tablo"><caption class="kt-cap"><span class="kt-cap-ust">${ikon("k_spor", 22)}<span class="hk-et">${esc(t("puanBaslik"))}</span></span>${alt ? `<span class="kt-alt">${esc(alt)}</span>` : ""}</caption>
    <thead>${bas}</thead><tbody>${liste.map(satir).join("")}</tbody></table>${kesik ? `<div class="kt-alt kt-not">${esc(t("puanIlk", liste.length))}</div>` : ""}</div>`;
}
const listeKartHtml = (k, opt) => (k.tur === "skorlar" ? skorlarHtml(k, opt) : puanHtml(k, opt));
function ekHtml(o, detay) {   // video (varsa, fotoğrafın yerine) ya da görsel (yoksa OP tasarım kartı) + (haberde) lisans satırı + kaynak kartı
  let h = "";
  if (o.foto) h += `<img class="gorsel" src="${esc(o.foto)}" alt="" loading="lazy" decoding="async" data-e="foto-ac">`;
  if (o.video?.url && !o.haber) h += videoHtml(o.video, detay);   // kullanıcı videosu (haber videosuyla aynı oynatıcı; lisans satırı yok)
  if (o.haber) {
    const g = o.gorsel, v = o.video;
    if (v && v.url) h += videoHtml(v, detay) + lisansSatiri(t("video"), v);
    else if (g && g.url) h += `<img class="gorsel" src="${esc(g.url)}" alt="" loading="lazy" decoding="async" data-e="foto-ac">` + lisansSatiri(t("foto"), g);
    else if (kartGorunur(o)) h += haberKartHtml(o, detay);
    else if (skorKartiMi(o.kart)) h += skorKartHtml(o.kart, { detay });   // maç sonucu: armasız skor kartı (yalnız fotoğraf/video yoksa)
    if (listeKartiMi(o.kart)) h += listeKartHtml(o.kart, { detay });      // skor LİSTESİ / PUAN TABLOSU: fotoğraf/video varsa ALTINA, yoksa tek başına (gecis-020)
    const link = guvenliUrl(o.link);
    if (o.kategori !== "sohbet" || link) h += `<${link ? `a href="${esc(link)}" target="_blank" rel="noopener noreferrer"` : "div"} class="kaynak-kart"><span>${o.yer ? "📍 " + esc(o.yer) + " · " : ""}${t("kaynak")}: ${esc(o.kaynak)}</span>${link ? " ↗" : ""}</${link ? "a" : "div"}>`;
  }
  return h;
}
// ---------- anket (gecis-014) ----------
// Sonuç (oy/yüzde/toplam) sunucudan yalnız oy verdiysen / anket bittiyse / gönderi sahibiysen gelir; yoksa yalnız seçenek metinleri → yuvarlak düğmeler. Oy tek ve değiştirilemez.
const ANKETLER = new Map();   // gönderi kimliği → son bilinen anket (kendi oyum / iyimser güncelleme çizimlerde korunur)
function anketKalan(bitis) {
  const ms = Date.parse(bitis) - Date.now(); if (!(ms > 0)) return "";
  const dk = Math.ceil(ms / 60000);
  return dk >= 1440 ? t("kalanGun", Math.ceil(dk / 1440)) : dk >= 60 ? t("kalanSaat", Math.ceil(dk / 60)) : t("kalanDk", dk);
}
function anketHtml(id, ham, kucuk = false) {
  if (!ham || !Array.isArray(ham.secenekler)) return "";
  const eski = ANKETLER.get(id);
  const a = eski && eski.oyum && !ham.oyum ? eski : ham;   // sunucudan henüz gelmemiş kendi oyumu kaybetme
  ANKETLER.set(id, a);
  const bitti = a.bitti || Date.parse(a.bitis) <= Date.now(), oylanabilir = !bitti && !a.oyum;
  const sonucVar = a.secenekler.some((x) => x.oy !== undefined) && !a.bekliyor;
  const en = sonucVar ? Math.max(...a.secenekler.map((x) => x.oy || 0)) : -1;
  const ogeler = a.secenekler.map((x) => {
    const sec = a.oyum === x.id, ad = esc(x.metin);
    if (oylanabilir) {   // sonuç görünüyorsa (gönderi sahibi) satırlar hem sonuç hem oy düğmesi
      const y = x.yuzde || 0;
      return `<button type="button" class="anket-sec" role="radio" aria-checked="false" data-e="anket-oy" data-id="${esc(id)}" data-s="${x.id}">${sonucVar ? `<span class="anket-bar" style="--y:${y}%"></span><span>${ad}</span><span>%${y}</span>` : `<span>${ad}</span>`}</button>`;
    }
    if (!sonucVar) return `<div class="anket-sec sonuc${sec ? " secili" : ""}" role="radio" aria-checked="${sec}" aria-disabled="true"><span>${ad}</span>${sec ? `<span aria-hidden="true">✓</span>` : ""}</div>`;
    const y = x.yuzde || 0;
    return `<div class="anket-sec sonuc${sec ? " secili" : ""}${x.oy === en && en > 0 ? " en" : ""}" role="radio" aria-checked="${sec}" aria-disabled="true" aria-label="${ad}: %${y}${sec ? ", " + esc(t("seciliSecenek")) : ""}"><span class="anket-bar" style="--y:${y}%"></span><span>${ad}${sec ? " ✓" : ""}</span><span>%${y}</span></div>`;
  }).join("");
  const alt = [sonucVar && a.toplam !== undefined ? `${a.toplam} ${t("oyAd")}` : "", bitti ? t("sonuclandi") : anketKalan(a.bitis)].filter(Boolean).join(" · ");
  return `<div class="anket${kucuk ? " kucuk" : ""}" data-anket="${esc(id)}"><div role="radiogroup" aria-label="${esc(t("anket"))}">${ogeler}</div>${alt ? `<div class="anket-alt">${esc(alt)}</div>` : ""}</div>`;
}
const anketYenile = (id) => document.querySelectorAll(`.anket[data-anket="${CSS.escape(id)}"]`).forEach((el) => { el.outerHTML = anketHtml(id, ANKETLER.get(id), el.classList.contains("kucuk")); });
async function anketOy(id, sec) {
  if (girisGerekli()) return;
  const onceki = ANKETLER.get(id); if (!onceki || onceki.oyum || onceki.bitti || Date.parse(onceki.bitis) <= Date.now()) return;
  ANKETLER.set(id, { ...onceki, oyum: sec, bekliyor: true }); anketYenile(id);   // iyimser: seçim hemen işaretlenir
  try { const v = await api(`/api/oge/${id}/anket-oy`, { secenek: sec }); ANKETLER.set(id, v.anket); }
  catch (e) { ANKETLER.set(id, onceki); tost(e.durum === 409 || e.durum === 404 ? e.message : t("anketOyHata")); }
  anketYenile(id);
}
// ---------- bağlantı önizleme kartı (gecis-012) ----------
// Kart verisi gönderi OLUŞURKEN sunucuda çıkarılır (posts.baglanti); burada yalnız çizilir. Fotoğraf/video varsa ya da metinde kartın adresi yoksa (düzenlenmişse) çizilmez.
// YouTube: dokununca kart içinde çerezsiz gömme oynatıcı (youtube-nocookie). Mağaza uygulamasında (capacitor:// kökeni) gömme "Hata 153" verebilir → YT_GOMME_NATIF false iken dokununca YouTube/tarayıcı açılır.
const YT_GOMME_NATIF = false;
function baglantiKartiVeri(o) {
  if (!BG || !o || o.haber || o.foto || o.video?.url) return null;
  const k = BG.kartTemizle(o.baglanti); if (!k) return null;
  return BG.bul(o.metin).some((b) => BG.temizle(b.ham) === k.url) ? k : null;
}
function baglantiKartHtml(o, kucuk = false, onizleme = false) {
  const k = baglantiKartiVeri(o); if (!k) return "";
  const yt = k.tur === "youtube", site = k.site || BG.kisalt(k.url, 40).split("/")[0];
  const gorsel = yt ? `<span class="bk-gorsel"><img src="${esc(k.gorsel)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="bk-oynat">${ikon("oynat", 28, true)}</span></span>` : "";
  const metin = `<span class="bk-metin"><span class="bk-site">${esc(site)}</span>${k.baslik ? `<span class="bk-baslik">${esc(k.baslik)}</span>` : ""}${k.aciklama ? `<span class="bk-acik">${esc(k.aciklama)}</span>` : ""}</span>`;
  const kls = `bag-kart${kucuk ? " kucuk" : ""}${yt ? " yt" : ""}`;
  if (onizleme) return `<div class="${kls} onizleme">${gorsel}${metin}</div>`;
  if (yt) return `<div class="${kls}" role="button" tabindex="0" data-e="yt-oynat" data-yt="${esc(k.yt_id)}" data-url="${esc(k.url)}" aria-label="${esc(t("ytOynat") + ": " + (k.baslik || "YouTube"))}">${gorsel}${metin}</div>`;
  return `<a class="${kls}" href="${esc(k.url)}" target="_blank" rel="noopener noreferrer nofollow" data-bag="1">${gorsel}${metin}</a>`;
}
function ytOynat(el) {
  const id = el.dataset.yt || ""; if (!BG || !/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  if (NATIF && !YT_GOMME_NATIF) { window.open(BG.ytAdres(id), "_blank", "noopener"); return; }   // mobil.js window.open'ı sistem/uygulama içi tarayıcıya yönlendirir
  const kap = $(".bk-gorsel", el); if (!kap) return;
  kap.innerHTML = `<iframe src="${esc(BG.ytGomme(id))}" title="${esc($(".bk-baslik", el)?.textContent || "YouTube")}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  el.removeAttribute("data-e"); el.removeAttribute("role"); el.removeAttribute("tabindex"); el.classList.add("oynuyor");
  el.insertAdjacentHTML("beforeend", `<a class="bk-yt-ac" href="${esc(BG.ytAdres(id))}" target="_blank" rel="noopener noreferrer">${esc(t("ytAc"))} ↗</a>`);   // gömme kapalıysa/hata verirse YouTube'da aç
}
// alıntı kartı: alıntılanan gönderinin kısa görünümü (akış, detay, yazma penceresi önizlemesi). onizleme: dokunulmaz, video yerine poster (yazarken oynatıcı yeniden kurulmasın)
function alintiKartHtml(a, onizleme = false) {
  if (!a) return "";
  if (a.yok) return `<div class="alinti-kart yok" role="note">${esc(t(a.silindi ? "alintiSilindi" : "alintiYok"))}</div>`;
  const y = a.yazar, [baslik, ...gerisi] = String(a.metin || "").split("\n\n");
  const metin = a.haber ? `<b class="baslik-metin">${esc(baslik)}</b>${gerisi.length ? `<br>${esc(gerisi.join("\n\n"))}` : ""}` : (onizleme ? esc(a.metin || "") : baglaEtiket(a.metin || "", a.etiketler));
  let medya = "";
  if (a.video?.url) medya = onizleme ? `<span class="alinti-video-onizle" style="min-height:110px">${a.video.poster ? `<img src="${esc(a.video.poster)}" alt="">` : ""}${ikon("oynat", 30, true)}</span>` : videoHtml(a.video);
  else if (a.foto) medya = `<img class="gorsel" src="${esc(a.foto)}" alt="" loading="lazy">`;
  else if (a.haber && a.gorsel?.url) medya = `<img class="gorsel" src="${esc(a.gorsel.url)}" alt="" loading="lazy" decoding="async">`;   // görselsiz haberde tasarım kartı YOK (başlık zaten metinde)
  else if (a.haber && skorKartiMi(a.kart)) medya = skorKartHtml(a.kart, { kucuk: true });   // yalnız skor kartı alıntıda da gösterilir (küçük)
  if (a.haber && listeKartiMi(a.kart)) medya += listeKartHtml(a.kart, { kucuk: true });      // liste/tablo: alıntıda kısaltılmış (ilk 3 maç / 4 satır), fotoğrafın altına (gecis-020)
  const kaynak = a.haber && a.kaynak ? `<div class="alinti-kaynak">${t("kaynak")}: ${esc(a.kaynak)}</div>` : "";
  const kimlik = onizleme ? `class="alinti-kart onizleme"` : `class="alinti-kart" data-e="alinti-ac" data-id="${esc(a.id)}" role="link" tabindex="0"`;
  return `<div ${kimlik} data-alinti="${esc(a.id)}"><div class="alinti-kim">${avatarHtml(y)}<span class="ad">${esc(y?.ad)}</span>${rozetHtml(y)}<span class="gri kisa">@${esc(y?.handle)}</span><span class="gri zaman">· ${zamanYaz(a.zaman)}</span></div>
    ${metin ? `<div class="alinti-metin">${metin}</div>` : ""}${medya}${a.haber ? "" : baglantiKartHtml(a, true, onizleme)}${onizleme ? "" : anketHtml(a.id, a.anket, true)}${kaynak}${a.alintiIcerir || a.alinti ? `<div class="alinti-not">${esc(t("alintiIcerir"))}</div>` : ""}</div>`;
}
function satirHtml(o) {
  const y = o.yazar;
  return `<article class="satir" data-oge="${o.id}">
    ${o.yenidenPaylasan ? `<div class="baglam">${ikon("yay", 14)} ${esc(o.yenidenPaylasan)} ${t("yenidenDedi")}</div>` : ""}
    <div class="satir-ic"><span class="sol" data-profil="${esc(y?.handle)}">${avatarHtml(y)}</span>
      <div class="govde"><div class="kim"><span class="ad" data-profil="${esc(y?.handle)}">${esc(y?.ad)}</span>${rozetHtml(y)}
        <span class="gri kisa" data-profil="${esc(y?.handle)}">@${esc(y?.handle)}</span><span class="gri zaman">· ${zamanYaz(o.zaman)}</span>${o.duzenlendi ? `<span class="gri duzenlendi">· ${t("duzenlendi")}</span>` : ""}${menuDug("gonderi", o.id, y, o)}</div>
        ${metinHtml(o)}${anketHtml(o.id, o.anket)}${ekHtml(o)}${baglantiKartHtml(o)}${alintiKartHtml(o.alinti)}${seriSatiriHtml(o)}${eylemHtml(o)}</div></div></article>`;
}
function detayGonHtml(o) {
  const y = o.yazar, sayac = [[o.yanitSayisi, t("yanit")], [o.yaySayisi, t("yeniPay")], [o.alintiSayisi, t("alintilar"), 1], [o.begeniSayisi, t("begeni")], [o.goruntulenme, t("goruntulenme"), 0, 1]].filter(([n]) => n);
  const zaman = new Date(o.zaman).toLocaleString(D.dil === "en" ? "en-GB" : "tr-TR", { dateStyle: "medium", timeStyle: "short" });
  return `<article class="detay-gon" data-oge="${o.id}" data-gor="detay">
    <div class="detay-ust"><span data-profil="${esc(y?.handle)}">${avatarHtml(y)}</span>
      <div class="detay-kim" data-profil="${esc(y?.handle)}"><div class="ad">${esc(y?.ad)}${rozetHtml(y)}</div><div class="gri">@${esc(y?.handle)}</div></div>${menuDug("gonderi", o.id, y, o)}</div>
    ${metinHtml(o, true)}${anketHtml(o.id, o.anket)}${ekHtml(o, true)}${baglantiKartHtml(o)}${alintiKartHtml(o.alinti)}${seriSatiriHtml(o)}
    <div class="gri detay-zaman">${esc(zaman)}${o.sehir ? " · 📍" + esc(o.sehir) : ""}${o.duzenlendi ? " · " + esc(t("duzenlendi")) : ""}</div>
    ${sayac.length ? `<div class="sayilar">${sayac.map(([n, ad, dugme, kisa]) => dugme ? `<button class="sayac-dug" data-e="alintilar" data-id="${o.id}" aria-expanded="${!!document.querySelector("#alinti-bolum")}"><b>${n}</b> ${ad}</button>` : `<span><b>${kisa ? kisaSayi(n) : n}</b> ${ad}</span>`).join("")}</div>` : ""}${eylemHtml(o)}</article>`;
}
const yanitHtml = (y) => `<article class="satir yanit" data-yanit="${esc(y.id)}"><div class="satir-ic"><span class="sol" data-profil="${esc(y.yazar?.handle)}">${avatarHtml(y.yazar)}</span>
  <div class="govde"><div class="kim"><span class="ad" data-profil="${esc(y.yazar?.handle)}">${esc(y.yazar?.ad)}</span>${rozetHtml(y.yazar)}
  <span class="gri kisa">@${esc(y.yazar?.handle)}</span><span class="gri zaman">· ${zamanYaz(y.zaman)}</span>${menuDug("yanit", y.id, y.yazar, y)}</div><div class="metin">${baglaEtiket(y.metin, y.etiketler)}</div></div></div></article>`;
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
// ---- akış: sayfalama (imleç = created_at), okunanlar en alta, önbellekten anında çizim (stale-while-revalidate), "N yeni gönderi"
const SAYFA = 30, MAX_SAYFA = 3;
const akisAnahtar = () => [D.ben?.handle || "", D.sekme, D.ben?.sehir || "", G.kategori, D.dil].join("|");
const zamanKarsilastir = (l, enYeni) => l.reduce((m, o) => (!m || (enYeni ? Date.parse(o.zaman) > Date.parse(m) : Date.parse(o.zaman) < Date.parse(m)) ? o.zaman : m), null);
const GORULEN_ANAHTAR = "op-gorulen", GORULEN_MAX = 3000;
const gorulenListe = (() => { const a = sakla.al(GORULEN_ANAHTAR, []); return Array.isArray(a) ? a.filter(x => typeof x === "string").slice(-GORULEN_MAX) : []; })();
const gorulen = new Set(gorulenListe);
let gorulenZ = 0;
const gorulenYaz = () => { clearTimeout(gorulenZ); sakla.koy(GORULEN_ANAHTAR, gorulenListe.slice(-GORULEN_MAX)); };
function gorulduIsaretle(id) {   // ≥1 sn ve ≥%50 görünen gönderi (görüntülenme ölçütüyle aynı); yerel depoda en çok ~3000 kimlik, eskiler düşer
  if (gorulen.has(id)) return;
  gorulen.add(id); gorulenListe.push(id);
  if (gorulenListe.length > GORULEN_MAX + 200) gorulenListe.splice(0, gorulenListe.length - GORULEN_MAX).forEach(x => gorulen.delete(x));
  clearTimeout(gorulenZ); gorulenZ = setTimeout(gorulenYaz, 2000);
}
addEventListener("pagehide", gorulenYaz); document.addEventListener("visibilitychange", () => { if (document.hidden) gorulenYaz(); });
function okunanlarAlta(l) {   // görülmeyenler başa, görülenler sona; iki grup kendi içinde sırasını korur; kendi yeni gönderin (15 dk) hep en üstte
  const ben = D.ben?.handle, simdi = Date.now(), ust = [], yeni = [], eski = [];
  for (const o of l) {
    if (ben && o.yazar?.handle === ben && simdi - Date.parse(o.zaman) < 15 * 60000) ust.push(o);
    else if (gorulen.has(o.id) || (ben && o.yazar?.handle === ben)) eski.push(o); else yeni.push(o);   // kendi eski gönderin "okunmuş" sayılır (yoksa hep üstte kalıyordu)
  }
  return ust.concat(yeni, eski);
}
// gecis-019: "Takip" ve "Yakınımda"da kişinin KENDİ gönderisi görünmez (sunucu da süzer; bu savunma eski sunucuya karşı). Sayfalama imleci/bitiş HAM listeden hesaplanır, yalnız çizilecek liste süzülür.
// "Senin İçin"deki okunanlar-alta / kendi-yeni-gönderi-üstte (okunanlarAlta) mantığıyla çelişmez: o yalnız Senin İçin'de kendi gönderi bulunduğunda çalışır.
function kendiSusle(l) { return !G.kategori && D.ben && (D.sekme === "takip" || D.sekme === "yakin") ? l.filter(o => o.yazar?.handle !== D.ben.handle) : l; }
async function akisSayfaCek(imlec) {
  // konu (kategori) sayfası sekmeden bağımsızdır: Takip/Yakınımda sekmesindeyken açılınca boş geliyordu ("Bilim 7" yazıp "burada bir şey yok" demesi)
  const q = new URLSearchParams({ sekme: G.kategori ? "senin" : D.sekme, sehir: G.kategori ? "" : (D.ben?.sehir || ""), kategori: G.kategori, sinir: SAYFA }); if (imlec) q.set("once", imlec);
  return (await api(`/api/akis?${q}`)).ogeler || [];
}
async function akisIlkSayfalar() {   // ilk sayfa görülmüşlerle doluysa (≥10 yeni yoksa) bir sonrakini de çek: en çok 3 sayfa
  const kisisel = !G.kategori; let liste = [], imlec = null, bitti = false;
  for (let i = 0; i < MAX_SAYFA; i++) {
    const sy = await akisSayfaCek(imlec);
    liste = liste.concat(sy); if (sy.length) imlec = zamanKarsilastir(sy, false);
    bitti = sy.length < SAYFA;
    if (bitti || !kisisel || liste.filter(o => !gorulen.has(o.id)).length >= 10) break;
  }
  return { ogeler: kisisel ? okunanlarAlta(kendiSusle(liste)) : liste, imlec, bitti, enYeni: zamanKarsilastir(liste, true), zaman: Date.now() };
}
function akisIcerikHtml(a) {
  const sat = a.ogeler.map(satirHtml), kart = G.kategori ? "" : onerilenHtml("akis");
  if (kart && sat.length) sat.splice(Math.min(5, sat.length), 0, kart);   // ~5. gönderiden sonra yatay "Kimi takip etmeli" şeridi (takip edilmeyen OP hesabı yoksa hiç yok)
  return sat.join("") + (a.bitti ? "" : `<div id="daha-sentinel"></div>`);
}
async function akisCiz(my, yen) {
  const kat = G.kategori, geri = !!kat, bas = kat ? `<h1 class="baslik">${esc(KATEGORI[kat]?.[di()] || "OP")}</h1>` : "";
  const secenek = { geri, sekmeler: !kat }, yz = kat ? "" : betaSeritHtml() + yazKutuHtml();
  const goster = (h) => { kok().innerHTML = kabuk(h, secenek); yazKur(); };
  if (BULUT && !D.ben && D.sekme === "takip" && !kat) { goster(yz + bosHtml(bt("gezintiYok"), `<br><br><button class="dug" data-e="giris-ac">${bt("girisYap")}</button>`)); return; }
  if (D.sekme === "yakin" && !kat && !D.ben?.sehir) {
    goster(yz + bosHtml(t("sehirSec"), `<br><br><button class="dug" data-e="profil-duzenle">${t("duzenle")}</button>`)); return;
  }
  const anahtar = akisAnahtar(), onb = D.onb[anahtar];
  const bos = () => bosHtml(D.sekme === "takip" && !kat ? t("bosTakip") : t("bosAkis"));
  const ciz_ = (a) => { D.ogeler = a.ogeler; D.akis = a; goster(yz + bas + (a.ogeler.length ? akisIcerikHtml(a) : bos())); sentinelKur(); };
  if (onb && !yen) {   // önbellekten ANINDA çiz; arkada tazele (yeni gönderiler hapla bildirilir, sayaçlar yerinde güncellenir)
    ciz_(onb); veriYukle().then(() => { if (my === D.cizim) onerilenDagit(); }); arkaTazele(my, anahtar); return;
  }
  if (!yen || !document.querySelector(".satir")) goster(yz + bas + iskelet);
  try {
    const [a] = await Promise.all([akisIlkSayfalar(), veriYukle()]);
    if (my !== D.cizim) return;
    a.anahtar = anahtar; D.onb[anahtar] = a; ciz_(a);
  } catch (e) { if (my === D.cizim) goster(yz + bosHtml(e.message, `<br><br><button class="dug ikincil" data-e="ust-yenile">↻</button>`)); }
}
const sayacFarkli = (e, o) => ["begeniSayisi", "yaySayisi", "yanitSayisi", "begendimMi", "yaydimMi", "kaydettimMi", "alintiSayisi", "goruntulenme"].some(k => e[k] !== o[k]);
async function arkaTazele(my, anahtar) {
  try {
    const sy = await akisSayfaCek(null);
    if (my !== D.cizim || !D.akis || D.akis.anahtar !== anahtar) return;
    const var_ = new Map(D.akis.ogeler.map(o => [o.id, o])); let yeni = 0;
    for (const o of kendiSusle(sy)) { const e = var_.get(o.id); if (!e) yeni++; else if (sayacFarkli(e, o)) eylemYama({ id: o.id, begeniSayisi: o.begeniSayisi, yaySayisi: o.yaySayisi, yanitSayisi: o.yanitSayisi, alintiSayisi: o.alintiSayisi, goruntulenme: o.goruntulenme, begendimMi: o.begendimMi, yaydimMi: o.yaydimMi, kaydettimMi: o.kaydettimMi }); }
    if (yeni) yeniHapGoster(yeni);
  } catch { /* sessiz */ }
}
let sentinelGozlem = null, dahaYukleniyor = false;
function sentinelKur() {
  sentinelGozlem?.disconnect(); const el = $("#daha-sentinel"); if (!el || !("IntersectionObserver" in window)) return;
  sentinelGozlem = new IntersectionObserver(k => { if (k.some(x => x.isIntersecting)) dahaYukle(); }, { rootMargin: "900px" }); sentinelGozlem.observe(el);
}
async function dahaYukle() {
  const a = D.akis; if (!a || a.bitti || dahaYukleniyor || G.sayfa !== "akis") return; dahaYukleniyor = true; const my = D.cizim;
  try {
    const sy = await akisSayfaCek(a.imlec);
    if (my !== D.cizim || D.akis !== a) return;
    const var_ = new Set(a.ogeler.map(o => o.id)), taze = kendiSusle(sy).filter(o => !var_.has(o.id));
    a.bitti = sy.length < SAYFA; if (sy.length) a.imlec = zamanKarsilastir(sy, false);
    const ekle = G.kategori ? taze : okunanlarAlta(taze);
    a.ogeler.push(...ekle);
    const el = $("#daha-sentinel");
    if (el) { el.insertAdjacentHTML("beforebegin", ekle.map(satirHtml).join("")); if (a.bitti) el.remove(); else sentinelKur(); }
  } catch { /* sessiz: kaydırınca yeniden denenir */ } finally { dahaYukleniyor = false; }
}
// "N yeni gönderi" hapı: akış açıkken 60 sn'de bir (sayfa gizliyken durur) ucuz sorgu → yalnız sayı + en yeni zaman
let yeniZ = 0, yeniHata = 0;
function yeniHapKapat() { document.querySelector(".yeni-hap")?.remove(); }
function yeniHapGoster(n) {
  if (G.sayfa !== "akis") return;
  let h = document.querySelector(".yeni-hap");
  if (!h) { h = document.createElement("button"); h.type = "button"; h.className = "yeni-hap"; h.dataset.e = "yeni-hap"; document.body.appendChild(h); }
  h.textContent = "↑ " + t("yeniHap", n); h.setAttribute("aria-label", t("yeniHap", n));
}
async function yeniKontrol(zorla) {
  if (yeniHata >= 3 || G.sayfa !== "akis" || !D.akis?.enYeni || document.hidden || document.querySelector(".sheet,.cekmece")) return;
  if (!zorla && Date.now() - yeniZ < 55000) return;
  yeniZ = Date.now(); const my = D.cizim, a = D.akis;
  try {
    const q = new URLSearchParams({ sekme: D.sekme, sehir: D.ben?.sehir || "", kategori: G.kategori, sonra: a.enYeni });
    const v = await api(`/api/akis-yeni?${q}`); yeniHata = 0;
    if (my !== D.cizim || D.akis !== a) return;
    if (v && v.sayi > 0) yeniHapGoster(v.sayi); else yeniHapKapat();
  } catch { yeniHata++; }   // uç yoksa (SQL kurulmamış) üç denemeden sonra sessizce vazgeç
}
setInterval(() => yeniKontrol(false), 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) yeniKontrol(false); });
function onbSil() { D.onb = {}; D.yanitOnb = {}; }
function akisYenile() { D.veriZ = 0; delete D.onb[akisAnahtar()]; yeniHapKapat(); return ciz(true, true); }
async function kesfetCiz(my) {
  await veriYukle();
  if (my !== D.cizim) return;
  const say = D.katSay || {};
  kok().innerHTML = kabuk(`<h1 class="baslik">${t("kesfet")}</h1><div class="kesfet-ust">${gundemHtml("kesfet")}${onerilenHtml("kesfet")}</div>` + Object.entries(KATEGORI).map(([id, ad]) =>
    `<button class="liste-satir" data-e="kategori" data-k="${id}"><span class="ad">${ad[di()]}</span><span class="gri">${t("say", say[id] || 0, t("haber"))}</span>${ikon("sag", 18)}</button>`).join(""));
}
async function videolarCiz(my, yen) {   // yalnız videolu gönderiler/haberler, en yeni önce
  const bas = `<h1 class="baslik">${t("videolar")}</h1>`;
  if (!yen) kok().innerHTML = kabuk(bas + iskelet, {});
  try {
    const v = await api("/api/videolar");
    if (my !== D.cizim) return;
    D.ogeler = v.ogeler;
    kok().innerHTML = kabuk(bas + (v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("bosVideo"))), {});
  } catch (e) { if (my === D.cizim) kok().innerHTML = kabuk(bas + bosHtml(e.message, `<br><br><button class="dug ikincil" data-e="ust-yenile">↻</button>`), {}); }
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
  const bm = T[D.dil].bildirimMetin, tur = { begen: "begen", yanit: "yanit", yay: "yay", alinti: "alinti", takip: "profil", bahset: "yanit" };
  kok().innerHTML = kabuk(`<h1 class="baslik">${t("bildirim")}</h1>` + (v.bildirimler.length ? v.bildirimler.map(b =>
    `<div class="satir bildirim ${b.okundu ? "" : "yeni"}" data-e="bil-ac" data-t="${esc(b.tur)}" data-h="${esc(b.tur === "takip" ? b.kimden?.handle : b.hedef)}"><div class="satir-ic"><span class="bil-ik">${ikon(tur[b.tur] || "begen", 22, b.tur === "begen")}</span>
      <div class="govde">${avatarHtml(b.kimden, "kucuk")}<div class="bil-metin"><b>${esc(b.kimden?.ad)}</b> ${bm[b.tur] || ""}${(b.tur === "yanit" || b.tur === "alinti" || b.tur === "bahset") && b.ek ? `<div class="gri">${baglaEtiket(b.ek, b.etiketler)}</div>` : ""}
      <div class="gri">${zamanYaz(b.zaman)}</div></div></div></div></div>`).join("") : bosHtml(t("bosBildirim"))));
}
// ---------- yazı serileri (gecis-019) ----------
const profilSeriSekmesi = () => !!D.profilV && Array.isArray(D.profilV.seriler) && (D.profilV.benim || D.profilV.seriler.length > 0);
function profilSekmeHtml() {
  if (!profilSeriSekmesi()) return "";
  const sec = G.psekme === "seri" ? "seri" : "gonderi", b = (id, ad) => `<button role="tab" class="psekme ${sec === id ? "secili" : ""}" aria-selected="${sec === id}" data-e="psekme" data-s="${id}"><span>${esc(t(ad))}</span></button>`;
  return `<nav class="psekmeler" role="tablist">${b("gonderi", "gonderiSekme")}${b("seri", "seriSekme")}</nav>`;
}
function profilAltHtml() {
  const p = D.profilV; if (!p) return "";
  if (G.psekme === "seri" && profilSeriSekmesi()) return seriPanelHtml(p.seriler, p.benim);
  return `<div class="profil-gonderiler">${p.gonderiler.length ? p.gonderiler.map(satirHtml).join("") : bosHtml(t("bosAkis"))}</div>`;
}
function profilAltYenile() {
  const a = $(".profil-alt"); if (!a) return;
  D.ogeler = G.psekme === "seri" ? [] : D.profilV.gonderiler;
  const nav = $(".psekmeler"); if (nav) nav.outerHTML = profilSekmeHtml();
  a.innerHTML = profilAltHtml();
}
function seriAgaci(liste) {   // düz liste (derinlik, sıra) → [{...seri, cocuklar}]
  const harita = new Map(liste.map(x => [x.id, { ...x, cocuklar: [] }])), kok_ = [];
  for (const x of harita.values()) { const u = x.ustId && harita.get(x.ustId); (u ? u.cocuklar : kok_).push(x); }
  return kok_;
}
function seriSatirlariHtml(dugumler, derin = 0) {
  return dugumler.map(x => `<button class="seri-oge" style="--d:${derin}" data-e="seri-ac" data-id="${esc(x.id)}">${ikon("seri", 22)}<span class="seri-ad"><b>${esc(x.ad)}</b>${x.aciklama ? `<span class="gri">${esc(x.aciklama)}</span>` : ""}</span>
    <span class="gri seri-say">${esc(t("seriGonderi", x.toplam ?? x.sayi ?? 0))}</span>${ikon("sag", 18)}</button>` + seriSatirlariHtml(x.cocuklar || [], derin + 1)).join("");
}
function seriPanelHtml(seriler, benim) {
  const ust = benim ? `<div class="seri-ust-sira"><span class="gri">${esc(t("seriSayi", seriler.length))}</span><button class="dug kucuk" data-e="seri-yeni">${ikon("yaz", 16)} ${esc(t("yeniSeri"))}</button></div>` : "";
  return ust + (seriler.length ? `<div class="seri-agac">${seriSatirlariHtml(seriAgaci(seriler))}</div>` : bosHtml(t(benim ? "seriBos" : "seriBosBaskasi")));
}
function seriSatiriHtml(o) {   // gönderi kartında/detayda: "Seri: Ad › 3"; dokununca seri sayfası. Seri sayfasının kendisinde yalnız sıra rozeti
  const x = o && o.seri; if (!x) return "";
  const kendi = G.sayfa === "seri" && G.id === x.id, metin = kendi ? t("seriSira", x.sira) : `${t("seri")}: ${x.ad}${x.sira ? " › " + x.sira : ""}`;
  return `<button class="seri-satir" data-e="seri-ac" data-id="${esc(x.id)}" aria-label="${esc(t("seriAra", x.ad))}">${ikon("seri", 15)}<span>${esc(metin)}</span></button>`;
}
async function seriCiz(my) {
  kok().innerHTML = kabuk(iskelet, { geri: true });
  const v = await api(`/api/seri/${encodeURIComponent(G.id)}`).catch(() => null);
  if (my !== D.cizim) return;
  if (!v) { kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: true }); return; }
  D.seri = v; D.ogeler = v.ogeler;
  const x = v.seri, y = x.sahip, benim = !!D.ben && y?.handle === D.ben.handle;
  const yol = [`<span class="seri-yol-oge" data-profil="${esc(y?.handle)}" role="link" tabindex="0">@${esc(y?.handle)}</span>`, ...(x.yol || []).map(u => `<button type="button" class="seri-yol-oge" data-e="seri-ac" data-id="${esc(u.id)}">${esc(u.ad)}</button>`)];
  kok().innerHTML = kabuk(`<div class="seri-ust">
      <nav class="seri-yol gri" aria-label="${esc(t("seriYolu"))}">${yol.join('<span aria-hidden="true"> › </span>')}</nav>
      <div class="seri-baslik-sira"><h1 class="seri-baslik">${ikon("seri", 24)}<span>${esc(x.ad)}</span></h1>
        <button class="ikon-dug" data-e="seri-paylas" data-id="${esc(x.id)}" aria-label="${esc(t("seriPaylas"))}">${ikon("paylas", 20)}</button>
        ${benim ? `<button class="menu-dug" data-e="seri-menu" data-id="${esc(x.id)}" aria-label="${bt("menu")}">•••</button>` : ""}</div>
      ${x.aciklama ? `<p class="bio seri-aciklama">${esc(x.aciklama)}</p>` : ""}
      <div class="gri seri-meta"><span data-profil="${esc(y?.handle)}">${esc(y?.ad)}</span> · ${esc(t("seriGonderi", x.toplam ?? 0))}</div></div>` +
    (v.altSeriler.length ? `<h2 class="seri-ara-baslik">${esc(t("seriAltBaslik"))}</h2><div class="seri-agac">${seriSatirlariHtml(v.altSeriler.map(c => ({ ...c, cocuklar: [] })))}</div>` : "") +
    `<h2 class="seri-ara-baslik">${esc(t("seriGonderiler"))}</h2><div class="seri-gonderiler">${v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("seriBosGonderi"))}</div>`, { geri: true });
}
function seriMenuAc(id) {
  const x = D.seri?.seri; if (!x || x.id !== id) return;
  sheet(sheetUst(x.ad) + `<button class="liste-satir" data-e="seri-duzenle" data-id="${esc(id)}"><span class="ad">${esc(t("seriDuzenle"))}</span></button>
    ${x.derinlik < 3 ? `<button class="liste-satir" data-e="seri-yeni" data-ust="${esc(id)}"><span class="ad">${esc(t("seriAltEkle"))}</span></button>` : ""}
    <button class="liste-satir sil-satir" data-e="seri-sil-sor" data-id="${esc(id)}"><span class="ad">${esc(t("seriSil"))}</span></button>`);
}
const seriDuzListe = (liste) => { const o = []; const yur = (dg, derin) => dg.forEach(x => { o.push({ ...x, derin }); yur(x.cocuklar, derin + 1); }); yur(seriAgaci(liste), 0); return o; };   // ağaç sırasıyla düz liste (girintili seçici için)
async function seriFormAc({ id = "", ustId = "", postId = "" } = {}) {   // id: yeniden adlandır · ustId: alt seri · postId: oluşturunca bu gönderiyi ekle
  if (girisGerekli()) return;
  let secenek = "", mevcut = null;
  if (id) mevcut = D.seri?.seri?.id === id ? D.seri.seri : (D.profilV?.seriler || []).find(x => x.id === id) || null;
  else if (!ustId) {
    try { const v = await api(`/api/kullanici/${encodeURIComponent(D.ben.handle)}/seriler`); secenek = seriDuzListe(v.seriler.filter(x => x.derinlik < 3)).map(x => `<option value="${esc(x.id)}">${"— ".repeat(x.derin)}${esc(x.ad)}</option>`).join(""); } catch { /* seçici olmadan da oluşturulur */ }
  }
  sheet(sheetUst(t(id ? "seriDuzenle" : ustId ? "seriAltEkle" : "yeniSeri")) +
    `<div class="alan"><label for="sr-ad">${esc(t("seriAd"))}</label><input id="sr-ad" maxlength="60" autocomplete="off" value="${esc(mevcut?.ad || "")}"></div>
    <div class="alan"><label for="sr-ac">${esc(t("seriAciklama"))}</label><textarea id="sr-ac" maxlength="200" rows="3">${esc(mevcut?.aciklama || "")}</textarea></div>
    ${secenek ? `<div class="alan"><label for="sr-ust">${esc(t("ustSeri"))}</label><select id="sr-ust"><option value="">${esc(t("ustYok"))}</option>${secenek}</select></div>` : ""}
    <div id="ipucu"></div><button class="dug tam" data-e="seri-form-gonder" data-id="${esc(id)}" data-ust="${esc(ustId)}" data-post="${esc(postId)}">${esc(t(id ? "kaydet" : "seriOlustur"))}</button>`);
  $("#sr-ad")?.focus({ preventScroll: true });
}
async function seriFormGonder(dugme) {
  const f = dugme.closest(".sheet"), ad = $("#sr-ad", f).value.trim(), ac = $("#sr-ac", f).value.trim(), { id, ust, post } = dugme.dataset, ustId = ust || $("#sr-ust", f)?.value || "";
  if ([...ad].length < 2) return ipucuYaz(t("seriAdKisa"));
  dugme.disabled = true;
  try {
    const sn = id ? await api(`/api/seri/${encodeURIComponent(id)}/duzenle`, { ad, aciklama: ac }) : await api("/api/seri", { ad, aciklama: ac || null, ...(ustId ? { ustId } : {}) });
    if (post) { const o = await api(`/api/oge/${encodeURIComponent(post)}/seri`, { seriId: sn.seri.id }); ogeGuncelle({ seri: null, ...o.oge }); }
    sheetKapat(); tost(t(post ? "seriEklendi" : "seriKaydedildi"));
    if (G.sayfa === "profil" || G.sayfa === "seri") ciz(false, true);
  } catch (er) { dugme.disabled = false; if (er.durum === 401) return hataGoster(er); ipucuYaz(er.message); }
}
function seriSilSor(id) {
  sheet(sheetUst(t("seriSil")) + `<p class="gri">${esc(t("seriSilSor"))}</p><button class="dug tam tehlike" data-e="seri-sil-evet" data-id="${esc(id)}">${esc(t("seriSil"))}</button><button class="dug ikincil tam" data-e="sheet-kapat">${t("vazgec")}</button>`);
}
async function seriSilEvet(id, dugme) {
  dugme.disabled = true;
  try { await api(`/api/seri/${encodeURIComponent(id)}`, null, "DELETE"); }
  catch (er) { dugme.disabled = false; sheetKapat(); return hataGoster(er); }
  sheetKapat(); tost(t("seriSilindi")); onbSil();
  if (G.sayfa === "seri" && G.id === id) { if (yigin.length) return history.back(); return gotur({ sayfa: "profil", handle: D.ben.handle }, false); }
  ciz(false, true);
}
async function seriSeciciAc(postId) {   // kendi gönderisini bir seriye ekle / taşı: seri seçici + "yeni seri"
  if (girisGerekli()) return;
  sheet(sheetUst(t("seriSec")) + `<div id="seri-sec-icerik">${iskelet}</div>`);
  let v; try { v = await api(`/api/kullanici/${encodeURIComponent(D.ben.handle)}/seriler`); } catch (e) { sheetKapat(); return hataGoster(e); }
  const o = ogeBul(postId), simdiki = o?.seri?.id, duz = seriDuzListe(v.seriler), kutu = $("#seri-sec-icerik");
  if (!kutu) return;
  kutu.innerHTML = (duz.length ? duz.map(x => `<button class="liste-satir seri-sec-satir" style="--d:${x.derin}" data-e="seri-ata" data-id="${esc(postId)}" data-s="${esc(x.id)}" aria-pressed="${x.id === simdiki}">${ikon("seri", 20)}<span class="ad">${esc(x.ad)}</span>${x.id === simdiki ? ikon("tik", 20) : ""}</button>`).join("") : `<p class="gri">${esc(t("seriYokListe"))}</p>`) +
    `<button class="dug ikincil tam" data-e="seri-yeni" data-post="${esc(postId)}">${ikon("yaz", 16)} ${esc(t("yeniSeri"))}</button>`;
}
async function seriAta(postId, seriId, el) {   // seriId boş = seriden çıkar. `seri: null` + sunucu nesnesi: sunucu nesnesinde alan yoksa eski değer birleşimde kalmasın
  if (el) el.disabled = true;
  try { const v = await api(`/api/oge/${encodeURIComponent(postId)}/seri`, { seriId: seriId || null }); sheetKapat(); onbSil(); ogeGuncelle({ seri: null, ...v.oge }); tost(t(seriId ? "seriEklendi" : "seriCikarildi")); if (G.sayfa === "seri") ciz(false, true); }
  catch (e) { if (el) el.disabled = false; sheetKapat(); hataGoster(e); }
}
function seriPaylas(id) {
  const url = `${NATIF ? (YAPI.site || "https://onlypositive.org").replace(/\/$/, "") : location.origin}/#s=${id}`, ad = D.seri?.seri?.ad || "OP";
  if (NATIF && window.OP_MOBIL?.paylas) { window.OP_MOBIL.paylas({ title: "OP", text: ad, url }).catch(() => {}); return; }
  if (navigator.share) navigator.share({ title: "OP", text: ad, url }).catch(() => {});
  else baglantiKopyala(url).then(() => tost(t("kopyalandi"))).catch(() => tost(url));
}

// ---------- çoklu kayıt listeleri (gecis-019; yazı serilerinden bağımsız, yalnız kişinin kendisi görür) ----------
function listeIzgaraHtml(listeler, tumu) {
  return `<div class="liste-izgara" role="list" aria-label="${esc(t("kayitListelerim"))}"><div class="liste-kart secili" role="listitem" aria-current="true">${ikon("kayit", 22, true)}<b>${esc(t("tumu"))}</b><span class="gri">${esc(t("seriGonderi", tumu))}</span></div>` +
    listeler.map(l => `<button class="liste-kart" role="listitem" data-e="liste-ac" data-id="${esc(l.id)}">${ikon("liste", 22)}<b>${esc(l.ad)}</b><span class="gri">${esc(t("seriGonderi", l.sayi))}</span></button>`).join("") +
    `<button class="liste-kart yeni" data-e="liste-yeni">${ikon("yaz", 22)}<b>${esc(t("yeniListe"))}</b></button></div>`;
}
async function kayitCiz(my) {
  const bas = `<h1 class="baslik">${t("kayitlar")}</h1>`;
  kok().innerHTML = kabuk(bas + iskelet, { geri: true });
  const [v, lv] = await Promise.all([api("/api/kayitlar").catch(() => ({ ogeler: [] })), api("/api/kayit-listeleri").catch(() => ({ listeler: [] }))]);
  if (my !== D.cizim) return;
  D.ogeler = v.ogeler; D.listeler = lv.listeler || [];
  kok().innerHTML = kabuk(bas + (lv.listeler ? listeIzgaraHtml(lv.listeler, v.ogeler.length) : "") + (v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("bosKayit"))), { geri: true });
}
async function kayitListeCiz(my) {
  kok().innerHTML = kabuk(iskelet, { geri: true });
  const v = await api(`/api/kayit-listeleri/${encodeURIComponent(G.id)}`).catch(() => null);
  if (my !== D.cizim) return;
  if (!v) { kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: true }); return; }
  D.ogeler = v.ogeler; D.liste = v.liste;
  kok().innerHTML = kabuk(`<div class="baslik-sira"><h1 class="baslik">${esc(v.liste.ad)}</h1><button class="menu-dug" data-e="liste-menu" data-id="${esc(v.liste.id)}" aria-label="${bt("menu")}">•••</button></div>` +
    `<div class="gri seri-meta liste-meta">${esc(t("seriGonderi", v.ogeler.length))}</div>` + (v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("listeBos"))), { geri: true });
}
function listeMenuAc(id) {
  const l = D.liste; if (!l || l.id !== id) return;
  sheet(sheetUst(l.ad) + `<button class="liste-satir" data-e="liste-yeni" data-id="${esc(id)}" data-ad="${esc(l.ad)}"><span class="ad">${esc(t("listeAdlandir"))}</span></button>
    <button class="liste-satir sil-satir" data-e="liste-sil-sor" data-id="${esc(id)}"><span class="ad">${esc(t("listeSil"))}</span></button>`);
}
function listeFormAc({ id = "", ad = "" } = {}) {   // id: yeniden adlandır
  if (girisGerekli()) return;
  sheet(sheetUst(t(id ? "listeAdlandir" : "yeniListe")) + `<div class="alan"><label for="ls-ad">${esc(t("listeAd"))}</label><input id="ls-ad" maxlength="40" autocomplete="off" value="${esc(ad)}"></div>
    <div id="ipucu"></div><button class="dug tam" data-e="liste-form-gonder" data-id="${esc(id)}">${esc(t(id ? "kaydet" : "listeOlustur"))}</button>`);
  const i = $("#ls-ad"); i?.focus({ preventScroll: true }); i?.select();
}
async function listeFormGonder(dugme) {
  const ad = $("#ls-ad")?.value.trim() || "", id = dugme.dataset.id;
  if (!ad) return ipucuYaz(t("listeAdKisa"));
  dugme.disabled = true;
  try { await (id ? api(`/api/kayit-listeleri/${encodeURIComponent(id)}/duzenle`, { ad }) : api("/api/kayit-listeleri", { ad })); }
  catch (er) { dugme.disabled = false; if (er.status === 401 || er.durum === 401) return hataGoster(er); return ipucuYaz(er.message); }
  sheetKapat(); if (id) tost(t("listeAdlandirildi")); ciz(false, true);
}
function listeSilSor(id) {
  sheet(sheetUst(t("listeSil")) + `<p class="gri">${esc(t("listeSilSor"))}</p><button class="dug tam tehlike" data-e="liste-sil-evet" data-id="${esc(id)}">${esc(t("listeSil"))}</button><button class="dug ikincil tam" data-e="sheet-kapat">${t("vazgec")}</button>`);
}
async function listeSilEvet(id, dugme) {
  dugme.disabled = true;
  try { await api(`/api/kayit-listeleri/${encodeURIComponent(id)}`, null, "DELETE"); }
  catch (er) { dugme.disabled = false; sheetKapat(); return hataGoster(er); }
  sheetKapat(); tost(t("listeSilindi"));
  if (G.sayfa === "kayit-liste") { if (yigin.length) return history.back(); return gotur({ sayfa: "kayit" }, false); }
  ciz(false, true);
}
const listeSecSatir = (l, postId) => `<label class="onay liste-sec-satir"><input type="checkbox" data-e="liste-isaret" data-l="${esc(l.id)}" data-p="${esc(postId)}"${l.icinde ? " checked" : ""}><span><b>${esc(l.ad)}</b> <span class="gri">${esc(t("seriGonderi", l.sayi))}</span></span></label>`;
async function listeSeciciAc(postId) {   // kaydet simgesine uzun basış ya da "Kaydedildi · Listeye ekle": mevcut listeler (onay kutulu, çoklu) + "Yeni liste"
  if (girisGerekli()) return;
  const s = sheet(sheetUst(t("listeSecici")) + `<div id="liste-sec-icerik">${iskelet}</div>`);
  let v; try { v = await api(`/api/kayit-listeleri?post=${encodeURIComponent(postId)}`); } catch (e) { sheetKapat(); return hataGoster(e); }
  const kutu = $("#liste-sec-icerik"); if (!kutu) return;
  kutu.innerHTML = `<div class="liste-sec-liste">${(v.listeler || []).length ? v.listeler.map(l => listeSecSatir(l, postId)).join("") : `<p class="gri liste-sec-bos">${esc(t("listeYok"))}</p>`}</div>
    <form class="liste-yeni-form" data-p="${esc(postId)}"><input class="liste-yeni-ad" maxlength="40" autocomplete="off" placeholder="${esc(t("yeniListe"))}" aria-label="${esc(t("listeAd"))}"><button class="dug kucuk" disabled>${ikon("yaz", 16)} ${esc(t("listeOlustur"))}</button></form><div id="ipucu"></div>`;
  const ad = $(".liste-yeni-ad", kutu), form = $(".liste-yeni-form", kutu);
  ad.addEventListener("input", () => { $("button", form).disabled = !ad.value.trim(); });
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); const b = $("button", form), isim = ad.value.trim(); if (!isim) return; b.disabled = true;
    try {
      const r = await api("/api/kayit-listeleri", { ad: isim, postId });
      $(".liste-sec-bos", kutu)?.remove(); $(".liste-sec-liste", kutu).insertAdjacentHTML("beforeend", listeSecSatir(r.liste, postId)); ad.value = ""; ipucuYaz("");
      eylemYama({ id: postId, kaydettimMi: true });
    } catch (er) { b.disabled = false; ipucuYaz(er.message); }
  });
  s.addEventListener("change", async (e) => {
    const c = e.target.closest?.('input[data-e="liste-isaret"]'); if (!c) return;
    const ekle = c.checked; c.disabled = true;
    try { await api(`/api/kayit-listeleri/${encodeURIComponent(c.dataset.l)}/oge`, { postId: c.dataset.p, ekle }); if (ekle) eylemYama({ id: c.dataset.p, kaydettimMi: true }); }
    catch (er) { c.checked = !ekle; ipucuYaz(er.message); }
    c.disabled = false;
  });
}
let uzunZ = 0, uzunTetik = false;   // kaydet simgesine uzun basış → liste seçici
const uzunIptal = () => clearTimeout(uzunZ);
document.addEventListener("pointerdown", (e) => {
  const b = e.target.closest?.(".eylem.kayit"); uzunIptal(); uzunTetik = false; if (!b || !b.dataset.id) return;
  uzunZ = setTimeout(() => { if (!D.ben) return; uzunTetik = true; titrestir(); listeSeciciAc(b.dataset.id); }, 550);
}, true);
for (const olay of ["pointerup", "pointercancel", "pointerleave", "scroll"]) document.addEventListener(olay, uzunIptal, true);
document.addEventListener("contextmenu", (e) => { if (e.target.closest?.(".eylem.kayit")) e.preventDefault(); });

async function profilCiz(my) {
  const handle = G.handle || D.ben?.handle, benim = !!D.ben && handle === D.ben.handle;
  if (!handle) { girisIste(); return; }
  const [v, sv] = await Promise.all([api(`/api/kullanici/${encodeURIComponent(handle)}`).catch(() => null),
    api(`/api/kullanici/${encodeURIComponent(handle)}/seriler`).catch(() => null)]);   // gecis-019: eski sunucuda uç yok → null → sekme gizli
  if (my !== D.cizim) return;
  if (!v) { kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: yigin.length > 0 }); return; }
  const k = v.kullanici; D.ogeler = v.gonderiler;
  D.profilV = { gonderiler: v.gonderiler, seriler: sv ? sv.seriler : null, benim };
  if (G.psekme === "seri" && !profilSeriSekmesi()) G.psekme = "gonderi";
  const katildi = new Date(k.katilma).toLocaleDateString(D.dil === "en" ? "en-GB" : "tr-TR", { month: "long", year: "numeric" });
  const etiket = k.editor ? t("editor") : k.resmi ? t("resmi") : "";
  kok().innerHTML = kabuk(`<div class="profil-ust">${avatarHtml(k, "dev")}<div class="bosluk"></div>
      ${benim ? `<button class="dug ikincil" data-e="profil-duzenle">${t("duzenle")}</button>`
        : `${BULUT && D.ben && !k.editor && !k.resmi ? `<button class="menu-dug" data-e="menu" data-t="profil" data-id="" data-h="${esc(k.handle)}" data-ed="0" data-eng="${v.engelliMi ? 1 : 0}" aria-label="${bt("menu")}">•••</button>` : ""}<button class="dug ${v.takipEdiyorMu ? "ikincil" : ""}" data-e="takip" data-h="${esc(k.handle)}">${v.takipEdiyorMu ? t("takipte") : t("takipEt")}</button>`}</div>
    <div class="profil-bilgi"><h2 class="ad">${esc(k.ad)}${rozetHtml(k)}</h2><div class="gri">@${esc(k.handle)}</div>
      ${etiket ? `<div class="etiket">${esc(etiket)}</div>` : ""}
      ${k.editor && !k.resmi ? `<p class="gri bot-not" role="note">${esc(t("botNot"))}</p>` : ""}
      ${k.bio ? `<p class="bio">${esc(k.bio)}</p>` : ""}
      <div class="gri meta">${k.sehir ? `<span>📍 ${esc(k.sehir)}</span>` : ""}<span>${esc(t("katildi", katildi))}</span></div>
      <div class="istatistik"><span><b>${k.takipSayisi}</b> ${t("takipSay")}</span><span><b>${k.takipci}</b> ${t("takipciSay")}</span></div></div>
    ${profilSekmeHtml()}<div class="profil-alt">${profilAltHtml()}</div>`,
    { geri: !benim || yigin.length > 0, fab: true });
}
function detayYaz(v) {
  D.detay = v;
  const bar = BULUT && !D.ben ? `<div class="yanit-kutu"><button class="dug tam" data-e="giris-ac">${bt("yanitGirisYap")}</button></div>` : `<div class="yanit-kutu"><div id="ipucu"></div><form class="yanit-bar" data-e="yanit-gonder" data-id="${v.oge.id}">${avatarHtml(D.ben, "kucuk")}
    <input id="yanit-metin" maxlength="280" placeholder="${t("yanitYaz")}" autocomplete="off" enterkeyhint="send" aria-label="${t("yanitYaz")}">
    <button class="dug kucuk" id="yanit-dug" disabled>${t("yanitla")}</button></form></div>`;
  kok().innerHTML = kabuk(`<h1 class="baslik gizli-baslik">${t("gonderi")}</h1>` + detayGonHtml(v.oge) +
    `<div id="yanit-liste">${v.yanitlar ? v.yanitlar.map(yanitHtml).join("") : iskelet}</div>` + (v.yanitlar && !v.yanitlar.length ? `<div class="bos az" id="yanit-bos">${t("bosYanit")}</div>` : ""),
    { geri: true, alt: false, fab: false, ekstra: bar });
  const i = $("#yanit-metin"); if (!i) return; let z;
  etiketOnerKur(i);
  if (D.odakYanit === v.oge.id) { D.odakYanit = null; i.focus({ preventScroll: true }); }
  i.addEventListener("input", () => { $("#yanit-dug").disabled = !i.value.trim(); clearTimeout(z); z = setTimeout(canliDenetle, 600, i, "#ipucu"); });
  i.closest("form").addEventListener("submit", e => { e.preventDefault(); yanitGonder(v.oge.id); });
  if (G.odak) { G.odak = false; i.focus({ preventScroll: true }); }
}
async function detayCiz(my) {   // bilinen gönderi/yanıtlar ANINDA çizilir (listeden ya da önbellekten), arkada tazelenir
  const id = G.id, bilinen = D.yanitOnb[id] || (ogeBul(id) ? { oge: ogeBul(id), yanitlar: null } : null);
  if (bilinen) detayYaz(bilinen);
  const v = await api(`/api/oge/${id}`).catch(() => null);
  if (my !== D.cizim) return;
  if (!v) { if (!bilinen) kok().innerHTML = kabuk(bosHtml(t("yok")), { geri: true, alt: false, fab: false }); return; }
  D.yanitOnb[id] = v;
  if (!bilinen) return detayYaz(v);
  D.detay = v;
  const art = $(".detay-gon");
  if (art && JSON.stringify(v.oge) !== JSON.stringify(bilinen.oge)) { const n = document.createElement("div"); n.innerHTML = detayGonHtml(v.oge); art.replaceWith(n.firstElementChild); }
  const liste = $("#yanit-liste");
  if (liste) {
    liste.innerHTML = v.yanitlar.map(yanitHtml).join(""); $("#yanit-bos")?.remove();
    if (!v.yanitlar.length) liste.insertAdjacentHTML("afterend", `<div class="bos az" id="yanit-bos">${t("bosYanit")}</div>`);
  }
}
function ciz(basa = true, yen = false) {   // yen: aşağı çekip yenileme / yeniden yükle → iskelet gösterme, önbelleği kullanma
  const my = ++D.cizim; sheetKapat(); kok().onclick = kok().onkeydown = kok().onchange = null; yeniHapKapat();
  yanCiz(); veriYukle().then(() => { if (my === D.cizim) sagCiz(); });
  const s = G.sayfa, is = s === "video" ? videolarCiz(my, yen) : s === "onerilen" ? onerilenCiz(my) : s === "akis" ? akisCiz(my, yen) : s === "kesfet" ? kesfetCiz(my) : s === "bildirim" ? bildirimCiz(my) : s === "profil" ? profilCiz(my) : s === "kayit" ? kayitCiz(my) : s === "kayit-liste" ? kayitListeCiz(my) : s === "seri" ? seriCiz(my) : detayCiz(my);
  if (basa) scrollTo(0, 0);
  return is.then(() => { if (!basa && my === D.cizim) scrollTo(0, G.scroll || 0); if (my === D.cizim && s === "akis") setTimeout(ilgiIlkKontrol, 400); });
}
function gotur(y, ekle) {   // ekle: alt sayfa (geri okuyla dönülür); değilse kök sayfa
  if (ekle) { G.scroll = scrollY; yigin.push(G); history.pushState({ op: 1 }, ""); } else yigin.length = 0;
  G = { kategori: "", handle: null, id: null, odak: false, ...y };
  return ciz(true);
}
window.addEventListener("popstate", () => { if (yigin.length) { G = yigin.pop(); ciz(false); } });

// ---------- alt sayfalar ----------
function sheet(html) {
  sheetKapat(true);
  const p = document.createElement("div"); p.className = "perde"; p.dataset.e = "sheet-kapat";
  const s = document.createElement("div"); s.className = "sheet"; s.setAttribute("role", "dialog"); s.setAttribute("aria-modal", "true"); s.innerHTML = html;
  document.body.append(p, s); return s;
}
function sheetKapat(yeniAcilis) {   // yeniAcilis: sheet() yeni bir pencere açmadan önce çağırır (taslaktaki alıntı korunur)
  etiketKapat();
  const cek = document.querySelector(".cekmece"), geri = D.odakGeri;
  document.querySelectorAll(".perde,.sheet,.cekmece").forEach(e => e.remove());
  if (!yeniAcilis && taslak.alinti) { taslak.alinti = null; yzGuncelle(); }   // alıntı penceresi kapandı/iptal: vazgeçildi
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

// ---------- paylaşım kutusu davet cümlesi: her açılışta değişir (oturum içinde sabit, art arda aynı gelmez); günün saatine göre sabah/akşam havuzu eklenir ----------
const DAVET = {
  tr: {
    genel: ["Bugün iyi olan ne?", "Bugün seni ne gülümsetti?", "Aklındaki güzel şey ne?", "Bugün sana iyi gelen neydi?", "Küçük bir mutluluğun var mı?", "Bugün ne öğrendin?",
      "Kime teşekkür etmek istersin?", "Bugün neyi başardın?", "Şu an nasıl hissediyorsun?", "Gördüğün güzel bir şey var mı?", "Bugün seni ne şaşırttı?", "En son ne zaman güldün?",
      "Bugün kime iyilik yaptın?", "Seni neşelendiren bir şey var mı?", "Bugünün en güzel anı neydi?", "Bugün hangi şarkı eşlik etti?", "Sevdiğin küçük bir detay?",
      "Bugün neyle gurur duydun?", "Birine ne söylemek isterdin?", "Bugün neye sevindin?", "Seni sakinleştiren şey ne?", "Bugün yeni ne denedin?", "Sana iyi gelen biri var mı?", "Bugün ne güzel geçti?"],
    sabah: ["Güne nasıl başladın?", "Bu sabah seni ne ısıttı?", "Bugün neyi dört gözle bekliyorsun?", "Güne güzel başlatan ne oldu?", "Bu sabah ne duydun, ne gördün?", "Bugün ne yapmak istersin?"],
    aksam: ["Bugün nasıl geçti?", "Günün en iyi anı neydi?", "Bu akşam ne yapıyorsun?", "Yatmadan önce aklında ne var?", "Günü nasıl kapatıyorsun?", "Bu akşam seni ne rahatlatır?"],
  },
  en: {
    genel: ["What's good today?", "What made you smile today?", "What's a nice thing on your mind?", "What did you enjoy today?", "Got a small joy to share?", "What did you learn today?",
      "Who would you like to thank?", "What did you achieve today?", "How are you feeling right now?", "Seen anything lovely lately?", "What surprised you today?", "When did you last laugh?",
      "Who did you help today?", "Anything cheering you up?", "What was the best moment today?", "Which song kept you company?", "A little detail you love?",
      "What made you proud today?", "What would you tell someone?", "What made you happy today?", "What calms you down?", "What did you try today?", "Is someone good to have around?", "What went well today?"],
    sabah: ["How did your day begin?", "What warmed you this morning?", "What are you looking forward to?", "What started your day well?", "What did you see this morning?", "What would you like to do today?"],
    aksam: ["How was your day?", "What was today's best moment?", "What are you up to tonight?", "What's on your mind tonight?", "How do you end your day?", "What helps you unwind tonight?"],
  },
};
const davetTumu = (dil) => [...DAVET[dil].genel, ...DAVET[dil].sabah, ...DAVET[dil].aksam];
const davetSecili = {};
function davet() {
  const dil = D.dil === "en" ? "en" : "tr";
  if (davetSecili[dil]) return davetSecili[dil];
  const sa = new Date().getHours(), havuz = [...DAVET[dil].genel, ...(sa >= 5 && sa < 11 ? DAVET[dil].sabah : sa >= 18 || sa < 4 ? DAVET[dil].aksam : [])];
  const son = sakla.al("op-davet", {})?.[dil], aday = havuz.filter((x) => x !== son);
  const sec = aday[Math.floor(Math.random() * aday.length)];
  sakla.koy("op-davet", { ...(sakla.al("op-davet", {}) || {}), [dil]: sec });
  return (davetSecili[dil] = sec);
}
const taslak = { metin: "", foto: null, video: null, alinti: null, anket: null, paylasiyor: false, baglanti: null, baglantiUrl: "", baglantiYok: "", baglantiDenendi: "" };
let videoSayac = 0;
const EMOJILER = ["😀", "😃", "😄", "😁", "😊", "🙂", "😍", "🥰", "😎", "🤩", "🥳", "🤗", "😇", "😂", "😌", "😉", "🙌", "👏", "👍", "💪",
  "🤝", "❤️", "🧡", "💛", "💚", "💙", "💜", "🌞", "🌻", "🌈", "⭐", "✨", "🎉", "🎈", "🌱", "🌿", "🍀", "🌸", "🐱", "🐶", "🦋"];
const genis = () => matchMedia("(min-width:700px)").matches;
// yazma bileşeni: TEK kod, iki yüz — akış tepesindeki satır içi kutu (≥700 px) ve alt-sayfa penceresi (mobil "+"); ikisi aynı `taslak` ve aynı gonderiPaylas'ı paylaşır
function yazAlani(sheetMi) {
  const id = (x) => (sheetMi ? `id="${x}"` : "");
  return `<textarea class="yaz-alan yz-metin" ${id("yaz-metin")} maxlength="280" rows="${sheetMi ? 5 : 2}" placeholder="${taslak.alinti ? t("alintiYorum") : davet()}" aria-label="${t(taslak.alinti ? "alintiYorum" : "paylasimYaz")}">${esc(taslak.metin)}</textarea>
    <div class="yz-foto"></div><div class="yz-video"></div><div class="yz-baglanti"></div><div class="yz-anket"></div><div class="yz-alinti"></div><div class="yz-ipucu" ${id("ipucu")}></div>
    <div class="yz-emoji" hidden>${EMOJILER.map(e => `<button type="button" data-e="yz-emoji-ekle" data-m="${e}" aria-label="${e}">${e}</button>`).join("")}</div>
    <div class="alt-satir"><button type="button" class="yz-ik" data-e="yz-foto" aria-label="${t("foto")}">${ikon("foto", 22)}</button>
      <button type="button" class="yz-ik" data-e="yz-video" aria-label="${t("videoEkle")}">${ikon("video", 22)}</button>
      <button type="button" class="yz-ik" data-e="yz-emoji" aria-label="${t("emoji")}" aria-expanded="false">${ikon("emoji", 22)}</button>
      <button type="button" class="yz-ik" data-e="yz-anket" aria-label="${t("anketEkle")}" aria-pressed="false">${ikon("anket", 22)}</button>
      <input type="file" accept="image/*" class="yz-dosya" ${id("foto-sec")} hidden>
      <input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm" class="yz-video-dosya" hidden>
      <div class="bosluk"></div><span class="sayac yz-sayac" ${id("sayac")}>280</span>
      ${sheetMi ? "" : `<button class="dug kucuk yz-gonder" data-e="paylas-gonder" disabled>${t("gonderiYayinla")}</button>`}</div>`;
}
function yazKutuHtml() {
  if (!genis()) return `<button class="yz-kisa" data-e="yaz" aria-label="${t("yeniGonderi")}">${avatarHtml(D.ben, "kucuk")}<span class="yz-yer">${davet()}</span><span class="yz-ik-s">${ikon("foto", 22)}</span></button>`;
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
    const g = $(".yz-gonder", k); if (g && !g.dataset.bekle) g.disabled = (!taslak.metin.trim() && !taslak.foto && !taslak.video) || taslak.video?.durum === "inceleniyor" || (!!taslak.anket && !anketTaslakGecerli());
    anketTaslakCiz(k);
    $(".yz-foto", k).innerHTML = taslak.foto ? `<div class="foto-onizle"><img src="${taslak.foto}" alt=""><button type="button" data-e="foto-sil" aria-label="${t("kapat")}">✕</button></div>` : "";
    const al = $(".yz-alinti", k), alId = taslak.alinti?.id || "";
    if (al && (al.dataset.id || "") !== alId) { al.dataset.id = alId; al.innerHTML = taslak.alinti ? alintiKartHtml(taslak.alinti, true) : ""; }
    const bk = $(".yz-baglanti", k);   // bağlantı önizlemesi (✕ ile kaldırılabilir; fotoğraf/video varsa gösterilmez)
    if (bk) {
      const kart = !taslak.foto && !taslak.video && taslak.baglanti && taslak.baglantiYok !== taslak.baglanti.url ? taslak.baglanti : null, imza = kart ? kart.url + "|" + (kart.baslik || "") : "";
      if ((bk.dataset.u || "") !== imza) {
        bk.dataset.u = imza;
        bk.innerHTML = kart ? `<div class="bag-onizle-kap">${baglantiKartHtml({ baglanti: kart, metin: taslak.metin }, false, true)}<button type="button" class="vo-kapat" data-e="baglanti-sil" aria-label="${esc(t("baglantiKaldir"))}">✕</button></div>` : "";
      }
    }
    videoOnizCiz(k);
  });
}
// ---- anket taslağı (composer): 2 seçenekle açılır, "+ seçenek" ile 5'e kadar, süre 1/3/7 gün, ✕ ile kalkar
const anketTaslakGecerli = () => !!taslak.anket && !!taslak.metin.trim() && taslak.anket.secenekler.filter((x) => x.trim()).length >= 2;
function anketTaslakCiz(k) {
  const kap = $(".yz-anket", k); if (!kap) return;
  const a = taslak.anket, imza = a ? a.secenekler.length + "|" + a.sureGun : "";
  document.querySelectorAll('[data-e="yz-anket"]').forEach((b) => b.setAttribute("aria-pressed", String(!!a)));
  if ((kap.dataset.imza || "") !== imza) {
    kap.dataset.imza = imza;
    kap.innerHTML = a ? `<div class="yz-anket-kutu" role="group" aria-label="${esc(t("anket"))}">
      ${a.secenekler.map((x, i) => `<div class="anket-satir"><input class="anket-alan" maxlength="40" data-i="${i}" value="${esc(x)}" placeholder="${esc(t("anketSecenek", i + 1))}" aria-label="${esc(t("anketSecenek", i + 1))}" autocomplete="off"><span class="sayac anket-sayac" aria-hidden="true">${40 - [...x].length}</span></div>`).join("")}
      ${a.secenekler.length < 5 ? `<button type="button" class="dug kucuk ikincil" data-e="anket-ekle">${esc(t("anketSecenekEkle"))}</button>` : ""}
      <div class="anket-sure" role="group" aria-label="${esc(t("anketSure"))}"><span class="gri">${esc(t("anketSure"))}</span>${[1, 3, 7].map((g) => `<button type="button" class="dug kucuk ${a.sureGun === g ? "" : "ikincil"}" data-e="anket-sure" data-g="${g}" aria-pressed="${a.sureGun === g}">${esc(t("gun" + g))}</button>`).join("")}</div>
      <button type="button" class="vo-kapat" data-e="anket-kaldir" aria-label="${esc(t("anketKaldir"))}">✕</button></div>` : "";
  }
  if (a) kap.querySelectorAll(".anket-alan").forEach((inp) => { const v = a.secenekler[+inp.dataset.i]; if (inp.value !== v) inp.value = v; });
}
document.addEventListener("input", (e) => {
  const inp = e.target.closest?.(".anket-alan"); if (!inp || !taslak.anket) return;
  taslak.anket.secenekler[+inp.dataset.i] = inp.value;
  document.querySelectorAll(`.anket-alan[data-i="${inp.dataset.i}"]`).forEach((o) => { if (o !== inp) o.value = inp.value; });
  document.querySelectorAll(`.anket-alan[data-i="${inp.dataset.i}"]`).forEach((o) => { const sy = o.nextElementSibling; if (sy) sy.textContent = String(40 - [...inp.value].length); });
  yzGuncelle();
});
function anketDegistir() {
  if (taslak.anket) { taslak.anket = null; return yzGuncelle(); }
  if (taslak.foto || taslak.video || taslak.alinti) { tost(t("anketUyum")); return; }
  taslak.anket = { secenekler: ["", ""], sureGun: 1 }; yzGuncelle();
  setTimeout(() => document.querySelector(".yz-anket .anket-alan")?.focus({ preventScroll: true }), 30);
}
// metindeki İLK bağlantı değiştiyse sunucudan kart önizlemesi iste (yazma durduktan 600 ms sonra); kart verisini sunucu üretir, istemci göndermez
function baglantiTara() {
  const bg = BG ? BG.ilkBaglanti(taslak.metin) : null, url = bg ? bg.temiz : "";
  if (url !== taslak.baglantiUrl) { taslak.baglantiUrl = url; taslak.baglanti = null; taslak.baglantiDenendi = ""; yzGuncelle(); }
  if (taslak.baglantiYok && taslak.baglantiYok !== url) taslak.baglantiYok = "";
  if (!url || taslak.foto || taslak.video || taslak.baglantiYok === url || taslak.baglanti || taslak.baglantiDenendi === url) return;   // medya varsa kart istenmez (medya öncelikli)
  taslak.baglantiDenendi = url;
  api("/api/baglanti-onizle", { url }).then((v) => { if (taslak.baglantiUrl !== url) return; taslak.baglanti = BG.kartTemizle(v?.baglanti); yzGuncelle(); }).catch(() => { /* önizleme olmasa da bağlantı tıklanabilir kalır */ });
}
// ---- video taslağı: seç → tarayıcıda denetle + küçük resim → önizle → Paylaş'ta yükle (yüzde, iptal, tekrar dene) → gönderi
const videoIleti = (kod) => t({ tur: "videoTur", buyuk: "videoBuyuk", uzun: "videoUzun", acilamaz: "videoAcilamaz", yetki: "videoYetki", ag: "hata" }[kod] || "videoYuklenemedi");
const ipucuYazHepsi = (m) => document.querySelectorAll("[data-yz] .yz-ipucu").forEach(i => { i.innerHTML = m ? `<div class="ipucu">${esc(m)}</div>` : ""; });
const boyutYaz = (b) => (b / 1048576).toFixed(1).replace(".", D.dil === "tr" ? "," : ".") + " MB";
function videoOnizCiz(k) {
  const kap = $(".yz-video", k), v = taslak.video; if (!kap) return;
  if (String(kap.dataset.vid || "") !== String(v ? v.id : "")) {   // video değişti: çerçeve (oynatıcı öğesi) baştan kurulur; durum/yüzde değişince yalnız alt satır güncellenir
    kap.dataset.vid = String(v ? v.id : ""); kap.dataset.vdurum = "";
    kap.innerHTML = v ? `<div class="video-onizle"><video class="vo-video" src="${v.url}" muted playsinline controls preload="metadata"></video>
      <button type="button" class="vo-kapat" data-e="video-sil" aria-label="${t("kapat")}">✕</button></div><div class="vo-durum" aria-live="polite"></div><p class="gri vo-not">${esc(t("videoHatirlat"))}</p>` : "";
  }
  if (!v) return;
  const vv = $(".vo-video", kap); if (v.posterUrl && vv && !vv.getAttribute("poster")) vv.setAttribute("poster", v.posterUrl);
  const d = $(".vo-durum", kap), imza = v.durum + "|" + (v.hataKod || "");
  if (kap.dataset.vdurum !== imza) {
    kap.dataset.vdurum = imza;
    d.innerHTML = v.durum === "inceleniyor" ? `<span class="gri">${t("videoHazirlaniyor")}</span>`
      : v.durum === "hazir" ? `<span class="gri vo-bilgi">${sureYaz(Math.round(v.sure_sn))} · ${boyutYaz(v.boyut)}</span>`
      : v.durum === "yukleniyor" ? `<div class="vo-bar" role="progressbar" aria-label="${esc(t("videoYukleniyor"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div><span class="vo-yuzde">0%</span>
          <button type="button" class="dug kucuk ikincil" data-e="video-iptal">${t("iptal")}</button>`
      : `<span class="vo-hata" role="alert">${esc(videoIleti(v.hataKod))}</span><button type="button" class="dug kucuk ikincil" data-e="video-tekrar">${t("tekrarDene")}</button>`;
  }
  if (v.durum === "yukleniyor") {
    const bar = $(".vo-bar", d); if (bar) { bar.setAttribute("aria-valuenow", String(v.yuzde)); $("i", bar).style.width = v.yuzde + "%"; }
    const y = $(".vo-yuzde", d); if (y) y.textContent = v.yuzde + "%";
  }
}
const videoOnizGuncelle = () => document.querySelectorAll("[data-yz]").forEach(videoOnizCiz);
async function medyaKimlik() {
  if (BULUT) { const o = await OPB.op.oturum(); if (!o) throw Object.assign(new Error("oturum"), { kod: "yetki" }); return { uid: o.user.id, jeton: o.access_token }; }
  return { handle: D.ben.handle, cihaz: D.cihaz };
}
function videoBirak(sil, yenile = true) {   // taslaktaki videoyu bırak: yükleme sürüyorsa durdur, blob adreslerini serbest bırak, depoya yüklenmiş dosyaları (gönderi olmadıysa) sil
  const v = taslak.video; if (!v) return;
  taslak.video = null;
  v.ctrl?.abort();
  [v.url, v.posterUrl].forEach(u => u && URL.revokeObjectURL(u));
  if (sil && (v.videoYol || v.posterYol)) medyaKimlik().then(k => OP_MEDYA.sil([v.videoYol, v.posterYol], k)).catch(() => {});
  if (yenile) yzGuncelle();
}
async function videoSec(dosya) {
  if (taslak.paylasiyor) return;
  if (taslak.foto) { taslak.foto = null; tost(t("videoFotoDegis")); }
  if (taslak.anket) { taslak.anket = null; tost(t("anketUyum")); }
  videoBirak(true, false); ipucuYazHepsi("");
  const id = ++videoSayac;
  taslak.video = { id, durum: "inceleniyor", dosya, url: URL.createObjectURL(dosya) };
  yzGuncelle();
  try {
    const b = await OP_MEDYA.incele(dosya);
    if (taslak.video?.id !== id) return;
    Object.assign(taslak.video, b, { durum: "hazir", posterUrl: URL.createObjectURL(b.poster) });
  } catch (e) {
    if (taslak.video?.id !== id) return;
    videoBirak(false, false); ipucuYazHepsi(videoIleti(e.kod) + (e.asama ? ` [${e.asama}]` : ""));   // net iletiyle reddedilir; taslakta video kalmaz
  }
  yzGuncelle();
}
// iPhone'da gizli video kare vermez; kapak düz renk (yedek) kalır. Paylaş'a basıldığında (kullanıcı hareketi içinde) ekrandaki ÖNİZLEME videosundan gerçek kare alınır.
async function kapakYakala(v) {
  try {
    const vv = [...document.querySelectorAll(".vo-video")].find(x => x.getAttribute("src") === v.url);
    if (!vv) return;
    const bekle = (ms) => new Promise(c => setTimeout(c, ms));
    if (vv.readyState < 2 || !vv.videoWidth) { try { vv.muted = true; await vv.play(); } catch { /* engellenebilir */ } for (let i = 0; i < 25 && (vv.readyState < 2 || !vv.videoWidth); i++) await bekle(100); }
    if (!vv.paused && vv.currentTime < 0.15) await bekle(250);   // ilk kare siyah olmasın
    try { vv.pause(); } catch { /* yok */ }
    if (vv.readyState < 2 || !vv.videoWidth) return;
    const o = Math.min(1, 720 / Math.max(vv.videoWidth, vv.videoHeight));
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(vv.videoWidth * o)); cv.height = Math.max(1, Math.round(vv.videoHeight * o));
    cv.getContext("2d").drawImage(vv, 0, 0, cv.width, cv.height);
    for (const q of [0.82, 0.7, 0.55, 0.4]) {
      const b = await new Promise(c => cv.toBlob(c, "image/jpeg", q));
      if (b && b.size > 2000 && b.size <= OP_MEDYA.SINIR.posterBayt) { v.poster = b; v.kapakYedek = false; if (v.posterUrl) URL.revokeObjectURL(v.posterUrl); v.posterUrl = URL.createObjectURL(b); return; }
    }
  } catch { /* yedek kapak kalır */ }
}
async function videoYukle() {   // poster + video depoya (medya adaptörü); başarılıysa gönderi isteğine girecek { yol, posterYol, sure_sn, en, boy }. Yarım kalan yüklemede tekrar denenince yüklenenler yeniden kullanılır
  const v = taslak.video;
  if (v.yuklendi) return v.yuklendi;
  v.durum = "yukleniyor"; v.yuzde = 0; v.hataKod = ""; v.ctrl = new AbortController(); yzGuncelle();
  try {
    const kimlik = await medyaKimlik();
    if (v.kapakYedek && !v.posterYol) await kapakYakala(v);
    if (!v.posterYol) v.posterYol = (await OP_MEDYA.yukle(v.poster, { amac: "poster", sinyal: v.ctrl.signal, kimlik })).yol;
    if (!v.videoYol) v.videoYol = (await OP_MEDYA.yukle(v.dosya, { amac: "video", tur: v.tur, sinyal: v.ctrl.signal, kimlik, ilerleme: f => { v.yuzde = Math.min(100, Math.round(f * 100)); videoOnizGuncelle(); } })).yol;
    v.yuklendi = { yol: v.videoYol, posterYol: v.posterYol, sure_sn: v.sure_sn, en: v.en, boy: v.boy };
    v.durum = "hazir"; v.yuzde = 100;
    return v.yuklendi;
  } catch (e) {
    v.durum = e.kod === "iptal" ? "hazir" : "hata"; v.hataKod = e.kod === "iptal" ? "" : (e.kod || "yukleme");
    throw e;
  } finally { if (taslak.video === v) yzGuncelle(); }
}
function yazKur() {
  document.querySelectorAll("[data-yz]:not([data-bagli])").forEach(k => {
    k.dataset.bagli = "1";
    const m = $(".yz-metin", k); let z, zb;
    etiketOnerKur(m);
    m.addEventListener("focus", () => { if (girisGerekli()) m.blur(); });   // misafir: kutuya dokununca giriş/kayıt penceresi
    m.addEventListener("input", () => { taslak.metin = m.value; yzGuncelle(); clearTimeout(z); z = setTimeout(canliDenetle, 600, m, $(".yz-ipucu", k)); clearTimeout(zb); zb = setTimeout(baglantiTara, 600); });
    $(".yz-dosya", k).addEventListener("change", async e => {
      const f = e.target.files[0]; e.target.value = ""; if (!f) return;
      if (taslak.paylasiyor) return;
      if (taslak.video) { videoBirak(true, false); tost(t("videoFotoDegis")); }
      if (taslak.anket) { taslak.anket = null; tost(t("anketUyum")); }
      try { taslak.foto = await fotoKucult(f); } catch { tost(t("hata")); }
      yzGuncelle();
    });
    $(".yz-video-dosya", k).addEventListener("change", e => { const f = e.target.files[0]; e.target.value = ""; if (f) videoSec(f); });
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
  if (!k || taslak.paylasiyor) return;
  const d = $(".yz-gonder", k), ip = $(".yz-ipucu", k); taslak.paylasiyor = true; if (d) { d.disabled = true; d.dataset.bekle = "1"; }
  const v = taslak.video;
  try {
    if (ip) ip.innerHTML = "";
    const video = v ? await videoYukle() : null;   // önce depoya (yüzde çubuğu); sonra gönderi (çift filtre sunucuda)
    let cevap = null;
    try { cevap = await api("/api/gonderi", { metin: taslak.metin, foto: taslak.foto, ...(video ? { video } : {}), ...(taslak.alinti ? { alintiId: taslak.alinti.id } : {}), ...(taslak.anket && anketTaslakGecerli() ? { anket: { secenekler: taslak.anket.secenekler.map((x) => x.trim()).filter(Boolean), sureGun: taslak.anket.sureGun } } : {}), ...(taslak.baglantiYok && taslak.baglantiYok === (BG?.ilkBaglanti(taslak.metin)?.temiz || "") ? { baglantiYok: true } : {}) }); }
    catch (e) {
      if (video && [400, 404, 413].includes(e.durum)) {   // sunucu videoyu kabul etmedi: yüklenenler silinir, tekrar denemede baştan yüklenir
        medyaKimlik().then(kim => OP_MEDYA.sil([v.videoYol, v.posterYol], kim)).catch(() => {}); v.yuklendi = v.videoYol = v.posterYol = null;
      }
      throw e;
    }
    if (v) videoBirak(false, false);   // dosyalar artık gönderinin; yalnız önizleme adresleri serbest
    Object.assign(taslak, { metin: "", foto: null, alinti: null, anket: null, baglanti: null, baglantiUrl: "", baglantiYok: "", baglantiDenendi: "" });
    sheetKapat(); { const bb = botBilgi(cevap); tost(bb ? `${t("paylasildi")} · ${bb}` : t("paylasildi"), bb ? 5600 : 2600); } onbSil();
    D.sekme = "senin"; yigin.length = 0; G = { sayfa: "akis", kategori: "", handle: null, id: null, odak: false }; await ciz(true);   // kutu boşalır, yeni gönderi akışın tepesinde
  } catch (e) {
    if (ip && e.kod !== "iptal" && !(v && e.kod)) ip.innerHTML = `<div class="ipucu">${esc(e.message)}</div>`;   // video yükleme hataları önizlemedeki satırda (Tekrar dene) gösterilir
  } finally { taslak.paylasiyor = false; if (d) delete d.dataset.bekle; yzGuncelle(); }
}
async function yanitGonder(id) {
  const i = $("#yanit-metin"), metin = i.value.trim(); if (!metin) return;
  $("#yanit-dug").disabled = true;
  try {
    const v = await api(`/api/oge/${id}/yanit`, { metin });
    i.value = ""; $("#ipucu").innerHTML = "";
    $("#yanit-bos")?.remove(); $("#yanit-liste").insertAdjacentHTML("beforeend", yanitHtml(v.yanit));
    ogeGuncelle({ id, yanitSayisi: (D.detay.oge.yanitSayisi || 0) + 1 });
    const bb = botBilgi(v); if (bb) tost(bb, 5600);
  } catch (e) { $("#yanit-dug").disabled = false; $("#ipucu").innerHTML = `<div class="ipucu">${esc(e.message)}</div>`; }
}
// Ayarlar > Görünüm: Açık / Koyu / Sistem + "Açık tema zemini" ve "Koyu tema zemini" için 10'ar önizleme kutusu (seçim anında uygulanır)
function gorunumHtml(grup) {
  const TM = window.OP_TEMA, tm = document.documentElement.dataset.tema || "";
  if (!TM) return `<div class="alan"><label>${t("tema")}</label>${grup([["", t("oto")], ["acik", t("acik")], ["koyu", t("koyu")]], tm, "tema", "t")}</div>`;
  const tr = TM.tercih(), liste = (mod, ad) => `<div class="zemin-baslik" id="zb-${mod}">${esc(t(ad))}</div><div class="zemin-izgara" role="group" aria-labelledby="zb-${mod}">` +
    TM.liste.filter((x) => x.mod === mod).map((x) => { const ad2 = D.dil === "en" ? x.adEn : x.ad;
      return `<button type="button" class="zemin-sec" data-e="zemin-sec" data-m="${mod}" data-z="${x.id}" aria-pressed="${tr[mod] === x.id}" aria-label="${esc(ad2)}"><span class="zemin-ornek" style="--zo-z:${x.zemin};--zo-c:${x.cizgi};--zo-m:${x.metin};--zo-g:${x.gri};--zo-v:${x.vurgu}"><i></i><i></i><b></b></span><span class="zemin-ad">${esc(ad2)}</span></button>`; }).join("") + "</div>";
  return `<div class="alan"><label>${t("gorunum")}</label>${grup([["", t("sistem")], ["acik", t("acik")], ["koyu", t("koyu")]], tm, "tema", "t")}${liste("acik", "acikZemin")}${liste("koyu", "koyuZemin")}</div>`;
}
function zeminSec(mod, id) {
  if (!window.OP_TEMA?.zeminSec(mod, id)) return;
  document.querySelectorAll(`.zemin-sec[data-m="${mod}"]`).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.z === id)));
  gorunumKaydet();
}
async function gorunumKaydet() {   // oturum açıksa profile de yaz (başka cihazda da gelir); hata sessiz: yerel tercih zaten uygulandı
  if (!BULUT || !D.ben || !window.OP_TEMA) return;
  const tr = window.OP_TEMA.tercih();
  try { await api("/api/gorunum", { acik: tr.acik, koyu: tr.koyu }); D.ben = { ...D.ben, gorunum: { acik: tr.acik, koyu: tr.koyu } }; } catch { /* yerel kalır */ }
}
function gorunumEslestir(ben) {   // giriş sonrası: profildeki tercih (başka cihazdan) yerele yazılır ve uygulanır
  const g = ben?.gorunum; if (!g || !window.OP_TEMA) return;
  const TM = window.OP_TEMA; if (!TM.bul(g.acik, "acik") && !TM.bul(g.koyu, "koyu")) { if (ben) gorunumKaydet(); return; }
  TM.tercihYaz(g); TM.uygula();
}
function ayarlarAc() { return BULUT ? ayarlarAcBulut() : ayarlarAcYerel(); }
function ayarlarAcYerel() {
  const tm = document.documentElement.dataset.tema || "";
  const grup = (liste, secili, e, anahtar) => `<div class="grup">${liste.map(([k, a]) => `<button class="dug ${secili === k ? "" : "ikincil"}" data-e="${e}" data-${anahtar}="${k}">${a}</button>`).join("")}</div>`;
  sheet(`<div class="sheet-ust"><h2>${t("ayarlar")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    ${gorunumHtml(grup)}
    <div class="alan"><label>${t("dil")}</label>${grup([["tr", "Türkçe"], ["en", "English"]], D.dil, "dil", "d")}</div>
    <div class="alan"><label>${t("yaziBoyutu")}</label>${grup([["kucuk", t("yaziKucuk")], ["normal", t("yaziNormal")], ["buyuk", t("yaziBuyuk")]], sakla.al("op-yazi", "kucuk"), "yazi", "v")}</div>
    <div class="alan"><label>${t("otoVideo")}</label>${grup([["1", t("otoAcik")], ["0", t("otoKapali")]], otoVideoTercih() ? "1" : "0", "oto-video", "v")}<p class="gri oto-not">${t("otoVideoNot")}</p></div>
${NATIF && navigator.vibrate ? `<div class="alan"><label>${t("titresim")}</label>${grup([["1", t("otoAcik")], ["0", t("otoKapali")]], sakla.al("op-titresim", true) !== false ? "1" : "0", "titresim", "v")}<p class="gri oto-not">${t("titresimNot")}</p></div>` : ""}
    <button class="dug ikincil tam" data-e="ilgi-ac">${t("ilgiBaslik")}</button>
    <button class="dug ikincil tam" data-e="kayitlar">${ikon("kayit", 18)} ${t("kayitlar")}</button>
    <button class="dug ikincil tam" data-e="profil-duzenle">${t("duzenle")}</button>
    <p class="gri not">OP – Only Positive · ${D.dil === "en" ? "local test build. Only good conversations: no politics, religion, ethnicity or violence." : "yerel deneme sürümü. Sadece iyi sohbet: siyaset, din, etnik kimlik ve şiddet yok."}</p>
    <button class="dug ikincil tam" data-e="cikis">${t("cikis")}</button>`);
}

// ---------- video oynatıcı (haber + kullanıcı): ekrana girince SESSİZ otomatik oynat (aynı anda tek video), çıkınca durdur; dokununca ses; denetim çubuğu; hata yedeği ----------
// Otomatik oynatma YOK: Ayarlar'daki anahtar kapalıysa, veri tasarrufu (saveData) ya da "hareketi azalt" açıksa. Tercih yerel depoda: op-oto-video (çerez politikası tablosunda)
const veriTasarrufu = () => !!navigator.connection?.saveData;
const hareketAzalt = () => !!matchMedia?.("(prefers-reduced-motion: reduce)").matches;
const otoVideoTercih = () => sakla.al("op-oto-video", true) !== false;
const otoOynat = () => otoVideoTercih() && !veriTasarrufu() && !hareketAzalt();
const gorunurOran = new Map();   // video → ekranda görünen oran (yalnız ekrana girmiş olanlar)
function videoBirini() {   // yeterince görünenler (≥%60) arasında en görünür tek video oynar, diğerleri durur
  let en = null, oran = 0;
  for (const [v, o] of gorunurOran) if (v.isConnected && o >= 0.6 && o > oran && !v.dataset.elle && !v.closest(".video-kap.hatali")) { en = v; oran = o; }
  for (const v of gorunurOran.keys()) if (v !== en && !v.paused) v.pause();
  if (en && otoOynat() && en.paused) en.play().catch(() => {});
}
const videoGozlem = "IntersectionObserver" in window ? new IntersectionObserver(kayitlar => {
  for (const k of kayitlar) {
    const v = k.target;
    if (k.isIntersecting) gorunurOran.set(v, k.intersectionRatio); else { gorunurOran.delete(v); delete v.dataset.elle; if (!v.paused) v.pause(); }
  }
  videoBirini();
}, { threshold: [0, 0.25, 0.6, 0.85, 1] }) : null;
function videolariBagla() {
  document.querySelectorAll("video.haber-video[data-oto]:not([data-bagli])").forEach(v => { v.dataset.bagli = "1"; videoGozlem?.observe(v); });
  for (const v of [...gorunurOran.keys()]) if (!v.isConnected) gorunurOran.delete(v);
}
let videoKare = 0;
new MutationObserver(() => { cancelAnimationFrame(videoKare); videoKare = requestAnimationFrame(videolariBagla); }).observe(document.body, { childList: true, subtree: true });
function videoDurumu(v) {
  const kap = v.closest(".video-kap"); if (!kap || kap.classList.contains("detay")) return;
  kap.classList.toggle("durdu", v.paused); kap.classList.toggle("sesli", !v.muted && !v.paused);
  kap.setAttribute("aria-label", t(v.paused ? "oynat" : v.muted ? "sesAc" : "sesKapat"));
  const ses = kap.querySelector("[data-e='video-ses-dugme']"); if (ses) ses.setAttribute("aria-label", t(v.muted ? "sesAc" : "sesKapat"));
  kap.classList.toggle("sessiz-ik", v.muted);
  const oy = kap.querySelector("[data-e='video-oynat']"); if (oy) oy.setAttribute("aria-label", t(v.paused ? "oynat" : "duraklat"));
}
function videoIlerleme(v) {
  const kap = v.closest(".video-kap"); if (!kap || !(v.duration > 0)) return;
  const yuzde = Math.min(100, (v.currentTime / v.duration) * 100), ilr = kap.querySelector(".video-ilerleme");
  kap.style.setProperty("--p", yuzde.toFixed(2)); if (ilr) ilr.setAttribute("aria-valuenow", String(Math.round(yuzde)));
}
["play", "pause", "volumechange"].forEach(ad => document.addEventListener(ad, e => {
  if (!e.target.matches?.("video.haber-video")) return;
  if (ad === "play") document.querySelectorAll("video.haber-video").forEach(x => { if (x !== e.target && !x.paused) x.pause(); });   // aynı anda tek video
  videoDurumu(e.target);
}, true));
document.addEventListener("timeupdate", e => { if (e.target.matches?.("video.haber-video")) videoIlerleme(e.target); }, true);
document.addEventListener("loadedmetadata", e => {   // süre rozeti: sunucu süre vermediyse dosyadan
  if (!e.target.matches?.("video.haber-video")) return;
  const r = e.target.closest(".video-kap")?.querySelector(".video-sure");
  if (r && r.hidden && e.target.duration > 0 && Number.isFinite(e.target.duration)) { r.textContent = sureYaz(Math.round(e.target.duration)); r.hidden = false; }
}, true);
document.addEventListener("error", e => { if (e.target.matches?.("video.haber-video")) { e.target.closest(".video-kap")?.classList.add("hatali"); videoDurumu(e.target); } }, true);   // zarif yedek: poster + "Video açılamadı · Tekrar dene"
document.addEventListener("keydown", e => {
  const kap = e.target.matches?.(".video-kap[data-e='video-ses']") ? e.target : null;
  if (kap && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); videoDokun(kap); }
  const yk = e.target.matches?.(".bag-kart[data-e='yt-oynat']") ? e.target : null;
  if (yk && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ytOynat(yk); }
  const et = e.target.matches?.(".bahset[data-e='etiket']") ? e.target : null;
  if (et && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); e.stopPropagation(); gotur({ sayfa: "profil", handle: et.dataset.h }, true); }
  const ak = e.target.matches?.(".alinti-kart[data-e='alinti-ac']") ? e.target : null;
  if (ak && e.key === "Enter") { e.preventDefault(); gotur({ sayfa: "detay", id: ak.dataset.id }, true); }
});
function videoDokun(kap) {   // durmuşsa sesli oynat, oynuyorsa sesi aç/kapat
  const v = kap.querySelector("video"); if (!v) return;
  if (v.paused) { delete v.dataset.elle; v.muted = false; v.play().catch(() => {}); } else v.muted = !v.muted;
}
function videoOynatDuraklat(kap) {
  const v = kap.querySelector("video"); if (!v) return;
  if (v.paused) { delete v.dataset.elle; v.play().catch(() => {}); } else { v.dataset.elle = "1"; v.pause(); }
}
function videoAra(el, olay) {
  const v = el.closest(".video-kap")?.querySelector("video"); if (!v || !(v.duration > 0)) return;
  const r = el.getBoundingClientRect(); v.currentTime = Math.min(1, Math.max(0, (olay.clientX - r.left) / r.width)) * v.duration;
}
function videoTamEkran(kap) {
  const v = kap.querySelector("video"); if (!v) return;
  if (document.fullscreenElement || document.webkitFullscreenElement) { (document.exitFullscreen || document.webkitExitFullscreen)?.call(document); return; }
  if (kap.requestFullscreen) kap.requestFullscreen().catch(() => {}); else if (v.webkitEnterFullscreen) v.webkitEnterFullscreen();   // iOS: yalnız video öğesi tam ekran olur
}
function videoYeniden(kap) { const v = kap.querySelector("video"); kap.classList.remove("hatali"); if (v) { const s = v.src; v.removeAttribute("src"); v.src = s; v.load(); } }
function otoVideoDegistir(ac) {
  sakla.koy("op-oto-video", ac);
  if (!ac) document.querySelectorAll("video.haber-video[data-oto]").forEach(v => { if (!v.paused && v.muted) v.pause(); });
  else videoBirini();
}

// ---------- yeniden paylaş menüsü · alıntıla · alıntılar listesi (gecis-008) ----------
function yayMenusu(id) {
  const o = ogeBul(id); if (!o) return;
  sheet(sheetUst(t("yeniden")) + `<div class="yay-menu" role="menu" aria-label="${esc(t("yenidenMenu"))}">
    <button class="liste-satir" role="menuitem" data-e="yay-yap" data-id="${esc(id)}">${ikon("yay", 22)}<span class="ad">${esc(t(o.yaydimMi ? "yenidenGeriAl" : "yeniden"))}</span></button>
    <button class="liste-satir" role="menuitem" data-e="alintila" data-id="${esc(id)}">${ikon("alinti", 22)}<span class="ad">${esc(t("alintila"))}</span></button></div>`);
}
function alintilaAc(id) {   // yazma penceresi açılır, altında alıntı önizlemesi (kaldırılamaz; ✕ ile vazgeçilir)
  const o = ogeBul(id); if (!o) return;
  if (taslak.anket) taslak.anket = null;
  taslak.alinti = o; yazAc();
}
async function alintilariAc(id) {   // detay sayfasında "Alıntılar" sayısına dokununca liste açılır/kapanır
  const var_ = $("#alinti-bolum");
  if (var_) { var_.remove(); document.querySelector("[data-e='alintilar']")?.setAttribute("aria-expanded", "false"); return; }
  const b = document.createElement("section"); b.id = "alinti-bolum";
  b.innerHTML = `<h2 class="alt-baslik">${esc(t("alintilar"))}</h2><div id="alinti-liste">${iskelet}</div>`;
  $(".detay-gon")?.after(b); document.querySelector("[data-e='alintilar']")?.setAttribute("aria-expanded", "true");
  try {
    const v = await api(`/api/oge/${id}/alintilar`);
    if (!b.isConnected) return;
    for (const o of v.ogeler) if (!D.ogeler.some(x => x.id === o.id)) D.ogeler.push(o);   // listedeki gönderilerin düğmeleri çalışsın (ogeBul/ogeGuncelle)
    $("#alinti-liste").innerHTML = v.ogeler.length ? v.ogeler.map(satirHtml).join("") : bosHtml(t("bosAlinti"));
  } catch (e) { if (b.isConnected) $("#alinti-liste").innerHTML = bosHtml(e.message); }
}

// ---------- görüntülenme sayımı (gecis-008): ekranda ≥1 sn ve ≥%50 görünen gönderi kuyruğa girer; 10 sn'de bir ya da sayfa gizlenirken TOPLU (en çok 50) gider; oturumda aynı gönderi bir kez ----------
const goruntuKuyruk = new Set(), goruntulendi = new Set(), goruntuSayac = new Map();
function goruntuSay(id) {
  if (goruntulendi.has(id)) return;
  const o = ogeBul(id); if (o?.yazar?.handle && o.yazar.handle === D.ben?.handle) return;   // yazarın kendi görüntülemesi sayılmaz (sunucu da saymaz)
  gorulduIsaretle(id);   // okunanlar yenilemede en alta iner
  goruntulendi.add(id); goruntuKuyruk.add(id);
  if (goruntuKuyruk.size >= 50) goruntuGonder();
}
function goruntuGonder() {
  if (!goruntuKuyruk.size) return;
  const idler = [...goruntuKuyruk].slice(0, 50); idler.forEach(i => goruntuKuyruk.delete(i));
  api("/api/goruntule", { idler }).catch(() => {});   // sayım en iyi çabadır: hata sessiz
}
const goruntuGozlem = "IntersectionObserver" in window ? new IntersectionObserver(kayitlar => {
  for (const k of kayitlar) {
    const el = k.target, id = el.dataset.oge;
    if (!id || goruntulendi.has(id)) { goruntuGozlem.unobserve(el); continue; }
    const yeterli = k.isIntersecting && (k.intersectionRatio >= 0.5 || k.intersectionRect.height >= innerHeight * 0.5);   // uzun gönderi ekranın yarısını doldurunca da sayılır
    if (yeterli) { if (!goruntuSayac.has(el)) goruntuSayac.set(el, setTimeout(() => { goruntuSayac.delete(el); if (el.isConnected && !document.hidden) goruntuSay(id); }, 1000)); }
    else if (goruntuSayac.has(el)) { clearTimeout(goruntuSayac.get(el)); goruntuSayac.delete(el); }
  }
}, { threshold: [0, 0.25, 0.5, 0.75, 1] }) : null;
function goruntuBagla() { document.querySelectorAll("[data-oge]:not([data-gb])").forEach(el => { el.dataset.gb = "1"; goruntuGozlem?.observe(el); }); }
let goruntuKare = 0;
new MutationObserver(() => { cancelAnimationFrame(goruntuKare); goruntuKare = requestAnimationFrame(goruntuBagla); }).observe(document.body, { childList: true, subtree: true });
setInterval(goruntuGonder, 10000);
document.addEventListener("visibilitychange", () => { if (document.hidden) goruntuGonder(); });
addEventListener("pagehide", goruntuGonder);

// ---------- etkileşim ----------
function ogeVeriYama(yeni) {   // bellekteki tüm listelerde (görünür liste, akış önbellekleri, detay) gönderiyi birleştir
  const uygula = (l) => { const i = l.findIndex(x => x.id === yeni.id); if (i >= 0) l[i] = { ...l[i], ...yeni }; };
  uygula(D.ogeler); for (const a of Object.values(D.onb)) uygula(a.ogeler);
  if (D.detay?.oge.id === yeni.id) D.detay.oge = { ...D.detay.oge, ...yeni };
  for (const v of Object.values(D.yanitOnb)) if (v.oge.id === yeni.id) v.oge = { ...v.oge, ...yeni };
}
function ogeGuncelle(yeni) {
  ogeVeriYama(yeni);
  document.querySelectorAll(`[data-oge="${yeni.id}"]`).forEach(el => {
    const detay = el.dataset.gor === "detay", o = detay ? D.detay?.oge : D.ogeler.find(x => x.id === yeni.id); if (!o) return;
    const n = document.createElement("div"); n.innerHTML = detay ? detayGonHtml(o) : satirHtml(o); el.replaceWith(n.firstElementChild);
  });
}
function eylemYama(yeni) {   // yalnız eylem çubuğu yeniden yazılır (video/görsel yerinde kalır): iyimser güncelleme + sunucu yanıtı
  ogeVeriYama(yeni);
  document.querySelectorAll(`[data-oge="${yeni.id}"]`).forEach(el => {
    const detay = el.dataset.gor === "detay", o = detay ? D.detay?.oge : D.ogeler.find(x => x.id === yeni.id), eski = $(".eylemler", el); if (!o || !eski) return;
    const f = document.activeElement, kd = eski.contains(f) ? f.dataset.e : null;
    const n = document.createElement("div"); n.innerHTML = eylemHtml(o); eski.replaceWith(n.firstElementChild);
    if (kd) $(`.eylemler [data-e="${kd}"]`, el)?.focus({ preventScroll: true });
  });
}
const titrestir = () => { if (NATIF && sakla.al("op-titresim", true) !== false) { try { navigator.vibrate?.(8); } catch { /* yok say */ } } };
const eylemSira = new Map();
function etkilesim(tur, id) {   // İYİMSER: arayüz hemen değişir, ağ yanıtı beklenmez; hata olursa geri alınır; aynı eylemin art arda dokunuşları sıraya girer
  const o = ogeBul(id); if (!o) return Promise.resolve();
  const alan = { begen: ["begendimMi", "begeniSayisi"], yay: ["yaydimMi", "yaySayisi"], kaydet: ["kaydettimMi"] }[tur]; if (!alan) return Promise.resolve();
  const onceki = Object.fromEntries(alan.map(a => [a, o[a]])), ac = !o[alan[0]], yeni = { id, [alan[0]]: ac };
  if (alan[1]) yeni[alan[1]] = Math.max(0, (o[alan[1]] || 0) + (ac ? 1 : -1));
  eylemYama(yeni); titrestir();
  const k = tur + id, zincir = (eylemSira.get(k) || Promise.resolve()).then(async () => {
    try { const v = await api(`/api/oge/${id}/${tur}`, {}); if (eylemSira.get(k) === zincir) eylemYama(v.oge); }
    catch (e) { eylemYama({ id, ...onceki }); hataGoster(e); }
  });
  eylemSira.set(k, zincir); zincir.then(() => { if (eylemSira.get(k) === zincir) eylemSira.delete(k); });
  return zincir;
}
function ogeBul(id) { return D.ogeler.find(x => x.id === id) || (D.detay?.oge.id === id ? D.detay.oge : null); }
function kaydetDegistir(id) {
  const o = ogeBul(id), ac = !!o && !o.kaydettimMi, p = etkilesim("kaydet", id);
  if (o) { if (ac && D.ben) tostGeriAl(t("kaydedildi") + " ·", () => listeSeciciAc(id), t("listeyeEkle"), 5000); else tost(t(ac ? "kaydedildi" : "kayitKalkti")); }   // gecis-019: kaydetmek eskisi gibi; altta "Listeye ekle" kısayolu
  return p;
}
// marka logoları: simple-icons (CC0); yalnız "şurada paylaş" kısayolu olarak kullanılır
const LOGO = {
  facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  instagram: 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077',
  x: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  telegram: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  gmail: 'M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z',
};
const logo = (ad, boy = 26) => `<svg width="${boy}" height="${boy}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${LOGO[ad]}"/></svg>`;
// paylaşım menüsü: gönderinin OP bağlantısı; iki sıra halinde hedefler
const paylasBilgi = (o) => ({ url: `${NATIF ? (YAPI.site || "https://onlypositive.org").replace(/\/$/, "") : location.origin}/#g=${o.id}`, metin: String(o.metin || "").split("\n\n")[0].slice(0, 140) || (o.video ? t("video") : "") });
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
    bag("p-fb", logo("facebook"), "Facebook", `https://www.facebook.com/sharer/sharer.php?u=${u}`) +
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
  sakla.koy("op-tema", k); window.OP_TEMA?.uygula();
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
    if (satir && satir.dataset.gor !== "detay") { D.ciftBekle = { id: satir.dataset.oge, z: Date.now() }; return gotur({ sayfa: "detay", id: satir.dataset.oge }, true); }   // metne tek dokunma gecikmesiz detayı açar
    if (satir && satir.dataset.gor === "detay" && e.target.closest(".metin")) {   // listeden çift dokunuşla gelindiyse ikinci dokunuş beğenidir
      const b = D.ciftBekle; D.ciftBekle = null;
      if (b && b.id === satir.dataset.oge && Date.now() - b.z < 700) return begeniYap(b.id, e.clientX, e.clientY);
    }
    return;
  }
  const a = el.dataset;
  switch (a.e) {
    case "git": if (BULUT && !D.ben && (a.s === "bildirim" || a.s === "profil" || a.s === "kayit")) return girisIste();
      if (a.s === "akis" && G.sayfa === "akis" && !G.kategori && !document.querySelector(".sheet,.cekmece")) { if (scrollY > 80) { scrollTo({ top: 0, behavior: hareketAzalt() ? "auto" : "smooth" }); return; } return akisYenile(); }   // X gibi: aşağıdaysa en üste, tepedeyse yenile
      return gotur({ sayfa: a.s, handle: a.s === "profil" ? D.ben.handle : null }, false);
    case "geri": return yigin.length ? history.back() : gotur({ sayfa: "akis" }, false);
    case "sekme": D.sekme = a.s; return ciz(true);
    case "ust-yenile": yigin.length = 0; G = { sayfa: "akis", kategori: "", handle: null, id: null, odak: false }; return akisYenile();   // logo: en üste çık + yenile
    case "yeni-hap": scrollTo(0, 0); return akisYenile();
    case "foto-ac": return fotoTikla(el, e);
    case "foto-kapat": return fotoKapat();
    case "yazi": sakla.koy("op-yazi", a.v); yaziUygula(); return ayarlarAc();
    case "ilgi-ac": return ilgiSheetAc();
    case "ilgi-sec": return ilgiSec(a.k, +a.v, el);
    case "ilgi-cip": { const ac = el.getAttribute("aria-pressed") !== "true"; el.setAttribute("aria-pressed", String(ac)); return; }
    case "ilgi-devam": return ilgiIlkBitir(true);
    case "ilgi-gec": return ilgiIlkBitir(false);
    case "ilgi-az": return ilgiAz(a.k);
    case "titresim": sakla.koy("op-titresim", a.v === "1"); if (a.v === "1") titrestir(); return ayarlarAc();
    case "kategori": return gotur({ sayfa: "akis", kategori: a.k }, true);
    case "begen": if (girisGerekli()) return; return etkilesim(a.e, a.id);
    case "yay": if (girisGerekli()) return; return yayMenusu(a.id);
    case "yay-yap": sheetKapat(); return etkilesim("yay", a.id);
    case "alintila": sheetKapat(); return alintilaAc(a.id);
    case "alinti-ac": return gotur({ sayfa: "detay", id: a.id }, true);
    case "etiket": return gotur({ sayfa: "profil", handle: a.h }, true);   // @etiket bağlantısı
    case "alintilar": return alintilariAc(a.id);
    case "yanit": return gotur({ sayfa: "detay", id: a.id, odak: true }, true);
    case "kaydet": if (uzunTetik) { uzunTetik = false; return; }   // uzun basış liste seçiciyi açtı: tıklama kaydetmesin
      if (girisGerekli()) return; return kaydetDegistir(a.id);
    // ---- gecis-019: yazı serileri + kayıt listeleri
    case "psekme": G.psekme = a.s === "seri" ? "seri" : "gonderi"; return profilAltYenile();
    case "seri-ac": sheetKapat(); return gotur({ sayfa: "seri", id: a.id }, true);
    case "seri-yeni": sheetKapat(); return seriFormAc({ ustId: a.ust || "", postId: a.post || "" });
    case "seri-duzenle": sheetKapat(); return seriFormAc({ id: a.id });
    case "seri-form-gonder": return seriFormGonder(el);
    case "seri-menu": return seriMenuAc(a.id);
    case "seri-sil-sor": return seriSilSor(a.id);
    case "seri-sil-evet": return seriSilEvet(a.id, el);
    case "seri-paylas": return seriPaylas(a.id);
    case "seri-sec": sheetKapat(); return seriSeciciAc(a.id);
    case "seri-ata": return seriAta(a.id, a.s, el);
    case "seri-cikar": sheetKapat(); return seriAta(a.id, "");
    case "liste-ac": return gotur({ sayfa: "kayit-liste", id: a.id }, true);
    case "liste-yeni": sheetKapat(); return listeFormAc({ id: a.id || "", ad: a.ad || "" });
    case "liste-form-gonder": return listeFormGonder(el);
    case "liste-menu": return listeMenuAc(a.id);
    case "liste-sil-sor": return listeSilSor(a.id);
    case "liste-sil-evet": return listeSilEvet(a.id, el);
    case "liste-sec": sheetKapat(); return listeSeciciAc(a.id);
    case "devam": return gotur({ sayfa: "detay", id: a.id }, true);
    case "video-ses": return videoDokun(el);
    case "video-oynat": return videoOynatDuraklat(el.closest(".video-kap"));
    case "video-ses-dugme": { const v = el.closest(".video-kap")?.querySelector("video"); if (v) v.muted = !v.muted; return; }
    case "video-ara": return videoAra(el, e);
    case "video-tam": return videoTamEkran(el.closest(".video-kap"));
    case "video-yeniden": return videoYeniden(el.closest(".video-kap"));
    case "oto-video": { const ac = a.v === "1"; otoVideoDegistir(ac); return document.querySelector(".sheet") && ayarlarAc(); }
    case "yz-video": if (girisGerekli()) return; return $(".yz-video-dosya", el.closest("[data-yz]")).click();
    case "video-sil": videoBirak(true, true); return baglantiTara();
    case "video-iptal": return taslak.video?.ctrl?.abort();
    case "video-tekrar": return gonderiPaylas(el.closest("[data-yz]") || $("[data-yz]"));
    case "kayitlar": sheetKapat(); return gotur({ sayfa: "kayit" }, true);
    case "paylas": return disariPaylas(a.id);
    case "paylas-kopyala": return paylasKopyala(a.id);
    case "paylas-ig": return paylasIg(a.id, a.tur);
    case "paylas-diger": return paylasDiger(a.id);
    case "bil-ac": return a.t === "takip" ? gotur({ sayfa: "profil", handle: a.h }, true) : gotur({ sayfa: "detay", id: a.h }, true);
    case "yaz": if (girisGerekli()) return; return yazAc();
    case "foto-sil": taslak.foto = null; baglantiTara(); return yzGuncelle();
    case "pf-sec": return document.getElementById("pf-dosya")?.click();
    case "pf-kaldir": yeniProfil.fotoVeri = ""; yeniProfil.fotoKaldir = true; return pfGuncelle();
    case "soru-cevapla": D.odakYanit = a.id; return gotur({ sayfa: "detay", id: a.id }, true);
    case "yz-anket": return anketDegistir();
    case "anket-ekle": if (taslak.anket && taslak.anket.secenekler.length < 5) { taslak.anket.secenekler.push(""); yzGuncelle(); document.querySelector(".yz-anket .anket-satir:last-of-type .anket-alan")?.focus({ preventScroll: true }); } return;
    case "anket-sure": if (taslak.anket) { taslak.anket.sureGun = +a.g; yzGuncelle(); } return;
    case "anket-kaldir": taslak.anket = null; return yzGuncelle();
    case "anket-oy": return anketOy(a.id, +a.s);
    case "baglanti-sil": taslak.baglantiYok = taslak.baglantiUrl; taslak.baglanti = null; return yzGuncelle();
    case "yt-oynat": return ytOynat(el);
    case "zemin-sec": return zeminSec(a.m, a.z);
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
    case "cikis": if (confirm(t("silOnay"))) { sakla.koy("op-ben", null); D.ben = null; onbSil(); sheetKapat(); karsilamaCiz(0); } return;
    case "takip": { if (girisGerekli()) return; return takipDegistir(a.h); }
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
const yeniProfil = { ad: "", handle: "", avatar: "🌞", renk: "#F3E3B3", sehir: "", bio: "", foto: "", fotoVeri: "", fotoKaldir: false };
// ---- profil fotoğrafı: seç → kare kırp (sürükle + yakınlaştır) → 512x512 JPEG (≤200 KB; tuvalden geçince EXIF/konum bilgisi düşer) → önizle → kaydet
const pfVar = () => !!(yeniProfil.fotoVeri || (yeniProfil.foto && !yeniProfil.fotoKaldir));
const pfOnizle = () => avatarHtml({ ...yeniProfil, foto: yeniProfil.fotoKaldir ? "" : yeniProfil.foto }, "dev");
const pfSatir = () => `<div class="foto-sec-satir" role="group" aria-label="${esc(t("pfAlan"))}"><button type="button" class="dug kucuk ikincil" data-e="pf-sec">${esc(t("pfSec"))}</button>${pfVar() ? `<button type="button" class="dug kucuk ikincil" data-e="pf-kaldir">${esc(t("pfKaldir"))}</button>` : ""}<input type="file" id="pf-dosya" accept="image/*" hidden></div>`;
function pfGuncelle() { const o = $("#avatar-onizle"); if (o) o.innerHTML = pfOnizle(); const s = $(".foto-sec-satir"); if (s) s.outerHTML = pfSatir(); }
document.addEventListener("change", (e) => { if (e.target.id === "pf-dosya") { const f = e.target.files[0]; e.target.value = ""; if (f) pfKirp(f); } });
async function pfKirp(dosya) {
  const url = URL.createObjectURL(dosya), img = new Image();
  try { await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = url; }); } catch { URL.revokeObjectURL(url); return tost(t("pfAcilamaz")); }
  const V = 280, w = img.naturalWidth, h = img.naturalHeight, min = Math.max(V / w, V / h);
  let z = 1, ox = 0, oy = 0;
  const s = sheet(`<div class="sheet-ust"><h2>${esc(t("pfKirp"))}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    <p class="gri">${esc(t("pfIpucu"))}</p><div class="kirp-kap" style="width:${V}px;height:${V}px"><canvas id="kirp" width="${V}" height="${V}" tabindex="0" aria-label="${esc(t("pfKirp"))}"></canvas></div>
    <label class="kirp-yak"><span>${esc(t("pfYakin"))}</span><input type="range" id="kirp-z" min="1" max="3" step="0.01" value="1" aria-label="${esc(t("pfYakin"))}"></label>
    <div class="grup"><button class="dug ikincil" data-e="sheet-kapat">${t("iptal")}</button><button class="dug" id="kirp-tamam">${esc(t("pfKullan"))}</button></div>`);
  const cv = $("#kirp", s), c = cv.getContext("2d");
  const sinirla = () => { const sc = min * z, mx = Math.max(0, (w * sc - V) / 2), my = Math.max(0, (h * sc - V) / 2); ox = Math.max(-mx, Math.min(mx, ox)); oy = Math.max(-my, Math.min(my, oy)); };
  const ciz = (hc, bt_) => { const k = bt_ / V, sc = min * z * k; hc.fillStyle = "#fff"; hc.fillRect(0, 0, bt_, bt_); hc.drawImage(img, bt_ / 2 + ox * k - (w * sc) / 2, bt_ / 2 + oy * k - (h * sc) / 2, w * sc, h * sc); };
  const yenile = () => { sinirla(); ciz(c, V); };
  let sur = null;
  cv.addEventListener("pointerdown", (e) => { sur = { x: e.clientX, y: e.clientY, ox, oy }; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener("pointermove", (e) => { if (!sur) return; ox = sur.ox + (e.clientX - sur.x); oy = sur.oy + (e.clientY - sur.y); yenile(); });
  const bitir = () => { sur = null; }; cv.addEventListener("pointerup", bitir); cv.addEventListener("pointercancel", bitir);
  cv.addEventListener("wheel", (e) => { e.preventDefault(); z = Math.max(1, Math.min(3, z - e.deltaY * 0.002)); $("#kirp-z", s).value = z; yenile(); }, { passive: false });
  cv.addEventListener("keydown", (e) => { const d = { ArrowLeft: [20, 0], ArrowRight: [-20, 0], ArrowUp: [0, 20], ArrowDown: [0, -20] }[e.key]; if (d) { e.preventDefault(); ox += d[0]; oy += d[1]; yenile(); } });
  $("#kirp-z", s).addEventListener("input", (e) => { z = +e.target.value; yenile(); });
  $("#kirp-tamam", s).addEventListener("click", () => {
    const out = document.createElement("canvas"); out.width = out.height = 512; ciz(out.getContext("2d"), 512);
    let veri = "";
    for (const q of [0.9, 0.82, 0.74, 0.66, 0.58, 0.5]) { veri = out.toDataURL("image/jpeg", q); if ((veri.length - 23) * 0.75 <= 200 * 1024) break; }
    URL.revokeObjectURL(url); yeniProfil.fotoVeri = veri; yeniProfil.fotoKaldir = false; sheetKapat(); pfGuncelle();
  });
  yenile();
}
function karsilamaCiz(adim = 0, duzenleme = false) {
  D.veriZ = 0;
  if (duzenleme && D.ben) { Object.assign(yeniProfil, D.ben); yeniProfil.fotoVeri = ""; yeniProfil.fotoKaldir = false; }
  const en = D.dil === "en", k = kok();
  const bulutKayit = BULUT && !duzenleme && adim === 2, epostali = bulutKayit && D.profilModu !== "profil";
  k.onclick = k.onkeydown = k.onchange = null; sheetKapat();
  if (adim === 0) D.profilModu = "kayit";
  const nokta = `<div class="adim-nokta">${[0, 1, 2].map(i => `<i class="${i === adim ? "aktif" : ""}"></i>`).join("")}</div>`;
  if (adim === 0) {
    k.innerHTML = `<div class="karsila sayfa"><div class="karsila-marka"><img class="karsila-logo" src="icons/op.svg" alt="OP">${betaEtiket()}</div>
      <h1>${en ? "Only good things here" : "Burada sadece iyi şeyler var"}</h1>
      <p>${en ? "Good conversations, happy moments and tiny joys." : "İyi sohbetler, güzel anlar, küçük mutluluklar."}</p>
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
      <div class="avatar-onizle" id="avatar-onizle">${pfOnizle()}</div>${epostali ? "" : pfSatir()}
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
        D.ben = { ...v.kullanici, ilgi: v.kullanici.ilgi ?? D.ben?.ilgi }; sakla.koy("op-ben", D.ben); onbSil(); k.onclick = null;
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
  gorunumEslestir(ben);
  return ben;
}
function girisSonrasi() {   // giriş/kayıt tamam: önceki sayfaya (paylaşılan bağlantı vb.) ya da akışa dön
  D.veriZ = 0; onbSil(); const d = D.donus; D.donus = null; D.misafir = false;
  kok().onclick = kok().onkeydown = kok().onchange = null;
  gotur(d && d.sayfa ? d : { sayfa: "akis" }, false); bildirimYokla();
}
function profilGerek() { D.profilModu = "profil"; return karsilamaCiz(2); }   // oturum var, profil yok
function gezintiBaslat() { D.misafir = true; kok().onclick = kok().onkeydown = null; return gotur({ sayfa: "akis" }, false); }
async function cikisYap() {
  try { await OPB.op.cikisYap(); } catch { /* yok say */ }
  D.ben = null; D.oturum = false; D.donus = null; onbSil(); sheetKapat(); karsilamaCiz(0);
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
  const taslak = { ad: p.ad, handle: p.handle, sehir: p.sehir, bio: p.bio, avatar: p.avatar, renk: p.renk, dil: D.dil, ...(p.fotoVeri && !epostali ? { fotoVeri: p.fotoVeri } : {}), yasOnay: true, kosulOnay: true, kosulSurumu: OPB.KOSUL_SURUMU };
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
    D.ben = { ...v.kullanici, ilgi: v.kullanici.ilgi ?? D.ben?.ilgi }; sakla.koy("op-taslak", null); girisSonrasi();
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
  const m = location.hash.match(/^#g=([a-z0-9-]+)$/), sm = location.hash.match(/^#s=([a-z0-9-]+)$/);
  if (m) G = { sayfa: "detay", kategori: "", handle: null, id: m[1], odak: false };   // paylaşılan bağlantı: girişsiz de açılır
  else if (sm) G = { sayfa: "seri", kategori: "", handle: null, id: sm[1], odak: false };   // gecis-019: paylaşılan yazı serisi bağlantısı
  if (D.oturum && !ben) return profilGerek();
  if (!D.oturum && !m && !sm) return karsilamaCiz(0);
  ciz(true); bildirimYokla();
}

// ---- ayarlar (bulut)
function ayarlarAcBulut() {
  const tm = document.documentElement.dataset.tema || "", giris = !!D.ben;
  const grup = (liste, secili, e, anahtar) => `<div class="grup">${liste.map(([k, a]) => `<button class="dug ${secili === k ? "" : "ikincil"}" data-e="${e}" data-${anahtar}="${k}">${a}</button>`).join("")}</div>`;
  const tit0 = (NATIF && navigator.vibrate ? `<div class="alan"><label>${t("titresim")}</label>${grup([["1", t("otoAcik")], ["0", t("otoKapali")]], sakla.al("op-titresim", true) !== false ? "1" : "0", "titresim", "v")}<p class="gri oto-not">${t("titresimNot")}</p></div>` : "") + `<button class="dug ikincil tam" data-e="ilgi-ac">${t("ilgiBaslik")}</button>`;
  sheet(`<div class="sheet-ust"><h2>${t("ayarlar")}</h2><div class="bosluk"></div><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>
    ${gorunumHtml(grup)}
    <div class="alan"><label>${t("dil")}</label>${grup([["tr", "Türkçe"], ["en", "English"]], D.dil, "dil", "d")}</div>
    <div class="alan"><label>${t("yaziBoyutu")}</label>${grup([["kucuk", t("yaziKucuk")], ["normal", t("yaziNormal")], ["buyuk", t("yaziBuyuk")]], sakla.al("op-yazi", "kucuk"), "yazi", "v")}</div>
    <div class="alan"><label>${t("otoVideo")}</label>${grup([["1", t("otoAcik")], ["0", t("otoKapali")]], otoVideoTercih() ? "1" : "0", "oto-video", "v")}<p class="gri oto-not">${t("otoVideoNot")}</p></div>
    ${giris ? tit0 + `<button class="dug ikincil tam" data-e="kayitlar">${ikon("kayit", 18)} ${t("kayitlar")}</button>
      <button class="dug ikincil tam" data-e="profil-duzenle">${t("duzenle")}</button>
      <button class="dug ikincil tam" data-e="engellenenler">${bt("engellenenler")}</button>`
      : `<button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button>`}
    <p class="yasal-satir"><a href="/yasal/kosullar" target="_blank" rel="noopener">${bt("yasalKosul")}</a> · <a href="/yasal/gizlilik" target="_blank" rel="noopener">${bt("yasalGizlilik")}</a> · <a href="/yasal/cerezler" target="_blank" rel="noopener">${bt("yasalCerez")}</a> · <a href="/yasal/kurallar" target="_blank" rel="noopener">${bt("yasalKurallar")}</a> · <a href="/yasal/destek" target="_blank" rel="noopener">${bt("yasalDestek")}</a></p>
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
    if (a.t === "gonderi") {   // gecis-019: yazı serisi
      g += `<button class="liste-satir" data-e="seri-sec" data-id="${esc(a.id)}"><span class="ad">${esc(t("seriyeEkle"))}</span></button>`;
      if (ogeBul(a.id)?.seri) g += `<button class="liste-satir" data-e="seri-cikar" data-id="${esc(a.id)}"><span class="ad">${esc(t("seridenCikar"))}</span></button>`;
    }
    g += `<button class="liste-satir sil-satir" data-e="sil-sor" data-t="${esc(a.t)}" data-id="${esc(a.id)}"><span class="ad">${esc(t("gonSil"))}</span></button>`;
    sheet(sheetUst(bt("menu")) + g); return;
  }
  if (a.t === "gonderi" && a.k && KATEGORI[a.k]) g += `<button class="liste-satir" data-e="ilgi-az" data-k="${esc(a.k)}"><span class="ad">${esc(t("azGoster"))}</span></button>`;   // X'teki "ilgilenmiyorum": kategoriyi "Gösterme"ye çeker
  if (a.t !== "profil" && BULUT) g += `<button class="liste-satir" data-e="sikayet" data-t="${esc(a.t)}" data-id="${esc(a.id)}"><span class="ad">${bt("sikayetEt")}</span></button>`;
  if (a.ed !== "1" && BULUT) g += a.eng === "1"
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
    etiketOnerKur(ta);
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
  tost(t("silindi")); if (tur === "gonderi") onbSil();
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
  sheet(sheetUst(bt("hesabiSil")) + `<p>${esc(bt("silUyari"))} <a href="/yasal/hesap-sil" target="_blank" rel="noopener">${bt("silAyrinti")}</a></p>
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
const MENU_TANIM = { akis: ["ana", "ana"], kesfet: ["kesfet", "kesfet"], video: ["video", "videolar"], bildirim: ["bildirim", "bildirim"], kayit: ["kayit", "kayitlar"], profil: ["profil", "profil"], ayarlar: ["ayarlar", "ayarlar"] };
const menuOgeleri = (sira) => sira.filter(s => girisli() || s === "akis" || s === "kesfet" || s === "video" || s === "ayarlar");   // misafirde girişsiz çalışmayan öğe yok
function solSecili() {
  if (G.sayfa === "akis") return G.kategori ? "kesfet" : "akis";
  if (G.sayfa === "profil") return !G.handle || G.handle === D.ben?.handle ? "profil" : "";
  if (G.sayfa === "kayit-liste") return "kayit";
  return ["kesfet", "bildirim", "kayit", "video"].includes(G.sayfa) ? G.sayfa : "";
}
const menuDugme = (s, sinif) => {
  const [ik, ad] = MENU_TANIM[s], sec = solSecili() === s, e = s === "ayarlar" ? 'data-e="ayarlar"' : `data-e="git" data-s="${s}"`;
  return `<button class="${sinif} ${sec ? "secili" : ""}" ${e} aria-label="${t(ad)}" ${sec ? 'aria-current="page"' : ""}>${ikon(ik, 26)}<span class="sol-ad">${t(ad)}</span>${s === "bildirim" && D.okunmamis ? '<i class="nokta"></i>' : ""}</button>`;
};
const yasalSatir = () => `<a href="/yasal/kosullar" target="_blank" rel="noopener">${t("kosul")}</a> · <a href="/yasal/gizlilik" target="_blank" rel="noopener">${t("gizlilik")}</a> · <a href="/yasal/cerezler" target="_blank" rel="noopener">${t("cerez")}</a> · <a href="/yasal/kurallar" target="_blank" rel="noopener">${t("kurallar")}</a> · <a href="/yasal/destek" target="_blank" rel="noopener">${t("destek")}</a>`;
function hesapKartHtml() {
  if (!D.ben) return `<div class="sol-misafir"><button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button></div>`;
  return `<div class="hesap-alan"><button class="hesap-kart" data-e="hesap-menu" aria-haspopup="menu" aria-expanded="false" aria-label="${t("hesapMenu")}">${avatarHtml(D.ben, "kucuk")}
      <span class="hesap-bilgi"><b>${esc(D.ben.ad)}</b><span class="gri">@${esc(D.ben.handle)}</span></span><span class="hesap-uc" aria-hidden="true">•••</span></button>
    <div class="hesap-menu" role="menu" hidden><button role="menuitem" data-e="git" data-s="profil">${t("profil")}</button>
      ${BULUT ? `<button role="menuitem" data-e="cikis-yap">${bt("cikisYap")}</button>` : `<button role="menuitem" data-e="profil-duzenle">${t("duzenle")}</button>`}</div></div>`;
}
function solHtml() {
  return `<div class="sol-ic"><div class="sol-ust"><button class="sol-logo" data-e="ust-yenile" aria-label="OP"><img src="icons/op.svg" alt="OP"></button>${betaEtiket()}</div>
    <nav class="sol-menu" aria-label="${t("menu")}">${menuOgeleri(["akis", "kesfet", "video", "bildirim", "kayit", "profil", "ayarlar"]).map(s => menuDugme(s, "sol-oge")).join("")}</nav>
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
  D.veriZ = 0; onbSil();
  setTimeout(() => { D.onerilen = (D.onerilen || []).filter(x => x.handle !== h); onerilenDagit(); }, 900);
}
// mobil yan çekmece (avatara dokununca soldan açılır): hesap kartı + menü + tema kısayolu + yasal bağlantılar
function cekmeceHtml() {
  const k = D.ben, tm = document.documentElement.dataset.tema || "";
  const hesap = k ? `<button class="cek-hesap" data-e="git" data-s="profil">${avatarHtml(k)}<b class="ad">${esc(k.ad)}</b><span class="gri">@${esc(k.handle)}</span>
      <span class="cek-say gri">${typeof k.takipSayisi === "number" ? `<span><b>${k.takipSayisi}</b> ${t("takipSay")}</span> · <span><b>${k.takipci || 0}</b> ${t("takipciSay")}</span>` : ""}</span></button>`
    : `<div class="cek-misafir">${avatarHtml(null)}<button class="dug tam" data-e="giris-ac">${bt("girisYap")}</button><button class="dug ikincil tam" data-e="kayit-ac">${bt("kayitOl")}</button></div>`;
  return `<div class="cek-ust"><span class="cek-baslik">${t("yanMenu")}</span><button class="ust-dug" data-e="sheet-kapat" aria-label="${t("kapat")}">✕</button></div>${hesap}
    <nav class="cek-menu" aria-label="${t("menu")}">${menuOgeleri(["profil", "kayit", "bildirim", "kesfet", "video", "ayarlar"]).map(s => menuDugme(s, "cek-oge")).join("")}
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

// ---------- yazı boyutu (Ayarlar): kök değişken --yz ile ölçeklenir ----------
function yaziUygula() { const v = sakla.al("op-yazi", "kucuk"); if (v === "kucuk" || v === "buyuk") document.documentElement.dataset.yazi = v; else delete document.documentElement.dataset.yazi; }
yaziUygula();

// ---------- fotoğraf: çift dokunma = beğen (yalnız beğenir) · tek dokunma = tam ekran görüntüleyici ----------
function kalpPop(x, y) {
  const k = document.createElement("div"); k.className = "kalp-pop"; k.setAttribute("aria-hidden", "true");
  k.style.left = x + "px"; k.style.top = y + "px"; k.innerHTML = ikon("begen", 72, true); document.body.appendChild(k);
  setTimeout(() => k.remove(), hareketAzalt() ? 350 : 750);
}
function begeniYap(id, x, y) {   // yalnız beğenir (zaten beğenilmişse geri almaz); oturumsuzsa giriş istemi
  if (girisGerekli()) return;
  kalpPop(x, y);
  const o = ogeBul(id); if (o && !o.begendimMi) etkilesim("begen", id);
}
function fotoTikla(img, e) {
  const id = img.closest("[data-oge]")?.dataset.oge, simdi = Date.now(), onceki = img._son;
  if (onceki && simdi - onceki.z < 300 && Math.hypot(e.clientX - onceki.x, e.clientY - onceki.y) < 48) {   // çift dokunma: bekleyen "aç" iptal edilir
    clearTimeout(onceki.t); img._son = null; if (id) begeniYap(id, e.clientX, e.clientY); return;
  }
  img._son = { z: simdi, x: e.clientX, y: e.clientY, t: setTimeout(() => { img._son = null; fotoAc(img, id); }, 250) };   // gecikme yalnız fotoğrafta (~250 ms)
}
function fotoAc(img, id) {
  const o = id ? ogeBul(id) : null, atif = o?.haber && o.gorsel && o.gorsel.sahibi ? lisansSatiri(t("foto"), o.gorsel) : "";
  fotoGoruntule(img.currentSrc || img.src, atif);
}
function fotoKapat() { const g = document.querySelector(".gor-gor"); if (!g) return; g._temizle?.(); g.remove(); document.documentElement.classList.remove("gor-acik"); g._odak?.focus?.({ preventScroll: true }); }
function fotoGoruntule(src, atifHtml) {
  fotoKapat();
  const g = document.createElement("div"); g.className = "gor-gor"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-label", t("foto")); g._odak = document.activeElement;
  g.innerHTML = `<img class="gor-img" src="${esc(src)}" alt="" draggable="false"><button type="button" class="gor-kapat" data-e="foto-kapat" aria-label="${esc(t("kapat"))}">✕</button>${atifHtml ? `<div class="gor-atif">${atifHtml}</div>` : ""}`;
  document.body.appendChild(g); document.documentElement.classList.add("gor-acik");
  const im = g.querySelector(".gor-img"), st = { s: 1, x: 0, y: 0 }; let dy = 0;
  const uygula = (anim) => { im.style.transition = anim && !hareketAzalt() ? "transform .18s ease-out" : "none"; im.style.transform = `translate3d(${st.x}px,${st.y + dy}px,0) scale(${st.s})`; g.style.background = `rgba(0,0,0,${Math.max(.3, .96 - Math.abs(dy) / 500)})`; };
  const sinirla = () => { const r = im.getBoundingClientRect(), tw = (r.width / st.s) * st.s, mx = Math.max(0, (innerWidth * st.s - innerWidth) / 2), my = Math.max(0, (r.height / st.s * st.s - innerHeight) / 2 + 0); st.x = Math.max(-mx, Math.min(mx, st.x)); st.y = st.s <= 1 ? 0 : Math.max(-my - innerHeight * 0.25 * (st.s - 1), Math.min(my + innerHeight * 0.25 * (st.s - 1), st.y)); };
  const yakinlas = (nx, ny) => { if (st.s > 1.05) { st.s = 1; st.x = st.y = 0; } else { st.s = 2; st.x = (innerWidth / 2 - nx) * 1; st.y = (innerHeight / 2 - ny) * 1; sinirla(); } uygula(true); };
  let t0 = null, son = null, hareket = false, p2 = null;
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const ts = e => {
    hareket = false;
    if (e.touches.length === 2) { p2 = { d: dist(e.touches[0], e.touches[1]), s: st.s }; t0 = null; return; }
    const t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY, bx: st.x, by: st.y, z: Date.now(), kenar: NATIF && t.clientX <= 24 };
  };
  const tm = e => {
    if (e.cancelable) e.preventDefault();
    if (e.touches.length === 2 && p2) { st.s = Math.max(1, Math.min(4, p2.s * dist(e.touches[0], e.touches[1]) / p2.d)); hareket = true; sinirla(); uygula(false); return; }
    if (!t0 || e.touches.length !== 1) return;
    const t = e.touches[0], ddx = t.clientX - t0.x, ddy = t.clientY - t0.y;
    if (Math.abs(ddx) + Math.abs(ddy) > 8) hareket = true;
    if (st.s > 1.02) { st.x = t0.bx + ddx; st.y = t0.by + ddy; sinirla(); uygula(false); }
    else if (t0.kenar && ddx > 0) { st.x = ddx * 0.6; uygula(false); }
    else { dy = ddy; uygula(false); }
  };
  const te = e => {
    if (e.touches.length) return;
    if (p2) { p2 = null; if (st.s < 1.05) { st.s = 1; st.x = st.y = 0; uygula(true); } return; }
    const t = t0; t0 = null; if (!t) return;
    if (st.s <= 1.02 && (Math.abs(dy) > 90 || t.kenar && st.x > 60)) { fotoKapat(); return; }
    dy = 0; if (st.s <= 1.02) { st.x = 0; st.y = 0; } uygula(true);
    if (!hareket) {   // dokunma: çift dokunma 1x ↔ 2x
      const x = t.x, y = t.y;
      if (son && Date.now() - son.z < 300 && Math.hypot(son.x - x, son.y - y) < 48) { son = null; yakinlas(x, y); } else son = { z: Date.now(), x, y };
    }
  };
  g.addEventListener("touchstart", ts, { passive: true }); g.addEventListener("touchmove", tm, { passive: false }); g.addEventListener("touchend", te, { passive: true });
  im.addEventListener("dblclick", e => yakinlas(e.clientX, e.clientY));
  g.addEventListener("click", e => { if (e.target === g) fotoKapat(); });   // masaüstü: arka plana tıklayınca kapanır
  const esc_ = e => { if (e.key === "Escape") { e.stopPropagation(); fotoKapat(); } };
  document.addEventListener("keydown", esc_, true); g._temizle = () => document.removeEventListener("keydown", esc_, true);
  g.querySelector(".gor-kapat").focus({ preventScroll: true });
}

// ---------- takip (iyimser) ----------
async function takipDegistir(h) {
  const btnler = [...document.querySelectorAll(`[data-e="takip"][data-h="${h}"]`)], ac = btnler.length ? !btnler[0].classList.contains("ikincil") : true;
  const sayi = G.sayfa === "profil" && G.handle === h ? $(".istatistik span:nth-child(2) b") : null;
  const ayarla = (takipte) => { btnler.forEach(b => { b.classList.toggle("ikincil", takipte); b.textContent = t(takipte ? "takipte" : "takipEt"); }); if (sayi) sayi.textContent = String(Math.max(0, (+sayi.textContent || 0) + (takipte ? 1 : -1))); };
  ayarla(ac); titrestir();
  try { await api(`/api/kullanici/${h}/takip`, {}); D.veriZ = 0; onbSil(); }
  catch (e) { ayarla(!ac); hataGoster(e); }
}

// ---------- ilgi alanları ----------
const ilgiDeger = (k) => { const v = D.ben?.ilgi?.[k]; return v === 0 || v === 2 ? v : 1; };
async function ilgiKaydet(yeni) {   // yeni: { kategori: 0 | 1 | 2 }; iyimser — arayüz hemen değişir, ağ hatasında geri alınır
  if (!D.ben) return false;
  const onceki = D.ben.ilgi || {}, temiz = {};
  for (const [k, v] of Object.entries(yeni)) if (KATEGORI[k] && (v === 0 || v === 2)) temiz[k] = v;
  const yaz = (i) => { D.ben = { ...D.ben, ilgi: i }; if (!BULUT) sakla.koy("op-ben", D.ben); };
  yaz(temiz); onbSil();
  try { await api("/api/ilgi", { ilgi: temiz }); return true; }
  catch { yaz(onceki); tost(t("ilgiHata")); return false; }
}
function ilgiSatirHtml(k, ad, acik, ust = "") {
  const v = ilgiDeger(k), dug = (n, m) => `<button type="button" data-e="ilgi-sec" data-k="${k}" data-v="${n}" aria-pressed="${v === n}">${t(m)}</button>`;
  return `<div class="ilgi-satir ${ust}" role="group" aria-label="${esc(ad)}"><div class="ilgi-ad"><b>${esc(ad)}</b><span>${esc(acik)}</span></div>
    <div class="ilgi-uc">${dug(2, "ilgiDaha")}${dug(1, "ilgiNormal")}${dug(0, "ilgiGosterme")}</div></div>`;
}
function ilgiSheetAc() {
  const satirlar = Object.entries(KATEGORI).map(([k, ad]) => ilgiSatirHtml(k, ad[di()], KAT_ACIKLAMA[k]?.[di()] || "") +
    (ILGI_ALT[k] || []).map(([ak, aad]) => ilgiSatirHtml(k + "." + ak, aad[di()], "", "ilgi-alt")).join("")).join("");
  sheet(sheetUst(t("ilgiBaslik")) + `<p class="gri">${esc(t("ilgiNot"))}</p><div class="ilgi-liste">${satirlar}</div>`);
}
async function ilgiSec(k, v, el) {
  const satir = el.closest(".ilgi-satir");
  satir.querySelectorAll("[data-e='ilgi-sec']").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === v)));
  const ok = await ilgiKaydet({ ...(D.ben?.ilgi || {}), [k]: v });
  if (!ok) satir.querySelectorAll("[data-e='ilgi-sec']").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.v === ilgiDeger(k))));
}
function tostGeriAl(m, fn, etiket = t("geriAl"), ms = 6000) {   // gecis-019: etiket/süre isteğe bağlı ("Kaydedildi · Listeye ekle")
  const e = document.createElement("div"); e.className = "tost"; e.setAttribute("role", "status"); e.append(m);
  const b = document.createElement("button"); b.type = "button"; b.className = "tost-dug"; b.textContent = etiket; b.onclick = () => { e.remove(); fn(); }; e.append(b);
  document.body.appendChild(e); setTimeout(() => e.remove(), ms);
}
async function ilgiAz(k) {   // "Bu konudan daha az göster": kategoriyi "Gösterme"ye çek; akıştaki o konu satırları hemen kalkar; Geri al
  sheetKapat(); if (!KATEGORI[k] || !D.ben) return;
  const onceki = { ...(D.ben.ilgi || {}) };
  if (!(await ilgiKaydet({ ...onceki, [k]: 0 }))) return;
  if (G.sayfa === "akis" && D.sekme === "senin" && !G.kategori) {
    const gizle = D.ogeler.filter(o => o.haber && o.kategori === k);
    gizle.forEach(o => document.querySelectorAll(`[data-oge="${o.id}"]`).forEach(el => el.remove()));
    D.ogeler = D.ogeler.filter(o => !(o.haber && o.kategori === k)); if (D.akis) D.akis.ogeler = D.ogeler;
  }
  tostGeriAl(t("azGosterTamam", KATEGORI[k][di()]), async () => { await ilgiKaydet(onceki); if (G.sayfa === "akis") akisYenile(); });
}
function ilgiIlkKontrol() {   // kayıt sonrası ilk açılış: tek ekranlık "Nelerden hoşlanırsın?" (atlanabilir, hesap başına bir kez)
  const b = D.ben; if (!b || b.editor || b.resmi || D.ilgiSoruldu || document.querySelector(".sheet,.cekmece") || G.sayfa !== "akis") return;
  const sordu = sakla.al("op-ilgi-sordu", []);
  if (!Array.isArray(sordu) || sordu.includes(b.handle) || sordu.includes("*")) return;   // "*" = tüm hesaplar sorulmuş say (testler/kurumsal dağıtım)
  if (Object.keys(b.ilgi || {}).length || Date.now() - Date.parse(b.katilma) > 2 * 86400000) return;   // yalnız yeni üyeler
  D.ilgiSoruldu = true; sakla.koy("op-ilgi-sordu", [...sordu, b.handle].slice(-50));
  sheet(sheetUst(t("ilgiSoru")) + `<p class="gri">${esc(t("ilgiSoruNot"))}</p>
    <div class="ilgi-cip" role="group" aria-label="${esc(t("ilgiSoru"))}">${Object.entries(KATEGORI).map(([k, ad]) => `<button type="button" data-e="ilgi-cip" data-k="${k}" aria-pressed="false" title="${esc(KAT_ACIKLAMA[k]?.[di()] || "")}">${esc(ad[di()])}</button>`).join("")}</div>
    <button class="dug tam" data-e="ilgi-devam">${t("ilgiDevam")}</button><button class="dug ikincil tam" data-e="ilgi-gec">${t("ilgiGec")}</button>`);
}
async function ilgiIlkBitir(kaydet) {
  const secili = kaydet ? [...document.querySelectorAll(".ilgi-cip [data-e='ilgi-cip'][aria-pressed='true']")].map(b => b.dataset.k) : [];
  sheetKapat();
  if (secili.length) { await ilgiKaydet({ ...(D.ben?.ilgi || {}), ...Object.fromEntries(secili.map(k => [k, 2])) }); if (G.sayfa === "akis") akisYenile(); }
}

// ---------- dokunma hareketleri: aşağı çekip yenile · kenardan kaydırarak geri ----------
const hareketAzalt2 = () => !!matchMedia?.("(prefers-reduced-motion: reduce)").matches;
(function dokunmaHareketleri() {
  const ESIK = 70, MAKS = 130, uyku = (ms) => new Promise(r => setTimeout(r, ms));
  let p = null, yenileniyor = false;
  const ptrUygun = (e) => {
    if (yenileniyor || scrollY > 0 || document.querySelector(".sheet,.cekmece")) return false;
    if (!["akis", "kesfet", "video", "profil", "bildirim", "kayit", "kayit-liste", "seri"].includes(G.sayfa)) return false;
    return !e.target.closest?.(".video-ilerleme,.oneri-sirit,textarea,input,select,.duz,.yz");
  };
  const tut = () => { if (!p || !p.aktif) return; p.kare = 0; const d = Math.min(MAKS, p.dy * 0.8); p.el.style.transform = `translate3d(0,${d}px,0)`; p.g.style.opacity = String(Math.min(1, d / 50)); p.g.style.transform = `rotate(${d * 4}deg)`; };
  document.addEventListener("touchstart", e => {
    p = null;
    if (e.touches.length !== 1) return;
    const t0 = e.touches[0];
    if (NATIF && t0.clientX <= 24 && !document.querySelector(".sheet,.cekmece")) {   // sol kenar: geri / çekmece
      const geri = document.querySelector('[data-e="geri"]'), ana = document.querySelector(".alt");
      if (geri || ana) { p = { kenar: true, x: t0.clientX, y: t0.clientY, z: Date.now(), aktif: false, dx: 0, geri: !!geri, el: document.getElementById("uygulama") }; return; }
    }
    if (!ptrUygun(e)) return;
    const el = document.querySelector(".icerik"); if (!el) return;
    p = { x: t0.clientX, y: t0.clientY, aktif: false, dy: 0, el, kare: 0, sinir: false };
  }, { passive: true });
  document.addEventListener("touchmove", e => {
    if (!p || e.touches.length !== 1) return;
    const t0 = e.touches[0], dx = t0.clientX - p.x, dy = t0.clientY - p.y;
    if (p.kenar) {
      if (!p.aktif) { if (dx > 10 && dx > Math.abs(dy) * 1.5) p.aktif = true; else if (Math.abs(dy) > 12 || dx < -6) { p = null; return; } else return; }
      if (e.cancelable) e.preventDefault();
      p.dx = Math.max(0, dx);
      if (p.geri) { p.el.style.willChange = "transform"; p.el.style.transform = `translate3d(${Math.min(p.dx, innerWidth)}px,0,0)`; }
      return;
    }
    if (!p.aktif) {
      if (dy > 8 && dy > Math.abs(dx) * 1.3 && scrollY <= 0) {
        p.aktif = true; const g = document.createElement("div"); g.className = "ptr"; g.setAttribute("aria-hidden", "true"); g.innerHTML = "<i></i>"; p.el.prepend(g); p.g = g; p.el.style.willChange = "transform";
      } else if (Math.abs(dx) > 10 || dy < -4) { p = null; return; } else return;
    }
    if (e.cancelable) e.preventDefault();
    p.dy = Math.max(0, dy);
    if (!p.sinir && p.dy >= ESIK) { p.sinir = true; titrestir(); } else if (p.sinir && p.dy < ESIK) p.sinir = false;
    if (!p.kare) p.kare = requestAnimationFrame(tut);
  }, { passive: false });
  const bitir = async () => {
    const q = p; p = null; if (!q || !q.aktif) return;
    if (q.kenar) {
      const hizli = q.dx > 40 && q.dx / Math.max(1, Date.now() - q.z) > 0.5, tamam = q.dx >= innerWidth * 0.3 || hizli;
      const sn = hareketAzalt2() ? 0 : 0.18, el = q.el;
      el.style.transition = sn ? `transform ${sn}s ease-out` : "none"; el.style.transform = `translate3d(${tamam ? innerWidth : 0}px,0,0)`;
      await uyku(sn * 1000 + 10);
      el.style.transition = ""; el.style.transform = ""; el.style.willChange = "";
      if (tamam) { if (q.geri) document.querySelector('[data-e="geri"]')?.click(); else cekmeceAc(); }
      return;
    }
    cancelAnimationFrame(q.kare);
    const el = q.el, g = q.g, reduced = hareketAzalt2();
    if (q.dy >= ESIK) {
      yenileniyor = true; g.classList.add("donuyor"); g.style.opacity = "1"; g.style.transform = "none";
      if (!reduced) el.style.transition = "transform .15s ease-out"; el.style.transform = "translate3d(0,56px,0)";
      try { await Promise.all([ciz(true, true), uyku(450)]); }
      catch { tost(t("yenilenemedi")); }
      yenileniyor = false;
    }
    if (el.isConnected) { el.style.transition = reduced ? "none" : "transform .2s ease-out"; el.style.transform = ""; setTimeout(() => { el.style.transition = ""; el.style.willChange = ""; g?.remove(); }, reduced ? 0 : 220); }
  };
  document.addEventListener("touchend", bitir, { passive: true });
  document.addEventListener("touchcancel", () => { if (p?.aktif) bitir(); else p = null; }, { passive: true });
  document.addEventListener("touchstart", () => {}, { passive: true });   // iOS: :active durumu hemen çalışsın
})();

// ---------- yerel uygulamada yakınlaşma güvencesi ----------
// Web'de kullanıcı yakınlaştırması açık kalır (erişilebilirlik); otomatik yakınlaşmayı 16 px yazı kuralı önler. Mağaza uygulamasında (NATIF) ölçek kilitlenir.
(function olcekKilidi() {
  if (!NATIF) return;
  const meta = document.querySelector('meta[name="viewport"]'); if (!meta) return;
  const KILIT = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
  const yaz = () => { meta.setAttribute("content", KILIT); };
  yaz();
  const duzelt = () => {   // güvence: yine de yakınlaştıysa meta'yı yeniden yazıp ölçeği 1'e döndür
    const vv = window.visualViewport; if (!vv || vv.scale <= 1.01) return;
    meta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1.0001, user-scalable=yes, viewport-fit=cover");
    setTimeout(yaz, 60);
  };
  document.addEventListener("focusout", () => setTimeout(duzelt, 150), true);
  window.visualViewport?.addEventListener("resize", () => setTimeout(duzelt, 150));
})();

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
  const m = location.hash.match(/^#g=([a-z0-9-]+)$/), sm = location.hash.match(/^#s=([a-z0-9-]+)$/);
  if (m) G = { sayfa: "detay", kategori: "", handle: null, id: m[1], odak: false };
  else if (sm) G = { sayfa: "seri", kategori: "", handle: null, id: sm[1], odak: false };   // gecis-019
  ciz(true); bildirimYokla(); setInterval(bildirimYokla, 20000);
}
if (!NATIF && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});   // mobil pakette SW yok: varlıklar paketin içinde
// mağaza uygulaması köprüsü (mobil/src/mobil.js kullanır): Android geri tuşu + paylaşılan bağlantıyla (#g=<id>) açılış
window.OP_UYG = {
  geri() {   // true = uygulama içinde işlendi; false = en üst düzey (Android: uygulamayı arka plana al)
    if (document.querySelector(".gor-gor")) { fotoKapat(); return true; }
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
  seriAc(id) { if (!/^[a-z0-9-]+$/.test(String(id))) return; gotur({ sayfa: "seri", id }, false); },   // gecis-019
};
basla();
