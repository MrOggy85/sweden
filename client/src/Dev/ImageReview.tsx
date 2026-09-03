import { useEffect, useMemo, useState } from 'react';
import { PAGES } from '../data/pages';
import { ImageUpload } from './ImageUpload';
import styles from './ImageReview.module.css';

type Verdict = { keep: boolean; reason?: string };
type Target = { file: string; page: string; caption: string; src: string };
type Verdicts = Record<string, Verdict>;

const STORE_KEY = 'sweden.image-review.v1';

// Fixed reasons rather than free text: this gets used on an iPad, where typing is the part
// that stops you reviewing forty images.
const REASONS = ['wrong subject', 'too dark', 'too busy', 'dull', 'not Swedish', 'scary'];

function load(): Verdicts {
  try {
    return JSON.parse(globalThis.localStorage.getItem(STORE_KEY) ?? '{}') as Verdicts;
  } catch {
    return {};
  }
}

/** Paste-back format: one line per judged image, so a verdict survives leaving the page. */
function report(verdicts: Verdicts, total: number): string {
  const lines = Object.entries(verdicts).map(([file, v]) =>
    v.keep ? `keep: ${file}` : `drop: ${file}${v.reason ? ` (${v.reason})` : ''}`
  );
  const judged = lines.length;
  return [`image-review v1 (${judged}/${total} judged)`, ...lines.sort()].join('\n');
}

export function ImageReview() {
  const [verdicts, setVerdicts] = useState<Verdicts>(load);
  const [dropped, setDropped] = useState<string[]>([]);

  const images = useMemo(
    () => PAGES.flatMap((page) => (page.images ?? []).map((image) => ({ ...image, page: page.id }))),
    [],
  );

  // Also POSTed to the dev server, which writes .dev/image-review.json in the working tree:
  // localStorage alone is invisible to whoever is editing the repo.
  useEffect(() => {
    globalThis.localStorage.setItem(STORE_KEY, JSON.stringify(verdicts));
    void fetch('/api/dev/review', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(verdicts),
    }).catch(() => {});
  }, [verdicts]);

  function judge(file: string, keep: boolean) {
    setVerdicts((prev) => ({ ...prev, [file]: { keep, reason: keep ? undefined : prev[file]?.reason } }));
  }

  // Drop deletes: the file, its line in the content file, and its sources entry. Only the
  // reason survives, in content/media/rejected.md.
  async function drop(target: Target, reason?: string) {
    setDropped((prev) => [...prev, target.file]);
    await fetch('/api/dev/image/drop', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ file: target.file, page: target.page, reason }),
    }).catch(() => {});
  }

  function setReason(file: string, reason: string) {
    setVerdicts((prev) => ({
      ...prev,
      [file]: { keep: false, reason: prev[file]?.reason === reason ? undefined : reason },
    }));
  }

  const text = report(verdicts, images.length);

  if (images.length === 0) return <p className={styles.note}>No images in the content yet.</p>;

  return (
    <div className={styles.review}>
      <p className={styles.note}>
        Keep or drop each one. Reasons are optional and only matter for the ones you drop. Verdicts are stored on this
        device, so you can stop and come back; paste the block at the bottom into the chat when you are done.
      </p>

      <ul className={styles.list}>
        {images.map((image) => {
          const file = image.src.split('/').pop() ?? image.src;
          const verdict = verdicts[file];
          if (dropped.includes(file)) return null;
          return (
            <li key={image.src} className={styles.item}>
              <img className={styles.photo} src={image.src} alt={image.caption} loading='lazy' />
              <div className={styles.meta}>
                <span className={styles.page}>{image.page}</span>
                <span className={styles.caption}>{image.caption}</span>
                <span className={styles.file}>{file}</span>
              </div>

              <div className={styles.actions}>
                <button
                  type='button'
                  className={verdict?.keep === true ? `${styles.keep} ${styles.on}` : styles.keep}
                  onClick={() => judge(file, true)}
                >
                  Keep
                </button>
                <button
                  type='button'
                  className={verdict?.keep === false ? `${styles.drop} ${styles.on}` : styles.drop}
                  onClick={() => judge(file, false)}
                >
                  Drop
                </button>
                {verdict?.keep === false && (
                  <button
                    type='button'
                    className={styles.confirm}
                    onClick={() =>
                      void drop({ file, page: image.page, caption: image.caption, src: image.src }, verdict.reason)}
                  >
                    Delete it
                  </button>
                )}
              </div>

              {verdict?.keep === false && (
                <div className={styles.reasons}>
                  {REASONS.map((reason) => (
                    <button
                      key={reason}
                      type='button'
                      className={verdict.reason === reason ? `${styles.reason} ${styles.on}` : styles.reason}
                      onClick={() => setReason(file, reason)}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <ImageUpload onUploaded={(file) => judge(file, true)} />

      <h3 className={styles.subheading}>Or paste this back</h3>
      <textarea className={styles.output} readOnly rows={Math.min(images.length + 2, 14)} value={text} />
      <div className={styles.actions}>
        <button type='button' className={styles.keep} onClick={() => void navigator.clipboard?.writeText(text)}>
          Copy
        </button>
        <button type='button' className={styles.drop} onClick={() => setVerdicts({})}>
          Reset all
        </button>
      </div>
    </div>
  );
}
