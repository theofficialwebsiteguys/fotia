// Regenerates public/assets/web/* from the original files in public/assets.
// Originals are never modified. Requires sharp, which is not a project dependency:
//   npm i --no-save sharp@0.33.5 && node scripts/optimize-images.mjs
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const src = 'public/assets';
const out = 'public/assets/web';
mkdirSync(join(out, 'hero'), { recursive: true });
mkdirSync(join(out, 'brand'), { recursive: true });

// Combined hero: one composition, several widths and formats.
for (const width of [640, 960, 1280, 1672]) {
  const image = sharp(join(src, 'FOTIA-bg.png')).resize({ width });
  await image.clone().avif({ quality: 52, effort: 6 }).toFile(join(out, `hero/fotia-hero-${width}.avif`));
  await image.clone().webp({ quality: 78, effort: 6 }).toFile(join(out, `hero/fotia-hero-${width}.webp`));
  await image.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(join(out, `hero/fotia-hero-${width}.jpg`));
}

// Logo: trim the transparent padding so it can be sized precisely.
const logo = await sharp(join(src, 'full-logo.png')).trim().toBuffer();
for (const width of [240, 480]) {
  const image = sharp(logo).resize({ width });
  await image.clone().png({ compressionLevel: 9 }).toFile(join(out, `brand/fotia-logo-${width}.png`));
  await image.clone().webp({ quality: 90, alphaQuality: 100 }).toFile(join(out, `brand/fotia-logo-${width}.webp`));
}

// Flame mark: placeholders, footer rule and favicons.
const flame = await sharp(join(src, 'icon-logo.png')).trim().toBuffer();
await sharp(flame).resize({ height: 160 }).png({ compressionLevel: 9 }).toFile(join(out, 'brand/fotia-flame-160.png'));
await sharp(flame).resize({ height: 160 }).webp({ quality: 90 }).toFile(join(out, 'brand/fotia-flame-160.webp'));

const square = (size, background) => {
  const inner = Math.round(size * 0.82);
  const pad = Math.round(size * 0.09);
  return sharp(flame)
    .resize({ width: inner, height: inner, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .extend({ top: pad, left: pad, bottom: size - inner - pad, right: size - inner - pad, background })
    .png({ compressionLevel: 9 })
    .toBuffer();
};
const favicon = await square(32, { r: 0, g: 0, b: 0, alpha: 0 });
writeFileSync(join(out, 'brand/favicon-32.png'), favicon);
writeFileSync(join(out, 'brand/apple-touch-icon.png'), await sharp(await square(180, { r: 0, g: 0, b: 0, alpha: 1 })).flatten({ background: '#000' }).png().toBuffer());

// favicon.ico wrapping the 32px PNG (PNG-in-ICO, supported by current browsers).
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(favicon.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync('public/favicon.ico', Buffer.concat([header, entry, favicon]));

console.log('Web images written to', out);
