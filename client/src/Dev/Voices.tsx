import { useEffect, useState } from 'react';
import styles from './Voices.module.css';

const TEST_PHRASE = 'Hej! Jag heter Alva. Katten har en bok.';

// Whether a device has a Swedish voice at all — the API is everywhere, the voices are not.
// Why it matters, and why nothing user-facing uses it: CLAUDE.md, "Runtime speech".
export function Voices() {
  const supported = 'speechSynthesis' in globalThis;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [swedishOnly, setSwedishOnly] = useState(true);
  const [phrase, setPhrase] = useState(TEST_PHRASE);

  // getVoices() populates asynchronously: the first call usually returns [].
  useEffect(() => {
    if (!supported) return;
    const read = () => setVoices(speechSynthesis.getVoices());
    read();
    speechSynthesis.addEventListener('voiceschanged', read);
    return () => speechSynthesis.removeEventListener('voiceschanged', read);
  }, [supported]);

  function speak(voice?: SpeechSynthesisVoice) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = voice?.lang ?? 'sv-SE';
    if (voice) utterance.voice = voice;
    speechSynthesis.speak(utterance);
  }

  if (!supported) {
    return <p className={styles.verdict}>speechSynthesis is not available in this browser.</p>;
  }

  const swedish = voices.filter((v) => v.lang.toLowerCase().startsWith('sv'));
  const shown = swedishOnly ? swedish : voices;

  return (
    <div className={styles.voices}>
      <p className={swedish.length > 0 ? styles.good : styles.bad}>
        {swedish.length > 0
          ? `${swedish.length} Swedish voice${swedish.length === 1 ? '' : 's'} of ${voices.length} total.`
          : voices.length === 0
          ? 'No voices reported yet — the list can take a moment, or arrive only after a tap.'
          : `No Swedish voice among ${voices.length}. Swedish would be read with the default voice's rules.`}
      </p>

      <label className={styles.field}>
        Test phrase
        <input
          className={styles.input}
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
        />
      </label>

      <div className={styles.row}>
        <button type='button' className={styles.button} onClick={() => speak()}>
          Speak with the sv-SE default
        </button>
        <button type='button' className={styles.button} onClick={() => setSwedishOnly((v) => !v)}>
          {swedishOnly ? `Show all ${voices.length}` : `Swedish only (${swedish.length})`}
        </button>
      </div>

      <ul className={styles.list}>
        {shown.map((voice) => (
          <li key={`${voice.name}-${voice.lang}`} className={styles.item}>
            <div className={styles.meta}>
              <span className={styles.name}>{voice.name}</span>
              <span className={styles.lang}>
                {voice.lang} · {voice.localService ? 'on device' : 'network'}
                {voice.default ? ' · default' : ''}
              </span>
            </div>
            <button type='button' className={styles.button} onClick={() => speak(voice)}>
              Speak
            </button>
          </li>
        ))}
      </ul>

      {shown.length === 0 && <p className={styles.hint}>Nothing to list. Try tapping Speak once, then reload.</p>}
    </div>
  );
}
