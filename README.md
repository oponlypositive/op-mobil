# OP – Only Positive · mobil (Capacitor)

PWA'yı iOS/Android mağaza uygulamasına saran proje. Paket kimliği `org.onlypositive.app`. Web paketi `www/` içinde gömülüdür (uzak site yüklenmez).

## Akış
1. (Ana depoda, yalnız web kodu değişince) `node op/app/mobil/hazirla.mjs` → `www/` yenilenir (OP_SITE, OP_MOBIL_BETA=1 ortam değişkenleri isteğe bağlı). Bu klasörü ayrı depoya kopyalarken `www/` dahil olmalı.
2. Bulut: `.github/workflows/android.yml` ve `ios.yml` her gönderimde `npx cap add <platform>` + `platform_ayar.mjs` (OP'ye özgü ayarlar) + `capacitor-assets` (simgeler) + `cap sync` + derleme yapar. `android/` ve `ios/` depoda TUTULMAZ (her derlemede güncel şablondan üretilir; özel ayarlar `platform_ayar.mjs`'te).
3. Simgeler: `node ikon_uret.mjs` → `assets/` (kaynak `../public/icons/op.svg`).
4. Deneme (ana depoda): `.venv/Scripts/python.exe op/app/mobil/test/mobil_e2e.py` (taklit arka uç, canlıya istek yok).

## GitHub Actions gizli değerleri (Settings → Secrets and variables → Actions)
Hepsi isteğe bağlıdır: yoksa yalnız imzasız derleme çalışır.

| Ad | Ne | Nereden |
|---|---|---|
| APPLE_TEAM_ID | 10 karakterli takım kimliği | developer.apple.com → Account → Membership details |
| APPSTORE_KEY_ID | API anahtar kimliği | App Store Connect → Users and Access → Integrations → App Store Connect API (rol Admin) |
| APPSTORE_ISSUER_ID | Issuer ID | aynı sayfanın üstü |
| APPSTORE_KEY_P8 | .p8 dosyasının TÜM metni (BEGIN/END satırları dahil) | aynı sayfada anahtar oluşturulurken bir kez indirilir |
| ANDROID_KEYSTORE_B64 | yükleme anahtarı dosyasının base64'ü | aşağıdaki komutlar |
| ANDROID_KEYSTORE_PASSWORD | keystore şifresi | kendin belirlersin |
| ANDROID_KEY_ALIAS | anahtar takma adı (örn. op-yukleme) | kendin belirlersin |
| ANDROID_KEY_PASSWORD | anahtar şifresi | kendin belirlersin |

Android yükleme anahtarı (Play hesabı açılınca; JDK gerekir — geçici kurulum ya da başka bir bilgisayar):
`keytool -genkeypair -v -keystore op-yukleme.keystore -alias op-yukleme -keyalg RSA -keysize 2048 -validity 10000`
base64 (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("op-yukleme.keystore"))`
Anahtarı ve şifreleri güvenli yerde yedekle; depoya KOYMA.

## Dönüş bağlantıları ve sunucu ayarları
- E-posta doğrulama / şifre sıfırlama: `org.onlypositive.app://giris` ve `://sifre-yenile`. Supabase → Authentication → URL Configuration → Redirect URLs'e `org.onlypositive.app://**` eklenmeli. PKCE kodu uygulama içinde oturuma çevrilir.
- Edge Function CORS: `IZINLI_ORIGINLER` = `https://onlypositive.org,https://<proje>.pages.dev,capacitor://localhost,https://localhost` (site ilk sırada kalsın).
