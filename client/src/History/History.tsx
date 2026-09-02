import { pageById } from '../data/pages';
import type { Visit } from '../data/types';
import motion from '../core/motion.module.css';
import styles from './History.module.css';

type Props = {
  visits: Visit[];
};

// How many stickers fit on one shelf before it starts to look like a list again.
const MAX_STICKERS = 8;

// A shelf of the places you have been, newest first. Deliberately no titles and no "5 min
// ago": the emoji is the memory, and a timestamp is for someone who can read one.
export function History({ visits }: Props) {
  const seen = new Set<string>();
  const stickers: { pageId: string; emoji: string }[] = [];

  for (const visit of visits) {
    if (seen.has(visit.pageId)) continue;
    const page = pageById(visit.pageId);
    if (!page) continue;
    seen.add(visit.pageId);
    stickers.push({ pageId: visit.pageId, emoji: page.emoji });
    if (stickers.length >= MAX_STICKERS) break;
  }

  if (stickers.length === 0) return null;

  return (
    <section className={styles.history}>
      <h3 className={styles.heading}>Your stickers</h3>
      <ul className={styles.shelf}>
        {stickers.map((sticker, index) => (
          <li
            key={sticker.pageId}
            className={`${styles.sticker} ${motion.popIn}`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span aria-hidden='true'>{sticker.emoji}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
