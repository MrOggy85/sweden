import { PAGES } from '../data/pages';
import { GAMES } from '../data/games';
import type { PageProgress } from '../data/types';
import { Stars } from '../Stars/Stars';
import motion from '../core/motion.module.css';
import styles from './PageGrid.module.css';

type Props = {
  progress: PageProgress[];
  onOpen: (pageId: string) => void;
  onOpenGame: (path: string) => void;
};

// Capped, or a long grid is still arriving half a second in.
const STAGGER_MS = 40;
const STAGGER_CAP_MS = 400;

const delay = (index: number) => ({ animationDelay: `${Math.min(index * STAGGER_MS, STAGGER_CAP_MS)}ms` });

export function PageGrid({ progress, onOpen, onOpenGame }: Props) {
  const counts = new Map(progress.map((p) => [p.pageId, p.count]));

  return (
    <div className={styles.grid}>
      {GAMES.map((game, index) => (
        <button
          key={game.id}
          type='button'
          className={`${styles.card} ${styles.game} ${motion.popIn}`}
          style={delay(index)}
          onClick={() => onOpenGame(game.path)}
        >
          <span className={styles.gameEmoji} aria-hidden='true'>{game.emoji}</span>
          <span className={styles.title}>{game.title}</span>
        </button>
      ))}

      {PAGES.map((page, index) => {
        const count = counts.get(page.id) ?? 0;
        return (
          <button
            key={page.id}
            type='button'
            className={`${styles.card} ${count > 0 ? styles.seen : ''} ${motion.popIn}`}
            style={delay(index + GAMES.length)}
            onClick={() => onOpen(page.id)}
            // The blurb and count are off the card's face, so they live here instead.
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
