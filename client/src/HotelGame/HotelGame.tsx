import { useEffect, useState } from 'react';
import { GAME_COLORS, GameIcon } from '../GameIcons/GameIcons';
import type { GameColorId } from '../GameIcons/iconIds';
import { Celebration, GameFrame } from '../GameFrame/GameFrame';
import {
  GAME_PAIRS,
  GAME_WORDS,
  type GamePair,
  HOTEL_GUESTS,
  numberAudio,
  randomPhrase,
  shuffled,
} from '../data/gameContent';
import { playSfx } from '../core/sfx';
import { useSpeaker } from '../core/useSpeaker';
import motion from '../core/motion.module.css';
import styles from './HotelGame.module.css';

// Nine rooms, each with its own number and colour, so a guest can ask by either.
const DOOR_COLORS: GameColorId[] = ['red', 'blue', 'yellow', 'green', 'purple', 'pink', 'orange', 'white', 'brown'];
const ROOMS = DOOR_COLORS.map((color, i) => ({ number: i + 1, color }));
// Top floor first, as the building is drawn; room 1 is bottom left.
const FLOORS = [[7, 8, 9], [4, 5, 6], [1, 2, 3]];

const STAY = 6;
// The first guests ask by number; after that, number or colour at random.
const NUMBER_ONLY = 2;

type Guest = { animal: GamePair; room: number; byColor: boolean };

// Colour words are connect-game pairs; the icon id is how to find them.
function colorAudio(color: GameColorId): string {
  return GAME_PAIRS.find((p) => p.icon === `color-${color}`)?.audio ?? '';
}

function checkIn(): Guest[] {
  const rooms = shuffled(ROOMS).slice(0, STAY);
  return shuffled(HOTEL_GUESTS).slice(0, STAY).map((animal, i) => ({
    animal,
    room: rooms[i]!.number,
    byColor: i >= NUMBER_ONLY && Math.random() < 0.5,
  }));
}

function requestAudio(guest: Guest): string[] {
  const room = ROOMS[guest.room - 1]!;
  return [
    guest.animal.audio,
    ...(guest.byColor ? [colorAudio(room.color)] : [GAME_WORDS.rum, numberAudio(room.number)]),
  ];
}

export function HotelGame({ onBack }: { onBack: () => void }) {
  const say = useSpeaker();
  const [guests, setGuests] = useState(checkIn);
  const [arrived, setArrived] = useState(0);
  // Room number -> who is staying there.
  const [occupied, setOccupied] = useState<Map<number, GamePair>>(new Map());
  const [wrong, setWrong] = useState<number | null>(null);
  const [phrase, setPhrase] = useState('');

  const guest = guests[arrived];

  useEffect(() => {
    if (guest) void say(...requestAudio(guest));
  }, [guest]);

  function knock(number: number) {
    const resident = occupied.get(number);
    if (resident) {
      void say(resident.audio);
      return;
    }
    if (!guest) return;

    if (number !== guest.room) {
      // Say what was tapped, in the same terms as the request, so the miss teaches too.
      const room = ROOMS[number - 1]!;
      setWrong(number);
      setTimeout(() => setWrong(null), 400);
      void say(...(guest.byColor ? [colorAudio(room.color)] : [GAME_WORDS.rum, numberAudio(number)]));
      return;
    }

    setOccupied(new Map(occupied).set(number, guest.animal));
    if (arrived + 1 === guests.length) {
      setPhrase(randomPhrase());
      playSfx('fanfare');
    } else {
      playSfx('correct');
    }
    setArrived(arrived + 1);
  }

  function again() {
    setGuests(checkIn());
    setArrived(0);
    setOccupied(new Map());
  }

  return (
    <GameFrame emoji='🏨' title='Djurhotellet' onBack={onBack}>
      <div className={styles.building}>
        <div className={styles.sign} aria-hidden='true'>⭐ HOTELL ⭐</div>
        {FLOORS.map((floor) => (
          <div key={floor[0]} className={styles.floor}>
            {floor.map((number) => {
              const room = ROOMS[number - 1]!;
              const resident = occupied.get(number);
              return (
                <button
                  key={number}
                  type='button'
                  className={`${styles.door} ${wrong === number ? styles.wrong : ''}`}
                  style={{ background: GAME_COLORS[room.color] }}
                  onClick={() => knock(number)}
                  aria-label={resident ? `Room ${number}, ${resident.sv}` : `Room ${number}, ${room.color}`}
                >
                  <span className={styles.plate}>{number}</span>
                  <span className={styles.window}>
                    {resident && (
                      <span className={motion.stamp}>
                        <GameIcon icon={resident.icon} size={44} />
                      </span>
                    )}
                  </span>
                  <span className={styles.knob} aria-hidden='true' />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className={styles.reception}>
        <span className={styles.bell} aria-hidden='true'>🛎️</span>
        {guest && (
          <button
            key={arrived}
            type='button'
            className={`${styles.guest} ${motion.popIn}`}
            onClick={() => void say(...requestAudio(guest))}
            aria-label={`${guest.animal.sv} wants a room. Hear it again`}
          >
            <GameIcon icon={guest.animal.icon} size={88} />
            <span className={styles.bubble} aria-hidden='true'>🔊</span>
          </button>
        )}
        <span className={styles.queue} aria-label={`${guests.length - arrived} guests waiting`}>
          {guests.slice(arrived + 1).map((g) => <GameIcon key={g.animal.sv} icon={g.animal.icon} size={32} />)}
        </span>
      </div>

      {!guest && (
        <Celebration onAgain={again}>
          <div className={styles.guestbook}>
            {guests.map((g) => <GameIcon key={g.animal.sv} icon={g.animal.icon} size={64} />)}
          </div>
          <span className={styles.phrase}>{phrase}</span>
        </Celebration>
      )}
    </GameFrame>
  );
}
