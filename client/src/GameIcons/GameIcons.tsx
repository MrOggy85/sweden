import type { ReactNode } from 'react';
import { COLOR_ICON_PREFIX, type GameColorId, type ObjectIconId } from './iconIds';
import styles from './GameIcons.module.css';

// Inline SVG for the connect game, in Avatar.tsx's outline style. Fixed colours, not
// currentColor: a child recognises these by colour. Drawing rules: ./CLAUDE.md.
//
// The two Record types are keyed by the unions from ./iconIds.ts, so a drawing without an id
// there — or an id with no drawing — is a type error rather than a blank card in the game.

// Not `COLORS` from data/pages.ts — those are avatar colours, stored in profiles and not
// retunable. These differ in lightness as well as hue, which is what carries the difference
// when hue perception does not. Green is Okabe-Ito's bluish green because it sits next to
// red. See ./CLAUDE.md.
export const GAME_COLORS: Record<GameColorId, string> = {
  yellow: '#ffd400',
  pink: '#f07cb0',
  orange: '#f07c0a',
  green: '#009e73',
  red: '#d81e05',
  blue: '#0057b8',
  purple: '#6a2ba8',
  // The achromatic four. Hue tells you nothing here, so they are spaced down the lightness
  // axis instead — the same lever the red/green note leans on, used on purpose.
  white: '#ffffff',
  grey: '#8c9196',
  brown: '#7a4a1e',
  black: '#1c1c1c',
};

