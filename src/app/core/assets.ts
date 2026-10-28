/**
 * Every image path the site uses. The original files supplied by Fotia stay
 * untouched in public/assets; the web derivatives in public/assets/web are
 * generated from them (see README → Assets).
 */
const WEB = 'assets/web';

const srcset = (base: string, ext: string, widths: readonly number[]) =>
  widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(', ');

const HERO_WIDTHS = [640, 960, 1280, 1672] as const;

export const ASSETS = {
  /** Combined hero: background, stone platform and pouch in one image. */
  hero: {
    width: 1672,
    height: 941,
    src: `${WEB}/hero/fotia-hero-1280.jpg`,
    srcsetAvif: srcset(`${WEB}/hero/fotia-hero`, 'avif', HERO_WIDTHS),
    srcsetWebp: srcset(`${WEB}/hero/fotia-hero`, 'webp', HERO_WIDTHS),
    srcsetJpg: srcset(`${WEB}/hero/fotia-hero`, 'jpg', HERO_WIDTHS),
    alt: 'A black Fotia pouch with gold Greek-key detailing rests on a dark stone ledge, lit by gold and silver light among ancient columns.',
  },
  /** Gold wordmark with flame, trimmed from the supplied transparent logo. */
  logo: {
    width: 480,
    height: 222,
    src: `${WEB}/brand/fotia-logo-240.png`,
    srcsetPng: `${WEB}/brand/fotia-logo-240.png 240w, ${WEB}/brand/fotia-logo-480.png 480w`,
    srcsetWebp: `${WEB}/brand/fotia-logo-240.webp 240w, ${WEB}/brand/fotia-logo-480.webp 480w`,
  },
  /** The flame mark alone, used for placeholders and the footer rule. */
  flame: {
    width: 113,
    height: 160,
    src: `${WEB}/brand/fotia-flame-160.png`,
    srcWebp: `${WEB}/brand/fotia-flame-160.webp`,
  },
} as const;
