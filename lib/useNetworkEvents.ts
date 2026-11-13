'use client'

import { useEffect, useState } from 'react';
import type { NetworkEvent } from '@/lib/sdx-calendars';

/** One request per page load, shared by every section that shows events. */
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { at: number; promise: Promise<NetworkEvent[]> } | null = null;

function loadEvents(): Promise<NetworkEvent[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.promise;

  const promise = fetch('/api/events/network')
    .then((res) => {
      if (!res.ok) throw new Error(`events: ${res.status}`);
      return res.json();
    })
    .then((json) => (Array.isArray(json?.events) ? (json.events as NetworkEvent[]) : []));

  cache = { at: Date.now(), promise };
  // A failed call should not stick: the next section to ask tries again.
  promise.catch(() => {
    if (cache?.promise === promise) cache = null;
  });
  return promise;
}

/** Every event on the three SDx calendars, newest first. */
export function useNetworkEvents() {
  const [state, setState] = useState<{ events: NetworkEvent[]; loading: boolean; error: boolean }>({
    events: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    loadEvents()
      .then((events) => {
        if (!cancelled) setState({ events, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ events: [], loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
