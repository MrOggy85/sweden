import type { ReactNode } from 'react';
import type { ColorId } from '../data/pages';
import { COLORS } from '../data/pages';
import styles from './GameIcons.module.css';

// Inline SVG icons for the connect-the-words game, drawn in the same outline style as
// Avatar.tsx (fixed colours here, rather than currentColor, because each object has an
// expected colour a child will recognise it by).
//
// `color-<name>` icons are handled separately below as plain high-contrast swatches rather
// than hand-drawn shapes, so a new colour pair never needs a new icon.
const COLOR_ICON_PREFIX = 'color-';

const OBJECT_ICONS: Record<string, ReactNode> = {
  cow: (
    <>
      <path d='M14 18 L10 10 L17 15 Z M34 18 L38 10 L31 15 Z' fill='#ffffff' />
      <ellipse cx='24' cy='28' rx='13' ry='12' fill='#ffffff' />
      <ellipse cx='17' cy='23' rx='4' ry='5' fill='#1c1c1c' />
      <ellipse cx='30' cy='31' rx='5' ry='4' fill='#1c1c1c' />
      <ellipse cx='24' cy='35' rx='5' ry='3' fill='#f3b6c1' />
      <circle className={styles.eye} cx='19' cy='27' r='1.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='27' r='1.6' fill='#1c1c1c' />
    </>
  ),
  dog: (
    <>
      <path d='M13 20 Q8 26 12 34 Q16 30 16 22 Z M35 20 Q40 26 36 34 Q32 30 32 22 Z' fill='#8a5a2b' />
      <ellipse cx='24' cy='29' rx='12' ry='12' fill='#c88b4a' />
      <ellipse cx='24' cy='35' rx='3' ry='2.2' fill='#1c1c1c' />
      <circle className={styles.eye} cx='19' cy='27' r='1.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='27' r='1.6' fill='#1c1c1c' />
    </>
  ),
  cat: (
    <>
      <path d='M13 17 L16 9 L21 18 Z M35 17 L32 9 L27 18 Z' fill='#e8a33d' />
      <ellipse cx='24' cy='29' rx='12' ry='11' fill='#e8a33d' />
      <path
        className={styles.line}
        d='M24 31 L24 33 M24 33 L17 31 M24 33 L31 31 M24 33 L17 36 M24 33 L31 36'
        stroke='#1c1c1c'
      />
      <path d='M24 31 L21.5 28 L26.5 28 Z' fill='#1c1c1c' />
      <circle className={styles.eye} cx='19' cy='26' r='1.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='26' r='1.6' fill='#1c1c1c' />
    </>
  ),
  horse: (
    <>
      <path className={styles.line} d='M14 16 Q24 7 34 16' stroke='#5c3a17' />
      <path d='M14 16 L10 10 L17 14 Z M34 16 L38 10 L31 14 Z' fill='#a9682f' />
      <ellipse cx='24' cy='29' rx='11' ry='13' fill='#a9682f' />
      <circle className={styles.eye} cx='19' cy='27' r='1.6' fill='#1c1c1c' />
      <circle className={styles.eye} cx='29' cy='27' r='1.6' fill='#1c1c1c' />
    </>
  ),
  bird: (
    <>
      <path className={styles.line} d='M12 30 Q18 37 27 34' stroke='#2b7fa8' />
      <circle cx='24' cy='27' r='13' fill='#3fa7d6' />
      <path d='M24 28 L38 32 L24 34 Z' fill='#f2a53c' />
      <circle className={styles.eye} cx='19' cy='22' r='1.8' fill='#1c1c1c' />
    </>
  ),
  apple: (
    <>
      <path className={styles.line} d='M24 15 L25 8' stroke='#5c3a17' />
      <path d='M25 9 Q31 7 30 14 Q25 15 25 9 Z' fill='#2a9d8f' />
      <circle cx='24' cy='29' r='13' fill='#d1495b' />
    </>
  ),
  banana: (
    <>
      <path
        d='M14 33 Q13 15 30 10 Q35 9 33 13 Q21 16 21 33 Q21 39 12 37 Q9 35 14 33 Z'
        fill='#fecc00'
      />
    </>
  ),
  car: (
    <>
      <path d='M6 31 L10 20 Q14 16 22 16 L28 16 Q36 16 40 23 L42 31 Z' fill='#005293' />
      <rect x='15' y='19' width='9' height='8' rx='1' fill='#bfe3f5' />
      <rect x='26' y='19' width='9' height='8' rx='1' fill='#bfe3f5' />
      <circle cx='14' cy='32' r='4.5' fill='#1c1c1c' />
      <circle cx='34' cy='32' r='4.5' fill='#1c1c1c' />
    </>
  ),
};

type Props = {
  icon: string;
  size?: number;
};

export function GameIcon({ icon, size = 56 }: Props) {
  if (icon.startsWith(COLOR_ICON_PREFIX)) {
    const colorId = icon.slice(COLOR_ICON_PREFIX.length) as ColorId;
    const fill = COLORS[colorId] ?? '#1c1c1c';
    return (
      <svg className={styles.icon} width={size} height={size} viewBox='0 0 48 48' aria-hidden='true'>
        <circle cx='24' cy='24' r='18' fill={fill} stroke='#1c1c1c' strokeWidth={1.5} />
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
