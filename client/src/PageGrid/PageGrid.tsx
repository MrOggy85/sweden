import { PAGES } from '../data/pages';
import type { PageProgress } from '../data/types';
import styles from './PageGrid.module.css';

type Props = {
  progress: PageProgress[];
  onOpen: (pageId: string) => void;
};

export function PageGrid({ progress, onOpen }: Props) {
  const counts = new Map(progress.map((p) => [p.pageId, p.count]));

  return (
    <div className={styles.grid}>
      {PAGES.map((page) => {
        const count = counts.get(page.id) ?? 0;
        return (
          <button
            key={page.id}
            type='button'
            className={count > 0 ? `${styles.card} ${styles.seen}` : styles.card}
            onClick={() => onOpen(page.id)}
          >
            <span className={styles.emoji} aria-hidden='true'>{page.emoji}</span>
            <span className={styles.title}>{page.title}</span>
            <span className={styles.blurb}>{page.blurb}</span>
            {count > 0 && <span className={styles.badge}>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
