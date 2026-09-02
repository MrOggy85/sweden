import { useRef, useState } from 'react';
import type { Page } from '../data/pages';
import { SentenceBuilder } from '../SentenceBuilder/SentenceBuilder';
import { Stars } from '../Stars/Stars';
import motion from '../core/motion.module.css';
import styles from './PageView.module.css';

type Props = {
  page: Page;
  count: number;
  onBack: () => void;
};

export function PageView({ page, count, onBack }: Props) {
  // One element reused for every word: tapping a second word cuts the first one off, which
  // is what a child poking at all three in a row expects.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Which button is sounding, so its speaker glyph can pulse. Cleared on `ended`.
  const [playing, setPlaying] = useState<string | null>(null);

  function play(src: string) {
    const audio = audioRef.current ??= new Audio();
    // ?v= puts the clip on the immutable cache branch in api/server.ts.
    audio.src = `${src}?v=${BUILD_HASH}`;
    audio.currentTime = 0;
    audio.onended = () => setPlaying(null);
    setPlaying(src);
    // A clip that will not play is not worth interrupting a child over.
    void audio.play().catch(() => setPlaying(null));
  }

  return (
    <article className={`${styles.page} ${motion.slideUp}`}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

      {
        /* The picture leads. It floats when you have been here before, and stamps itself
          down the first time — the count is the only way to know which. */
      }
      <span
        className={`${styles.hero} ${count === 1 ? motion.stamp : motion.float}`}
        aria-hidden='true'
      >
        {page.emoji}
      </span>

      <h2 className={styles.title}>{page.title}</h2>
      <Stars count={count} />

      <ul className={styles.facts}>
        {page.facts.map((fact) => <li key={fact} className={styles.fact}>{fact}</li>)}
      </ul>

      {page.sounds && page.sounds.length > 0 && (
        <ul className={styles.sounds}>
          {page.sounds.map((sound) => (
            <li key={sound.audio}>
              <button
                type='button'
                className={styles.sound}
                onClick={() => play(sound.audio)}
                aria-label={`Play ${sound.label}`}
              >
                <span className={playing === sound.audio ? motion.pulse : undefined} aria-hidden='true'>🔊</span>{' '}
                {sound.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {page.kind === 'sentence'
        ? <SentenceBuilder words={page.words ?? []} />
        : page.words && page.words.length > 0 && (
          <ul className={styles.words}>
            {page.words.map((word) => (
              <li key={word.sv}>
                <button
                  type='button'
                  className={styles.word}
                  onClick={() => play(word.audio)}
                  aria-label={`Play ${word.sv}, ${word.en}`}
                >
                  <span className={playing === word.audio ? motion.pulse : undefined} aria-hidden='true'>🔊</span>
                  <span className={styles.sv}>{word.sv}</span>
                  <span className={styles.en}>{word.en}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
    </article>
  );
}
