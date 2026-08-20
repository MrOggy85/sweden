import type { ReactNode } from 'react';
import type { AnimalId } from '../data/pages';
import { COLORS } from '../data/pages';
import type { Avatar as AvatarShape } from '../data/types';
import styles from './Avatar.module.css';

// Simple geometric silhouettes rather than drawings — same outline trick as the rest of
// the UI, so no image assets are needed and any colour works.
//
// styles.line marks strokes that must not be filled (antlers, whiskers, hair).
const SHAPES: Record<AnimalId, ReactNode> = {
  'moose': (
    <>
      <path className={styles.line} d='M14 20 L6 10 M14 20 L8 22 M34 20 L42 10 M34 20 L40 22' />
      <ellipse cx='24' cy='28' rx='11' ry='13' />
      <circle className={styles.eye} cx='20' cy='25' r='1.6' />
      <circle className={styles.eye} cx='28' cy='25' r='1.6' />
    </>
  ),
  'fox': (
    <>
      <path d='M13 16 L11 6 L20 12 Z M35 16 L37 6 L28 12 Z' />
      <path d='M24 42 L12 20 Q24 14 36 20 Z' />
      <circle className={styles.eye} cx='19' cy='24' r='1.6' />
      <circle className={styles.eye} cx='29' cy='24' r='1.6' />
    </>
  ),
  'lynx': (
    <>
      <path d='M14 14 L12 5 L21 11 Z M34 14 L36 5 L27 11 Z' />
      <circle cx='24' cy='27' r='13' />
      <circle className={styles.eye} cx='19' cy='24' r='1.6' />
      <circle className={styles.eye} cx='29' cy='24' r='1.6' />
      <path className={styles.line} d='M10 30 L4 28 M38 30 L44 28' />
    </>
  ),
  'reindeer': (
    <>
      <path className={styles.line} d='M15 18 L10 8 L15 11 M15 18 L6 14 M33 18 L38 8 L33 11 M33 18 L42 14' />
      <ellipse cx='24' cy='28' rx='10' ry='13' />
      <circle className={styles.eye} cx='20' cy='25' r='1.6' />
      <circle className={styles.eye} cx='28' cy='25' r='1.6' />
    </>
  ),
  'puffin': (
    <>
      <ellipse cx='24' cy='26' rx='12' ry='14' />
      <path d='M24 28 L38 32 L24 36 Z' />
      <circle className={styles.eye} cx='20' cy='22' r='2' />
    </>
  ),
  'hedgehog': (
    <>
      <path d='M8 34 L12 20 L16 30 L20 16 L24 28 L28 16 L32 30 L36 20 L40 34 Z' />
      <circle className={styles.eye} cx='36' cy='34' r='2' />
    </>
  ),
  'troll': (
    <>
      <path className={styles.line} d='M12 20 Q24 4 36 20' />
      <ellipse cx='24' cy='30' rx='12' ry='11' />
      <circle className={styles.eye} cx='19' cy='28' r='2' />
      <circle className={styles.eye} cx='29' cy='28' r='2' />
      <path className={styles.line} d='M19 36 Q24 39 29 36' />
    </>
  ),
  'dala-horse': (
    <>
      <path d='M16 42 L16 26 Q16 16 26 14 L30 6 L34 14 Q38 18 38 26 L38 42 Z' />
      <circle className={styles.eye} cx='31' cy='16' r='1.6' />
    </>
  ),
};

type Props = {
  avatar: AvatarShape;
  size?: number;
};

export function AvatarFigure({ avatar, size = 48 }: Props) {
  return (
    <svg
      className={styles.avatar}
      width={size}
      height={size}
      viewBox='0 0 48 48'
      style={{ color: COLORS[avatar.color] }}
      aria-hidden='true'
    >
      {SHAPES[avatar.animal]}
    </svg>
  );
}
