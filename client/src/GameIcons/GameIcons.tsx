import type { ReactNode } from 'react';
import styles from './GameIcons.module.css';

// Inline SVG icons for the connect-the-words game, drawn in the same outline style as
// Avatar.tsx (fixed colours here, rather than currentColor, because each object has an
// expected colour a child will recognise it by).
//
// `color-<name>` icons are swatches rather than hand-drawn shapes, so a new colour pair
// never needs a new icon.
const COLOR_ICON_PREFIX = 'color-';

// The game's own palette, deliberately not `COLORS` from data/pages.ts. Those are avatar
// colours: validated server-side and stored in every profile, so they cannot be retuned for
// contrast without a migration. These exist only to be told apart.
//
// Chosen so the swatches differ in *lightness* as well as hue, which is what carries the
// distinction when hue perception does not: yellow and pink are light, orange and green
// mid, red mid-dark, blue and purple dark. Green is the bluish green from the Okabe-Ito
// colourblind-safe set rather than a grass green, since it has to sit next to red — that
// pair is the one red-green colour blindness collapses, and shifting green toward blue is
// the only lever a palette has.
const GAME_COLORS: Record<string, string> = {
  yellow: '#ffd400',
  pink: '#f07cb0',
  orange: '#f07c0a',
  green: '#009e73',
  red: '#d81e05',
  blue: '#0057b8',
  purple: '#6a2ba8',
};

/** Colour swatch ids, for the /dev/icons gallery. */
export const GAME_COLOR_IDS = Object.keys(GAME_COLORS);

