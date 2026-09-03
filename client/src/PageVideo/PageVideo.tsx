import { useState } from 'react';
import type { Video } from '../data/pages';
import styles from './PageVideo.module.css';

type Props = {
  videos: Video[];
};

// Nothing reaches YouTube until a child taps: the facade is ours, and the iframe only
// mounts after the tap. Keeps the page fast and sets no third-party cookies on arrival.
//
// The tap is also what satisfies iOS autoplay, so autoplay=1 is honoured.
//
// fs=0 hides the fullscreen button and the iframe carries no allowFullScreen: fullscreen
// hides the app, which on a shared iPad is a way to get lost. rel=0 no longer removes
// end-screen suggestions, only restricts them to the same channel — the player remains a
// door out of the app, accepted deliberately (PROJECT.md, Video).
function embedUrl(id: string): string {
  const params = new URLSearchParams({
    autoplay: '1',
    playsinline: '1',
    rel: '0',
    fs: '0',
    modestbranding: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
}

export function PageVideo({ videos }: Props) {
  const [playing, setPlaying] = useState<string | null>(null);

  if (videos.length === 0) return null;

  return (
    <ul className={styles.videos}>
      {videos.map((video) => (
        <li key={video.id} className={styles.item}>
          {playing === video.id
            ? (
              <iframe
                className={styles.frame}
                src={embedUrl(video.id)}
                title={video.label}
                allow='autoplay; encrypted-media; picture-in-picture'
              />
            )
            : (
              <button
                type='button'
                className={styles.facade}
                onClick={() => setPlaying(video.id)}
                aria-label={`Play video: ${video.label}`}
              >
                <span className={styles.play} aria-hidden='true'>▶</span>
                <span className={styles.label}>{video.label}</span>
              </button>
            )}
        </li>
      ))}
    </ul>
  );
}
