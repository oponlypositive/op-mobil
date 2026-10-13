// OP simge + açılış ekranı kaynakları: public/icons/op.svg'den mobil/assets/ içine PNG üretir (sharp, @capacitor/assets ile gelir).
// Sonra platform klasörleri varken:  npx capacitor-assets generate --ios --android   (tüm iOS/Android boyutları + uyarlanabilir Android ikonu)
// Çalıştır:  node ikon_uret.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const MOBIL = path.dirname(fileURLToPath(import.meta.url));
const SVG = fs.readFileSync(path.join(MOBIL, "..", "public", "icons", "op.svg"), "utf8");
const CIKTI = path.join(MOBIL, "assets");
fs.mkdirSync(CIKTI, { recursive: true });

const defs = SVG.match(/<defs>[\s\S]*?<\/defs>/)[0];
const daire = '<circle cx="100" cy="100" r="100" fill="url(#p)"/>';
if (!SVG.includes(daire)) throw new Error("op.svg beklenen daire satırını içermiyor");
const halka = SVG.match(/<circle cx="88"[^>]*\/>/)[0];
const arti = SVG.match(/<g stroke="#FBF3DC"[\s\S]*?<\/g>/)[0];
const kare = (govde, vb = "0 0 200 200", zemin = "") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${defs}${zemin}${govde}</svg>`;
const yaz = async (ad, svg, boy, ek = (s) => s) => {
  await ek(sharp(Buffer.from(svg), { density: 600 }).resize(boy, boy)).png().toFile(path.join(CIKTI, ad));
  console.log("ok", ad, boy + "x" + boy);
};

// 1) iOS/Android ana simge: tam kare, SAYDAMLIKSIZ (App Store alfa kanalını reddeder)
await yaz("icon-only.png", kare(halka + arti, "0 0 200 200", '<rect width="200" height="200" fill="url(#p)"/>'), 1024, (s) => s.flatten({ background: "#1D4753" }));
// 2) Android uyarlanabilir: ön plan (saydam; @capacitor/assets %16,7 iç boşluk bırakır → içerik tuvalin ~%78 köşegeninde) + arka plan (petrol degrade)
//    içerik kutusu x 39.5..171.5, y 40.5..156.5 (merkez 105.5, 98.5); köşegen ~176 birim → tuval 226 birim
const W = 226, vb = `${105.5 - W / 2} ${98.5 - W / 2} ${W} ${W}`;
await yaz("icon-foreground.png", kare(halka + arti, vb), 1024);
await yaz("icon-background.png", kare("", "0 0 200 200", '<rect width="200" height="200" fill="url(#p)"/>'), 1024, (s) => s.flatten({ background: "#1D4753" }));
// 3) açılış ekranı: açık (krem-beyaz) ve koyu; ortada daire logo, kenarlar geniş (2732 px kare; cihaza göre kırpılır)
for (const [ad, zemin] of [["splash.png", "#EEF5FB"], ["splash-dark.png", "#0B1D24"]]) {
  const bos = 2732, logoBoy = 760;
  const d = await sharp(Buffer.from(kare(daire + halka + arti)), { density: 600 }).resize(logoBoy, logoBoy).png().toBuffer();
  await sharp({ create: { width: bos, height: bos, channels: 3, background: zemin } }).composite([{ input: d, gravity: "center" }]).removeAlpha().png().toFile(path.join(CIKTI, ad));
  console.log("ok", ad, bos + "x" + bos);
}
