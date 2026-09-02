import styles from './Stars.module.css';

// How often you have been somewhere, without reading a number. Three is the cap: past
// that, more stars stop meaning anything to a child and start being a wall of gold.
export function Stars({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span className={styles.stars} aria-hidden='true'>
      {'★'.repeat(Math.min(count, 3))}
    </span>
  );
}
