import { useEffect, useRef, useState } from 'react';
import type { Word } from '../data/pages';
import styles from './SentenceBuilder.module.css';

type Props = {
  words: Word[];
};

// Long enough for anything a child builds, short enough that the box never pushes Speak
// off the screen.
const MAX_WORDS = 12;

// A beat between words. Back-to-back clips run together into one mumble.
const GAP_MS = 120;

// ?v= puts the clip on the immutable cache branch in api/server.ts.
const clipUrl = (word: Word) => `${word.audio}?v=${BUILD_HASH}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves when the clip finishes — or immediately if it refuses to play at all. */
function playToEnd(audio: HTMLAudioElement): Promise<void> {
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener('ended', done);
      audio.removeEventListener('error', done);
      resolve();
    };
    audio.addEventListener('ended', done);
    audio.addEventListener('error', done);
    // One bad clip should not strand the rest of the sentence.
    void audio.play().catch(done);
  });
}

/** Words in file order, bucketed by their group label, groups in first-seen order. */
function byGroup(words: Word[]): { label: string; words: Word[] }[] {
  const groups: { label: string; words: Word[] }[] = [];
  for (const word of words) {
    const label = word.group ?? '';
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.words.push(word);
    else groups.push({ label, words: [word] });
  }
  return groups;
}

export function SentenceBuilder({ words }: Props) {
  const [sentence, setSentence] = useState<Word[]>([]);
  const [speaking, setSpeaking] = useState<number | null>(null);

  // One element for every clip: on iOS only the element unlocked by the tap may play
  // afterwards, so a fresh Audio per word would go silent after the first.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Bumped whenever playback should stop — a second Speak, a tap on a word, or unmount.
  const runRef = useRef(0);

  // Warm the HTTP cache once so swapping src mid-sentence never waits on the network.
  useEffect(() => {
    for (const word of words) void fetch(clipUrl(word)).catch(() => {});
  }, [words]);

  // Backing out of the page must stop the sentence, not let it play over the grid.
  useEffect(() => () => {
    runRef.current++;
    audioRef.current?.pause();
  }, []);

  function playOne(word: Word) {
    const audio = audioRef.current ??= new Audio();
    runRef.current++;
    setSpeaking(null);
    audio.src = clipUrl(word);
    void audio.play().catch(() => {});
  }

  function add(word: Word) {
    if (sentence.length >= MAX_WORDS) return;
    setSentence((current) => [...current, word]);
    playOne(word);
  }

  function removeAt(index: number) {
    runRef.current++;
    setSpeaking(null);
    setSentence((current) => current.filter((_, i) => i !== index));
  }

  function clear() {
    runRef.current++;
    audioRef.current?.pause();
    setSpeaking(null);
    setSentence([]);
  }

  async function speak() {
    const audio = audioRef.current ??= new Audio();
    const run = ++runRef.current;

    for (const [index, word] of sentence.entries()) {
      if (run !== runRef.current) return;
      setSpeaking(index);
      audio.src = clipUrl(word);
      await playToEnd(audio);
      await sleep(GAP_MS);
    }

    if (run === runRef.current) setSpeaking(null);
  }

  return (
    <div className={styles.builder}>
      <div className={styles.box}>
        {sentence.length === 0
          ? <p className={styles.empty}>Your sentence turns up here.</p>
          : sentence.map((word, index) => (
            <button
              key={`${word.sv}-${index}`}
              type='button'
              className={index === speaking ? `${styles.chip} ${styles.speaking}` : styles.chip}
              onClick={() => removeAt(index)}
              aria-label={`Remove ${word.sv}`}
            >
              {word.sv}
            </button>
          ))}
      </div>

      <div className={styles.actions}>
        <button
          type='button'
          className={styles.speak}
          onClick={() => void speak()}
          disabled={sentence.length === 0}
        >
          🔊 Speak
        </button>
        <button
          type='button'
          className={styles.clear}
          onClick={clear}
          disabled={sentence.length === 0}
        >
          Clear
        </button>
      </div>

      {byGroup(words).map((group) => (
        <section key={group.label} className={styles.group}>
          {group.label && <h4 className={styles.groupLabel}>{group.label}</h4>}
          <ul className={styles.palette}>
            {group.words.map((word) => (
              <li key={word.sv}>
                <button
                  type='button'
                  className={styles.word}
                  onClick={() => add(word)}
                  aria-label={`Add ${word.sv}, ${word.en}`}
                >
                  <span className={styles.sv}>{word.sv}</span>
                  <span className={styles.en}>{word.en}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
