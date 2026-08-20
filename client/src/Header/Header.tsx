import { useState } from 'react';
import { AvatarFigure } from '../Avatar/Avatar';
import type { User } from '../data/types';
import { selectProfile } from '../data/api';
import styles from './Header.module.css';

type Props = {
  user: User;
  profiles: User[];
  total: number;
  onSwitched: (user: User) => void;
  onAddProfile: () => void;
};

export function Header({ user, profiles, total, onSwitched, onAddProfile }: Props) {
  const [open, setOpen] = useState(false);

  async function switchTo(id: string) {
    setOpen(false);
    if (id === user.id) return;
    const { user: next } = await selectProfile(id);
    onSwitched(next);
  }

  return (
    <header className={styles.header}>
      <button type='button' className={styles.who} onClick={() => setOpen(!open)} aria-expanded={open}>
        <AvatarFigure avatar={user.avatar} size={40} />
        <span className={styles.name}>{user.name}</span>
        <span className={styles.caret} aria-hidden='true'>▾</span>
      </button>

      <span className={styles.total}>
        {total} {total === 1 ? 'thing' : 'things'} explored
      </span>

      {open && (
        <div className={styles.menu}>
          {profiles.map((p) => (
            <button
              key={p.id}
              type='button'
              className={p.id === user.id ? `${styles.item} ${styles.itemOn}` : styles.item}
              onClick={() => void switchTo(p.id)}
            >
              <AvatarFigure avatar={p.avatar} size={28} />
              <span>{p.name}</span>
            </button>
          ))}
          <button
            type='button'
            className={styles.item}
            onClick={() => {
              setOpen(false);
              onAddProfile();
            }}
          >
            <span className={styles.plus} aria-hidden='true'>+</span>
            <span>Add someone</span>
          </button>
        </div>
      )}
    </header>
  );
}
