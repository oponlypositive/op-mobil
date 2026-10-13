// OP mobil web paketi üretici. Çalıştır (kök: kuki-holding):   node op/app/mobil/hazirla.mjs      (ya da mobil/ içinden: npm run hazirla)
// Girdi : bulut/yayin/hazirla.mjs çıktısı (aynı doğrulamalarla; çıktı ayrı klasöre, canlı yayın klasörü EZİLMEZ) + src/mobil.js
// Çıktı : mobil/www/  (Capacitor webDir). Paketin İÇİNDEDİR: uzak site yüklenmez (ön izleme kapısından ve Apple 4.2'den bağımsız).
// Ortam (hepsi isteğe bağlı, hiçbiri gizli değil):
//   OP_SITE          paylaşım bağlantıları için herkese açık adres (varsayılan https://onlypositive.org)
//   OP_SUPABASE_URL / OP_SUPABASE_ANAHTAR   bulut/yayin/hazirla.mjs ile aynı (yalnız publishable anahtar kabul edilir)
//   OP_MOBIL_BETA=1  BETA etiketi + şeridi AÇIK (TestFlight/iç test); varsayılan KAPALI (mağaza sürümü: "beta/çok yakında" ibaresi olmaz)
//   OP_SURUM         yapılandırmaya yazılan sürüm etiketi
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const MOBIL = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(MOBIL, "..");
const ARA = path.join(MOBIL, ".ara", "web");
const WWW = path.join(MOBIL, "www");
const dur = (m) => { console.error("HATA: " + m); process.exit(1); };
const SITE = (process.env.OP_SITE || "https://onlypositive.org").replace(/\/$/, "");
const BETA = process.env.OP_MOBIL_BETA === "1";

// 1) web yayın derlemesi (tek kaynak; doğrulamaları orada)
fs.rmSync(ARA, { recursive: true, force: true });
const r = spawnSync(process.execPath, [path.join(APP, "bulut", "yayin", "hazirla.mjs")], { env: { ...process.env, OP_CIKTI: ARA, OP_SITE: SITE }, encoding: "utf8" });
if (r.status !== 0) dur("web derlemesi başarısız:\n" + r.stdout + r.stderr);

// 2) kopyala (mobilde gereksizler çıkar)
fs.rmSync(WWW, { recursive: true, force: true });
fs.cpSync(ARA, WWW, { recursive: true });
for (const g of ["sw.js", "_headers", "_redirects", "manifest.webmanifest", "icons/op-180.png", "icons/op-192.png", "icons/op-512.png", "icons/op-512-zemin.png", ".well-known"]) fs.rmSync(path.join(WWW, g), { recursive: true, force: true });