const OBJECT_ICONS: Record<string, ReactNode> = {
  // White eyes with a pupil, not bare black dots: a black eye vanishes the moment it lands
  // on one of the patches, which is what made this one look eyeless.
  cow: (
    <>
      <path d='M15 15 Q10 9 14 6 Q18 9 19 14 Z M33 15 Q38 9 34 6 Q30 9 29 14 Z' fill='#e8dcc8' />
      <ellipse cx='9' cy='24' rx='5.5' ry='3.5' fill='#e8dcc8' />
      <ellipse cx='39' cy='24' rx='5.5' ry='3.5' fill='#e8dcc8' />
      <ellipse cx='24' cy='28' rx='13' ry='12' fill='#ffffff' />
      <ellipse cx='16' cy='20' rx='5' ry='4' fill='#1c1c1c' />
      <ellipse cx='32' cy='31' rx='4.5' ry='3.5' fill='#1c1c1c' />
      <ellipse cx='24' cy='35' rx='7' ry='4.5' fill='#f3b6c1' />
      <ellipse className={styles.dot} cx='21' cy='35' rx='1.1' ry='1.4' fill='#c98a97' />
      <ellipse className={styles.dot} cx='27' cy='35' rx='1.1' ry='1.4' fill='#c98a97' />
      <circle cx='19' cy='26' r='3' fill='#ffffff' />
      <circle cx='29' cy='26' r='3' fill='#ffffff' />
      <circle className={styles.eye} cx='19' cy='26' r='1.5' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='26' r='1.5' fill='#1c1c1c' />
    </>
  ),
  // Floppy ears rooted inside the skull, a lighter muzzle, and a nose high on that muzzle
  // with a mouth under it — the old nose sat where a mouth belongs, so it read as one.
  dog: (
    <>
      <path d='M13 20 C7 20 5 30 9 36 C14 34 15 26 15 21 Z' fill='#7a4a20' />
      <path d='M35 20 C41 20 43 30 39 36 C34 34 33 26 33 21 Z' fill='#7a4a20' />
      <ellipse cx='24' cy='29' rx='12' ry='12' fill='#c88b4a' />
      <ellipse cx='24' cy='34' rx='7.5' ry='5.5' fill='#e8c69a' />
      <path d='M24 32 L20.5 28.5 L27.5 28.5 Z' fill='#1c1c1c' />
      <path
        className={styles.line}
        d='M24 32 L24 35 M24 35 Q20.5 36.8 19 34.2 M24 35 Q27.5 36.8 29 34.2'
        stroke='#1c1c1c'
      />
      <circle className={styles.eye} cx='19' cy='25' r='1.7' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='25' r='1.7' fill='#1c1c1c' />
    </>
  ),
  // What separates a cat from a mouse here: pink triangular nose, whiskers springing from
  // the cheeks rather than the middle of the face, forehead stripes, and tall eyes.
  cat: (
    <>
      <path d='M12 20 L11 8 L22 15 Z M36 20 L37 8 L26 15 Z' fill='#e8a33d' />
      <path d='M13.5 18 L13 12 L19 15.5 Z M34.5 18 L35 12 L29 15.5 Z' fill='#f3b6c1' />
      <ellipse cx='24' cy='29' rx='13' ry='11' fill='#e8a33d' />
      <path className={styles.fine} d='M20 21 L20 24 M24 20 L24 23.5 M28 21 L28 24' stroke='#c9822a' />
      <path className={styles.line} d='M12 30 L3 28 M12 33 L3 34 M36 30 L45 28 M36 33 L45 34' stroke='#1c1c1c' />
      <ellipse cx='24' cy='33' rx='6.5' ry='4' fill='#f7e2c0' />
      <path d='M24 32.5 L21.8 30 L26.2 30 Z' fill='#e07a9c' />
      <path
        className={styles.line}
        d='M24 32.5 L24 34 M24 34 Q21.5 35.6 20.5 33.6 M24 34 Q26.5 35.6 27.5 33.6'
        stroke='#1c1c1c'
      />
      <circle cx='18.5' cy='26' r='2.8' fill='#f7e2c0' />
      <circle cx='29.5' cy='26' r='2.8' fill='#f7e2c0' />
      <ellipse className={styles.eye} cx='18.5' cy='26' rx='1' ry='2.2' fill='#1c1c1c' />
      <ellipse className={styles.eye} cx='29.5' cy='26' rx='1' ry='2.2' fill='#1c1c1c' />
    </>
  ),
  // A long head that narrows to the muzzle, with a blaze down it — a plain oval with ears
  // was reading as any quadruped at all.
  horse: (
    <>
      <path d='M16 15 L14 5 L21.5 13 Z M32 15 L34 5 L26.5 13 Z' fill='#a9682f' />
      <path
        d='M16 16 C13 24 15 32 18 38 C20 41 28 41 30 38 C33 32 35 24 32 16 C28 12 20 12 16 16 Z'
        fill='#a9682f'
      />
      <path className={styles.line} d='M16 15 Q24 8 32 15 M19 13 L17 7 M29 13 L31 7' stroke='#5c3a17' />
      <path d='M22 17 L26 17 L25.5 31 L22.5 31 Z' fill='#f2e6d0' />
      <ellipse cx='24' cy='37' rx='6' ry='4' fill='#d9a86a' />
      <ellipse className={styles.dot} cx='21.5' cy='37' rx='1' ry='1.4' fill='#7a4a20' />
      <ellipse className={styles.dot} cx='26.5' cy='37' rx='1' ry='1.4' fill='#7a4a20' />
      <circle className={styles.eye} cx='19' cy='25' r='1.7' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='25' r='1.7' fill='#1c1c1c' />
    </>
  ),
  // A whole bird in profile rather than a head: a bird's head alone is not recognisable,
  // and a side view makes one visible eye obviously right instead of looking like a face
  // missing the other one.
  bird: (
    <>
      <path d='M11 26 L2 21 L4 32 Z' fill='#2b7fa8' />
      <ellipse cx='23' cy='27' rx='12' ry='9' fill='#3fa7d6' />
      <path d='M15 25 Q23 21 29 28 Q21 34 15 25 Z' fill='#2b7fa8' />
      <path className={styles.line} d='M22 36 L21 42 M28 36 L28 42' stroke='#f2a53c' />
      <circle cx='33' cy='18' r='7' fill='#3fa7d6' />
      <path d='M39 17 L47 20 L39 23 Z' fill='#f2a53c' />
      <circle className={styles.eye} cx='35' cy='16.5' r='1.7' fill='#1c1c1c' />
    </>
  ),
  moose: (
    <>
      <path d='M16 16 L7 13 L2 6 L9 9 L8 2 L13 8 L16 5 Z' fill='#a9682f' />
      <path d='M32 16 L41 13 L46 6 L39 9 L40 2 L35 8 L32 5 Z' fill='#a9682f' />
      <ellipse cx='13' cy='24' rx='4' ry='5.5' fill='#6f4a22' />
      <ellipse cx='35' cy='24' rx='4' ry='5.5' fill='#6f4a22' />
      <ellipse className={styles.dot} cx='13' cy='24' rx='1.8' ry='3' fill='#a9805a' />
      <ellipse className={styles.dot} cx='35' cy='24' rx='1.8' ry='3' fill='#a9805a' />
      <ellipse cx='24' cy='28' rx='10' ry='13' fill='#6f4a22' />
      <ellipse cx='24' cy='38' rx='6.5' ry='5' fill='#8f6234' />
      <ellipse className={styles.dot} cx='21.5' cy='36.5' rx='1' ry='1.3' fill='#4a2f14' />
      <ellipse className={styles.dot} cx='26.5' cy='36.5' rx='1' ry='1.3' fill='#4a2f14' />
      <path className={styles.fine} d='M21 40.5 Q24 42 27 40.5' stroke='#4a2f14' />
      <circle cx='20' cy='25' r='2.8' fill='#ffffff' />
      <circle cx='28' cy='25' r='2.8' fill='#ffffff' />
      <circle className={styles.eye} cx='20' cy='25' r='1.5' fill='#1c1c1c' />
      <circle className={styles.eye} cx='28' cy='25' r='1.5' fill='#1c1c1c' />
    </>
  ),
  fox: (
    <>
      <path d='M12 16 L9 3 L21 12 Z M36 16 L39 3 L27 12 Z' fill='#e8763d' />
      <path d='M13.5 14 L12 7 L18 11.5 Z M34.5 14 L36 7 L30 11.5 Z' fill='#f3b6a1' />
      <path d='M24 42 L11 19 Q24 13 37 19 Z' fill='#e8763d' />
      <path d='M24 42 L17.5 27 Q24 24.5 30.5 27 Z' fill='#fff6ee' />
      <circle cx='19' cy='24' r='2.8' fill='#fff6ee' />
      <circle cx='29' cy='24' r='2.8' fill='#fff6ee' />
      <ellipse className={styles.eye} cx='19' cy='24' rx='1' ry='1.9' fill='#1c1c1c' />
      <ellipse className={styles.eye} cx='29' cy='24' rx='1' ry='1.9' fill='#1c1c1c' />
      <path d='M24 37 L21.8 33.5 L26.2 33.5 Z' fill='#1c1c1c' />
      <path
        className={styles.line}
        d='M24 37 L24 39 M24 39 Q22.4 40.4 21.6 38.8 M24 39 Q25.6 40.4 26.4 38.8'
        stroke='#1c1c1c'
      />
    </>
  ),
  bear: (
    <>
      <circle cx='13' cy='17' r='5.5' fill='#6f4a22' />
      <circle cx='35' cy='17' r='5.5' fill='#6f4a22' />
      <circle cx='24' cy='28' r='13' fill='#8a5a2b' />
      <ellipse cx='24' cy='33' rx='7' ry='5.5' fill='#d9b48a' />
      <ellipse cx='24' cy='30.5' rx='2.6' ry='2' fill='#1c1c1c' />
      <path
        className={styles.line}
        d='M24 33 L24 35 M24 35 Q21 36.5 20 34.5 M24 35 Q27 36.5 28 34.5'
        stroke='#1c1c1c'
      />
      <circle className={styles.eye} cx='19' cy='25' r='1.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='25' r='1.6' fill='#1c1c1c' />
    </>
  ),
  pig: (
    <>
      <path d='M12 18 L10 6 L21 13 Z M36 18 L38 6 L27 13 Z' fill='#e07a9c' />
      <path d='M13.5 16 L12.5 9 L18 13 Z M34.5 16 L35.5 9 L30 13 Z' fill='#f7c9d6' />
      <ellipse cx='24' cy='29' rx='13' ry='11' fill='#f3a8ba' />
      <ellipse className={styles.dot} cx='14' cy='31' rx='2.6' ry='1.8' fill='#eb92ab' />
      <ellipse className={styles.dot} cx='34' cy='31' rx='2.6' ry='1.8' fill='#eb92ab' />
      <circle cx='19' cy='25' r='2.8' fill='#ffffff' />
      <circle cx='29' cy='25' r='2.8' fill='#ffffff' />
      <circle className={styles.eye} cx='19' cy='25' r='1.5' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='25' r='1.5' fill='#1c1c1c' />
      <ellipse cx='24' cy='34' rx='6.5' ry='5' fill='#e07a9c' />
      <ellipse className={styles.dot} cx='21.6' cy='34' rx='1' ry='1.5' fill='#a34a66' />
      <ellipse className={styles.dot} cx='26.4' cy='34' rx='1' ry='1.5' fill='#a34a66' />
      <path className={styles.fine} d='M24 29.5 L24 31' stroke='#a34a66' />
    </>
  ),
  fish: (
    <>
      <path d='M9 24 L1 17 L2 31 Z' fill='#26788a' />
      <path d='M21 15 L23 8 L28 16 Z' fill='#26788a' />
      <path d='M9 24 C15 13 31 13 39 24 C31 35 15 35 9 24 Z' fill='#2d8f9e' />
      <path className={styles.line} d='M29 17 Q27 24 29 31' stroke='#1c1c1c' />
      <circle className={styles.eye} cx='33' cy='21' r='1.8' fill='#1c1c1c' />
    </>
  ),
  // Two lobes meeting in a dip at the stem, not a circle — the dip is the whole difference
  // between an apple and a tomato at this size.
  apple: (
    <>
      <path className={styles.line} d='M24 17 L25 8' stroke='#5c3a17' />
      <path d='M25 10 Q32 6 35 11 Q29 16 25 10 Z' fill='#2a9d8f' />
      <path className={styles.fine} d='M26 11 Q30 10.5 33.5 11.5' stroke='#1f7a6f' />
      <path
        d='M24 17 C19 13 11 16 11 26 C11 35 17 42 24 42 C31 42 37 35 37 26 C37 16 29 13 24 17 Z'
        fill='#d1495b'
      />
      <path className={styles.fine} d='M16 24 Q18.5 20 22 18.8' stroke='#e8949e' />
    </>
  ),
  pineapple: (
    <>
      <path d='M17 21 L10 8 L19 16 Z M31 21 L38 8 L29 16 Z' fill='#2a9d8f' />
      <path d='M24 20 L19 5 L22.5 13 L24 3 L25.5 13 L29 5 Z' fill='#2a9d8f' />
      <path d='M24 19 C31 19 35 24 35 31 C35 38 30 43 24 43 C18 43 13 38 13 31 C13 24 17 19 24 19 Z' fill='#e8a33d' />
      <path
        className={styles.dot}
        d='M19 22 L22 25 L19 28 L16 25 Z M29 22 L32 25 L29 28 L26 25 Z M24 27 L27 30 L24 33 L21 30 Z
           M17 30 L20 33 L17 36 L14 33 Z M31 30 L34 33 L31 36 L28 33 Z M24 35 L27 38 L24 41 L21 38 Z'
        fill='#c9822a'
      />
    </>
  ),
  // A crescent with two tips, not a blob: the outer edge sweeps from the bottom-left tip up
  // to the stem, the inner edge comes back under it, and the ridge line down the middle is
  // what stops it reading as a slice of melon.
  banana: (
    <>
      <path d='M10 30 C9 16 21 9 35 9 L37 12 C24 12 17 21 16 31 C16 35 10 35 10 30 Z' fill='#fecc00' />
      <path className={styles.fine} d='M13.5 29 C13 18 22 12.5 33 11.5' stroke='#d9a800' />
      <path className={styles.line} d='M35 9 L38 6' stroke='#8a6a2b' />
    </>
  ),
  strawberry: (
    <>
      <path d='M12 23 C18 19 30 19 36 23 C38 32 32 41 24 41 C16 41 10 32 12 23 Z' fill='#d1495b' />
      <path className={styles.line} d='M24 18 L24 11' stroke='#2a7d5f' />
      <path d='M24 22 L15 17 L21 19 L19 12 L24 18 L29 12 L27 19 L33 17 Z' fill='#2a9d8f' />
      <circle className={styles.dot} cx='18' cy='28' r='1' fill='#ffe9a8' />
      <circle className={styles.dot} cx='24' cy='26' r='1' fill='#ffe9a8' />
      <circle className={styles.dot} cx='30' cy='28' r='1' fill='#ffe9a8' />
      <circle className={styles.dot} cx='20' cy='34' r='1' fill='#ffe9a8' />
      <circle className={styles.dot} cx='28' cy='34' r='1' fill='#ffe9a8' />
    </>
  ),
  lemon: (
    <>
      <path d='M6 27 C9 21 15 17 24 17 C33 17 39 21 42 27 C39 33 33 37 24 37 C15 37 9 33 6 27 Z' fill='#fecc00' />
      <path className={styles.fine} d='M14 24 Q20 20.5 27 20.5' stroke='#d9a800' />
      <path d='M28 15 Q34 10 39 13 Q33 18 28 15 Z' fill='#2a9d8f' />
    </>
  ),
  pear: (
    <>
      <path className={styles.line} d='M24 14 L24 7' stroke='#6b4a1f' />
      <path d='M21 14 C21 19 18 21 16 26 C13 34 17 41 24 41 C31 41 35 34 32 26 C30 21 27 19 27 14 Z' fill='#b5cc3a' />
      <path d='M25 10 Q31 5 35 9 Q30 13 25 10 Z' fill='#2a9d8f' />
    </>
  ),
  blueberries: (
    <>
      <circle cx='31' cy='26' r='7' fill='#3d4f8f' />
      <circle cx='27' cy='36' r='5.5' fill='#5468b5' />
      <circle cx='18' cy='29' r='8.5' fill='#4a5fa8' />
      <path className={styles.line} d='M18 22 L18 19.5 M14.5 23 L13 21.5 M21.5 23 L23 21.5' stroke='#2a3468' />
    </>
  ),
  carrot: (
    <>
      <path className={styles.line} d='M24 17 L17 7 M24 17 L24 5 M24 17 L31 7' stroke='#2a9d8f' />
      <path d='M19 17 L29 17 L25 42 Q24 44 23 42 Z' fill='#ef8354' />
      <path className={styles.fine} d='M21 24 L26.5 24 M22 30 L26 30 M22.6 35 L25.4 35' stroke='#c9603a' />
    </>
  ),
  tomato: (
    <>
      <path className={styles.line} d='M24 16 L24 9' stroke='#2a7d5f' />
      <circle cx='24' cy='29' r='13' fill='#d1495b' />
      <path className={styles.fine} d='M15 25 Q18.5 20.5 24 19.5' stroke='#e07a8a' />
      <path d='M24 20 L16 14 L21 17 L19 10 L24 16 L29 10 L27 17 L32 14 Z' fill='#2a9d8f' />
    </>
  ),
  // A capsule, not a crescent: parallel sides with rounded ends read as a cylinder, which
  // is what a cucumber is. Tilted so it does not sit like a pill.
  cucumber: (
    <g transform='rotate(-18 24 24)'>
      <rect x='18' y='7' width='12' height='34' rx='5.5' fill='#3f8f4a' />
      <path className={styles.line} d='M24 7 L24 4' stroke='#2a6b33' />
      <ellipse className={styles.dot} cx='23' cy='14' rx='1.3' ry='1.1' fill='#7ab86a' />
      <ellipse className={styles.dot} cx='26' cy='21' rx='1.3' ry='1.1' fill='#7ab86a' />
      <ellipse className={styles.dot} cx='22' cy='28' rx='1.3' ry='1.1' fill='#7ab86a' />
      <ellipse className={styles.dot} cx='25.5' cy='35' rx='1.3' ry='1.1' fill='#7ab86a' />
    </g>
  ),
  potato: (
    <>
      <path d='M11 27 C11 19 19 14 28 15 C36 16 40 22 38 29 C36 36 27 39 20 37 C14 35 11 32 11 27 Z' fill='#c8a06a' />
      <circle className={styles.dot} cx='19' cy='24' r='1.4' fill='#8a6a3d' />
      <circle className={styles.dot} cx='28' cy='22' r='1.2' fill='#8a6a3d' />
      <circle className={styles.dot} cx='25' cy='31' r='1.3' fill='#8a6a3d' />
    </>
  ),
  // Husk leaves that hug the cob and taper upwards. The first pair flared out at the
  // bottom, which is exactly the silhouette of a rocket's fins.
  corn: (
    <>
      <path d='M18 41 C10 35 9 23 14 14 C18 21 19 31 18 41 Z' fill='#3f8f4a' />
      <path d='M30 41 C38 35 39 23 34 14 C30 21 29 31 30 41 Z' fill='#3f8f4a' />
      <ellipse cx='24' cy='26' rx='9' ry='15' fill='#fecc00' />
      <path
        className={styles.fine}
        d='M16 20 Q24 22 32 20 M15 26 Q24 28 33 26 M16 32 Q24 34 32 32 M20 13 L20 39 M28 13 L28 39'
        stroke='#d9a800'
      />
    </>
  ),
  // Side profile with a cabin set back from the bonnet, facing left. The old one was a
  // single wedge with two windows punched in it, which read as a bus.
  car: (
    <>
      <path d='M14 24 L18 14 Q19 12 22 12 L30 12 Q33 12 34.5 14.5 L39 24 Z' fill='#005293' />
      <path d='M4 33 L5 26.5 Q6 24 10 24 L38 24 Q42 24 43.5 26.5 L44 33 Z' fill='#005293' />
      <path d='M18.5 22.5 L21.5 15 L23 15 L23 22.5 Z' fill='#bfe3f5' />
      <path d='M25 15 L29.5 15 Q31.5 15 32.5 17 L34.5 22.5 L25 22.5 Z' fill='#bfe3f5' />
      <rect x='4' y='27' width='4.5' height='3' rx='1.2' fill='#fecc00' />
      <path className={styles.fine} d='M24 24 L24 32' stroke='#003a69' />
      <circle cx='14' cy='33' r='5.5' fill='#1c1c1c' />
      <circle cx='34' cy='33' r='5.5' fill='#1c1c1c' />
      <circle cx='14' cy='33' r='2.2' fill='#bfe3f5' />
      <circle cx='34' cy='33' r='2.2' fill='#bfe3f5' />
    </>
  ),
};

/** Every drawn icon, for the /dev/icons gallery. Colour swatches are generated, not drawn. */
export const OBJECT_ICON_IDS = Object.keys(OBJECT_ICONS);

type Props = {
  icon: string;
  size?: number;
};

export function GameIcon({ icon, size = 56 }: Props) {
  if (icon.startsWith(COLOR_ICON_PREFIX)) {
    const fill = GAME_COLORS[icon.slice(COLOR_ICON_PREFIX.length)];
    if (!fill) return null;
    return (
      <svg className={styles.icon} width={size} height={size} viewBox='0 0 48 48' aria-hidden='true'>
        {
          /* A rounded square rather than a circle: more area of the colour to judge, and a
            2px outline so a light swatch still separates from the card behind it. */
        }
        <rect x='7' y='7' width='34' height='34' rx='9' fill={fill} stroke='#1c1c1c' strokeWidth={2} />
      </svg>
    );
  }

  const shape = OBJECT_ICONS[icon];
  if (!shape) return null;

  return (
    <svg className={styles.icon} width={size} height={size} viewBox='0 0 48 48' aria-hidden='true'>
      {shape}
    </svg>
  );
}
