"""OP mobil web paketi (mobil/www) — tarayıcı denemesi. CANLIYA HİÇBİR İSTEK GİTMEZ: Supabase trafiği test/e2e_bulut.py'deki taklit arka uçla yanıtlanır.
Neyi sınar: platform işareti (ios|android, window.__OP_PLATFORM_TEST ile taklit), beta/SW kapalı, güvenli alan değişkenleri, klavye sınıfı, paylaşım (yerel paylaşım köprüsü + site adresi),
dış bağlantı yakalama, yasal sayfaların pakette açılması, geri tuşu mantığı, derin bağlantı (#g=), e-posta dönüşü (özel şema + PKCE kodu değişimi).
NEYİ SINAMAZ: gerçek Capacitor yerel eklentileri, iOS/Android WebView'ları, çubuk renkleri, gerçek geri tuşu/klavye olayları (cihaz ya da simülatör gerekir).
Çalıştır (kök: kuki-holding): PYTHONUTF8=1 .venv/Scripts/python.exe op/app/mobil/test/mobil_e2e.py   (önce: node op/app/mobil/hazirla.mjs)  -> görüntüler mobil/test/ekran/"""
import json
import re
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
from playwright.sync_api import sync_playwright  # noqa: E402

PORT = 5291
URL = f"http://localhost:{PORT}"
adimlar, hatalar = [], []


def adim(ad, ok=True, ayrinti=""):
    adimlar.append((ad, bool(ok), ayrinti))
    print(("✔ " if ok else "✘ ") + ad + (f" — {ayrinti}" if ayrinti else ""))


def senaryo(tarayici, cihaz, ad, platform):
    b = tarayici.new_context(**cihaz, locale="tr-TR", service_workers="block")
    b.add_init_script(f"window.__OP_PLATFORM_TEST = '{platform}';"
                      "Object.defineProperty(navigator, 'share', {value: (d) => { window.__paylasilan = d; return Promise.resolve(); }, configurable: true});")
    bulut = eb.Bulut()
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

    # ===== 2. yasal sayfa paket içinde =====
    s.click("[data-k='1']"); s.wait_for_selector(".manifesto"); s.click("[data-k='2']"); s.wait_for_selector("#p-eposta")
    hr = s.locator("label.onay a").first.get_attribute("href")
    with s.expect_navigation():
        s.locator("label.onay a").first.click()
    adim(f"{ad}: yasal bağlantı ({hr}) uygulamada .html olarak açılır", s.url == URL + "/yasal/kosullar.html" and "Kullanım Koşulları" in s.locator("h1:visible").first.inner_text(), s.url)
    adim(f"{ad}: yasal sayfa 'OP' geri bağlantısı index.html'e gider", s.locator("a.geri").get_attribute("href") == "/index.html")
    adim(f"{ad}: yasal sayfa bağlantıları .html'li (iç gezinti)", all(h.endswith(".html") for h in s.locator(".ust-gezin a").evaluate_all("els => els.map(e => e.getAttribute('href'))")))
    s.screenshot(path=str(EKRAN / f"mobil-{ad}-02-yasal.png"))

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

    # ===== 6. paylaş menüsü: yerel paylaşım + site adresi + dış bağlantı =====
    s.locator(".satir").filter(has_text="komşuma").locator("[data-e='paylas']").click(); s.wait_for_selector(".paylas-izgara")
    foto("05-paylas-menu")
    wa = s.locator("a.p-oge[href^='https://wa.me']")
    hedef0 = s.url
    wa.click(); s.wait_for_timeout(300)
    son = s.evaluate("() => OP_MOBIL.sonDisBaglanti || ''")
    adim(f"{ad}: WhatsApp bağlantısı uygulama içi tarayıcıya yönlendirildi (sayfa değişmedi)", son.startswith("https://wa.me/") and s.url == hedef0, son[:60])
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
