'use client'

import { useEffect, useState } from 'react';
import type { ProcessedEvent } from '@/types/luma';

/** Where /api/events got its list: the Luma API, the public calendar feed, or the bundled demo list. */
export type EventsSource = 'api' | 'ics' | 'demo';

type Loaded = { events: ProcessedEvent[]; source: EventsSource };

/** One request per page load, shared by every section that shows events. */
const CACHE_TTL_MS = 10 * 60 * 1000;
let cache: { at: number; promise: Promise<Loaded> } | null = null;

function loadEvents(): Promise<Loaded> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.promise;

  const promise = fetch('/api/events?filter=all&limit=50')
    .then((res) => {
      if (!res.ok) throw new Error(`events: ${res.status}`);
      return res.json();
    })
    .then((json) => ({
      events: Array.isArray(json?.data) ? (json.data as ProcessedEvent[]) : [],
      source: (json?.source ?? (json?.usingFallback ? 'demo' : 'api')) as EventsSource,
    }));

  cache = { at: Date.now(), promise };
  // A failed call should not stick: the next section to ask tries again.
  promise.catch(() => {
    if (cache?.promise === promise) cache = null;
  });
  return promise;
}

/** Every main-calendar event the API returns (up to 50), newest first. */
export function useSdxEvents() {
  const [state, setState] = useState<{
    events: ProcessedEvent[];
    source: EventsSource | null;
    loading: boolean;
    error: boolean;
  }>({ events: [], source: null, loading: true, error: false });

  useEffect(() => {
    let cancelled = false;
    loadEvents()
      .then(({ events, source }) => {
        if (!cancelled) setState({ events, source, loading: false, error: false });
      })
      .catch(() => {
        if (!cancelled) setState({ events: [], source: null, loading: false, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
