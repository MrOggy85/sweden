import { useState } from 'react';
import { AvatarFigure } from '../Avatar/Avatar';
import { ANIMAL_IDS, ANIMAL_LABELS, COLOR_IDS, COLORS } from '../data/pages';
import type { AnimalId, ColorId } from '../data/pages';
import type { User } from '../data/types';
import { createUser } from '../data/api';
import styles from './ProfileSetup.module.css';

const NAME_MAX = 24;

type Props = {
  onCreated: (user: User) => void;
};

export function ProfileSetup({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [animal, setAnimal] = useState<AnimalId>('moose');
  const [color, setColor] = useState<ColorId>('blue');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim().length > 0 && !busy;

  async function submit() {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    try {
      const { user } = await createUser(name.trim(), { animal, color });
      onCreated(user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not save');
      setBusy(false);
    }
  }

  return (
    <div className={styles.setup}>
      <h1 className={styles.title}>Hej!</h1>
      <p className={styles.lead}>Who is exploring Sweden today?</p>

      <div className={styles.preview}>
        <AvatarFigure avatar={{ animal, color }} size={96} />
      </div>

      <label className={styles.label} htmlFor='name'>Your name</label>
      <input
        id='name'
        className={styles.input}
        value={name}
        maxLength={NAME_MAX}
        placeholder='Astrid'
        autoComplete='off'
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void submit();
        }}
      />

      <span className={styles.label}>Pick an animal</span>
      <div className={styles.animals}>
        {ANIMAL_IDS.map((id) => (
          <button
            key={id}
            type='button'
            className={id === animal ? `${styles.animal} ${styles.animalOn}` : styles.animal}
            onClick={() => setAnimal(id)}
            aria-label={ANIMAL_LABELS[id]}
            aria-pressed={id === animal}
          >
            <AvatarFigure avatar={{ animal: id, color }} size={44} />
          </button>
        ))}
      </div>

      <span className={styles.label}>Pick a colour</span>
      <div className={styles.colors}>
        {COLOR_IDS.map((id) => (
          <button
            key={id}
            type='button'
            className={id === color ? `${styles.color} ${styles.colorOn}` : styles.color}
            style={{ background: COLORS[id] }}
            onClick={() => setColor(id)}
            aria-label={id}
            aria-pressed={id === color}
          />
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button type='button' className={styles.go} disabled={!canSubmit} onClick={() => void submit()}>
        {busy ? 'Saving…' : "Let's go"}
      </button>
    </div>
  );
}
