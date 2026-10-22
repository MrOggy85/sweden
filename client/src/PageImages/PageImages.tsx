import type { Image } from '../data/pages';
import styles from './PageImages.module.css';

type Props = {
  images: Image[];
};

// Photographs. The caption is alt text, not shown: a child looks, they do not read about
// what they are looking at. `loading='lazy'` because a page can carry several and only the
// first is on screen; width/height are unknown here, so the CSS caps the height instead of
// reserving space — one reflow beats hardcoding dimensions into content.
export function PageImages({ images }: Props) {
  if (images.length === 0) return null;

  return (
    <ul className={styles.images}>
      {images.map((image) => (
        <li key={image.src} className={styles.item}>
          <img className={styles.photo} src={`${image.src}?v=${BUILD_HASH}`} alt={image.caption} loading='lazy' />
        </li>
      ))}
    </ul>
  );
}
