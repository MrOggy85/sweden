import { useState } from 'react';
import { GameIcon } from '../GameIcons/GameIcons';
import { Celebration, GameFrame } from '../GameFrame/GameFrame';
import { GAME_WORDS, type GamePair, numberAudio, randomPhrase, SHOP_ITEMS, shuffled } from '../data/gameContent';
import { playSfx } from '../core/sfx';
import { useSpeaker } from '../core/useSpeaker';
import motion from '../core/motion.module.css';
import styles from './ShopGame.module.css';

// Prices are rolled, not authored: the same banana is a new sum next time.
type Ware = { item: GamePair; price: number };

const SHELF_SIZE = 6;
const MAX_PRICE = 10;
// A full bag is the round; then the celebration, then a fresh shop.
const BAG_SIZE = 5;
// The real Swedish coins. 5 and 10 are the gold ones.
const COINS = [1, 2, 5, 10];

function roll(item: GamePair): Ware {
  return { item, price: 1 + Math.floor(Math.random() * MAX_PRICE) };
}

function stock(exclude: GamePair[] = []): Ware[] {
  return shuffled(SHOP_ITEMS.filter((i) => !exclude.includes(i))).slice(0, SHELF_SIZE).map(roll);
}

/** "fem kronor", or "en krona" for one. */
function priceAudio(price: number): string[] {
  return price === 1 ? [GAME_WORDS.en, GAME_WORDS.krona] : [numberAudio(price), GAME_WORDS.kronor];
}

export function ShopGame({ onBack }: { onBack: () => void }) {
  const say = useSpeaker();
  const [shelf, setShelf] = useState<Ware[]>(() => stock());
  const [picked, setPicked] = useState<Ware | null>(null);
  const [tray, setTray] = useState<number[]>([]);
  const [overpaid, setOverpaid] = useState(false);
  const [bag, setBag] = useState<GamePair[]>([]);
  const [phrase, setPhrase] = useState('');
  const paid = tray.reduce((sum, coin) => sum + coin, 0);

  function pick(ware: Ware) {
    setPicked(ware);
    setTray([]);
    void say(ware.item.audio, ...priceAudio(ware.price));
  }

  function pay(coin: number) {
    if (!picked || overpaid) return;
    const total = paid + coin;
    setTray([...tray, coin]);

    if (total > picked.price) {
      // Too much goes back in the purse: the sum has to land exactly.
      setOverpaid(true);
      setTimeout(() => {
        setTray([]);
        setOverpaid(false);
      }, 700);
      return;
    }

    if (total < picked.price) {
      void say(numberAudio(total));
      return;
    }

    const bought = picked;
    const nextBag = [...bag, bought.item];
    setBag(nextBag);
    setPicked(null);
    setTray([]);
    setShelf((current) => {
      const [fresh] = stock([...current.map((w) => w.item), ...nextBag]);
      return current.map((w) => (w === bought && fresh ? fresh : w));
    });

    if (nextBag.length === BAG_SIZE) {
      setPhrase(randomPhrase());
      playSfx('fanfare');
      void say(GAME_WORDS.tack);
    } else {
      void say(numberAudio(total), GAME_WORDS.tack);
    }
  }

  function again() {
    setBag([]);
    setShelf(stock());
  }

  return (
    <GameFrame emoji='👑' title='Kronbutiken' onBack={onBack}>
      <ul className={styles.shelf}>
        {shelf.map((ware) => (
          <li key={ware.item.sv}>
            <button
              type='button'
              className={`${styles.ware} ${motion.popIn} ${picked === ware ? styles.chosen : ''}`}
              onClick={() => pick(ware)}
              aria-label={`${ware.item.sv}, ${ware.price} kronor`}
            >
              <GameIcon icon={ware.item.icon} size={64} />
              <span className={styles.tag}>{ware.price} kr</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.counter}>
        {picked
          ? (
            <button
              type='button'
              className={`${styles.onCounter} ${motion.popIn}`}
              onClick={() => void say(picked.item.audio, ...priceAudio(picked.price))}
              aria-label={`${picked.item.sv}, ${picked.price} kronor. Hear it again`}
            >
              <GameIcon icon={picked.item.icon} size={88} />
              <span className={styles.bigTag}>{picked.price} kr</span>
            </button>
          )
          : <span className={styles.empty} aria-label='Pick something from the shelf'>👆</span>}

        <div className={`${styles.tray} ${overpaid ? styles.overpaid : ''}`} aria-label={`${paid} kronor paid`}>
          {tray.map((coin, i) => (
            <span key={i} className={`${styles.coin} ${coin >= 5 ? styles.gold : ''} ${styles.small} ${motion.popIn}`}>
              {coin}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.purse}>
        {COINS.map((coin) => (
          <button
            key={coin}
            type='button'
            className={`${styles.coin} ${coin >= 5 ? styles.gold : ''}`}
            onClick={() => pay(coin)}
            disabled={!picked}
            aria-label={`${coin} kronor`}
          >
            {coin}
          </button>
        ))}
      </div>

      <div className={styles.bag} aria-label={`${bag.length} of ${BAG_SIZE} in the bag`}>
        <span className={styles.bagEmoji} aria-hidden='true'>🛍️</span>
        {Array.from({ length: BAG_SIZE }, (_, i) => {
          const item = bag[i];
          return (
            <span key={i} className={item ? `${styles.slot} ${motion.stamp}` : styles.slot}>
              {item && <GameIcon icon={item.icon} size={40} />}
            </span>
          );
        })}
      </div>

      {bag.length === BAG_SIZE && (
        <Celebration onAgain={again}>
          <div className={styles.haul}>
            {bag.map((item) => <GameIcon key={item.sv} icon={item.icon} size={72} />)}
          </div>
          <span className={styles.phrase}>{phrase}</span>
        </Celebration>
      )}
    </GameFrame>
  );
}
