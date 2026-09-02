import { navigate } from '../core/navigate';
import { Voices } from './Voices';
import styles from './DevPage.module.css';

type Props = {
  // Path below /dev: '/' for the index, '/voices' for that tool.
  path: string;
};

const TOOLS = [
  { path: '/voices', title: 'Speech voices', blurb: 'What speechSynthesis offers on this device' },
];

// Diagnostics, reachable only by tapping the build footer five times. Deliberately
// unstyled-for-children: this is for whoever is debugging on the actual iPad, where there
// is no console and no remote inspector to hand.
export function DevPage({ path }: Props) {
  const tool = TOOLS.find((t) => t.path === path);

  return (
    <div className={styles.dev}>
      <header className={styles.header}>
        <button
          type='button'
          className={styles.back}
          onClick={() => navigate(tool ? '/dev' : '/')}
        >
          &larr; {tool ? 'Dev' : 'Back to the app'}
        </button>
        <h1 className={styles.title}>{tool ? tool.title : 'Dev'}</h1>
      </header>

      {tool?.path === '/voices' ? <Voices /> : <Index unknown={path !== '/'} />}
    </div>
  );
}

function Index({ unknown }: { unknown: boolean }) {
  const audio = new Audio();

  return (
    <>
      {unknown && <p className={styles.note}>No such tool. Here is what there is.</p>}

      <ul className={styles.tools}>
        {TOOLS.map((tool) => (
          <li key={tool.path}>
            <button type='button' className={styles.tool} onClick={() => navigate(`/dev${tool.path}`)}>
              <span className={styles.toolTitle}>{tool.title}</span>
              <span className={styles.toolBlurb}>{tool.blurb}</span>
            </button>
          </li>
        ))}
      </ul>

      <h2 className={styles.subtitle}>Environment</h2>
      <dl className={styles.env}>
        <dt>Build</dt>
        <dd>{BUILD_HASH}</dd>
        <dt>AAC in m4a</dt>
        <dd>{audio.canPlayType('audio/mp4') || 'no'}</dd>
        <dt>MP3</dt>
        <dd>{audio.canPlayType('audio/mpeg') || 'no'}</dd>
        <dt>speechSynthesis</dt>
        <dd>{'speechSynthesis' in globalThis ? 'present' : 'absent'}</dd>
        <dt>Screen</dt>
        <dd>{globalThis.innerWidth}×{globalThis.innerHeight} @{globalThis.devicePixelRatio}x</dd>
        <dt>User agent</dt>
        <dd className={styles.ua}>{navigator.userAgent}</dd>
      </dl>
    </>
  );
}
