import { useState, useEffect } from 'react';
import {
  WatchlistItem,
  WATCHLIST_KEY,
  WATCHLIST_MAX,
  readStorage,
  writeStorage,
} from '@/lib/storage';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  useEffect(() => {
    setWatchlist(readStorage<WatchlistItem>(WATCHLIST_KEY));
  }, []);

  const add = (item: Omit<WatchlistItem, 'added_at'>) => {
    setWatchlist((prev) => {
      if (prev.some((w) => w.id === item.id && w.media_type === item.media_type)) return prev;
      const newItem: WatchlistItem = { ...item, added_at: Date.now() };
      const updated = [newItem, ...prev];
      const trimmed =
        updated.length > WATCHLIST_MAX
          ? updated.sort((a, b) => b.added_at - a.added_at).slice(0, WATCHLIST_MAX)
          : updated;
      writeStorage(WATCHLIST_KEY, trimmed);
      return trimmed;
    });
  };

  const remove = (id: number, media_type: 'movie' | 'tv') => {
    setWatchlist((prev) => {
      const updated = prev.filter((w) => !(w.id === id && w.media_type === media_type));
      writeStorage(WATCHLIST_KEY, updated);
      return updated;
    });
  };

  const isInWatchlist = (id: number, media_type: 'movie' | 'tv') =>
    watchlist.some((w) => w.id === id && w.media_type === media_type);

  return { watchlist, add, remove, isInWatchlist };
}
