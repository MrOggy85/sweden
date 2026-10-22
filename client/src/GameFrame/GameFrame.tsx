import type { ReactNode } from 'react';
import motion from '../core/motion.module.css';
import styles from './GameFrame.module.css';

type Props = {
  emoji: string;
  title: string;
  onBack: () => void;
  children: ReactNode;
};

// The frame the newer games share: a way out, a title, and a card to play on. No
// instructions — each game is built so the first tap shows what to do.
export function GameFrame({ emoji, title, onBack, children }: Props) {
  return (
    <article className={`${styles.game} ${motion.slideUp}`}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>
      <h2 className={styles.title}>
        <span aria-hidden='true'>{emoji}</span> {title}
      </h2>
      {children}
    </article>
  );
}

// Sixteen spans and two keyframes, like ConnectGame — this runs on an iPad.
const CONFETTI = Array.from({ length: 16 }, (_, i) => ({
  left: `${4 + (i * 6.2) % 92}%`,
  color: ['#fecc00', '#005293', '#2a9d8f', '#e07a9c', '#ef8354'][i % 5],
  delay: `${(i % 8) * 90}ms`,
}));

type CelebrationProps = {
  children?: ReactNode;
  onAgain: () => void;
};

/** Covers the nearest positioned parent. */
export function Celebration({ children, onAgain }: CelebrationProps) {
  return (
    <div className={styles.celebration}>
      <div className={styles.confetti} aria-hidden='true'>
        {CONFETTI.map((piece, i) => (
          <span
            key={i}
            className={styles.piece}
            style={{ left: piece.left, background: piece.color, animationDelay: piece.delay }}
          />
        ))}
      </div>
      {children}
      <button type='button' className={styles.again} onClick={onAgain} aria-label='Play again'>🔄</button>
    </div>
  );
}