// 3) index.html: PWA ipuçları çıkar, mobil.js ekle
let ix = fs.readFileSync(path.join(WWW, "index.html"), "utf8");
ix = ix.replace(/<link rel="manifest"[^>]*>\n?/, "").replace(/<link rel="apple-touch-icon"[^>]*>\n?/, "")
  .replace(/<meta name="apple-mobile-web-app-[^>]*>\n?/g, "").replace(/<meta name="mobile-web-app-capable"[^>]*>\n?/, "");
if (!ix.includes('<script src="yapilandirma.js"></script>')) dur("index.html beklenen betik düzeninde değil");
ix = ix.replace('<script src="yapilandirma.js"></script>', '<script src="yapilandirma.js"></script>\n<script src="mobil.js"></script>');
// uzun basma/seçim menüleri ve çift dokunma yakınlaştırması web sürümünde olduğu gibi kalır (erişilebilirlik); yalnız viewport'a dokunulmaz
fs.writeFileSync(path.join(WWW, "index.html"), ix);

// 4) yapilandirma.js: platform işareti + mağaza için beta kapalı
const ypath = path.join(WWW, "yapilandirma.js");
const yt = fs.readFileSync(ypath, "utf8");
const m = yt.match(/window\.OP_YAPI = (\{[\s\S]*\});\s*$/);
if (!m) dur("yapilandirma.js ayrıştırılamadı");
const yapi = JSON.parse(m[1]);
Object.assign(yapi, { platform: "mobil", site: SITE, beta: { acik: BETA } });   // "mobil" = mobil.js gerçek platforma (ios|android) çevirir; denemede __OP_PLATFORM_TEST
fs.writeFileSync(ypath, `// OP mobil yapılandırması — mobil/hazirla.mjs üretti (elle düzenleme). URL ve yayınlanabilir anahtar gizli değildir.\nwindow.OP_YAPI = ${JSON.stringify(yapi, null, 2)};\n`);

// 5) yasal sayfalar: paket içinde .html ile açılır
for (const d of ["kosullar", "gizlilik", "cerezler", "kurallar"]) {
  const f = path.join(WWW, "yasal", d + ".html");
  let h = fs.readFileSync(f, "utf8");
  h = h.replace(/href="\/yasal\/(kosullar|gizlilik|cerezler|kurallar)"/g, 'href="/yasal/$1.html"').replace('class="geri" href="/"', 'class="geri" href="/index.html"');
  fs.writeFileSync(f, h);
}

// 6) mobil.js paketi (Capacitor eklenti JS'i dahil, tek dosya)
await build({ entryPoints: [path.join(MOBIL, "src", "mobil.js")], outfile: path.join(WWW, "mobil.js"), bundle: true, format: "iife", target: ["es2020", "safari15", "chrome100"], minify: true, legalComments: "none", logLevel: "warning" });

// 7) doğrulama
const tum = []; (function gez(d) { for (const a of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, a.name); a.isDirectory() ? gez(p) : tum.push(p); } })(WWW);
const rel = (p) => path.relative(WWW, p).split(path.sep).join("/");
const sorun = [];
for (const yasak of ["sw.js", "_headers", "_redirects", "manifest.webmanifest"]) if (tum.some((p) => rel(p) === yasak)) sorun.push("pakette olmaması gereken: " + yasak);
const metin = tum.filter((p) => /\.(js|html|css)$/.test(p) && !/vendor|mobil\.js/.test(p)).map((p) => fs.readFileSync(p, "utf8")).join("\n");
if (/service_role|sb_secret_|SUPABASE_SERVICE/i.test(metin)) sorun.push("gizli anahtar kalıbı");
const yz = fs.readFileSync(ypath, "utf8");
if (!/"platform": "mobil"/.test(yz) || !/"arkaUc": "supabase"/.test(yz)) sorun.push("yapilandirma.js platform/arkaUc hatalı");
if (BETA !== /"acik": true/.test(yz)) sorun.push("beta ayarı beklenenden farklı");
if (!/mobil\.js/.test(fs.readFileSync(path.join(WWW, "index.html"), "utf8")) || !fs.existsSync(path.join(WWW, "mobil.js"))) sorun.push("mobil.js yok");
for (const mm of fs.readFileSync(path.join(WWW, "index.html"), "utf8").matchAll(/(?:src|href)="([^"#:]+)"/g)) if (!fs.existsSync(path.join(WWW, mm[1]))) sorun.push("index.html eksik kaynak: " + mm[1]);
for (const d of ["kosullar", "gizlilik", "cerezler", "kurallar"]) if (/href="\/yasal\/[a-z]+"/.test(fs.readFileSync(path.join(WWW, "yasal", d + ".html"), "utf8"))) sorun.push(`yasal/${d}.html .html'siz bağlantı kalmış`);
let toplam = 0; for (const p of tum) toplam += fs.statSync(p).size;
console.log(`mobil/www: ${tum.length} dosya, ${(toplam / 1024).toFixed(0)} KB; site=${SITE} beta=${BETA ? "açık" : "kapalı"}`);
if (sorun.length) dur(sorun.join("\n"));
console.log("mobil doğrulama: TAMAM");
