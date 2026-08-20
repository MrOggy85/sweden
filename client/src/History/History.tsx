import { pageById } from '../data/pages';
import type { Visit } from '../data/types';
import styles from './History.module.css';

type Props = {
  visits: Visit[];
};

function when(at: number): string {
  const mins = Math.round((Date.now() - at) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} d ago`;
}

export function History({ visits }: Props) {
  if (visits.length === 0) return null;

  return (
    <section className={styles.history}>
      <h3 className={styles.heading}>Where you have been</h3>
      <ol className={styles.list}>
        {visits.map((visit) => {
          const page = pageById(visit.pageId);
          return (
            <li key={`${visit.pageId}-${visit.at}`} className={styles.row}>
              <span aria-hidden='true'>{page?.emoji ?? '•'}</span>
              <span className={styles.label}>{page?.title ?? visit.pageId}</span>
              <span className={styles.when}>{when(visit.at)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
