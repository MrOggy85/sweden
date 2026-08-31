import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { GameIcon } from '../GameIcons/GameIcons';
import { pickRound, randomPhrase, shuffled } from '../data/gameContent';
import type { GamePair } from '../data/gameContent';
import styles from './ConnectGame.module.css';

type Side = 'word' | 'image';

type Drag = { side: Side; sv: string; startX: number; startY: number; moved: boolean };
type Point = { x1: number; y1: number; x2: number; y2: number };

// How long the celebration overlay stays up before the next round starts on its own —
// there is no "next" button, per the issue: infinite rounds, no lives, no score.
const CELEBRATION_MS = 2200;

// A tap (as opposed to a drag) moves less than this many CSS pixels between pointerdown
// and pointerup.
const TAP_THRESHOLD_PX = 6;

function cardKey(side: Side, sv: string): string {
  return `${side}:${sv}`;
}

export function ConnectGame({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState<GamePair[]>(() => pickRound());
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [wrongKeys, setWrongKeys] = useState<Set<string>>(new Set());
  const [celebrating, setCelebrating] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [lines, setLines] = useState<(Point & { sv: string })[]>([]);
  const [dragPreview, setDragPreview] = useState<Point | null>(null);

  const leftOrder = useMemo(() => shuffled(round.map((p) => p.sv)), [round]);
  const rightOrder = useMemo(() => shuffled(round.map((p) => p.sv)), [round]);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<Drag | null>(null);
  const wrongTimeout = useRef<number | null>(null);

  function setCardRef(side: Side, sv: string, el: HTMLElement | null) {
    const key = cardKey(side, sv);
    if (el) cardRefs.current.set(key, el);
    else cardRefs.current.delete(key);
  }

  function pairFor(sv: string): GamePair | undefined {
    return round.find((p) => p.sv === sv);
  }

  function playWord(sv: string) {
    const pair = pairFor(sv);
    if (!pair) return;
    const audio = (audioRef.current ??= new Audio());
    // ?v= puts the clip on the immutable cache branch in api/server.ts.
    audio.src = `${pair.audio}?v=${BUILD_HASH}`;
    audio.currentTime = 0;
    // A clip that will not play is not worth interrupting a child over.
    void audio.play().catch(() => {});
  }

  const recomputeLines = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const panelRect = panel.getBoundingClientRect();
    const next: (Point & { sv: string })[] = [];

    for (const sv of connected) {
      const wordEl = cardRefs.current.get(cardKey('word', sv));
      const imageEl = cardRefs.current.get(cardKey('image', sv));
      if (!wordEl || !imageEl) continue;
      const w = wordEl.getBoundingClientRect();
      const im = imageEl.getBoundingClientRect();
      next.push({
        sv,
        x1: w.right - panelRect.left,
        y1: w.top + w.height / 2 - panelRect.top,
        x2: im.left - panelRect.left,
        y2: im.top + im.height / 2 - panelRect.top,
      });
    }

    setLines(next);
  }, [connected]);

  useLayoutEffect(() => {
    recomputeLines();
  }, [recomputeLines, round]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const observer = new ResizeObserver(() => recomputeLines());
    observer.observe(panel);
    window.addEventListener('orientationchange', recomputeLines);
    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', recomputeLines);
    };
  }, [recomputeLines]);

  // A round is done once every pair in it has been connected. Kept in its own effect from
  // the timeout below so setting `celebrating` here does not cancel the timeout that reacts
  // to it.
  useEffect(() => {
    if (!celebrating && round.length > 0 && connected.size === round.length) {
      setPhrase(randomPhrase());
      setCelebrating(true);
    }
  }, [connected, round, celebrating]);

  useEffect(() => {
    if (!celebrating) return;
    const timeout = window.setTimeout(() => {
      setRound(pickRound());
      setConnected(new Set());
      setCelebrating(false);
    }, CELEBRATION_MS);
    return () => window.clearTimeout(timeout);
  }, [celebrating]);

  useEffect(() => {
    return () => {
      if (wrongTimeout.current) window.clearTimeout(wrongTimeout.current);
    };
  }, []);

  function flashWrong(a: string, b: string) {
    setWrongKeys(new Set([a, b]));
    if (wrongTimeout.current) window.clearTimeout(wrongTimeout.current);
    wrongTimeout.current = window.setTimeout(() => setWrongKeys(new Set()), 300);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLElement>, side: Side, sv: string) {
    if (celebrating) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { side, sv, startX: e.clientX, startY: e.clientY, moved: false };
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    if (!drag.moved) {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (Math.hypot(dx, dy) < TAP_THRESHOLD_PX) return;
      drag.moved = true;
    }

    const panel = panelRef.current;
    const sourceEl = cardRefs.current.get(cardKey(drag.side, drag.sv));
    if (!panel || !sourceEl) return;
    const panelRect = panel.getBoundingClientRect();
    const sourceRect = sourceEl.getBoundingClientRect();

    setDragPreview({
      x1: drag.side === 'word' ? sourceRect.right - panelRect.left : sourceRect.left - panelRect.left,
      y1: sourceRect.top + sourceRect.height / 2 - panelRect.top,
      x2: e.clientX - panelRect.left,
      y2: e.clientY - panelRect.top,
    });
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    dragRef.current = null;
    setDragPreview(null);
    if (!drag) return;

    if (!drag.moved) {
      playWord(drag.sv);
      return;
    }

    const dropEl = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-connect-side]');
    if (!dropEl) return;
    const dropSide = dropEl.dataset.connectSide as Side | undefined;
    const dropSv = dropEl.dataset.connectSv;
    if (!dropSide || !dropSv || dropSide === drag.side) return;

    if (dropSv === drag.sv) {
      setConnected((prev) => new Set(prev).add(drag.sv));
    } else {
      flashWrong(cardKey(drag.side, drag.sv), cardKey(dropSide, dropSv));
    }
  }

  function cardClassName(side: Side, sv: string, base: string) {
    const classes = [styles.card, base];
    if (connected.has(sv)) classes.push(styles.solved);
    if (wrongKeys.has(cardKey(side, sv))) classes.push(styles.wrong);
    return classes.join(' ');
  }

  return (
    <article className={styles.game}>
      <button type='button' className={styles.back} onClick={onBack}>&larr; All topics</button>

      <h2 className={styles.title}><span aria-hidden='true'>🔗</span> Connect the words</h2>
      <p className={styles.blurb}>Drag a word to its picture, or a picture to its word.</p>

      <div
        ref={panelRef}
        className={styles.panel}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div className={styles.column}>
          {leftOrder.map((sv) => {
            const pair = pairFor(sv);
            if (!pair) return null;
            return (
              <div
                key={sv}
                ref={(el) => setCardRef('word', sv, el)}
                data-connect-side='word'
                data-connect-sv={sv}
                aria-label={`${pair.sv}, tap to hear it`}
                className={cardClassName('word', sv, styles.wordCard)}
                onPointerDown={(e) => handlePointerDown(e, 'word', sv)}
              >
                {pair.sv}
              </div>
            );
          })}
        </div>

        <svg className={styles.lines} aria-hidden='true'>
          {lines.map((line) => (
            <line
              key={line.sv}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={styles.solvedLine}
            />
          ))}
          {dragPreview && (
            <line
              x1={dragPreview.x1}
              y1={dragPreview.y1}
              x2={dragPreview.x2}
              y2={dragPreview.y2}
              className={styles.dragLine}
            />
          )}
        </svg>

        <div className={styles.column}>
          {rightOrder.map((sv) => {
            const pair = pairFor(sv);
            if (!pair) return null;
            return (
              <div
                key={sv}
                ref={(el) => setCardRef('image', sv, el)}
                data-connect-side='image'
                data-connect-sv={sv}
                aria-label={`Picture for ${pair.sv}, tap to hear it`}
                className={cardClassName('image', sv, styles.imageCard)}
                onPointerDown={(e) => handlePointerDown(e, 'image', sv)}
              >
                <GameIcon icon={pair.icon} size={44} />
              </div>
            );
          })}
        </div>

        {celebrating && (
          <div className={styles.celebration}>
            <span className={styles.celebrationEmoji} aria-hidden='true'>🎉</span>
            <span className={styles.celebrationPhrase}>{phrase}</span>
          </div>
        )}
      </div>
    </article>
  );
}
