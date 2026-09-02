import styles from './Stars.module.css';

// Progress without a number to read. Three is the cap; more stops meaning anything.
export function Stars({ count }: { count: number }) {
  if (count < 1) return null;
  return (
    <span className={styles.stars} aria-hidden='true'>
      {'★'.repeat(Math.min(count, 3))}
    </span>
  );
}
