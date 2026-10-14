"""OP mobil web paketi (mobil/www) — tarayıcı denemesi. CANLIYA HİÇBİR İSTEK GİTMEZ: Supabase trafiği test/e2e_bulut.py'deki taklit arka uçla yanıtlanır.
Neyi sınar: platform işareti (ios|android, window.__OP_PLATFORM_TEST ile taklit), beta/SW kapalı, güvenli alan değişkenleri, klavye sınıfı, paylaşım (yerel paylaşım köprüsü + site adresi),
dış bağlantı yakalama, yasal sayfaların pakette açılması, geri tuşu mantığı, derin bağlantı (#g=), e-posta dönüşü (özel şema + PKCE kodu değişimi).
NEYİ SINAMAZ: gerçek Capacitor yerel eklentileri, iOS/Android WebView'ları, çubuk renkleri, gerçek geri tuşu/klavye olayları (cihaz ya da simülatör gerekir).
Çalıştır (kök: kuki-holding): PYTHONUTF8=1 .venv/Scripts/python.exe op/app/mobil/test/mobil_e2e.py   (önce: node op/app/mobil/hazirla.mjs)  -> görüntüler mobil/test/ekran/"""
import json
import re
import uuid
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
APP = HERE.parents[1]
WWW = HERE.parent / "www"
EKRAN = HERE / "ekran"
EKRAN.mkdir(exist_ok=True)
sys.path.insert(0, str(APP / "test"))
import e2e_bulut as eb   # noqa: E402  (Bulut taklidi; import yan etki çalıştırmaz)
import _yenile_ilgi as yi   # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

PORT = 5291
URL = f"http://localhost:{PORT}"
adimlar, hatalar = [], []


def adim(ad, ok=True, ayrinti=""):
    adimlar.append((ad, bool(ok), ayrinti))
    print(("✔ " if ok else "✘ ") + ad + (f" — {ayrinti}" if ayrinti else ""))


