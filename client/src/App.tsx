import { useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './Header/Header';
import { History } from './History/History';
import { PageGrid } from './PageGrid/PageGrid';
import { PageView } from './PageView/PageView';
import { ProfileSetup } from './ProfileSetup/ProfileSetup';
import { pageById } from './data/pages';
import type { PageProgress, User, Visit } from './data/types';
import { getPages, getVisits, recordVisit } from './data/api';
import { navigate, navigateReplace, registerNavigate } from './core/navigate';
import { useMe } from './data/useMe';
import styles from './App.module.css';

// The whole route table: `/` is the grid, `/<pageId>` is a topic. Page ids come from
// content/*.md, so no list needs maintaining here — an id that does not resolve is
// treated as a typo and rewritten to `/`.
function pageIdFromPath(path: string): string | null {
  const id = path.replace(/^\/+|\/+$/g, '');
  return id === '' ? null : id;
}

function App() {
  const { me, setMe, error, refresh, loading } = useMe();
  const [path, setPath] = useState(() => globalThis.location.pathname);
  const [addingProfile, setAddingProfile] = useState(false);
  const [progress, setProgress] = useState<PageProgress[]>([]);
  const [total, setTotal] = useState(0);
  const [visits, setVisits] = useState<Visit[]>([]);

  const user = me?.user ?? null;

  const loadProgress = useCallback(async () => {
    if (!user) return;
    const [pages, history] = await Promise.all([getPages(), getVisits(10)]);
    setProgress(pages.pages);
    setTotal(pages.total);
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

  const openPageId = pageIdFromPath(path);
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

  return (
    <div className={styles.app}>
      <Header
        user={user}
        profiles={me?.profiles ?? [user]}
        total={total}
        onSwitched={(next) => {
          setMe({ user: next, profiles: me?.profiles ?? [next] });
          navigate('/');
        }}
        onAddProfile={() => setAddingProfile(true)}
      />

      <main className={styles.main}>
        {currentPage
          ? <PageView page={currentPage} count={openCount} onBack={() => navigate('/')} />
          : <PageGrid progress={progress} onOpen={(id) => navigate(`/${id}`)} />}
      </main>

      {!currentPage && <History visits={visits} />}

      <footer className={styles.footer}>build {BUILD_HASH}</footer>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) createRoot(rootEl).render(<App />);
