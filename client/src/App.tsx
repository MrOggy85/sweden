import { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ConnectGame } from './ConnectGame/ConnectGame';
import { DevPage } from './Dev/DevPage';
import { Header } from './Header/Header';
import { History } from './History/History';
import { PageGrid } from './PageGrid/PageGrid';
import { PageView } from './PageView/PageView';
import { ProfileSetup } from './ProfileSetup/ProfileSetup';
import { pageById, PAGES } from './data/pages';
import type { PageProgress, User, Visit } from './data/types';
import { getPages, getVisits, recordVisit } from './data/api';
import { navigate, navigateReplace, registerNavigate } from './core/navigate';
import { useMe } from './data/useMe';
import styles from './App.module.css';

// The whole route table: `/` is the grid, `/connect` is the matching game, `/<pageId>` is
// a topic, `/dev...` is the diagnostics area. Page ids come from content/*.md, so no list
// needs maintaining here — an id that does not resolve is treated as a typo and rewritten
// to `/`.
const GAME_PATH = '/connect';

function pageIdFromPath(path: string): string | null {
  const id = path.replace(/^\/+|\/+$/g, '');
  return id === '' ? null : id;
}

/** The path below /dev, or null when this is not a dev route. `dev` is a reserved page id. */
function devSubPath(path: string): string | null {
  if (path === '/dev') return '/';
  return path.startsWith('/dev/') ? path.slice('/dev'.length) : null;
}

// Five taps on the build footer opens the dev area — the Android build-number gesture.
// Invisible to a child, one tap short of impossible to hit by accident, and no visible
// affordance to explain away.
const DEV_TAPS = 5;
const DEV_TAP_WINDOW_MS = 1500;

function App() {
  const { me, setMe, error, refresh, loading } = useMe();
  const [path, setPath] = useState(() => globalThis.location.pathname);
  const [addingProfile, setAddingProfile] = useState(false);
  const [progress, setProgress] = useState<PageProgress[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const devTaps = useRef(0);
  const devTapTimer = useRef(0);

  const user = me?.user ?? null;

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const [pages, history] = await Promise.all([getPages(), getVisits(10)]);
    setProgress(pages.pages);
    setVisits(history.items);
  }, [user]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    registerNavigate(setPath);
    const onPopState = () => setPath(globalThis.location.pathname);
    globalThis.addEventListener('popstate', onPopState);
    return () => globalThis.removeEventListener('popstate', onPopState);
  }, []);

  const devPath = devSubPath(path);
  const isGame = devPath === null && path === GAME_PATH;
  // Neither /dev nor /connect is a page id, so they must not reach the lookup below —
  // otherwise the unknown-page rewrite would bounce them straight back to the grid.
  const openPageId = devPath === null && !isGame ? pageIdFromPath(path) : null;
  const currentPage = openPageId ? pageById(openPageId) : undefined;

  // A URL naming a page that does not exist should not survive the next refresh.
  useEffect(() => {
    if (openPageId && !pageById(openPageId)) navigateReplace('/');
  }, [openPageId]);

  // Recording lives here rather than in the tap handler so that arriving at /flag any
  // other way — a refresh, the back button, a link — counts the same as tapping the card.
  // loadProgress is deliberately not a dependency: it is rebuilt whenever the `me` object
  // identity changes, and re-running on that would record a second visit for one opening.
  useEffect(() => {
    const pageId = currentPage?.id;
    if (!user || !pageId) return;
    void (async () => {
      try {
        await recordVisit(pageId, 'view');
        await loadProgress();
      } catch {
        // A dropped visit is not worth interrupting a child over.
      }
    })();
  }, [user?.id, currentPage?.id]);

  // Before the loading and error branches on purpose: diagnostics are most wanted when the
  // app itself will not come up.
  if (devPath !== null) return <DevPage path={devPath} />;

  if (loading) return <div className={styles.app} />;

  if (error && !me) {
    return (
      <div className={styles.app}>
        <p className={styles.error}>Could not reach the server. {error}</p>
      </div>
    );
  }

  if (!user || addingProfile) {
    return (
      <div className={styles.app}>
        <ProfileSetup
          onCreated={(created: User) => {
            setAddingProfile(false);
            setMe({ user: created, profiles: [...(me?.profiles ?? []), created] });
            void refresh();
          }}
        />
      </div>
    );
  }

  const openCount = progress.find((p) => p.pageId === openPageId)?.count ?? 0;
  const seen = progress.filter((p) => p.count > 0).length;

  function onFooterTap() {
    globalThis.clearTimeout(devTapTimer.current);
    devTaps.current += 1;
    if (devTaps.current >= DEV_TAPS) {
      devTaps.current = 0;
      navigate('/dev');
      return;
    }
    devTapTimer.current = globalThis.setTimeout(() => {
      devTaps.current = 0;
    }, DEV_TAP_WINDOW_MS);
  }

  return (
    <div className={styles.app}>
      <Header
        user={user}
        profiles={me?.profiles ?? [user]}
        seen={seen}
        pageCount={PAGES.length}
        onSwitched={(next) => {
          setMe({ user: next, profiles: me?.profiles ?? [next] });
          navigate('/');
        }}
        onAddProfile={() => setAddingProfile(true)}
      />

      <main className={styles.main}>
        {currentPage
          ? <PageView page={currentPage} count={openCount} onBack={() => navigate('/')} />
          : isGame
          ? <ConnectGame onBack={() => navigate('/')} />
          : (
            <PageGrid
              progress={progress}
              onOpen={(id) => navigate(`/${id}`)}
              onOpenGame={() => navigate(GAME_PATH)}
            />
          )}
      </main>

      {!currentPage && !isGame && <History visits={visits} />}

      <footer className={styles.footer}>
        <button type='button' className={styles.buildTap} onClick={onFooterTap}>build {BUILD_HASH}</button>
      </footer>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) createRoot(rootEl).render(<App />);
