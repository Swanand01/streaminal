import { useState, useEffect } from 'react';
import {
  ContinueWatchingItem,
  HISTORY_KEY,
  HISTORY_MAX,
  HISTORY_EXPIRE_MS,
  readStorage,
  writeStorage,
} from '@/lib/storage';

export function useContinueWatching() {
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);

  useEffect(() => {
    const now = Date.now();
    const items = readStorage<ContinueWatchingItem>(HISTORY_KEY).filter(
      (item) => now - item.watched_at < HISTORY_EXPIRE_MS
    );
    setContinueWatching(items);
  }, []);

  const track = (item: Omit<ContinueWatchingItem, 'watched_at'>) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((w) => !(w.id === item.id && w.media_type === item.media_type));
      const newItem: ContinueWatchingItem = { ...item, watched_at: Date.now() };
      const updated = [newItem, ...filtered].slice(0, HISTORY_MAX);
      writeStorage(HISTORY_KEY, updated);
      return updated;
    });
  };

  const remove = (id: number, media_type: 'movie' | 'tv') => {
    setContinueWatching((prev) => {
      const updated = prev.filter((w) => !(w.id === id && w.media_type === media_type));
      writeStorage(HISTORY_KEY, updated);
      return updated;
    });
  };

  const getProgress = (id: number): { season_number: number; episode_number: number } | null => {
    const item = continueWatching.find((w) => w.id === id && w.media_type === 'tv');
    if (!item?.season_number || !item?.episode_number) return null;
    return { season_number: item.season_number, episode_number: item.episode_number };
  };

  return { continueWatching, track, remove, getProgress };
}
