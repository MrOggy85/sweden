import { pageById, SEASON_IDS } from '../data/pages';
import { navigate } from '../core/navigate';
import { playSfx } from '../core/sfx';
import motion from '../core/motion.module.css';
import styles from './SeasonWheel.module.css';

type Props = {
  currentId: string;
};

// Clockwise from 12 o'clock, so the wheel turns the way the year does. Colours are the
// seasons themselves, not the app palette: told apart by lightness as well as hue.
const COLORS: Record<string, string> = {
  spring: '#8fd694',
  summer: '#fecc00',
  autumn: '#ef8354',
  winter: '#9ecbe6',
};

const SIZE = 260;
const CENTER = SIZE / 2;
const OUTER = 118;
const INNER = 52;
// A seam between the quadrants, in degrees at each edge.
const GAP = 1.6;

const LABEL_RADIUS = (OUTER + INNER) / 2;

function point(angle: number, radius: number): [number, number] {
  const rad = (angle - 90) * (Math.PI / 180);
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

function quadrant(index: number): string {
  const from = index * 90 + GAP;
  const to = (index + 1) * 90 - GAP;
  const [x1, y1] = point(from, OUTER);
  const [x2, y2] = point(to, OUTER);
  const [x3, y3] = point(to, INNER);
  const [x4, y4] = point(from, INNER);
  return `M ${x1} ${y1} A ${OUTER} ${OUTER} 0 0 1 ${x2} ${y2} ` +
    `L ${x3} ${y3} A ${INNER} ${INNER} 0 0 0 ${x4} ${y4} Z`;
}

// The hub: three quarters of a circle with an arrowhead, saying the wheel goes round.
const HUB_RADIUS = 30;
const HUB_ARROW = (() => {
  const [sx, sy] = point(20, HUB_RADIUS);
  const [ex, ey] = point(290, HUB_RADIUS);
  return `M ${sx} ${sy} A ${HUB_RADIUS} ${HUB_RADIUS} 0 1 1 ${ex} ${ey}`;
})();

export function SeasonWheel({ currentId }: Props) {
  const seasons = SEASON_IDS.map((id) => pageById(id));
  // A renamed season page takes the wheel with it rather than leaving a hole in it.
  if (seasons.some((page) => page === undefined)) return null;

  return (
    <nav className={`${styles.wheel} ${motion.popIn}`} aria-label='The four seasons'>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={styles.svg}>
        {seasons.map((page, index) => {
          if (!page) return null;
          const current = page.id === currentId;
          const [lx, ly] = point(index * 90 + 45, LABEL_RADIUS);

          const face = (
            <>
              <path
                d={quadrant(index)}
                fill={COLORS[page.id] ?? '#ddd'}
                className={current ? styles.currentSlice : styles.slice}
              />
              <text x={lx} y={ly - 11} className={styles.emoji}>{page.emoji}</text>
              <text x={lx} y={ly + 15} className={current ? styles.currentLabel : styles.label}>
                {page.title}
              </text>
            </>
          );

          if (current) {
            return <g key={page.id} aria-current='page' aria-label={`${page.title}, you are here`}>{face}</g>;
          }

          // A real href, so the link survives a refresh and reads as a link; pushState
          // instead of a reload, like every other link in the app.
          return (
            <a
              key={page.id}
              href={`/${page.id}`}
              className={styles.link}
              aria-label={`Go to ${page.title}`}
              onClick={(e) => {
                e.preventDefault();
                playSfx('tap');
                navigate(`/${page.id}`);
              }}
            >
              {face}
            </a>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r={HUB_RADIUS + 8} className={styles.hub} />
        <path d={HUB_ARROW} className={styles.hubArrow} markerEnd='url(#season-arrow)' />

        <defs>
          <marker id='season-arrow' viewBox='0 0 8 8' refX='4' refY='4' markerWidth='5' markerHeight='5' orient='auto'>
            <path d='M 0 0 L 8 4 L 0 8 z' fill='#1c1c1c55' />
          </marker>
        </defs>
      </svg>
    </nav>
  );
}
