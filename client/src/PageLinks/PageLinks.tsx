import { pageById } from '../data/pages';
import { GAME } from '../data/game';
import { navigate } from '../core/navigate';
import motion from '../core/motion.module.css';
import styles from './PageLinks.module.css';

type Props = {
  ids: string[];
};

// Enough that there is always somewhere to go, few enough that the foot of a page does not
// become a second home grid.
const MAX_LINKS = 6;

/** A link target resolved to something renderable: a page, or the game. */
function destination(id: string): { path: string; emoji: string; title: string } | null {
  if (id === GAME.id) return { path: GAME.path, emoji: GAME.emoji, title: GAME.title };
  const page = pageById(id);
  return page ? { path: `/${page.id}`, emoji: page.emoji, title: page.title } : null;
}

// Where to go next, as pictures. Navigation goes through the router, so each link is a real
// URL that survives a refresh — and because App records a visit on arrival rather than on
// tap, wandering sideways earns stars exactly like opening a card from the grid.
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
