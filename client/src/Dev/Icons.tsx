import { GAME_COLOR_IDS, GameIcon, OBJECT_ICON_IDS } from '../GameIcons/GameIcons';
import styles from './Icons.module.css';

// Every game picture on one screen. Drawing these is guesswork until they are seen at the
// size a child sees them, on the device a child holds — and 88px next to 44px is where a
// shape that only works large gives itself away.
export function Icons() {
  return (
    <div className={styles.icons}>
      <p className={styles.note}>
        Each icon at 88px and at 44px, the size the game uses. Anything unrecognisable in the small column needs
        redrawing, not shrinking.
      </p>

      <ul className={styles.grid}>
        {OBJECT_ICON_IDS.map((id) => (
          <li key={id} className={styles.cell}>
            <div className={styles.pair}>
              <GameIcon icon={id} size={88} />
              <GameIcon icon={id} size={44} />
            </div>
            <span className={styles.label}>{id}</span>
          </li>
        ))}
        {GAME_COLOR_IDS.map((id) => (
          <li key={id} className={styles.cell}>
            <div className={styles.pair}>
              <GameIcon icon={`color-${id}`} size={88} />
              <GameIcon icon={`color-${id}`} size={44} />
            </div>
            <span className={styles.label}>color-{id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
