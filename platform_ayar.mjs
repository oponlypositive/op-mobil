// `npx cap add android|ios` sonrası, üretilen yerel proje dosyalarına OP'ye özgü ayarları yazar (tekrar çalıştırılabilir / idempotent).
// Neden platform klasörleri depoda DEĞİL: Mac'siz sahip için her derlemede Capacitor'un güncel şablonu üretilir; OP'ye özgü değişiklikler tek yerde (bu dosya) ve gözden geçirilebilir.
// Kullanım:  node platform_ayar.mjs android   |   node platform_ayar.mjs ios
// Ortam (CI): OP_VERSION_CODE / OP_VERSION_NAME (Android sürüm), OP_KEYSTORE_FILE + OP_KEYSTORE_PASSWORD + OP_KEY_ALIAS + OP_KEY_PASSWORD (imzalı AAB).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MOBIL = path.dirname(fileURLToPath(import.meta.url));
const hedef = process.argv[2];
const dur = (m) => { console.error("HATA: " + m); process.exit(1); };
const oku = (p) => { if (!fs.existsSync(p)) dur("dosya yok (önce `npx cap add " + hedef + "`): " + p); return fs.readFileSync(p, "utf8"); };
const degistir = (s, ara, yeni, ad) => { if (!s.includes(ara) && !(ara instanceof RegExp && ara.test(s))) dur(`şablon beklenenden farklı (${ad}); Capacitor sürümü değişmiş olabilir`); return s.replace(ara, yeni); };
const SEMA = "org.onlypositive.app", SITE_ALAN = "onlypositive.org";