def senaryo(tarayici, cihaz, ad, platform):
    b = tarayici.new_context(**cihaz, locale="tr-TR", service_workers="block")
    b.add_init_script("localStorage.setItem('op-ilgi-sordu', '[\"*\"]');" f"window.__OP_PLATFORM_TEST = '{platform}';"
                      "Object.defineProperty(navigator, 'share', {value: (d) => { window.__paylasilan = d; return Promise.resolve(); }, configurable: true});")
    bulut = eb.Bulut()
    # gecis-012/014: bağlantılı (YouTube kartlı) gönderi + düz bağlantılı gönderi + anket
    yt_id = "5LLrL9EHwg0"
    bulut.postlar.append({"id": str(uuid.uuid4()), "yazar": bulut.mehmet, "metin": "Bak bu videoya https://youtu.be/" + yt_id, "foto": None, "z": eb.simdi(0), "haber": False,
                          "baglanti": {"url": "https://youtu.be/" + yt_id, "site": "YouTube", "baslik": "Sakin bir sahil videosu", "aciklama": "Güzel Kanal", "gorsel": f"https://i.ytimg.com/vi/{yt_id}/hqdefault.jpg", "tur": "youtube", "yt_id": yt_id}})
    bulut.postlar.append({"id": str(uuid.uuid4()), "yazar": bulut.mehmet, "metin": "Güzel yazı: https://ornek-site.com/yazi?utm_source=x", "foto": None, "z": eb.simdi(0), "haber": False})
    bulut.postlar.append({"id": str(uuid.uuid4()), "yazar": bulut.mehmet, "metin": "Hangisi daha güzel?", "foto": None, "z": eb.simdi(0), "haber": False,
                          "anket": {"secenekler": [{"id": 1, "metin": "Deniz"}, {"id": 2, "metin": "Dağ"}], "bitis": eb.simdi(-1440), "oylar": {}}})
    b.route(re.compile(r"^https://yixyvsspetwjatixfaki\.supabase\.co/.*"), bulut.yonlendir)
    sayfa_istekleri = []
    s = b.new_page()
    s.on("pageerror", lambda e: hatalar.append(f"[{ad}] {e}"))
    s.on("console", lambda m: m.type == "error" and "favicon" not in m.text and "Failed to load resource" not in m.text and hatalar.append(f"[{ad}] konsol: {m.text}"))
    s.on("request", lambda r: sayfa_istekleri.append(r.url))
    # PKCE kod değişimi taklidi (taklit arka uç yalnız parola girişini bilir)
    def pkce(route):
        k = bulut.kullanicilar["deneme@example.com"]
        bulut.cagrilar.append(("auth", "pkce", {}))
        bulut.cevap(route, 200, bulut.oturum_json(k["id"], "deneme@example.com"))
    b.route(re.compile(r".*/auth/v1/token\?grant_type=pkce.*"), pkce)

    def foto(isim):
        s.wait_for_timeout(250); s.screenshot(path=str(EKRAN / f"mobil-{ad}-{isim}.png"))

    taşma = lambda: s.evaluate("() => document.documentElement.scrollWidth - innerWidth")  # noqa: E731

    # ===== 1. açılış =====
    s.goto(URL); s.wait_for_selector(".karsila")
    adim(f"{ad}: OP_YAPI.platform = {platform}", s.evaluate("() => OP_YAPI.platform") == platform)
    adim(f"{ad}: html sınıfları mobil + mobil-{platform}", s.evaluate(f"() => document.documentElement.classList.contains('mobil') && document.documentElement.classList.contains('mobil-{platform}')"))
    adim(f"{ad}: mağaza sürümünde BETA etiketi/şeridi yok", s.locator(".beta-et, .beta-serit").count() == 0)
    adim(f"{ad}: service worker kaydı yok (paket içi varlıklar)", s.evaluate("async () => (await navigator.serviceWorker.getRegistrations()).length") == 0)
    adim(f"{ad}: yatay taşma yok (karşılama)", taşma() <= 0, f"{taşma()}px"); foto("01-karsilama")
    s.add_style_tag(content=":root{--ust:47px;--alt:34px}")   # cihazdaki çentik/ana çubuk değerlerini taklit (env() masaüstünde 0)
    pt = s.evaluate("() => parseFloat(getComputedStyle(document.querySelector('.karsila')).paddingTop)")
    adim(f"{ad}: güvenli alan: karşılama üst boşluğu --ust (47) + 36 = 83px", abs(pt - 83) < 0.6, f"{pt}px")
    adim(f"{ad}: viewport-fit=cover", "viewport-fit=cover" in s.locator("meta[name=viewport]").get_attribute("content"))
    vm = s.locator("meta[name=viewport]").get_attribute("content")
    adim(f"{ad}: NATIF'te viewport ölçeği kilitli (maximum-scale=1, user-scalable=no)", "maximum-scale=1" in vm and "user-scalable=no" in vm, vm)

    # ===== 2. yasal sayfa paket içinde =====
    s.click("[data-k='1']"); s.wait_for_selector(".manifesto"); s.click("[data-k='2']"); s.wait_for_selector("#p-eposta")
    hr = s.locator("label.onay a").first.get_attribute("href")
    with s.expect_navigation():
        s.locator("label.onay a").first.click()
    adim(f"{ad}: yasal bağlantı ({hr}) uygulamada .html olarak açılır", s.url == URL + "/yasal/kosullar.html" and "Kullanım Koşulları" in s.locator("h1:visible").first.inner_text(), s.url)
    adim(f"{ad}: yasal sayfa 'OP' geri bağlantısı index.html'e gider", s.locator("a.geri").get_attribute("href") == "/index.html")
    adim(f"{ad}: yasal sayfa bağlantıları .html'li (iç gezinti)", all(h.endswith(".html") for h in s.locator(".ust-gezin a").evaluate_all("els => els.map(e => e.getAttribute('href'))")))
    s.screenshot(path=str(EKRAN / f"mobil-{ad}-02-yasal.png"))
    # güvenli alan taklidi (iPhone 14 Pro: üst 59 px): Geri düğmesi güvenli alanın ALTINDA, ≥44x44, yapışkan; tıklanınca uygulamaya döner
    s.add_style_tag(content=":root{--ust:59px}")
    gk = s.locator("a.geri").bounding_box()
    adim(f"{ad}: yasal sayfa 'Geri' düğmesi güvenli alanın altında (y ≥ 59) ve ≥ 44x44", gk["y"] >= 59 and gk["width"] >= 44 and gk["height"] >= 44, str(gk))
    s.evaluate("() => scrollTo(0, 600)"); s.wait_for_timeout(150)
    gk2 = s.locator("a.geri").bounding_box()
    adim(f"{ad}: Geri düğmesi yapışkan (kaydırınca da görünür, güvenli alanın altında)", gk2["y"] >= 59 and gk2["y"] < 200, str(gk2))
    s.locator("a.geri").click(); s.wait_for_selector("#uygulama > *", timeout=8000); s.wait_for_timeout(500)
    adim(f"{ad}: Geri'ye basınca yasal sayfadan uygulamaya dönülür", "/yasal/" not in s.url and s.locator("#uygulama").count() == 1, s.url)

    # ===== 3. e-posta dönüşü: şifre sıfırlama (özel şema + PKCE) =====
    bulut.kullanicilar["deneme@example.com"] = {"id": "55555555-5555-4555-8555-555555555555", "sifre": "gizli-sifre-123", "onayli": True}
    s.goto(URL); s.wait_for_selector(".karsila"); s.click("[data-k='giris']"); s.wait_for_selector("#g-eposta")
    s.fill("#g-eposta", "deneme@example.com"); s.click("[data-k='sifremi-unuttum']"); s.wait_for_selector("[data-k]:has-text('Bağlantı gönder'), button.dug")
    s.fill("input[type=email]", "deneme@example.com")
    with s.expect_request(re.compile(r".*/auth/v1/recover.*")) as ri:
        s.locator("button.dug", has_text="Bağlantı gönder").click()
    rd = re.search(r"redirect_to=([^&]+)", ri.value.url)
    from urllib.parse import unquote
    adim(f"{ad}: şifre sıfırlama isteği uygulamanın özel adresine döner", rd and unquote(rd.group(1)) == "org.onlypositive.app://sifre-yenile", unquote(rd.group(1)) if rd else ri.value.url)
    s.evaluate("() => OP_MOBIL.baglantiIsle('org.onlypositive.app://sifre-yenile?code=ornek-kod-123')")
    s.wait_for_function("() => document.body.innerText.includes('Yeni şifre')", timeout=8000)
    adim(f"{ad}: dönüş bağlantısı → PKCE kodu uygulamada değişti → 'Yeni şifre' ekranı", bulut.sayac("auth", "pkce") == 1 and s.locator("input[type=password]").count() >= 1)
    foto("03-sifre-yenile")

    # ===== 4. kayıt (e-posta bağlantısı özel adrese döner) + giriş =====
    s.evaluate("() => localStorage.clear()")   # 3. bölümde PKCE oturumu açıldı: temiz başla
    s.goto(URL); s.wait_for_selector(".karsila")
    s.click("[data-k='1']"); s.wait_for_selector(".manifesto"); s.click("[data-k='2']"); s.wait_for_selector("#p-eposta")
    bulut.kullanicilar.pop("deneme@example.com", None)
    s.fill("#p-eposta", "deneme@example.com"); s.fill("#p-sifre", "gizli-sifre-123"); s.fill("#p-ad", "Deneme Kişi"); s.fill("#p-handle", f"deneme_{ad}"); s.select_option("#p-sehir", "İstanbul")
    s.check("#p-yas"); s.check("#p-kosul")
    with s.expect_request(re.compile(r".*/auth/v1/signup.*")) as rs:
        s.click("[data-k='bitir']")
    rd = re.search(r"redirect_to=([^&]+)", rs.value.url)
    adim(f"{ad}: kayıt doğrulama e-postası uygulamanın özel adresine döner", rd and unquote(rd.group(1)) == "org.onlypositive.app://giris", unquote(rd.group(1)) if rd else rs.value.url)
    s.wait_for_selector("[data-k='tekrar']")
    bulut.kullanicilar["deneme@example.com"]["onayli"] = True
    s.click("[data-k='giris']"); s.wait_for_selector("#g-eposta"); s.fill("#g-sifre", "gizli-sifre-123"); s.click("[data-k='giris-gonder']")
    s.wait_for_selector(".satir", timeout=8000); s.wait_for_timeout(400)
    adim(f"{ad}: giriş sonrası akış açık, BETA şeridi yok", s.locator(".satir").count() >= 3 and s.locator(".beta-serit").count() == 0)
    s.add_style_tag(content=":root{--ust:47px;--alt:34px}")
    adim(f"{ad}: yatay taşma yok (akış)", taşma() <= 0, f"{taşma()}px"); foto("04-akis")

    # ===== 5. alt menü + güvenli alan + klavye =====
    alt = s.locator(".alt")
    adim(f"{ad}: alt menü görünür; alt boşluk --alt (34px)", alt.is_visible() and abs(s.evaluate("() => parseFloat(getComputedStyle(document.querySelector('.alt')).paddingBottom)") - 34) < 0.6)
    ust = s.evaluate("() => parseFloat(getComputedStyle(document.querySelector('.ust')).paddingTop)")
    adim(f"{ad}: üst çubuk üst boşluğu --ust (47px)", abs(ust - 47) < 0.6, f"{ust}px")
    s.evaluate("() => document.documentElement.classList.add('klavye')")
    adim(f"{ad}: klavye açık (html.klavye) → alt menü + yüzen düğme gizli", not alt.is_visible() and not s.locator(".fab").is_visible())
    s.evaluate("() => document.documentElement.classList.remove('klavye')")
    adim(f"{ad}: klavye kapanınca alt menü geri gelir", alt.is_visible())

    # ===== 5b. bağlantı kartı + anket (gecis-012/014) =====
    s.evaluate("() => { OP_MOBIL.sonDisBaglanti = ''; }")
    yk = s.locator(".bag-kart[data-e='yt-oynat']").first
    adim(f"{ad}: YouTube kartı akışta (kapak i.ytimg.com, oynat düğmesi)", yk.count() == 1 and yk.locator("img").get_attribute("src").startswith("https://i.ytimg.com/vi/"))
    yk.click(); s.wait_for_timeout(300)
    son = s.evaluate("() => OP_MOBIL.sonDisBaglanti || ''")
    adim(f"{ad}: NATİF'te YouTube kartına dokununca gömme DENENMEZ (iframe yok), YouTube bağlantısı sistem/uygulama içi tarayıcıda açılır",
         s.locator(".bag-kart iframe").count() == 0 and "youtube.com/watch?v=" + "5LLrL9EHwg0" in son, son)
    s.evaluate("() => { OP_MOBIL.sonDisBaglanti = ''; }")
    bag = s.locator("a.bag[href^='https://ornek-site.com']").first
    adim(f"{ad}: gönderideki bağlantı tıklanabilir, izleme parametresi atılmış, rel noopener noreferrer nofollow", bag.count() == 1 and "utm_" not in bag.get_attribute("href") and bag.get_attribute("rel") == "noopener noreferrer nofollow")
    bag.click(); s.wait_for_timeout(300)
    adim(f"{ad}: bağlantı uygulama içi tarayıcıya yönlendirilir (sayfa değişmez)", s.evaluate("() => OP_MOBIL.sonDisBaglanti || ''").startswith("https://ornek-site.com/yazi"))
    ank = s.locator(".satir", has_text="Hangisi daha güzel?").locator(".anket")
    adim(f"{ad}: anket — oy vermeden yüzde yok, yuvarlak seçenekler", ank.locator("button.anket-sec").count() == 2 and "%" not in ank.inner_text())
    ank.locator("button.anket-sec").first.click(); s.wait_for_timeout(600)
    ank = s.locator(".satir", has_text="Hangisi daha güzel?").locator(".anket")
    adim(f"{ad}: oy → yüzde çubukları (%100) ve '1 oy'", ank.locator(".anket-bar").count() == 2 and "%100" in ank.inner_text() and "1 oy" in ank.inner_text(), ank.inner_text().replace(chr(10), " | "))
    foto("05b-baglanti-anket")

    # ===== 6. paylaş menüsü: yerel paylaşım + site adresi + dış bağlantı =====
    s.locator(".satir").filter(has_text="komşuma").locator("[data-e='paylas']").click(); s.wait_for_selector(".paylas-izgara")
    foto("05-paylas-menu")
    # WhatsApp (iPhone'da api.whatsapp.com/WA Business sorusu çıkmasın): ÖNCE kişisel WhatsApp şeması whatsapp://send, açılmazsa (uygulama arka plana geçmezse) sistem paylaşım sayfası
    s.evaluate("() => { window.__wa = null; window.__paylasilan = null; document.addEventListener('click', (e) => { const a = e.target.closest('a[href^=\"whatsapp:\"]'); if (a) { window.__wa = a.href; e.preventDefault(); } }, true); }")
    hedef0 = s.url
    adim(f"{ad}: paylaş menüsünde 'Diğer…' (sistem paylaşım sayfası) seçeneği var", s.locator("[data-e='paylas-diger'] >> text=Diğer…").count() == 1)
    adim(f"{ad}: WhatsApp artık wa.me/api.whatsapp.com bağlantısı değil, düğme", s.locator("a.p-oge[href*='wa.me']").count() == 0 and s.locator("[data-e='paylas-wa']").count() == 1)
    s.click("[data-e='paylas-wa']"); s.wait_for_timeout(250)
    wa_url = s.evaluate("() => window.__wa || ''")
    adim(f"{ad}: WhatsApp → önce whatsapp://send?text= şeması denenir (metin + site bağlantısı), sayfa değişmedi", wa_url.startswith("whatsapp://send?text=") and "komşuma" in unquote(wa_url) and "https://onlypositive.org/#g=" in unquote(wa_url) and s.url == hedef0, unquote(wa_url)[:100])
    adim(f"{ad}: paylaşım menüsü kapandı", s.locator(".sheet").count() == 0)
    s.wait_for_timeout(1700)
    pl0 = s.evaluate("() => window.__paylasilan || null")
    adim(f"{ad}: şema açılamadı (uygulama arka plana geçmedi) → sistem paylaşım sayfasına düşer", pl0 and pl0["title"] == "OP" and pl0["url"].startswith("https://onlypositive.org/#g="), str(pl0)[:100])
    s.evaluate("() => { window.__wa = null; window.__paylasilan = null; }")
    s.locator(".satir").filter(has_text="komşuma").locator("[data-e='paylas']").click(); s.wait_for_selector(".paylas-izgara")
    s.click("[data-e='paylas-wa']"); s.wait_for_timeout(300)
    s.evaluate("() => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }")   # WhatsApp açıldı: uygulama arka plana geçti
    s.wait_for_timeout(1800)
    s.evaluate("() => { delete document.hidden; }")
    adim(f"{ad}: şema açıldı (uygulama arka plana geçti) → sistem paylaşım sayfası AÇILMAZ", s.evaluate("() => window.__paylasilan || null") is None and s.evaluate("() => !!window.__wa"))
    son = wa_url
    adim(f"{ad}: paylaşım bağlantısı siteye göre (https://onlypositive.org/#g=…), capacitor/localhost değil", "https://onlypositive.org/#g=" in unquote(son), unquote(son)[:120])
    s.locator(".satir").filter(has_text="komşuma").locator("[data-e='paylas']").click(); s.wait_for_selector(".paylas-izgara")
    s.click("[data-e='paylas-diger']"); s.wait_for_timeout(300)
    pl = s.evaluate("() => window.__paylasilan || null")
    adim(f"{ad}: 'Şununla paylaş' yerel paylaşım köprüsünü çağırır (başlık OP, site bağlantısı)", pl and pl["title"] == "OP" and pl["url"].startswith("https://onlypositive.org/#g=") and "komşuma" in pl["text"], json.dumps(pl, ensure_ascii=False)[:140] if pl else "yok")
    adim(f"{ad}: paylaşım sayfası kapandı", s.locator(".sheet").count() == 0)

    # ===== 7. geri tuşu mantığı + derin bağlantı =====
    s.locator(".satir").filter(has_text="komşuma").locator("[data-e='paylas']").click(); s.wait_for_selector(".paylas-izgara")
    adim(f"{ad}: geri(): açık pencere varsa kapatır (true)", s.evaluate("() => OP_UYG.geri()") is True and s.locator(".sheet").count() == 0)
    s.locator(".satir").filter(has_text="komşuma").locator(".metin").click(); s.wait_for_selector(".detay-gon")
    adim(f"{ad}: geri(): gönderi detayında akışa döner (true)", s.evaluate("() => OP_UYG.geri()") is True)
    s.wait_for_selector(".satir"); s.wait_for_timeout(300)
    adim(f"{ad}: geri(): akışta (en üst) false → Android uygulamayı arka plana alır", s.evaluate("() => OP_UYG.geri()") is False)
    s.evaluate("() => OP_MOBIL.baglantiIsle('https://onlypositive.org/#g=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3')")
    s.wait_for_selector(".detay-gon")
    adim(f"{ad}: paylaşılan bağlantı (derin bağlantı) gönderiyi açar", "Sabah yürüyüşünde" in s.inner_text("#uygulama"))
    foto("06-derin-baglanti")

    # ===== 7b. ARAMA (gecis-023): Keşfet = büyüteç + "Ara ve Keşfet"; Enter ile arama; #etiket; son aramalar yalnız cihazda =====
    s.evaluate("() => OP_UYG.geri()"); s.wait_for_selector(".alt", timeout=6000)   # detaydan akışa (alt menü görünsün)
    s.click(".alt [data-s='kesfet']"); s.wait_for_selector(".ara-form", timeout=8000); s.wait_for_timeout(400)
    adim(f"{ad}: Keşfet sekmesi büyüteç simgeli, sayfa 'Ara ve Keşfet' + arama kutusu 'OP'de ara'", s.locator(".alt [data-s='kesfet'] svg circle").count() == 1 and s.locator(".ara-girdi").get_attribute("placeholder") == "OP'de ara" and "Ara ve Keşfet" in s.locator("h1.baslik").first.inner_text())
    s.fill(".ara-girdi", "KOMŞUMA"); s.press(".ara-girdi", "Enter"); s.wait_for_selector(".ara-sekmeler", timeout=8000); s.wait_for_selector(".ara-sonuc .satir", timeout=8000)
    adim(f"{ad}: arama sonuçları 4 sekme + katlamalı eşleşme (KOMŞUMA → komşuma)", s.locator(".ara-sekme").count() == 4 and "komşuma" in s.locator(".ara-sonuc").inner_text().lower())
    foto("07b-arama-sonuc")
    s.click(".alt [data-s='kesfet']"); s.wait_for_selector(".ara-son-satir", timeout=6000)
    adim(f"{ad}: son aramalar bu cihazda (localStorage) listelenir", s.evaluate("() => JSON.parse(localStorage.getItem('op-aramalar') || '[]')[0]") == "KOMŞUMA" and s.locator(".ara-son-satir").count() == 1)
    s.click(".alt [data-s='akis']"); s.wait_for_selector(".satir", timeout=8000); s.wait_for_timeout(300)
    s.evaluate("() => OP_MOBIL.baglantiIsle('https://onlypositive.org/#g=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3')"); s.wait_for_selector(".detay-gon")   # sonraki bölüm detay sayfasında başlar

    # ===== 8. kenardan kaydırarak geri (yalnız NATIF) + yazı alanları ≥16 px =====
    if yi.dokun_hazir(s):
        w = s.evaluate("() => innerWidth")
        s.evaluate("([w]) => { __dokun('touchstart', 6, 400); for (let i = 1; i <= 8; i++) __dokun('touchmove', 6 + i * (w * 0.45) / 8, 404); __dokun('touchend', 6 + w * 0.45, 404); }", [w])
        s.wait_for_selector(".sekmeler", timeout=5000); s.wait_for_timeout(300)
        adim(f"{ad}: detayda sol kenardan sağa kaydırma (>%30) geri götürür; sayfa kayma dönüşümü temizlenir", s.locator(".detay-gon").count() == 0 and s.evaluate("() => document.getElementById('uygulama').style.transform === ''"))
        s.evaluate("() => { __dokun('touchstart', 6, 400); for (let i = 1; i <= 4; i++) __dokun('touchmove', 6 + i * 8, 402); __dokun('touchend', 40, 402); }")
        s.wait_for_timeout(400)
        adim(f"{ad}: kısa kenar kaydırması (eşik altı) geri götürmez/çekmece açmaz", s.locator(".cekmece").count() == 0)
        s.evaluate("([w]) => { __dokun('touchstart', 6, 400); for (let i = 1; i <= 8; i++) __dokun('touchmove', 6 + i * (w * 0.45) / 8, 404); __dokun('touchend', 6 + w * 0.45, 404); }", [w])
        s.wait_for_selector(".cekmece", timeout=4000)
        adim(f"{ad}: ana sekmede sol kenar kaydırması yan çekmeceyi açar (X gibi)", s.locator(".cekmece").count() == 1)
        s.keyboard.press("Escape"); s.wait_for_timeout(300)
    yazi = s.evaluate("() => [...document.querySelectorAll('input,textarea,select')].filter(e => !['checkbox','radio','file','hidden'].includes(e.type)).map(e => parseFloat(getComputedStyle(e).fontSize))")
    adim(f"{ad}: akıştaki tüm yazı alanları ≥ 16 px", all(f >= 16 for f in yazi), str(yazi))
    s.click(".yz-kisa") if s.locator(".yz-kisa").count() else None
    s.wait_for_timeout(300)
    yazi2 = s.evaluate("() => [...document.querySelectorAll('input,textarea,select')].filter(e => !['checkbox','radio','file','hidden'].includes(e.type)).map(e => parseFloat(getComputedStyle(e).fontSize))")
    adim(f"{ad}: yazma penceresi (composer) yazı alanları ≥ 16 px", yazi2 and all(f >= 16 for f in yazi2), str(yazi2))
    s.keyboard.press("Escape"); s.wait_for_timeout(200)
    kopya = s.evaluate("() => visualViewport.scale")
    adim(f"{ad}: sayfa ölçeği 1", kopya == 1, str(kopya))
    adim(f"{ad}: Supabase dışına/izinsiz çağrı yok", not bulut.izinsiz, str(bulut.izinsiz))
    b.close()


def main():
    if not (WWW / "index.html").exists():
        sys.exit("önce: node op/app/mobil/hazirla.mjs")
    sunucu = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT), "--bind", "127.0.0.1", "--directory", str(WWW)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                urllib.request.urlopen(URL + "/index.html", timeout=1); break
            except Exception:
                time.sleep(0.2)
        with sync_playwright() as p:
            try:
                t = p.chromium.launch(channel="chrome", headless=True)
            except Exception:
                t = p.chromium.launch(channel="msedge", headless=True)
            for ad, cihaz_adi, platform in [("iphone", "iPhone 14 Pro Max", "ios"), ("android", "Pixel 7", "android")]:
                cihaz = {**p.devices[cihaz_adi]}; cihaz.pop("default_browser_type", None)
                senaryo(t, cihaz, ad, platform)
            t.close()
    finally:
        sunucu.terminate()
    print("\nJS HATALARI:", *(hatalar or ["yok"]), sep="\n  ")
    basarisiz = [a for a in adimlar if not a[1]]
    print(f"\n{len(adimlar) - len(basarisiz)}/{len(adimlar)} adım geçti")
    sys.exit(1 if basarisiz or hatalar else 0)


if __name__ == "__main__":
    main()