const OBJECT_ICONS: Record<ObjectIconId, ReactNode> = {
  // White eyes with pupils: a black dot vanishes on a black patch.
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
  // Ears rooted in the skull; nose high on the muzzle with a mouth under it, or the nose
  // reads as the mouth.
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
  // Not a mouse: pink nose, whiskers from the cheeks not the centre, stripes, tall eyes.
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
  // Long head narrowing to the muzzle, plus a blaze: an oval with ears is any quadruped.
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
  // Whole bird in profile: a bird's head alone is unrecognisable, and in profile one eye
  // is obviously right.
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
  // Branched twigs where the moose has filled palmate slabs, and a pale face under them.
  // Those two are the same silhouette otherwise.
  reindeer: (
    <>
      <path
        className={styles.line}
        d='M20 18 C17 12 13 8 9 6 M20 18 C18 13 15 11 12 12 M20 18 C19.5 12 20 8 21 5 M28 18 C31 12 35 8 39 6 M28 18 C30 13 33 11 36 12 M28 18 C28.5 12 28 8 27 5'
        stroke='#8a5a2b'
      />
      <ellipse cx='14' cy='21' rx='4.5' ry='3.2' fill='#7a5330' />
      <ellipse cx='34' cy='21' rx='4.5' ry='3.2' fill='#7a5330' />
      <ellipse cx='24' cy='27' rx='10' ry='12' fill='#9b7148' />
      <ellipse cx='24' cy='35' rx='6' ry='5' fill='#e8dcc8' />
      <ellipse cx='24' cy='33' rx='2.4' ry='1.8' fill='#1c1c1c' />
      <path
        className={styles.line}
        d='M24 35 L24 37 M24 37 Q21.5 38.4 20.6 36.6 M24 37 Q26.5 38.4 27.4 36.6'
        stroke='#1c1c1c'
      />
      <circle cx='19.5' cy='25' r='2.6' fill='#ffffff' />
      <circle cx='28.5' cy='25' r='2.6' fill='#ffffff' />
      <circle className={styles.eye} cx='19.5' cy='25' r='1.4' fill='#1c1c1c' />
      <circle className={styles.eye} cx='28.5' cy='25' r='1.4' fill='#1c1c1c' />
    </>
  ),
  // Round ears and a snout that comes to a point. The cat note says a centre-radiating
  // whisker fan is the most rodent-like thing you can draw — here that is the point.
  mouse: (
    <>
      <path className={styles.line} d='M34 34 C41 36 43 30 39 27' stroke='#8a8f95' />
      <circle cx='12' cy='18' r='8' fill='#9aa0a6' />
      <circle cx='36' cy='18' r='8' fill='#9aa0a6' />
      <circle cx='12' cy='18' r='4.5' fill='#f3b6c1' />
      <circle cx='36' cy='18' r='4.5' fill='#f3b6c1' />
      <path d='M24 41 C16 39 13 33 13 26 C13 19 18 15 24 15 C30 15 35 19 35 26 C35 33 32 39 24 41 Z' fill='#a8aeb4' />
      <path className={styles.line} d='M21 36 L11 34 M21 37.5 L12 39 M27 36 L37 34 M27 37.5 L36 39' stroke='#1c1c1c' />
      <circle cx='24' cy='38.5' r='2.2' fill='#e07a9c' />
      <circle cx='19.5' cy='26' r='2.6' fill='#ffffff' />
      <circle cx='28.5' cy='26' r='2.6' fill='#ffffff' />
      <circle className={styles.eye} cx='19.5' cy='26' r='1.4' fill='#1c1c1c' />
      <circle className={styles.eye} cx='28.5' cy='26' r='1.4' fill='#1c1c1c' />
    </>
  ),
  // Long ears and two front teeth. Without the teeth it is the mouse with the ears stretched.
  rabbit: (
    <>
      <ellipse cx='17' cy='15' rx='4.5' ry='10.5' transform='rotate(-8 17 15)' fill='#d8d2c8' />
      <ellipse cx='31' cy='15' rx='4.5' ry='10.5' transform='rotate(8 31 15)' fill='#d8d2c8' />
      <ellipse cx='17' cy='15' rx='2.2' ry='7' transform='rotate(-8 17 15)' fill='#f3b6c1' />
      <ellipse cx='31' cy='15' rx='2.2' ry='7' transform='rotate(8 31 15)' fill='#f3b6c1' />
      <ellipse cx='24' cy='31' rx='12' ry='11' fill='#e8e2d8' />
      <path className={styles.line} d='M13 32 L5 30 M13 35 L5 36 M35 32 L43 30 M35 35 L43 36' stroke='#1c1c1c' />
      <circle cx='19' cy='27' r='2.8' fill='#ffffff' />
      <circle cx='29' cy='27' r='2.8' fill='#ffffff' />
      <circle className={styles.eye} cx='19' cy='27' r='1.5' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='27' r='1.5' fill='#1c1c1c' />
      <path d='M24 34.5 L21.8 32 L26.2 32 Z' fill='#e07a9c' />
      <path className={styles.line} d='M24 34.5 L24 36' stroke='#1c1c1c' />
      <path d='M21.6 36 L23.5 36 L23.5 40.5 L21.6 40.5 Z M24.5 36 L26.4 36 L26.4 40.5 L24.5 40.5 Z' fill='#ffffff' />
    </>
  ),
  // A dark face in the wool. White all over it would be the cloud with legs left off.
  sheep: (
    <>
      <ellipse cx='13' cy='26' rx='5.5' ry='3.4' transform='rotate(20 13 26)' fill='#4a4a4a' />
      <ellipse cx='35' cy='26' rx='5.5' ry='3.4' transform='rotate(-20 35 26)' fill='#4a4a4a' />
      <circle cx='14' cy='18' r='7' fill='#f5f2ec' />
      <circle cx='34' cy='18' r='7' fill='#f5f2ec' />
      <circle cx='24' cy='14' r='8' fill='#f5f2ec' />
      <circle cx='24' cy='22' r='8.5' fill='#f5f2ec' />
      <ellipse cx='24' cy='31' rx='9' ry='9.5' fill='#4a4a4a' />
      <circle cx='20.5' cy='29' r='2.6' fill='#ffffff' />
      <circle cx='27.5' cy='29' r='2.6' fill='#ffffff' />
      <circle className={styles.eye} cx='20.5' cy='29' r='1.4' fill='#1c1c1c' />
      <circle className={styles.eye} cx='27.5' cy='29' r='1.4' fill='#1c1c1c' />
      <ellipse cx='24' cy='36' rx='4.5' ry='3' fill='#6a6a6a' />
      <ellipse className={styles.dot} cx='22.4' cy='35.5' rx='0.9' ry='1.2' fill='#2a2a2a' />
      <ellipse className={styles.dot} cx='25.6' cy='35.5' rx='0.9' ry='1.2' fill='#2a2a2a' />
    </>
  ),
  // Profile like the bird, but yellow with a broad flat bill — the bird's is a point, and
  // that is the only place the two differ in outline.
  duck: (
    <>
      <path d='M9 29 L4 25 L5 33 Z' fill='#e8a800' />
      <ellipse cx='19' cy='31' rx='12' ry='8.5' fill='#fecc00' />
      <path d='M27 25 C27 19 28 15 31 15 L33 22 L31 27 Z' fill='#fecc00' />
      <circle cx='30' cy='17' r='7' fill='#fecc00' />
      <path d='M36 14.5 L43 16 Q44 18 43 19.6 L36 20.5 Z' fill='#f2820a' />
      <path d='M13 28 Q21 25 26 31 Q18 35 13 28 Z' fill='#e8a800' />
      <path className={styles.line} d='M17 39 L17 41 M24 39 L24 41' stroke='#f2820a' />
      <path d='M12 41 L22 41 L17 43.5 Z M19 41 L29 41 L24 43.5 Z' fill='#f2820a' />
      <circle cx='32' cy='15.5' r='2.6' fill='#ffffff' />
      <circle className={styles.eye} cx='32' cy='15.5' r='1.4' fill='#1c1c1c' />
    </>
  ),
  // Eyes on domes above the skull, not in it. That plus the mouth across the whole face is
  // the frog; sunk into the head it is any green animal.
  frog: (
    <>
      <circle cx='15' cy='14' r='7' fill='#5aa83a' />
      <circle cx='33' cy='14' r='7' fill='#5aa83a' />
      <path d='M24 40 C12 40 6 33 6 26 C6 20 13 17 24 17 C35 17 42 20 42 26 C42 33 36 40 24 40 Z' fill='#6fbf4a' />
      <circle cx='15' cy='13' r='4' fill='#ffffff' />
      <circle cx='33' cy='13' r='4' fill='#ffffff' />
      <circle className={styles.eye} cx='15' cy='13' r='2.2' fill='#1c1c1c' />
      <circle className={styles.eye} cx='33' cy='13' r='2.2' fill='#1c1c1c' />
      <path className={styles.line} d='M12 28 Q24 38 36 28' stroke='#2f6b1f' />
      <circle className={styles.dot} cx='20' cy='23' r='1.2' fill='#3d8a26' />
      <circle className={styles.dot} cx='28' cy='23' r='1.2' fill='#3d8a26' />
    </>
  ),
  // The tail is bigger than the animal, which is the only reason this is not the fox: both
  // are orange and pointed at the front.
  squirrel: (
    <>
      <path d='M29 38 C40 37 42 22 34 14 C38 24 34 31 27 32 Z' fill='#c96a3a' />
      <path d='M15 42 C9 42 8 34 11 28 C13 22 17 19 22 20 C27 21 29 26 28 32 C27 38 23 42 18 42 Z' fill='#d9803f' />
      <path d='M13 10 L11.5 4.5 L18 8.5 Z' fill='#d9803f' />
      <circle cx='18' cy='16' r='8.5' fill='#d9803f' />
      <ellipse cx='12.5' cy='19' rx='4.5' ry='3.5' fill='#f2d8bc' />
      <circle cx='9' cy='18' r='1.8' fill='#1c1c1c' />
      <circle cx='18.5' cy='13.5' r='2.6' fill='#ffffff' />
      <circle className={styles.eye} cx='18.5' cy='13.5' r='1.4' fill='#1c1c1c' />
    </>
  ),
  // Two enormous ringed eyes and a beak between them. Anything smaller and it is a bird.
  owl: (
    <>
      <path d='M13 13 L11 4.5 L19.5 10 Z M35 13 L37 4.5 L28.5 10 Z' fill='#8a5a2b' />
      <ellipse cx='24' cy='27' rx='15' ry='16' fill='#a9763f' />
      <circle cx='17.5' cy='23' r='7' fill='#f2e6d0' />
      <circle cx='30.5' cy='23' r='7' fill='#f2e6d0' />
      <circle className={styles.eye} cx='17.5' cy='23' r='3.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='30.5' cy='23' r='3.6' fill='#1c1c1c' />
      <circle className={styles.dot} cx='19' cy='21.5' r='1.2' fill='#ffffff' />
      <circle className={styles.dot} cx='32' cy='21.5' r='1.2' fill='#ffffff' />
      <path d='M24 26 L21.5 30.5 L26.5 30.5 Z' fill='#f2a53c' />
      <path className={styles.fine} d='M15 34 Q24 37 33 34 M17 38 Q24 40.5 31 38' stroke='#7a5330' />
    </>
  ),
  // Spikes drawn as one zigzag ridge, so they read as spines rather than as fur at 44px.
  hedgehog: (
    <>
      <path
        d='M7 34 L9 22 L13 28 L16 15 L20 25 L24 12 L28 25 L32 15 L35 28 L39 22 L41 34 Z'
        fill='#6f4a22'
      />
      <ellipse cx='24' cy='34' rx='17' ry='9' fill='#6f4a22' />
      <circle cx='16' cy='32' r='3' fill='#d9b48a' />
      <ellipse cx='24' cy='36' rx='9.5' ry='7' fill='#e0c49a' />
      <circle className={styles.eye} cx='20.5' cy='34' r='1.5' fill='#1c1c1c' />
      <circle className={styles.eye} cx='27.5' cy='34' r='1.5' fill='#1c1c1c' />
      <circle cx='24' cy='40' r='2.2' fill='#1c1c1c' />
    </>
  ),
  butterfly: (
    <>
      <path className={styles.line} d='M22 15 C19 10 15 7 12 6 M26 15 C29 10 33 7 36 6' stroke='#1c1c1c' />
      <circle className={styles.dot} cx='12' cy='6' r='1.8' fill='#1c1c1c' />
      <circle className={styles.dot} cx='36' cy='6' r='1.8' fill='#1c1c1c' />
      <path d='M23 20 C18 12 9 11 6.5 17 C4.5 23 10 28 22 26 Z' fill='#f07c0a' />
      <path d='M25 20 C30 12 39 11 41.5 17 C43.5 23 38 28 26 26 Z' fill='#f07c0a' />
      <path d='M23 27 C17 27 11 30 12 35 C13 40 20 39 23 33 Z' fill='#e8546b' />
      <path d='M25 27 C31 27 37 30 36 35 C35 40 28 39 25 33 Z' fill='#e8546b' />
      <circle className={styles.dot} cx='14' cy='18.5' r='2.4' fill='#ffe9a8' />
      <circle className={styles.dot} cx='34' cy='18.5' r='2.4' fill='#ffe9a8' />
      <ellipse cx='24' cy='27' rx='2.6' ry='11' fill='#4a3520' />
      <circle cx='24' cy='16' r='3' fill='#4a3520' />
    </>
  ),
  // The dip at the stem is the whole difference between an apple and a tomato.
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
  // Crescent with two tips. The ridge line is what stops it reading as a melon slice.
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
  // Swedish key, like gryta and falukorv: "orange" would sit one character from the colour
  // swatch in content and read as a typo either way round.
  apelsin: (
    <>
      <path className={styles.line} d='M24 15 L24 11' stroke='#6b4a1f' />
      <path d='M26 14 Q33 9 37 13 Q31 18 26 14 Z' fill='#2a9d8f' />
      <circle cx='24' cy='28' r='13' fill='#f07c0a' />
      <path className={styles.fine} d='M15 24 Q18.5 19.5 24 18.5' stroke='#f8ab5e' />
      <circle className={styles.dot} cx='18' cy='31' r='1.1' fill='#c25f06' />
      <circle className={styles.dot} cx='24' cy='34' r='1.1' fill='#c25f06' />
      <circle className={styles.dot} cx='29' cy='29' r='1.1' fill='#c25f06' />
      <circle className={styles.dot} cx='21' cy='25' r='1.1' fill='#c25f06' />
    </>
  ),
  // Drupelets, not seeds: that is the whole difference from the strawberry beside it.
  raspberry: (
    <>
      <path d='M24 9 L18 12 L30 12 Z' fill='#2a9d8f' />
      <path
        d='M13 22 C13 15 18 11.5 24 11.5 C30 11.5 35 15 35 22 C35 32 30 41 24 41 C18 41 13 32 13 22 Z'
        fill='#b02a44'
      />
      <circle className={styles.dot} cx='19' cy='18' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='26' cy='17' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='31' cy='22' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='17' cy='25' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='24' cy='24' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='19.5' cy='32' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='27' cy='31' r='3.3' fill='#cf4a63' />
      <circle className={styles.dot} cx='23.5' cy='37.5' r='3' fill='#cf4a63' />
    </>
  ),
  cherry: (
    <>
      <path className={styles.line} d='M18 28 C17 20 20 13 26 9 M33 26 C33.5 18 30 12 26 9' stroke='#4a7a2a' />
      <path d='M26 9 Q33 4 38 8 Q32 13 26 9 Z' fill='#2a9d8f' />
      <circle cx='18' cy='34' r='7' fill='#c8102e' />
      <circle cx='33' cy='32' r='7' fill='#c8102e' />
      <circle className={styles.dot} cx='15.5' cy='31.5' r='1.6' fill='#e8546b' />
      <circle className={styles.dot} cx='30.5' cy='29.5' r='1.6' fill='#e8546b' />
    </>
  ),
  // Six berries in a triangle with a leaf. The blueberries are three loose spheres and no
  // leaf, which is the only thing keeping the two apart at 44px.
  grapes: (
    <>
      <path className={styles.line} d='M24 14 L24 8' stroke='#6b4a1f' />
      <path d='M24 10 Q31 5 36 9 Q30 14 24 10 Z' fill='#4a9e3f' />
      <circle cx='15.5' cy='19' r='5.2' fill='#6a3d9a' />
      <circle cx='24' cy='19' r='5.2' fill='#6a3d9a' />
      <circle cx='32.5' cy='19' r='5.2' fill='#6a3d9a' />
      <circle cx='19.75' cy='26.5' r='5.2' fill='#7d4cb0' />
      <circle cx='28.25' cy='26.5' r='5.2' fill='#7d4cb0' />
      <circle cx='24' cy='34' r='5.2' fill='#8b5cc0' />
    </>
  ),
  // Whole, never a slice: a wedge is the shape the banana already had to be rescued from.
  melon: (
    <>
      <path className={styles.line} d='M24 9 L24 5' stroke='#4a7a2a' />
      <circle cx='24' cy='25' r='16' fill='#5aa83a' />
      <path
        className={styles.line}
        d='M13.5 13 C10.5 18 10 32 13 37.5 M24 9 C22 17 22 33 24 41 M34.5 13 C37.5 18 38 32 35 37.5'
        stroke='#26602a'
      />
    </>
  ),
  // A sprig, not a heap: small berries under two leaves is how lingon differ from every
  // other red fruit in the set.
  lingon: (
    <>
      <path className={styles.line} d='M24 38 L24 12' stroke='#4a7a2a' />
      <ellipse cx='16' cy='16' rx='6.5' ry='4' transform='rotate(-25 16 16)' fill='#2f6b3a' />
      <ellipse cx='32' cy='16' rx='6.5' ry='4' transform='rotate(25 32 16)' fill='#2f6b3a' />
      <circle cx='17' cy='32' r='5.5' fill='#d81e05' />
      <circle cx='31' cy='32' r='5.5' fill='#d81e05' />
      <circle cx='24' cy='38' r='5.5' fill='#d81e05' />
      <circle className={styles.dot} cx='15' cy='30' r='1.3' fill='#f0645a' />
      <circle className={styles.dot} cx='29' cy='30' r='1.3' fill='#f0645a' />
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
  // Parallel sides read as a cylinder. Tilted so it is not a pill.
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
  // Husks hug the cob and taper up; flared at the bottom they were rocket fins.
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
  // Purple, and tapering to a root: beige it would be the potato with shoots on.
  onion: (
    <>
      <path className={styles.line} d='M22 13 C20 8 17 6 15 5 M24 13 L24 5 M26 13 C28 8 31 6 33 5' stroke='#3f8f4a' />
      <path d='M24 43 C14 40 10 34 10 26 C10 18 16 12 24 12 C32 12 38 18 38 26 C38 34 34 40 24 43 Z' fill='#c9a3d4' />
      <path className={styles.fine} d='M17 16 C14 22 14 34 19 41 M31 16 C34 22 34 34 29 41' stroke='#9b74ab' />
    </>
  ),
  pea: (
    <>
      <path className={styles.line} d='M7 25 L4 21' stroke='#2a6b33' />
      <path d='M7 25 C12 17 36 17 41 25 C36 33 12 33 7 25 Z' fill='#3f8f4a' />
      <circle cx='15' cy='25' r='5' fill='#8fd06a' />
      <circle cx='24' cy='25.5' r='5.4' fill='#8fd06a' />
      <circle cx='33' cy='25' r='5' fill='#8fd06a' />
    </>
  ),
  // Square shoulders and a dipped, lobed base — a round red thing with a green top is the
  // tomato, which is already in the set.
  paprika: (
    <>
      <path className={styles.line} d='M24 13 L24 6' stroke='#2a7d5f' />
      <path d='M18 11 Q24 8 30 11 Q31 13.5 29 14.5 L19 14.5 Q17 13.5 18 11 Z' fill='#2a9d8f' />
      <path
        d='M12 24 C12 17 17 13.5 24 13.5 C31 13.5 36 17 36 24 L36 29 C36 36 33 41 29.5 41 C27.5 41 27 38.5 24 38.5 C21 38.5 20.5 41 18.5 41 C15 41 12 36 12 29 Z'
        fill='#d81e05'
      />
      <path className={styles.fine} d='M17 22 Q19 18 23 17' stroke='#ef6a76' />
    </>
  ),
  mushroom: (
    <>
      <path d='M19 26 L29 26 L28 39 Q28 42 24 42 Q20 42 20 39 Z' fill='#f0e6d2' />
      <path d='M7 26 C7 16 14 9 24 9 C34 9 41 16 41 26 Z' fill='#d81e05' />
      <circle className={styles.dot} cx='16' cy='19' r='2.6' fill='#fff8ec' />
      <circle className={styles.dot} cx='25' cy='15' r='3' fill='#fff8ec' />
      <circle className={styles.dot} cx='33' cy='20' r='2.4' fill='#fff8ec' />
      <circle className={styles.dot} cx='21' cy='23' r='1.8' fill='#fff8ec' />
    </>
  ),
  // Veins radiating from the base say "one head of leaves". Without them it is the tree
  // crown with the trunk cropped off.
  lettuce: (
    <>
      <path
        d='M24 42 C12 42 6 34 8 24 C6 18 11 13 17 14 C18 9 24 7 28 10 C34 8 40 13 39 19 C43 24 41 34 33 39 Z'
        fill='#5aa83a'
      />
      <path
        className={styles.line}
        d='M24 42 C22 33 20 25 15 19 M24 42 C26 32 30 24 36 18 M24 42 L24 20'
        stroke='#3d8a26'
      />
    </>
  ),
  // Squat and ribbed under a stub stem; the melon is a true sphere with a thread of a stem.
  // Same drawing otherwise, and they would swap.
  pumpkin: (
    <>
      <path d='M21 12 Q24 6 27 12 L27 15 L21 15 Z' fill='#4a7a2a' />
      <ellipse cx='24' cy='28' rx='18' ry='14' fill='#f07c0a' />
      <path
        className={styles.line}
        d='M24 14 L24 42 M15 15.5 C12 21 12 35 15 40.5 M33 15.5 C36 21 36 35 33 40.5'
        stroke='#c25f06'
      />
    </>
  ),
  // Cabin set back from the bonnet, facing left. A single wedge reads as a bus.
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
  // The road vehicles share the car's wheel line so they read as one family. What separates
  // them is above it: the bus is the single wedge the car had to avoid being, the fire
  // engine carries a ladder, the tractor's back wheel is half the drawing.
  bus: (
    <>
      <path d='M5 34 L5 16 Q5 13 8 13 L40 13 Q43 13 43 16 L43 34 Z' fill='#fecc00' />
      <rect x='8.5' y='17' width='7' height='7' rx='1.5' fill='#bfe3f5' />
      <rect x='17.5' y='17' width='7' height='7' rx='1.5' fill='#bfe3f5' />
      <rect x='26.5' y='17' width='7' height='7' rx='1.5' fill='#bfe3f5' />
      <rect x='35' y='17' width='5.5' height='7' rx='1.5' fill='#bfe3f5' />
      <circle cx='14' cy='34' r='5.5' fill='#1c1c1c' />
      <circle cx='34' cy='34' r='5.5' fill='#1c1c1c' />
      <circle cx='14' cy='34' r='2.2' fill='#bfe3f5' />
      <circle cx='34' cy='34' r='2.2' fill='#bfe3f5' />
    </>
  ),
  train: (
    <>
      <rect x='8' y='10' width='7' height='9' rx='1' fill='#5a6470' />
      <path d='M5 34 L5 21 Q5 18 8 18 L26 18 L26 11 Q26 8 29 8 L39 8 Q42 8 42 11 L42 34 Z' fill='#c8102e' />
      <rect x='29' y='12' width='10' height='8' rx='1.5' fill='#bfe3f5' />
      <path className={styles.fine} d='M5 27 L26 27' stroke='#8f0b20' />
      <circle cx='11' cy='36' r='4.5' fill='#1c1c1c' />
      <circle cx='22' cy='36' r='4.5' fill='#1c1c1c' />
      <circle cx='35' cy='36' r='6' fill='#1c1c1c' />
      <circle cx='11' cy='36' r='1.8' fill='#bfe3f5' />
      <circle cx='22' cy='36' r='1.8' fill='#bfe3f5' />
      <circle cx='35' cy='36' r='2.4' fill='#bfe3f5' />
    </>
  ),
  // A sail, not a hull with a cabin: the hull alone is a shape, the sail is the word.
  boat: (
    <>
      <path className={styles.line} d='M24 32 L24 5' stroke='#6b4a1f' />
      <path d='M26 8 L38 27 L26 27 Z' fill='#f2f6fa' />
      <path d='M22 11 L11 27 L22 27 Z' fill='#d81e05' />
      <path d='M6 29 L42 29 L36 39 Q35 41 32 41 L16 41 Q13 41 12 39 Z' fill='#8a5a2b' />
    </>
  ),
  bicycle: (
    <>
      <circle cx='13' cy='31' r='9' fill='#ffffff' />
      <circle cx='35' cy='31' r='9' fill='#ffffff' />
      <path
        className={styles.fine}
        d='M13 22 L13 40 M4 31 L22 31 M6.6 24.6 L19.4 37.4 M19.4 24.6 L6.6 37.4 M35 22 L35 40 M26 31 L44 31 M28.6 24.6 L41.4 37.4 M41.4 24.6 L28.6 37.4'
        stroke='#9aa0a6'
      />
      <path
        className={styles.line}
        d='M13 31 L20 17 L30 17 L35 31 M20 17 L24 31 L35 31 M24 31 L13 31'
        stroke='#0057b8'
      />
      <path className={styles.line} d='M30 17 L32 13 M28.5 13 L35 13' stroke='#1c1c1c' />
      <path d='M16.5 14 L24 14 L22 17.5 L18 17.5 Z' fill='#1c1c1c' />
      <circle cx='24' cy='31' r='3' fill='#5a6470' />
    </>
  ),
  // Seen from above. In profile it is a fish with straight fins.
  plane: (
    <>
      <path
        d='M24 5 C26.5 5 28 10 28 18 L43 27 L43 31 L28 27 L28 34 L33 39 L33 42 L24 39.5 L15 42 L15 39 L20 34 L20 27 L5 31 L5 27 L20 18 C20 10 21.5 5 24 5 Z'
        fill='#0057b8'
      />
      <circle className={styles.dot} cx='24' cy='13' r='2.4' fill='#bfe3f5' />
    </>
  ),
  tractor: (
    <>
      <path d='M6 32 L6 22 Q6 20 8 20 L21 20 L21 11 Q21 9 24 9 L34 9 Q37 9 37 12 L37 32 Z' fill='#3f8f4a' />
      <rect x='24' y='12' width='10' height='8' rx='1.5' fill='#bfe3f5' />
      <circle cx='12' cy='32' r='6.5' fill='#1c1c1c' />
      <circle cx='32' cy='31' r='11' fill='#1c1c1c' />
      <circle cx='12' cy='32' r='2.6' fill='#d9d9d9' />
      <circle cx='32' cy='31' r='4.5' fill='#d9d9d9' />
    </>
  ),
  firetruck: (
    <>
      <rect x='9' y='12.5' width='7' height='3.5' rx='1.5' fill='#0057b8' />
      <path
        className={styles.line}
        d='M25 17 L42 17 M25 21 L42 21 M28 17 L28 21 M32 17 L32 21 M36 17 L36 21 M40 17 L40 21'
        stroke='#9aa0a6'
      />
      <path d='M4 34 L4 19 Q4 16 7 16 L18 16 Q21 16 22 19.5 L23.5 24 L41 24 Q44 24 44 27 L44 34 Z' fill='#c8102e' />
      <rect x='7.5' y='19.5' width='9.5' height='6.5' rx='1.5' fill='#bfe3f5' />
      <circle cx='13' cy='34' r='5.5' fill='#1c1c1c' />
      <circle cx='34' cy='34' r='5.5' fill='#1c1c1c' />
      <circle cx='13' cy='34' r='2.2' fill='#bfe3f5' />
      <circle cx='34' cy='34' r='2.2' fill='#bfe3f5' />
    </>
  ),

  // Nature and weather. The two clouds are the trap here: moln and regn draw the same
  // silhouette, so the rain cloud is grey and sized down to make room for the drops, and
  // the drops are the loudest thing in it.
  sun: (
    <>
      <circle cx='24' cy='24' r='10' fill='#fecc00' />
      <path
        className={styles.line}
        d='M24 12 L24 6 M24 36 L24 42 M12 24 L6 24 M36 24 L42 24 M15.5 15.5 L11.3 11.3 M32.5 32.5 L36.7 36.7 M15.5 32.5 L11.3 36.7 M32.5 15.5 L36.7 11.3'
        stroke='#f0a500'
      />
    </>
  ),
  // Craters, because a pale crescent on its own is the banana silhouette.
  moon: (
    <>
      <path
        d='M31 5 C20 8 12 15 12 24.5 C12 34 20 42 30 42 C33.5 42 36.5 41.2 39 39.8 C28 37.5 21 31 21 23.5 C21 15.5 25 9 31 5 Z'
        fill='#e8e4d0'
      />
      <circle className={styles.dot} cx='17' cy='22' r='2.2' fill='#c2bda4' />
      <circle className={styles.dot} cx='16' cy='30' r='1.2' fill='#c2bda4' />
      <circle className={styles.dot} cx='20.5' cy='33' r='1.5' fill='#c2bda4' />
    </>
  ),
  // Five solid points against the sun's disc-and-rays, so the two never trade places.
  star: (
    <path
      d='M24 6 L28.2 18.2 L41.1 18.4 L30.9 26.2 L34.6 38.6 L24 31.2 L13.4 38.6 L17.2 26.2 L6.9 18.4 L19.8 18.2 Z'
      fill='#fecc00'
    />
  ),
  cloud: (
    <>
      <path
        d='M14 36 C9.6 36 6 32.4 6 28 C6 23.6 9.6 20 14 20 C14.7 13.7 20 8.8 26.5 8.8 C33.2 8.8 38.7 14 39.2 20.6 C41 22 42 24.3 42 26.8 C42 31.9 37.9 36 32.8 36 Z'
        fill='#f2f6fa'
      />
      <path className={styles.fine} d='M13 31.5 Q18 28 25 28.6' stroke='#c3ccd6' />
    </>
  ),
  rain: (
    <>
      <path
        d='M15 28 C10.6 28 7 24.7 7 20.6 C7 16.6 10.4 13.2 14.4 13.2 C15 8.4 19.1 4.6 24 4.6 C28.9 4.6 33 8.4 33.6 13.2 C37.6 13.2 41 16.6 41 20.6 C41 24.7 37.4 28 33 28 Z'
        fill='#b9c4d0'
      />
      <path d='M15 31 C12 35 11.5 38.2 15 39.2 C18.5 38.2 18 35 15 31 Z' fill='#4a9fe0' />
      <path d='M24 33 C21 37 20.5 40.2 24 41.2 C27.5 40.2 27 37 24 33 Z' fill='#4a9fe0' />
      <path d='M33 31 C30 35 29.5 38.2 33 39.2 C36.5 38.2 36 35 33 31 Z' fill='#4a9fe0' />
    </>
  ),
  // Six arms and blue line work: the star is five solid yellow points, and stays one.
  snow: (
    <path
      className={styles.line}
      d='M24 7 L24 41 M38.7 15.5 L9.3 32.5 M9.3 15.5 L38.7 32.5 M24 12 L20 7.5 M24 12 L28 7.5 M24 36 L20 40.5 M24 36 L28 40.5 M34.4 18 L40.3 19.2 M34.4 18 L36.3 12.3 M13.6 30 L7.7 28.8 M13.6 30 L11.7 35.7 M13.6 18 L7.7 19.2 M13.6 18 L11.7 12.3 M34.4 30 L40.3 28.8 M34.4 30 L36.3 35.7'
      stroke='#3f8fc4'
    />
  ),
  // Trunk first so the crown overlaps its top. A scalloped crown, not a green ball, or it
  // is the same drawing as a single leaf scaled up.
  tree: (
    <>
      <path d='M21 43 L21 27 L27 27 L27 43 Z' fill='#8a5a2b' />
      <path
        d='M24 5 C30 5 34 8 35.5 12 C39.5 13 42 17 42 21.5 C42 27.5 36.5 32 29 32 L19 32 C11.5 32 6 27.5 6 21.5 C6 17 8.5 13 12.5 12 C14 8 18 5 24 5 Z'
        fill='#3f8f4a'
      />
    </>
  ),
  // The midrib and its herringbone veins are what say "one leaf" rather than "small bush".
  leaf: (
    <>
      <path className={styles.line} d='M12 39 L7 43' stroke='#6b4a1f' />
      <path d='M38 9 C38 25 27 37 12 39 C12 23 23 11 38 9 Z' fill='#4a9e3f' />
      <path className={styles.line} d='M12 39 L38 9' stroke='#2a6b33' />
      <path
        className={styles.fine}
        d='M18.5 31.5 L22 34.5 M25 24 L28.5 27 M31.5 16.5 L35 19.5 M18.5 31.5 L15 28.5 M25 24 L21.5 21 M31.5 16.5 L28 13.5'
        stroke='#2a6b33'
      />
    </>
  ),
  flower: (
    <>
      <path className={styles.line} d='M24 28 L24 43' stroke='#3f8f4a' />
      <path d='M24 36 C19 33 15 34 13.5 37 C17 40 22 39.5 24 36 Z' fill='#3f8f4a' />
      <circle cx='24' cy='11.5' r='6.5' fill='#f07cb0' />
      <circle cx='32.1' cy='17.4' r='6.5' fill='#f07cb0' />
      <circle cx='29' cy='26.9' r='6.5' fill='#f07cb0' />
      <circle cx='19' cy='26.9' r='6.5' fill='#f07cb0' />
      <circle cx='15.9' cy='17.4' r='6.5' fill='#f07cb0' />
      <circle cx='24' cy='20' r='5' fill='#fecc00' />
    </>
  ),
  // Flat facets and no eyes: the potato is the smooth blob with dots in it.
  stone: (
    <>
      <path d='M8 36 L13 22 L24 15 L36 19 L41 31 L37 39 L14 39 Z' fill='#9aa2a8' />
      <path className={styles.fine} d='M13 22 L22 28 L41 31 M22 28 L20 39' stroke='#6f767c' />
    </>
  ),

  // Kitchen. Drawn face-on rather than in perspective: a child reads a circle-on-a-body as
  // a pot, and a tilted ellipse as a bowl of something unclear.
  gryta: (
    <>
      <path d='M6 18 L10 18 L10 24 L6 24 Z M38 18 L42 18 L42 24 L38 24 Z' fill='#8a8a8a' />
      <path d='M9 18 L39 18 L36 40 Q35 43 32 43 L16 43 Q13 43 12 40 Z' fill='#5a6470' />
      <rect x='7' y='13' width='34' height='5' rx='2.5' fill='#7a8590' />
      <rect x='20' y='8' width='8' height='5' rx='2.5' fill='#5a6470' />
      <path className={styles.fine} d='M15 24 Q24 27 33 24' stroke='#8b96a3' />
    </>
  ),
  tallrik: (
    <>
      <ellipse cx='24' cy='26' rx='19' ry='14' fill='#ffffff' />
      <ellipse cx='24' cy='25' rx='12' ry='8.5' fill='#f2ece2' />
      <path className={styles.fine} d='M12 20 Q18 15 27 14' stroke='#d8d0c4' />
    </>
  ),
  gaffel: (
    <>
      <path d='M14 6 L16 6 L16 17 L14 17 Z M20 6 L22 6 L22 17 L20 17 Z M26 6 L28 6 L28 17 L26 17 Z' fill='#c9cfd6' />
      <path d='M13 16 L29 16 Q29 23 24 24 L24 42 Q24 44 21 44 Q18 44 18 42 L18 24 Q13 23 13 16 Z' fill='#c9cfd6' />
    </>
  ),
  sked: (
    <>
      <ellipse cx='21' cy='13' rx='9' ry='11' fill='#c9cfd6' />
      <ellipse className={styles.dot} cx='21' cy='13' rx='5.5' ry='7' fill='#e4e9ee' />
      <path d='M18 23 L24 23 L26 42 Q26 44 22 44 Q18 44 18.5 42 Z' fill='#c9cfd6' />
    </>
  ),
  kniv: (
    <>
      <path d='M16 5 Q30 8 30 22 L30 26 L18 26 L18 6 Z' fill='#dfe4ea' />
      <path className={styles.fine} d='M22 9 Q26 14 26 24' stroke='#b6bec7' />
      <path d='M17 26 L31 26 L29 43 Q29 45 24 45 Q19 45 19 43 Z' fill='#6b4a2a' />
    </>
  ),

  // Dishes. One recognisable feature each, since a plate of food at 44px is otherwise a
  // brown circle: spaghetti has strands, pizza a slice cut, sushi its black band.
  spagetti: (
    <>
      <ellipse cx='24' cy='28' rx='19' ry='14' fill='#ffffff' />
      <ellipse cx='24' cy='27' rx='14' ry='10' fill='#fecc00' />
      <path
        className={styles.fine}
        d='M12 26 Q19 21 27 25 M13 30 Q21 25 33 28 M15 33 Q23 29 35 31 M17 22 Q25 19 33 23'
        stroke='#d9a800'
      />
      <circle cx='21' cy='24' r='3.5' fill='#d1495b' />
      <circle cx='29' cy='30' r='3' fill='#d1495b' />
    </>
  ),
  falukorv: (
    <>
      <rect x='5' y='19' width='38' height='13' rx='6.5' fill='#c0504a' />
      <path className={styles.fine} d='M14 22.5 L14 28.5 M22 22 L22 29 M30 22.5 L30 28.5' stroke='#9c3b36' />
      <path d='M5 25.5 L2 22 L2 29 Z' fill='#9c3b36' />
    </>
  ),
  blodpudding: (
    <>
      <ellipse cx='24' cy='30' rx='18' ry='12' fill='#ffffff' />
      <path d='M10 30 L24 21 L38 30 L24 37 Z' fill='#4a2c33' />
      <path d='M10 30 L24 21 L24 26 L14 33 Z' fill='#5e3a42' />
      <circle cx='30' cy='24' r='3' fill='#d1495b' />
      <circle cx='35' cy='27' r='2.4' fill='#d1495b' />
      <circle cx='32' cy='30' r='2.2' fill='#d1495b' />
    </>
  ),
  pizza: (
    <>
      <path d='M24 6 L44 40 Q24 46 4 40 Z' fill='#e8a33d' />
      <path d='M24 12 L39 38 Q24 42 9 38 Z' fill='#f2c14e' />
      <circle cx='24' cy='24' r='3.4' fill='#d1495b' />
      <circle cx='16' cy='32' r='3.2' fill='#d1495b' />
      <circle cx='32' cy='33' r='3' fill='#d1495b' />
      <circle className={styles.dot} cx='27' cy='32' r='1.6' fill='#2a9d8f' />
      <circle className={styles.dot} cx='20' cy='23' r='1.5' fill='#2a9d8f' />
    </>
  ),
  sushi: (
    <>
      <rect x='9' y='16' width='30' height='22' rx='4' fill='#ffffff' />
      <rect x='18' y='16' width='12' height='22' fill='#1c3b2f' />
      <ellipse cx='24' cy='16' rx='15' ry='5' fill='#f7f3ec' />
      <ellipse cx='24' cy='16' rx='6' ry='3.4' fill='#e8763d' />
    </>
  ),
  kanelbullar: (
    <>
      <ellipse cx='24' cy='27' rx='16' ry='14' fill='#d9a05b' />
      <path
        className={styles.line}
        d='M24 27 Q24 19 31 19 Q39 19 38 28 Q37 39 24 39 Q11 39 11 27 Q11 15 24 15'
        stroke='#8a5a2b'
      />
      <circle className={styles.dot} cx='19' cy='22' r='1.3' fill='#fff8ec' />
      <circle className={styles.dot} cx='29' cy='23' r='1.3' fill='#fff8ec' />
      <circle className={styles.dot} cx='24' cy='33' r='1.3' fill='#fff8ec' />
      <circle className={styles.dot} cx='16' cy='30' r='1.2' fill='#fff8ec' />
    </>
  ),

  // The body. A hand and a foot stand alone, but a nose or an ear floating in the frame is
  // a shape nobody can name — so the four face parts are drawn on the same pale face with
  // the other features ghosted, and only the named one in colour. Eyes and ears are drawn
  // as the pair even though öga and öra are singular: one of two, greyed, reads as damage.
  hand: (
    <>
      <rect x='16' y='6' width='5.5' height='20' rx='2.75' fill='#f2c9a0' />
      <rect x='22.2' y='4' width='5.5' height='22' rx='2.75' fill='#f2c9a0' />
      <rect x='28.4' y='6.5' width='5.5' height='20' rx='2.75' fill='#f2c9a0' />
      <rect x='34' y='11' width='5.2' height='16' rx='2.6' fill='#f2c9a0' />
      <rect x='9' y='19' width='5.2' height='13' rx='2.6' transform='rotate(-30 11.6 25.5)' fill='#f2c9a0' />
      <path d='M14 24 L38 24 L38 33 C38 39 33 43 27 43 L23 43 C17 43 14 39 14 33 Z' fill='#f2c9a0' />
    </>
  ),
  foot: (
    <>
      <circle cx='15' cy='13' r='3.6' fill='#f2c9a0' />
      <circle cx='22' cy='10' r='3.2' fill='#f2c9a0' />
      <circle cx='28.5' cy='10.5' r='2.9' fill='#f2c9a0' />
      <circle cx='34' cy='13' r='2.6' fill='#f2c9a0' />
      <circle cx='38.5' cy='16.5' r='2.3' fill='#f2c9a0' />
      <path
        d='M14 18 C14 13.5 38 13.5 38 19.5 C38 25 32 27.5 30.5 32 C29 37 29.5 43 23 43 C16.5 43 14 37.5 15 32 C16 26.5 14 22 14 18 Z'
        fill='#f2c9a0'
      />
    </>
  ),
  eye: (
    <>
      <ellipse cx='9.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <ellipse cx='38.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <circle cx='24' cy='24' r='15' fill='#f7e2c0' />
      <path className={styles.fine} d='M24 22 L24 27 Q26 28.5 27.5 27 M18 32 Q24 35.5 30 32' stroke='#dcc39c' />
      <ellipse cx='18.5' cy='21' rx='5' ry='3.8' fill='#ffffff' />
      <ellipse cx='29.5' cy='21' rx='5' ry='3.8' fill='#ffffff' />
      <circle cx='18.5' cy='21' r='2.5' fill='#3fa7d6' />
      <circle cx='29.5' cy='21' r='2.5' fill='#3fa7d6' />
      <circle className={styles.eye} cx='18.5' cy='21' r='1.3' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29.5' cy='21' r='1.3' fill='#1c1c1c' />
      <path className={styles.line} d='M13.8 15 Q18.5 12.6 23.2 15 M24.8 15 Q29.5 12.6 34.2 15' stroke='#6b4a1f' />
    </>
  ),
  nose: (
    <>
      <ellipse cx='9.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <ellipse cx='38.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <circle cx='24' cy='24' r='15' fill='#f7e2c0' />
      <ellipse className={styles.dot} cx='18.5' cy='19' rx='2.6' ry='1.9' fill='#e4cba6' />
      <ellipse className={styles.dot} cx='29.5' cy='19' rx='2.6' ry='1.9' fill='#e4cba6' />
      <path className={styles.fine} d='M18 34 Q24 37 30 34' stroke='#dcc39c' />
      <path
        d='M24 14 C21 20 19 26 19.5 29 C20 32.2 22 33.4 24 33.4 C26 33.4 28 32.2 28.5 29 C29 26 27 20 24 14 Z'
        fill='#eec6a0'
      />
      <ellipse className={styles.dot} cx='21.6' cy='30' rx='1.7' ry='1.2' fill='#8a5a2b' />
      <ellipse className={styles.dot} cx='26.4' cy='30' rx='1.7' ry='1.2' fill='#8a5a2b' />
    </>
  ),
  mouth: (
    <>
      <ellipse cx='9.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <ellipse cx='38.5' cy='24' rx='3.5' ry='5' fill='#ecd6b4' />
      <circle cx='24' cy='24' r='15' fill='#f7e2c0' />
      <ellipse className={styles.dot} cx='18.5' cy='18' rx='2.6' ry='1.9' fill='#e4cba6' />
      <ellipse className={styles.dot} cx='29.5' cy='18' rx='2.6' ry='1.9' fill='#e4cba6' />
      <path className={styles.fine} d='M24 21 L24 25 Q25.6 26.2 26.8 25' stroke='#dcc39c' />
      <path d='M13 30 Q24 25.5 35 30 Q30 39.5 24 39.5 Q18 39.5 13 30 Z' fill='#c8102e' />
      <path d='M16.5 30.4 Q24 28.2 31.5 30.4 L30.6 33.2 L17.4 33.2 Z' fill='#ffffff' />
      <path className={styles.fine} d='M20 29.4 L20 33.2 M24 28.9 L24 33.2 M28 29.4 L28 33.2' stroke='#c9c9c9' />
    </>
  ),
  ear: (
    <>
      <ellipse cx='10' cy='24' rx='4.5' ry='6.5' fill='#eec6a0' />
      <ellipse cx='38' cy='24' rx='4.5' ry='6.5' fill='#eec6a0' />
      <circle cx='24' cy='24' r='15' fill='#f7e2c0' />
      <ellipse className={styles.dot} cx='18.5' cy='19' rx='2.6' ry='1.9' fill='#e4cba6' />
      <ellipse className={styles.dot} cx='29.5' cy='19' rx='2.6' ry='1.9' fill='#e4cba6' />
      <path className={styles.fine} d='M24 22 L24 26 Q25.6 27.2 26.8 26 M18 32 Q24 35.5 30 32' stroke='#dcc39c' />
      <path className={styles.line} d='M11 20.5 C7.8 21.8 7.8 26.2 11 27.5' stroke='#b98a5c' />
      <path className={styles.line} d='M37 20.5 C40.2 21.8 40.2 26.2 37 27.5' stroke='#b98a5c' />
    </>
  ),
  tooth: (
    <>
      <path
        d='M14 12 C18 8 30 8 34 12 C37 15 37 22 35 29 C33.5 35 33 41 30 41 C27 41 26.5 33 24 33 C21.5 33 21 41 18 41 C15 41 14.5 35 13 29 C11 22 11 15 14 12 Z'
        fill='#ffffff'
      />
      <path className={styles.fine} d='M18 16 Q24 13.6 30 16' stroke='#c9c9c9' />
    </>
  ),

  // Clothes. jacket and jumper are the same outline, so one has a zip, a collar and
  // pockets and the other a round neck and a ribbed hem, in different colours. mitten and
  // sock likewise: the thumb against the heel.
  hat: (
    <>
      <path d='M14 27 C13 18 17 11 24 11 C31 11 35 18 34 27 Z' fill='#8a5a2b' />
      <ellipse cx='24' cy='29' rx='19' ry='5.5' fill='#a9763f' />
      <path d='M13.6 23 Q24 20.5 34.4 23 L34.6 26.5 Q24 24 13.4 26.5 Z' fill='#5c3a17' />
    </>
  ),
  beanie: (
    <>
      <circle cx='24' cy='8' r='4' fill='#e8546b' />
      <path d='M9 32 C9 20 15 11 24 11 C33 11 39 20 39 32 Z' fill='#c8102e' />
      <path
        className={styles.fine}
        d='M16 15 C15 21 14.5 27 14.5 32 M24 11.5 L24 32 M32 15 C33 21 33.5 27 33.5 32'
        stroke='#8f0b20'
      />
      <path d='M7 31 L41 31 Q43 31 43 34 L43 37 Q43 40 40 40 L8 40 Q5 40 5 37 L5 34 Q5 31 7 31 Z' fill='#e8546b' />
      <path
        className={styles.fine}
        d='M12 32 L12 39 M18 32 L18 39 M24 32 L24 39 M30 32 L30 39 M36 32 L36 39'
        stroke='#c04055'
      />
    </>
  ),
  jacket: (
    <>
      <path d='M17 12 L10 16 L5 22 L10 27 L13 24 L13 41 L35 41 L35 24 L38 27 L43 22 L38 16 L31 12 Z' fill='#0057b8' />
      <path className={styles.line} d='M24 15 L24 41' stroke='#d9d9d9' />
      <path d='M17 12 L24 18.5 L31 12 L27.5 11 L24 14.5 L20.5 11 Z' fill='#003a69' />
      <rect x='15' y='30' width='6' height='4' rx='1' fill='#003a69' />
      <rect x='27' y='30' width='6' height='4' rx='1' fill='#003a69' />
    </>
  ),
  jumper: (
    <>
      <path
        d='M18 12 L10 16 L5 23 L11 28 L14 25 L14 41 L34 41 L34 25 L37 28 L43 23 L38 16 L30 12 C29 16.5 19 16.5 18 12 Z'
        fill='#3f8f4a'
      />
      <path className={styles.fine} d='M16 22 L32 22 M16 25 L32 25' stroke='#2a6b33' />
      <path d='M14 36.5 L34 36.5 L34 41 L14 41 Z' fill='#2a6b33' />
      <path className={styles.fine} d='M18 37 L18 41 M23 37 L23 41 M28 37 L28 41' stroke='#1f5226' />
    </>
  ),
  shoes: (
    <>
      <path d='M14 15 C18 15 20 19 21 23 L32 28 C35 29.5 35 34 31 34 L18 34 C14.5 34 13 31 13 27 Z' fill='#8f0b20' />
      <path d='M11 23 C15 23 17 27 18 31 L29 36 C32 37.5 32 42 28 42 L15 42 C11.5 42 10 39 10 35 Z' fill='#c8102e' />
      <path className={styles.fine} d='M15.5 31 L21 33.5 M16 27.5 L21.5 30' stroke='#ffffff' />
    </>
  ),
  trousers: (
    <>
      <path d='M13 12 L35 12 L33 42 L25.5 42 L24 24 L22.5 42 L15 42 Z' fill='#2b5583' />
      <path d='M12.5 9 L35.5 9 L35.5 15 L12.5 15 Z' fill='#1e3a5f' />
      <path className={styles.fine} d='M18 20 L18 26 M30 20 L30 26' stroke='#1e3a5f' />
    </>
  ),
  mitten: (
    <>
      <path d='M14 20 C9 20 6 24 7 28 C8 31 12 32 14 30 Z' fill='#c8102e' />
      <path d='M14 14 C14 8 34 8 34 16 L34 33 L14 33 Z' fill='#c8102e' />
      <path
        d='M12 32 L36 32 Q38 32 38 35 L38 39 Q38 42 35 42 L13 42 Q10 42 10 39 L10 35 Q10 32 12 32 Z'
        fill='#e8546b'
      />
      <path className={styles.fine} d='M15 33 L15 41 M21 33 L21 41 M27 33 L27 41 M33 33 L33 41' stroke='#c04055' />
    </>
  ),
  sock: (
    <>
      <path
        d='M16 12 L30 12 L30 27 C30 30 32 32 36 33 C40 34 41 40.5 36.5 40.5 L23 40.5 C18.5 40.5 16 37 16 32 Z'
        fill='#0057b8'
      />
      <path d='M30 33 C34 34 36 36.5 36.8 39.5 L28.5 39.5 C28.5 36.5 29 34 30 33 Z' fill='#003a69' />
      <path d='M15 9 L31 9 L31 15 L15 15 Z' fill='#e8546b' />
      <path className={styles.fine} d='M15 12 L31 12' stroke='#c04055' />
    </>
  ),
  // Whole animal in profile, long neck: a head alone is a lizard.
  dinosaur: (
    <>
      <path d='M13 30 Q6 31 3 25 Q6 35 16 35 Z' fill='#4a9e4a' />
      <rect x='14' y='32' width='5' height='10' rx='2' fill='#3b843b' />
      <rect x='27' y='32' width='5' height='10' rx='2' fill='#3b843b' />
      <ellipse cx='22' cy='29' rx='12' ry='8.5' fill='#5cb85c' />
      <path d='M29 25 Q33 14 35 8 L41 9.5 Q37 18 34 31 Z' fill='#5cb85c' />
      <ellipse cx='39' cy='9' rx='5.5' ry='3.8' fill='#5cb85c' />
      <circle className={styles.dot} cx='17' cy='25' r='1.8' fill='#9ad89a' />
      <circle className={styles.dot} cx='23' cy='23.5' r='1.8' fill='#9ad89a' />
      <circle className={styles.dot} cx='28' cy='26' r='1.5' fill='#9ad89a' />
      <circle cx='40' cy='7.8' r='1.7' fill='#ffffff' />
      <circle className={styles.eye} cx='40.4' cy='7.8' r='0.9' fill='#1c1c1c' />
      <path className={styles.line} d='M41 11 Q42.5 11.5 44 10.5' stroke='#1c1c1c' />
    </>
  ),
  crown: (
    <>
      <path d='M8 35 L8 15 L16 25 L24 9 L32 25 L40 15 L40 35 Z' fill='#ffd400' />
      <rect x='8' y='31' width='32' height='7' rx='1.5' fill='#f0b400' />
      <circle cx='8' cy='14' r='2.2' fill='#ffd400' />
      <circle cx='24' cy='8' r='2.2' fill='#ffd400' />
      <circle cx='40' cy='14' r='2.2' fill='#ffd400' />
      <circle cx='16' cy='34.5' r='2' fill='#d81e05' />
      <circle cx='24' cy='34.5' r='2' fill='#0057b8' />
      <circle cx='32' cy='34.5' r='2' fill='#d81e05' />
    </>
  ),
  // A whole bear sitting, with a bow: `bear` is the head alone.
  teddy: (
    <>
      <circle cx='15' cy='9' r='4' fill='#a8703a' />
      <circle cx='33' cy='9' r='4' fill='#a8703a' />
      <ellipse cx='10.5' cy='29' rx='4' ry='6' fill='#a8703a' />
      <ellipse cx='37.5' cy='29' rx='4' ry='6' fill='#a8703a' />
      <ellipse cx='16' cy='39.5' rx='5.5' ry='4' fill='#a8703a' />
      <ellipse cx='32' cy='39.5' rx='5.5' ry='4' fill='#a8703a' />
      <ellipse cx='24' cy='31' rx='10.5' ry='10' fill='#c8894a' />
      <ellipse cx='24' cy='33' rx='6' ry='6' fill='#ecc999' />
      <circle cx='24' cy='16' r='10' fill='#c8894a' />
      <ellipse cx='24' cy='19.5' rx='4.5' ry='3.5' fill='#ecc999' />
      <ellipse cx='24' cy='18.2' rx='1.7' ry='1.2' fill='#1c1c1c' />
      <path
        className={styles.line}
        d='M24 19.5 L24 21 M24 21 Q22 22 21.5 20.8 M24 21 Q26 22 26.5 20.8'
        stroke='#1c1c1c'
      />
      <circle cx='20' cy='13.5' r='2' fill='#ffffff' />
      <circle cx='28' cy='13.5' r='2' fill='#ffffff' />
      <circle className={styles.eye} cx='20' cy='13.7' r='1.1' fill='#1c1c1c' />
      <circle className={styles.eye} cx='28' cy='13.7' r='1.1' fill='#1c1c1c' />
      <path d='M24 26 L18 23 L18 29 Z M24 26 L30 23 L30 29 Z' fill='#d81e05' />
      <circle cx='24' cy='26' r='1.8' fill='#d81e05' />
    </>
  ),
  balloon: (
    <>
      <path className={styles.line} d='M24 32 Q20 36 24 39 Q28 42 24 45' stroke='#1c1c1c' />
      <path d='M24 30 L21.5 33.5 L26.5 33.5 Z' fill='#b81804' />
      <ellipse cx='24' cy='17' rx='11' ry='13.5' fill='#d81e05' />
      <path className={styles.fine} d='M17 11 Q18 7 21.5 6' stroke='#ffffff' />
    </>
  ),
  // Prinsesstårta: the green marzipan dome and the pink rose make it Swedish.
  cake: (
    <>
      <ellipse cx='24' cy='40' rx='19' ry='3.5' fill='#ffffff' />
      <path d='M7 38 L7 33 Q7 13 24 13 Q41 13 41 33 L41 38 Z' fill='#8fce7a' />
      <path className={styles.fine} d='M7 33 Q24 36 41 33' stroke='#5e9e4c' />
      <circle className={styles.dot} cx='15' cy='24' r='0.9' fill='#ffffff' />
      <circle className={styles.dot} cx='31' cy='22' r='0.9' fill='#ffffff' />
      <circle className={styles.dot} cx='22' cy='29' r='0.9' fill='#ffffff' />
      <circle className={styles.dot} cx='35' cy='29' r='0.9' fill='#ffffff' />
      <path d='M18 13 Q20 9 24 12 Z M30 13 Q28 9 24 12 Z' fill='#3b843b' />
      <circle cx='24' cy='10' r='4.5' fill='#f07cb0' />
      <path className={styles.fine} d='M22 10 Q24 7.5 26 10 Q24 12 22.5 10.5' stroke='#b8487e' />
    </>
  ),
  icecream: (
    <>
      <path d='M15 23 L33 23 L24 45 Z' fill='#e0a85a' />
      <path className={styles.fine} d='M18 27 L28 37 M22 25 L30 31 M30 27 L20 37 M26 25 L18 31' stroke='#a8743a' />
      <circle cx='24' cy='19' r='9' fill='#f7a8c4' />
      <circle cx='24' cy='10' r='7' fill='#fff4e0' />
      <circle cx='26.5' cy='3.5' r='2.5' fill='#d81e05' />
    </>
  ),
  // A wrapped sweet: the twisted ends are the whole identity.
  candy: (
    <>
      <path d='M15 24 L5 16 L7 24 L5 32 Z' fill='#c49be8' />
      <path d='M33 24 L43 16 L41 24 L43 32 Z' fill='#c49be8' />
      <ellipse cx='24' cy='24' rx='11' ry='8.5' fill='#8f4fd0' />
      <path
        className={styles.fine}
        d='M19 16.5 Q16 24 19 31.5 M24 15.5 Q21 24 24 32.5 M29 16.5 Q26 24 29 31.5'
        stroke='#ffffff'
      />
    </>
  ),
};

type Props = {
  icon: string;
  size?: number;
};

export function GameIcon({ icon, size = 56 }: Props) {
  if (icon.startsWith(COLOR_ICON_PREFIX)) {
    const fill = GAME_COLORS[icon.slice(COLOR_ICON_PREFIX.length) as GameColorId];
    if (!fill) return null;
    return (
      <svg className={styles.icon} width={size} height={size} viewBox='0 0 48 48' aria-hidden='true'>
        {
          /* Square, not circle: more colour to judge. 2px outline so light swatches
            separate from the card. */
        }
        <rect x='7' y='7' width='34' height='34' rx='9' fill={fill} stroke='#1c1c1c' strokeWidth={2} />
      </svg>
    );
  }

  const shape = OBJECT_ICONS[icon as ObjectIconId];
  if (!shape) return null;

  return (
    <svg className={styles.icon} width={size} height={size} viewBox='0 0 48 48' aria-hidden='true'>
      {shape}
    </svg>
  );
}