if (hedef === "android") {
  const A = path.join(MOBIL, "android", "app");
  // 1) AndroidManifest: uygulama bağlantısı (e-posta dönüşü) + paylaşılan gönderi bağlantısı + yedeklemeyi kapat
  const mf = path.join(A, "src", "main", "AndroidManifest.xml");
  let x = oku(mf);
  if (!x.includes('android:scheme="' + SEMA + '"')) {
    x = degistir(x, "</intent-filter>\n\n        </activity>",
      `</intent-filter>

            <!-- e-posta doğrulama / şifre sıfırlama dönüşü: ${SEMA}://giris | ://sifre-yenile -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${SEMA}" />
            </intent-filter>

            <!-- paylaşılan gönderi: https://${SITE_ALAN}/#g=<id> (assetlinks.json doldurulup yayına alınınca doğrulanır; kök yol dışı sayfalar tarayıcıda kalır) -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${SITE_ALAN}" android:path="/" />
            </intent-filter>

        </activity>`, "manifest intent-filter");
  }
  x = x.replace('android:allowBackup="true"', 'android:allowBackup="false"');
  // konum izni (gecis-025, @capacitor/geolocation): yaklaşık konum yeter (Yakınındaki Aktiviteler); konum yalnız cihazda kalır, sunucuya gönderilmez
  if (!x.includes("ACCESS_COARSE_LOCATION")) x = degistir(x, "</manifest>", `    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
</manifest>`, "manifest konum izni");
  fs.writeFileSync(mf, x);

  // 2) build.gradle: sürüm (CI) + imza (CI gizli değerleri; yoksa imzasız)
  const bg = path.join(A, "build.gradle");
  let g = oku(bg);
  if (!g.includes("OP_VERSION_CODE")) {
    g = degistir(g, "versionCode 1", 'versionCode Integer.parseInt(System.getenv("OP_VERSION_CODE") ?: "1")', "versionCode");
    g = degistir(g, 'versionName "1.0"', 'versionName System.getenv("OP_VERSION_NAME") ?: "1.0"', "versionName");
    g = degistir(g, "    buildTypes {", `    signingConfigs {
        release {
            if (System.getenv("OP_KEYSTORE_FILE")) {
                storeFile file(System.getenv("OP_KEYSTORE_FILE"))
                storePassword System.getenv("OP_KEYSTORE_PASSWORD")
                keyAlias System.getenv("OP_KEY_ALIAS")
                keyPassword System.getenv("OP_KEY_PASSWORD")
            }
        }
    }
    buildTypes {`, "buildTypes");
    g = degistir(g, "        release {\n            minifyEnabled false", `        release {
            if (System.getenv("OP_KEYSTORE_FILE")) { signingConfig signingConfigs.release }
            minifyEnabled false`, "release");
    fs.writeFileSync(bg, g);
  }

  // 3) MainActivity: kenardan kenara (Android 15+ zorunlu; Capacitor 8 belgesi insetsHandling!=disable iken önerir)
  const ma = path.join(A, "src", "main", "java", ...SEMA.split("."), "MainActivity.java");
  oku(ma);
  fs.writeFileSync(ma, `package ${SEMA};

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);
    }
}
`);
  console.log("android ayarları tamam");
} else if (hedef === "ios") {
  const I = path.join(MOBIL, "ios", "App");
  // 1) Info.plist
  const ip = path.join(I, "App", "Info.plist");
  let p = oku(ip);
  if (!p.includes("CFBundleURLTypes")) {
    p = degistir(p, "</dict>\n</plist>", `\t<key>CFBundleURLTypes</key>
\t<array>
\t\t<dict>
\t\t\t<key>CFBundleURLName</key>
\t\t\t<string>${SEMA}</string>
\t\t\t<key>CFBundleURLSchemes</key>
\t\t\t<array>
\t\t\t\t<string>${SEMA}</string>
\t\t\t</array>
\t\t</dict>
\t</array>
\t<key>NSCameraUsageDescription</key>
\t<string>Gönderine fotoğraf ya da video eklemek için kamerayı yalnız sen istediğinde kullanırız. / We use the camera only when you choose to take a photo or video for a post.</string>
\t<key>NSMicrophoneUsageDescription</key>
\t<string>Video çekerken sesi kaydetmek için mikrofonu yalnız sen video çektiğinde kullanırız. / We use the microphone only while you record a video for a post.</string>
\t<key>NSPhotoLibraryUsageDescription</key>
\t<string>Gönderine fotoğraf ya da video seçebilmen için galerine erişiriz. / We access your library so you can pick a photo or video for a post.</string>
\t<key>NSPhotoLibraryAddUsageDescription</key>
\t<string>Çektiğin fotoğraf ya da videoyu galerine kaydedebilmen için. / So you can save a photo or video you took to your library.</string>
\t<key>CFBundleLocalizations</key>
\t<array>
\t\t<string>tr</string>
\t\t<string>en</string>
\t</array>
\t<key>ITSAppUsesNonExemptEncryption</key>
\t<false/>
</dict>
</plist>`, "Info.plist sonu");
    // iPhone'a özel: yalnız dikey; armv7 yerine arm64
    p = p.replace(/<key>UISupportedInterfaceOrientations<\/key>\s*<array>[\s\S]*?<\/array>/, "<key>UISupportedInterfaceOrientations</key>\n\t<array>\n\t\t<string>UIInterfaceOrientationPortrait</string>\n\t</array>");
    p = p.replace("<string>armv7</string>", "<string>arm64</string>");
    fs.writeFileSync(ip, p);
  }
  // 1b) konum izni açıklaması (gecis-025; App Store incelemesi bu metni okur): yalnız uygulama açıkken, yalnız cihazda
  p = oku(ip);
  if (!p.includes("NSLocationWhenInUseUsageDescription")) {
    p = degistir(p, "</dict>\n</plist>", `\t<key>NSLocationWhenInUseUsageDescription</key>
\t<string>Yakınındaki aktiviteleri göstermek için; konumun cihazında kalır. / To show activities near you; your location stays on your device.</string>
</dict>
</plist>`, "Info.plist konum");
    fs.writeFileSync(ip, p);
  }
  // 2) yalnız iPhone (iPad ekran görüntüsü/yerleşim yükü yok; iPad'de uyumluluk modunda açılır)
  const pb = path.join(I, "App.xcodeproj", "project.pbxproj");
  let b = oku(pb);
  b = b.replace(/TARGETED_DEVICE_FAMILY = "1,2";/g, "TARGETED_DEVICE_FAMILY = 1;");
  fs.writeFileSync(pb, b);
  console.log("ios ayarları tamam");
} else dur("kullanım: node platform_ayar.mjs android|ios");
