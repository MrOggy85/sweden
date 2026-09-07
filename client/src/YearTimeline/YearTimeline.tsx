import { useEffect, useRef } from 'react';
import { EVENT_IDS, pageById } from '../data/pages';
import { navigate } from '../core/navigate';
import { playSfx } from '../core/sfx';
import motion from '../core/motion.module.css';
import styles from './YearTimeline.module.css';

type Props = {
  currentId: string;
};

// One per högtid, distinct in lightness as well as hue: the dot is the only thing telling
// them apart at a glance on the line.
const COLORS: Record<string, string> = {
  easter: '#fecc00',
  midsummer: '#8fd694',
  kraftskiva: '#e07a9c',
  halloween: '#ef8354',
  lucia: '#f3d78b',
  christmas: '#2a9d8f',
};

export function YearTimeline({ currentId }: Props) {
  const events = EVENT_IDS.map((id) => pageById(id));
  const currentRef = useRef<HTMLLIElement | null>(null);

  // The rail scrolls on a phone, and december is off the right edge until it is brought in.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ inline: 'center', block: 'nearest' });
  }, [currentId]);

  // A renamed page takes the timeline with it rather than leaving a gap in the year.
  if (events.some((page) => page === undefined)) return null;

  return (
    <nav className={`${styles.timeline} ${motion.popIn}`} aria-label='The year, one marker per högtid'>
      <ol className={styles.rail}>
        {events.map((page) => {
          if (!page) return null;
          const current = page.id === currentId;

          const face = (
            <>
              <span className={styles.emoji} aria-hidden='true'>{page.emoji}</span>
              <span className={styles.track}>
                <span className={styles.dot} style={{ background: COLORS[page.id] ?? '#ddd' }} />
              </span>
              <span className={styles.name}>{page.title}</span>
              <span className={styles.when}>{page.when}</span>
            </>
          );

          return (
            <li
              key={page.id}
              ref={current ? currentRef : undefined}
              className={current ? `${styles.item} ${styles.current}` : styles.item}
            >
              {current ? <span className={styles.face} aria-current='page'>{face}</span> : (
                // A real href, so the link survives a refresh; pushState instead of a
                // reload, like every other link in the app.
                <a
                  href={`/${page.id}`}
                  className={styles.face}
                  aria-label={`Go to ${page.title}, ${page.when ?? ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    playSfx('tap');
                    navigate(`/${page.id}`);
                  }}
                >
                  {face}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
