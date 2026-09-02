import { pageById } from '../data/pages';
import { GAME } from '../data/game';
import { navigate } from '../core/navigate';
import motion from '../core/motion.module.css';
import styles from './PageLinks.module.css';

type Props = {
  ids: string[];
};

// Enough to always offer somewhere to go, not so many it becomes a second grid.
const MAX_LINKS = 6;

/** A page, or the game. */
function destination(id: string): { path: string; emoji: string; title: string } | null {
  if (id === GAME.id) return { path: GAME.path, emoji: GAME.emoji, title: GAME.title };
  const page = pageById(id);
  return page ? { path: `/${page.id}`, emoji: page.emoji, title: page.title } : null;
}

// Real URLs, so a link survives a refresh. App records the visit on arrival, so wandering
// sideways earns stars like the grid does.
export function PageLinks({ ids }: Props) {
  const targets = ids.slice(0, MAX_LINKS).map(destination).filter((t) => t !== null);
  if (targets.length === 0) return null;

  return (
    <nav className={styles.links} aria-label='Related pages'>
      <h3 className={styles.heading}>Go and see</h3>
      <ul className={styles.list}>
        {targets.map((target, index) => (
          <li key={target.path}>
            <button
              type='button'
              className={`${styles.link} ${motion.popIn}`}
              style={{ animationDelay: `${index * 40}ms` }}
              onClick={() => navigate(target.path)}
            >
              <span className={styles.emoji} aria-hidden='true'>{target.emoji}</span>
              <span className={styles.title}>{target.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
