import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";

/**
 * Icônes PWA dérivées du favicon (sigil aurora sur fond nuit) :
 *   npx tsx scripts/generate-pwa-icons.ts
 *
 * - icon-192 / icon-512 : le SVG tel quel (coins arrondis du favicon) ;
 * - icon-512-maskable : sigil en zone sûre (75%) sur fond nuit plein cadre —
 *   les launchers Android croppent librement les icônes « maskable » ;
 * - src/app/apple-icon.png : iOS ignore le manifest, Next lie ce fichier
 *   automatiquement en <link rel="apple-touch-icon">.
 */
async function main() {
  const svg = readFileSync("src/app/icon.svg");
  mkdirSync("public/icons", { recursive: true });

  await sharp(svg, { density: 300 }).resize(192, 192).png().toFile("public/icons/icon-192.png");
  await sharp(svg, { density: 300 }).resize(512, 512).png().toFile("public/icons/icon-512.png");

  const nuit = { r: 11, g: 14, b: 20, alpha: 1 }; // #0B0E14
  const zoneSure = await sharp(svg, { density: 300 }).resize(384, 384).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: nuit } })
    .composite([{ input: zoneSure, left: 64, top: 64 }])
    .png()
    .toFile("public/icons/icon-512-maskable.png");

  const pomme = await sharp(svg, { density: 300 }).resize(150, 150).png().toBuffer();
  await sharp({ create: { width: 180, height: 180, channels: 4, background: nuit } })
    .composite([{ input: pomme, left: 15, top: 15 }])
    .png()
    .toFile("src/app/apple-icon.png");

  console.log("Icônes générées : public/icons/* + src/app/apple-icon.png");
}

main();
