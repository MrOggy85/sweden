import { useEffect, useRef, useState } from 'react';
import { EVENT_IDS, type Page, type Scene, SEASON_IDS } from '../data/pages';
import { clipUrl, GAP_MS, playToEnd, sleep } from '../core/clips';
import { PageImages } from '../PageImages/PageImages';
import { PageLinks } from '../PageLinks/PageLinks';
import { PageVideo } from '../PageVideo/PageVideo';
import { SeasonWheel } from '../SeasonWheel/SeasonWheel';
import { SentenceBuilder } from '../SentenceBuilder/SentenceBuilder';
import { YearTimeline } from '../YearTimeline/YearTimeline';
import { Stars } from '../Stars/Stars';
import motion from '../core/motion.module.css';
import styles from './PageView.module.css';

type Props = {
  page: Page;
  count: number;
  onBack: () => void;
};

export function PageView({ page, count, onBack }: Props) {
  // One element for every clip, so a second tap cuts the first off — and on iOS only the
  // element a tap unlocked may keep playing a scene's later words.
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Bumped whenever a scene must stop: any other tap, unmount.
  const runRef = useRef(0);
  // Drives the speaker pulse.
  const [playing, setPlaying] = useState<string | null>(null);
  // Which scene is talking, and which of its words is lit.
  const [spoken, setSpoken] = useState<{ scene: number; word: number } | null>(null);

  useEffect(() => () => {
    runRef.current++;
    audioRef.current?.pause();
  }, []);

  function play(src: string) {
    const audio = audioRef.current ??= new Audio();
    runRef.current++;
    setSpoken(null);
    audio.src = clipUrl(src);
    audio.currentTime = 0;
    audio.onended = () => setPlaying(null);
    setPlaying(src);
    // A dropped clip is not worth interrupting a child over.
    void audio.play().catch(() => setPlaying(null));
  }

  async function playScene(scene: Scene, index: number) {
    const audio = audioRef.current ??= new Audio();
    const run = ++runRef.current;
    audio.onended = null;
    setPlaying(null);

    for (const [word, { audio: src }] of scene.words.entries()) {
      if (run !== runRef.current) return;
      setSpoken({ scene: index, word });
      audio.src = clipUrl(src);
      await playToEnd(audio);
      await sleep(GAP_MS);
    }

    if (run === runRef.current) setSpoken(null);
  }

  // A season or a högtid gets a diagram where the emoji would be: it shows the same
  // picture, plus where in the year the page sits. Everything else floats on a return
  // visit and stamps down on the first — count is the only tell.
  const hero = SEASON_IDS.includes(page.id)
    ? <SeasonWheel currentId={page.id} />
    : EVENT_IDS.includes(page.id)
    ? <YearTimeline currentId={page.id} />
    : (
      <span className={`${styles.hero} ${count === 1 ? motion.stamp : motion.float}`} aria-hidden='true'>
        {page.emoji}
      </span>
    );

  return (
    <article className={`${styles.page} ${motion.slideUp}`}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

      {hero}

      <h2 className={styles.title}>{page.title}</h2>
      <Stars count={count} />

      <PageVideo videos={page.videos ?? []} />
      <PageImages images={page.images ?? []} />

      {/* No English: the picture says what the Swedish means, and tapping says the Swedish. */}
      {page.scenes && page.scenes.length > 0 && (
        <ul className={styles.scenes}>
          {page.scenes.map((scene, index) => (
            <li key={index}>
              <button
                type='button'
                className={styles.scene}
                onClick={() => void playScene(scene, index)}
                aria-label={`Play ${scene.words.map((w) => w.text).join(' ')}`}
              >
                <span
                  className={`${styles.picture} ${spoken?.scene === index ? motion.pulse : ''}`}
                  aria-hidden='true'
                >
                  {scene.picture}
                </span>
                <span className={styles.line}>
                  {scene.words.map((word, w) => (
                    <span
                      key={w}
                      className={spoken?.scene === index && spoken.word === w ? styles.lit : undefined}
                    >
                      {word.text}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

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
                <span className={playing === sound.audio ? motion.pulse : undefined} aria-hidden='true'>
                  {sound.emoji ?? '🔊'}
                </span>{' '}
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
                  <span
                    className={`${styles.wordPicture} ${playing === word.audio ? motion.pulse : ''}`}
                    aria-hidden='true'
                  >
                    {word.emoji ?? '🔊'}
                  </span>
                  <span className={styles.sv}>{word.sv}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

      <PageLinks ids={page.links ?? []} />
    </article>
  );
}
