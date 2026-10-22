import { useState } from 'react';
import { GameIcon } from '../GameIcons/GameIcons';
import { Celebration, GameFrame } from '../GameFrame/GameFrame';
import { randomPhrase, TRAVEL_STOPS, type TravelStop } from '../data/gameContent';
import { playSfx } from '../core/sfx';
import { useSpeaker } from '../core/useSpeaker';
import motion from '../core/motion.module.css';
import styles from './TravelGame.module.css';

// Coastline and borders as [lat, lon], clockwise from Treriksröset. Coarse on purpose: a
// child needs the long thin shape and the islands, not the fjords.
const MAINLAND: [number, number][] = [
  [69.06, 20.55],
  [68.44, 22.48],
  [67.95, 23.0],
  [67.2, 23.55],
  [66.6, 23.85],
  [66.0, 24.0],
  [65.82, 24.15],
  [65.6, 22.4],
  [65.3, 21.6],
  [64.75, 21.2],
  [64.2, 20.9],
  [63.8, 20.3],
  [63.5, 19.4],
  [63.0, 18.6],
  [62.6, 17.95],
  [62.3, 17.4],
  [61.7, 17.2],
  [61.0, 17.25],
  [60.65, 17.3],
  [60.4, 18.2],
  [60.2, 18.7],
  [59.8, 19.0],
  [59.4, 18.9],
  [59.0, 18.3],
  [58.8, 17.6],
  [58.5, 16.9],
  [57.9, 16.7],
  [57.3, 16.5],
  [56.7, 16.4],
  [56.2, 15.9],
  [56.15, 15.0],
  [56.0, 14.6],
  [55.65, 14.3],
  [55.42, 13.85],
  [55.35, 13.2],
  [55.55, 12.95],
  [55.95, 12.7],
  [56.25, 12.5],
  [56.55, 12.9],
  [56.9, 12.5],
  [57.3, 12.1],
  [57.7, 11.85],
  [58.2, 11.6],
  [58.65, 11.25],
  [59.0, 11.15],
  [59.1, 11.5],
  [59.8, 11.85],
  [60.1, 12.5],
  [60.9, 12.4],
  [61.4, 12.15],
  [61.9, 12.3],
  [62.3, 12.1],
  [63.0, 12.1],
  [63.6, 12.4],
  [64.1, 13.9],
  [64.6, 14.1],
  [65.1, 14.5],
  [65.7, 14.6],
  [66.1, 15.4],
  [66.6, 15.7],
  [67.0, 16.4],
  [67.5, 16.6],
  [68.0, 17.9],
  [68.4, 18.2],
  [68.55, 19.9],
  [68.9, 20.3],
];
const GOTLAND: [number, number][] = [
  [57.95, 19.1],
  [57.75, 18.95],
  [57.4, 18.75],
  [57.1, 18.25],
  [56.92, 18.15],
  [57.25, 18.1],
  [57.6, 18.35],
  [57.85, 18.65],
];
const OLAND: [number, number][] = [
  [57.35, 17.1],
  [56.9, 16.9],
  [56.2, 16.4],
  [56.35, 16.38],
  [56.9, 16.6],
  [57.3, 16.95],
];

// Equirectangular, with longitude squeezed by cos(62°) so the country is not drawn fat.
const SCALE = 15;
const x = (lon: number) => (lon - 9.0) * 0.47 * SCALE;
const y = (lat: number) => (69.6 - lat) * SCALE;
const outline = (points: [number, number][]) => points.map(([lat, lon]) => `${x(lon)},${y(lat)}`).join(' ');
const VIEW_W = x(25.6);
const VIEW_H = y(54.5);

export function TravelGame({ onBack }: { onBack: () => void }) {
  const say = useSpeaker();
  // How many stops have been reached; the train stands at the last one.
  const [reached, setReached] = useState(0);
  const [phrase, setPhrase] = useState('');
  const here = TRAVEL_STOPS[Math.max(reached - 1, 0)]!;
  const next = TRAVEL_STOPS[reached];

  function visit(stop: TravelStop, index: number) {
    if (index < reached) {
      void say(stop.audio, stop.sticker.audio);
      return;
    }
    if (index > reached) {
      // Not yet: name it, and the pulsing stop shows the way.
      void say(stop.audio);
      return;
    }
    setReached(index + 1);
    void say(stop.audio, stop.sticker.audio);
    if (index + 1 === TRAVEL_STOPS.length) {
      setPhrase(randomPhrase());
      playSfx('fanfare');
    }
  }

  return (
    <GameFrame emoji='🚂' title='Resa genom Sverige' onBack={onBack}>
      <div className={styles.trip}>
        <svg className={styles.map} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role='group' aria-label='Map of Sweden'>
          <rect width={VIEW_W} height={VIEW_H} className={styles.sea} />
          <polygon points={outline(MAINLAND)} className={styles.land} />
          <polygon points={outline(GOTLAND)} className={styles.land} />
          <polygon points={outline(OLAND)} className={styles.land} />

          <polyline
            points={TRAVEL_STOPS.slice(0, Math.max(reached, 1)).map((s) => `${x(s.lon)},${y(s.lat)}`).join(' ')}
            className={styles.route}
          />

          {TRAVEL_STOPS.map((stop, index) => {
            const isNext = index === reached;
            const visited = index < reached;
            return (
              <g
                key={stop.sv}
                className={styles.stop}
                transform={`translate(${x(stop.lon)} ${y(stop.lat)})`}
                onClick={() => visit(stop, index)}
                role='button'
                aria-label={visited ? `${stop.sv}, visited` : isNext ? `Travel to ${stop.sv}` : stop.sv}
              >
                {/* A finger-sized target around a small dot. */}
                <circle r={11} className={styles.hit} />
                {isNext && <circle r={8} className={styles.pulse} />}
                <circle r={visited ? 4.5 : 3.5} className={visited ? styles.visited : styles.dot} />
                <text x={7} y={4} className={styles.name}>{stop.sv}</text>
                {visited && (
                  <g transform='translate(-6.5 4.5)' className={styles.mapSticker}>
                    <GameIcon icon={stop.sticker.icon} size={13} />
                  </g>
                )}
              </g>
            );
          })}

          <g className={styles.train} style={{ transform: `translate(${x(here.lon)}px, ${y(here.lat)}px)` }}>
            <text x={-6} y={-5} className={styles.trainGlyph} aria-hidden='true'>🚂</text>
          </g>
        </svg>

        <ol className={styles.album} aria-label='Stickers'>
          {TRAVEL_STOPS.map((stop, index) => (
            <li key={stop.sv}>
              {index < reached
                ? (
                  <button
                    type='button'
                    className={`${styles.sticker} ${motion.stamp}`}
                    onClick={() => void say(stop.audio, stop.sticker.audio)}
                    aria-label={`${stop.sv}, ${stop.sticker.sv}`}
                  >
                    <GameIcon icon={stop.sticker.icon} size={52} />
                    <span className={styles.stickerName}>{stop.sv}</span>
                  </button>
                )
                : (
                  <span className={`${styles.sticker} ${styles.blank} ${index === reached ? styles.waiting : ''}`}>
                    ?
                  </span>
                )}
            </li>
          ))}
        </ol>
      </div>

      {!next && (
        <Celebration onAgain={() => setReached(0)}>
          <div className={styles.haul}>
            {TRAVEL_STOPS.map((s) => <GameIcon key={s.sv} icon={s.sticker.icon} size={64} />)}
          </div>
          <span className={styles.phrase}>{phrase}</span>
        </Celebration>
      )}
    </GameFrame>
  );
}
