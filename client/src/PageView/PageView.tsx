import { useRef } from 'react';
import type { Page } from '../data/pages';
import { SentenceBuilder } from '../SentenceBuilder/SentenceBuilder';
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

  function play(src: string) {
    const audio = audioRef.current ??= new Audio();
    // ?v= puts the clip on the immutable cache branch in api/server.ts.
    audio.src = `${src}?v=${BUILD_HASH}`;
    audio.currentTime = 0;
    // A clip that will not play is not worth interrupting a child over.
    void audio.play().catch(() => {});
  }

  return (
    <article className={styles.page}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

      <h2 className={styles.title}>
        <span aria-hidden='true'>{page.emoji}</span> {page.title}
      </h2>
      <p className={styles.blurb}>{page.blurb}</p>

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
                <span aria-hidden='true'>🔊</span> {sound.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      {page.kind === 'sentence'
        ? <SentenceBuilder words={page.words ?? []} />
        : page.words && page.words.length > 0 && (
          <>
            <h3 className={styles.wordsHeading}>Tap to hear it</h3>
            <ul className={styles.words}>
              {page.words.map((word) => (
                <li key={word.sv}>
                  <button
                    type='button'
                    className={styles.word}
                    onClick={() => play(word.audio)}
                    aria-label={`Play ${word.sv}, ${word.en}`}
                  >
                    <span className={styles.sv}>{word.sv}</span>
                    <span className={styles.en}>{word.en}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

      {count > 1 && <p className={styles.count}>You have been here {count} times.</p>}
    </article>
  );
}
