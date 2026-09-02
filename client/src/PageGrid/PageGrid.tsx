import { PAGES } from '../data/pages';
import type { PageProgress } from '../data/types';
import { Stars } from '../Stars/Stars';
import motion from '../core/motion.module.css';
import styles from './PageGrid.module.css';

type Props = {
  progress: PageProgress[];
  onOpen: (pageId: string) => void;
  onOpenGame: () => void;
};

// Cards land one after another rather than all at once. Capped so the last card in a long
// grid is not still arriving after half a second.
const STAGGER_MS = 40;
const STAGGER_CAP_MS = 400;

const delay = (index: number) => ({ animationDelay: `${Math.min(index * STAGGER_MS, STAGGER_CAP_MS)}ms` });

export function PageGrid({ progress, onOpen, onOpenGame }: Props) {
  const counts = new Map(progress.map((p) => [p.pageId, p.count]));

  return (
    <div className={styles.grid}>
      <button
        type='button'
        className={`${styles.card} ${styles.game} ${motion.popIn}`}
        style={delay(0)}
        onClick={onOpenGame}
      >
        <span className={styles.gameEmoji} aria-hidden='true'>🔗</span>
        <span className={styles.title}>Connect the words</span>
      </button>

      {PAGES.map((page, index) => {
        const count = counts.get(page.id) ?? 0;
        return (
          <button
            key={page.id}
            type='button'
            className={`${styles.card} ${count > 0 ? styles.seen : ''} ${motion.popIn}`}
            style={delay(index + 1)}
            onClick={() => onOpen(page.id)}
            // The blurb and the visit count are gone from the face of the card, so they
            // live here instead — a screen reader and a curious parent still get them.
            aria-label={`${page.title}. ${page.blurb}${count > 0 ? ` Visited ${count} times.` : ''}`}
          >
            <span className={styles.emoji} aria-hidden='true'>{page.emoji}</span>
            <span className={styles.title}>{page.title}</span>
            <Stars count={count} />
          </button>
        );
      })}
    </div>
  );
}
