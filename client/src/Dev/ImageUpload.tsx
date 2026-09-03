import { useEffect, useState } from 'react';
import { PAGES } from '../data/pages';
import styles from './ImageUpload.module.css';

// Default is honest rather than aspirational: most images come off the web with no licence
// checked. The URL is the part that matters, since it is what makes an image re-checkable.
const LICENCES = ['unknown (off the web)', 'own photo', 'CC0 / public domain', 'CC BY', 'CC BY-SA'];

type Status = { kind: 'idle' | 'sending' | 'done' | 'error'; message?: string };

const MAX_EDGE = 900;
const QUALITY = 0.8;

// Resized here rather than on the server: the api is deliberately free of npm dependencies,
// and a phone photo is several megabytes until something shrinks it.
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(MAX_EDGE / bitmap.width, MAX_EDGE / bitmap.height, 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', QUALITY));
  return blob ? new File([blob], 'upload.jpg', { type: 'image/jpeg' }) : file;
}

// Drops a file plus its metadata into .dev/incoming/ on the dev server. Deliberately not
// into client/static/: the build copies that wholesale, so an unwired upload would ship.
export function ImageUpload({ onUploaded }: { onUploaded: (file: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [page, setPage] = useState(PAGES[0]?.id ?? '');
  const [caption, setCaption] = useState('');
  const [source, setSource] = useState('');
  const [author, setAuthor] = useState('');
  const [licence, setLicence] = useState(LICENCES[0]!);
  const [details, setDetails] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  // "Copy image" in a browser puts a file on the clipboard, so Cmd+V anywhere on this page
  // picks it up. Pasted files are usually named image.png, hence the caption still matters.
  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const item = [...(event.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'));
      const pasted = item?.getAsFile();
      if (pasted) {
        setFile(pasted);
        setStatus({ kind: 'idle' });
      }
    }
    globalThis.addEventListener('paste', onPaste);
    return () => globalThis.removeEventListener('paste', onPaste);
  }, []);

  async function send() {
    if (!file) return;
    setStatus({ kind: 'sending' });

    const body = new FormData();
    body.set('file', await shrink(file));
    body.set('page', page);
    body.set('caption', caption);
    body.set('source', source);
    body.set('author', author);
    body.set('licence', licence);

    try {
      const res = await fetch('/api/dev/image', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.status);
      setStatus({ kind: 'done', message: `added to ${page} as ${data.stored}. Reload to see it.` });
      // Uploading is itself a verdict: you chose it, so it does not need reviewing.
      onUploaded(data.stored);
      setFile(null);
      setCaption('');
      setSource('');
      setAuthor('');
    } catch (err) {
      setStatus({ kind: 'error', message: String(err) });
    }
  }

  return (
    <section className={styles.upload}>
      <h3 className={styles.heading}>Add a photo</h3>

      <label
        className={dragging ? `${styles.drop} ${styles.dragging}` : styles.drop}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files[0];
          if (dropped) setFile(dropped);
        }}
      >
        <input
          type='file'
          accept='image/jpeg,image/png,image/webp'
          className={styles.file}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <span className={styles.dropText}>
          {file
            ? `${file.name} (${Math.round(file.size / 1024)} KB)`
            : 'Drop an image here, paste with Cmd+V, or tap to choose'}
        </span>
      </label>

      <label className={styles.field}>
        Page
        <select className={styles.input} value={page} onChange={(e) => setPage(e.target.value)}>
          {PAGES.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </label>

      <label className={styles.field}>
        Caption (shown under the photo)
        <input className={styles.input} value={caption} onChange={(e) => setCaption(e.target.value)} />
      </label>

      <label className={styles.field}>
        Where did you get it? Paste the URL
        <input
          className={styles.input}
          value={source}
          placeholder='https://...'
          onChange={(e) => setSource(e.target.value)}
        />
      </label>

      {details
        ? (
          <>
            <label className={styles.field}>
              Licence
              <select className={styles.input} value={licence} onChange={(e) => setLicence(e.target.value)}>
                {LICENCES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>

            <label className={styles.field}>
              Author
              <input className={styles.input} value={author} onChange={(e) => setAuthor(e.target.value)} />
            </label>
          </>
        )
        : (
          <button type='button' className={styles.more} onClick={() => setDetails(true)}>
            Add licence and author (optional)
          </button>
        )}

      <button
        type='button'
        className={styles.send}
        onClick={() => void send()}
        disabled={!file || status.kind === 'sending'}
      >
        {status.kind === 'sending' ? 'Sending…' : 'Upload'}
      </button>

      {status.message && <p className={status.kind === 'error' ? styles.error : styles.ok}>{status.message}</p>}
    </section>
  );
}
