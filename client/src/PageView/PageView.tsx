import type { Page } from '../data/pages';
import styles from './PageView.module.css';

type Props = {
  page: Page;
  count: number;
  onBack: () => void;
};

export function PageView({ page, count, onBack }: Props) {
  return (
    <article className={styles.page}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

      <h2 className={styles.title}>
        <span aria-hidden='true'>{page.emoji}</span> {page.title}
      </h2>
      <p className={styles.blurb}>{page.blurb}</p>

      <ul className={styles.facts}>
        {page.facts.map((fact) => <li key={fact} className={styles.fact}>{fact}</li>)}
      </ul>

      {count > 1 && <p className={styles.count}>You have been here {count} times.</p>}
    </article>
  );
}
