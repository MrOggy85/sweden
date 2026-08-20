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
import { useMe } from './data/useMe';
import styles from './App.module.css';

function App() {
  const { me, setMe, error, refresh, loading } = useMe();
  const [openPageId, setOpenPageId] = useState<string | null>(null);
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

  async function openPage(pageId: string) {
    setOpenPageId(pageId);
    // Fire-and-forget: never block the transition on the write.
    try {
      await recordVisit(pageId, 'view');
      await loadProgress();
    } catch {
      // A dropped visit is not worth interrupting a child over.
    }
  }

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

  const currentPage = openPageId ? pageById(openPageId) : undefined;
  const openCount = progress.find((p) => p.pageId === openPageId)?.count ?? 0;

  return (
    <div className={styles.app}>
      <Header
        user={user}
        profiles={me?.profiles ?? [user]}
        total={total}
        onSwitched={(next) => {
          setMe({ user: next, profiles: me?.profiles ?? [next] });
          setOpenPageId(null);
        }}
        onAddProfile={() => setAddingProfile(true)}
      />

      <main className={styles.main}>
        {currentPage
          ? <PageView page={currentPage} count={openCount} onBack={() => setOpenPageId(null)} />
          : <PageGrid progress={progress} onOpen={(id) => void openPage(id)} />}
      </main>

      {!currentPage && <History visits={visits} />}

      <footer className={styles.footer}>build {BUILD_HASH}</footer>
    </div>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) createRoot(rootEl).render(<App />);
