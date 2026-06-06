'use client';

import { MediaCarousel } from '@/components/media/media-carousel';
import { useContinueWatching } from '@/hooks/use-continue-watching';
import { useWatchlist } from '@/hooks/use-watchlist';
import { toMediaItem, toContinueMedia } from '@/lib/storage';

export function ContinueWatchingSection() {
  const { continueWatching, remove } = useContinueWatching();
  if (continueWatching.length === 0) return null;
  return (
    <MediaCarousel
      title="Continue Watching"
      items={continueWatching.map(toContinueMedia)}
      onRemove={remove}
    />
  );
}

export function WatchlistSection() {
  const { watchlist, remove } = useWatchlist();
  if (watchlist.length === 0) return null;
  return (
    <MediaCarousel title="My Watchlist" items={watchlist.map(toMediaItem)} onRemove={remove} />
  );
}
