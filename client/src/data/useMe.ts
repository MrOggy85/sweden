import { useCallback, useEffect, useState } from 'react';
import type { Me } from './types';
import { getMe } from './api';

/**
 * Single source of truth for identity: /api/me on mount. Mutating endpoints return the
 * updated user, so callers can hand it straight to setMe without a refetch.
 */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setMe(await getMe());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not reach the server');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { me, setMe, error, refresh, loading: me === null && error === null };
}
