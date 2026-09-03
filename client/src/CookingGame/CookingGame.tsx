import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { GameIcon } from '../GameIcons/GameIcons';
import { COOKING_ITEMS, DISHES, KITCHEN, randomPhrase } from '../data/gameContent';
import type { GamePair } from '../data/gameContent';
import motion from '../core/motion.module.css';
import styles from './CookingGame.module.css';

type Drag = { item: GamePair; startX: number; startY: number; x: number; y: number; moved: boolean };

// A tap moves less than this between pointerdown and pointerup; more is a drag. Same
// threshold as ConnectGame.
const TAP_THRESHOLD_PX = 6;

// Klar appears at this many, so a child sees the pot fill before being offered the payoff.
const READY_AT = 2;

// content/games/kitchen.md holds both, so their clips are generated and checked like any
// other word. The pot is the drag source once the food is ready; the rest are tappable.
const POT = KITCHEN.find((k) => k.icon === 'gryta')!;
const TOOLS = KITCHEN.filter((k) => k.icon !== 'gryta');

export function CookingGame({ onBack }: { onBack: () => void }) {
  const [pot, setPot] = useState<GamePair[]>([]);
  const [ready, setReady] = useState(false);
  const [dish, setDish] = useState<GamePair | null>(null);
  const [phrase, setPhrase] = useState('');
  const [drag, setDrag] = useState<Drag | null>(null);
  // Set by tapping the pot when it is ready: the tap-tap route to serving, for a child who
  // cannot hold a drag.
  const [potPicked, setPotPicked] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<Drag | null>(null);

  // One element for every clip: on iOS only the element unlocked by the tap may play after.
  function say(src: string) {
    const audio = audioRef.current ??= new Audio();
    audio.src = src;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  }

  useEffect(() => () => audioRef.current?.pause(), []);

  function addToPot(item: GamePair) {
    setPot((prev) => [...prev, item]);
    say(`${item.audio}?v=${BUILD_HASH}`);
  }

  function serve() {
    const picked = DISHES[Math.floor(Math.random() * DISHES.length)];
    if (!picked) return;
    setDish(picked);
    setPhrase(randomPhrase());
    setPotPicked(false);
    say(`${picked.audio}?v=${BUILD_HASH}`);
  }

  function reset() {
    setPot([]);
    setReady(false);
    setDish(null);
    setPotPicked(false);
  }

  function onIngredientDown(e: ReactPointerEvent<HTMLElement>, item: GamePair) {
    if (dish) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { item, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const current = dragRef.current;
    if (!current) return;
    const moved = current.moved ||
      Math.hypot(e.clientX - current.startX, e.clientY - current.startY) >= TAP_THRESHOLD_PX;
    dragRef.current = { ...current, x: e.clientX, y: e.clientY, moved };
    if (moved) setDrag(dragRef.current);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current) return;

    // A tap says the word and leaves the shelf alone.
    if (!current.moved) {
      say(`${current.item.audio}?v=${BUILD_HASH}`);
      return;
    }

    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-cook-drop]');
    if (under?.dataset.cookDrop === 'pot') addToPot(current.item);
  }

  // Dragging the pot itself, once it is ready: the same tap-or-drag shape, but the only
  // useful drop target is the plate.
  function onPotDown(e: ReactPointerEvent<HTMLElement>) {
    if (!ready || dish) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { item: POT, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, moved: false };
  }

  function onPotUp(e: ReactPointerEvent<HTMLElement>) {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);

    if (!current || current.item !== POT) {
      say(`${POT.audio}?v=${BUILD_HASH}`);
      return;
    }

    if (!current.moved) {
      // Tap: arm the pot, then tapping the plate serves.
      say(`${POT.audio}?v=${BUILD_HASH}`);
      setPotPicked(true);
      return;
    }

    const under = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-cook-drop]');
    if (under?.dataset.cookDrop === 'plate') serve();
  }

  return (
    <article className={styles.game} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
      <header className={styles.bar}>
        <button type='button' className={styles.restart} onClick={reset}>Börja om</button>
        <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

        <div className={styles.kitchen}>
          {TOOLS.map((tool) => {
            const isPlate = tool.icon === 'tallrik';
            return (
              <button
                key={tool.sv}
                type='button'
                className={isPlate && (ready || potPicked) ? `${styles.tool} ${styles.glow}` : styles.tool}
                data-cook-drop={isPlate ? 'plate' : undefined}
                aria-label={`${tool.sv}, ${tool.en}`}
                onClick={() => {
                  if (isPlate && potPicked) serve();
                  else say(`${tool.audio}?v=${BUILD_HASH}`);
                }}
              >
                <GameIcon icon={tool.icon} size={44} />
              </button>
            );
          })}
        </div>
      </header>

      {dish
        ? (
          <div className={`${styles.reveal} ${motion.popIn}`}>
            <GameIcon icon={dish.icon} size={200} />
            <span className={styles.dishName}>{dish.sv}</span>
            <span className={styles.phrase}>{phrase}</span>
            <button type='button' className={styles.restart} onClick={reset}>Börja om</button>
          </div>
        )
        : (
          <div className={styles.board}>
            <ul className={styles.shelf}>
              {COOKING_ITEMS.map((item, index) => (
                <li key={item.sv}>
                  <button
                    type='button'
                    className={`${styles.item} ${motion.popIn}`}
                    style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                    aria-label={`${item.sv}, ${item.en}`}
                    onPointerDown={(e) => onIngredientDown(e, item)}
                  >
                    <GameIcon icon={item.icon} size={52} />
                    <span className={styles.itemName}>{item.sv}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div className={styles.cooking}>
              <div
                className={potPicked ? `${styles.pot} ${styles.picked}` : styles.pot}
                data-cook-drop='pot'
                onPointerDown={onPotDown}
                onPointerUp={onPotUp}
              >
                <GameIcon icon='gryta' size={150} />
                {pot.length > 0 && (
                  <ul className={styles.contents} aria-label={`${pot.length} in the pot`}>
                    {pot.slice(-6).map((item, i) => (
                      <li key={`${item.sv}-${i}`} className={motion.popIn}>
                        <GameIcon icon={item.icon} size={30} />
                      </li>
                    ))}
                  </ul>
                )}
                {pot.length > 0 && <span className={styles.bubbles} aria-hidden='true'>• • •</span>}
              </div>

              {pot.length >= READY_AT && !ready && (
                <button
                  type='button'
                  className={`${styles.klar} ${motion.popIn}`}
                  onClick={() => setReady(true)}
                >
                  Klar!
                </button>
              )}
              {ready && <span className={styles.hint}>Dra grytan till tallriken</span>}
            </div>
          </div>
        )}

      {drag?.moved && (
        <span className={styles.ghost} style={{ left: drag.x, top: drag.y }} aria-hidden='true'>
          <GameIcon icon={drag.item.icon} size={64} />
        </span>
      )}
    </article>
  );
}
