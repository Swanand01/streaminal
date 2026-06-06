'use client';

import { Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWatchlist } from '@/hooks/use-watchlist';

interface WatchlistButtonProps {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  slug: string;
  voteAverage: number;
}

export function WatchlistButton({
  id,
  mediaType,
  title,
  posterPath,
  slug,
  voteAverage,
}: WatchlistButtonProps) {
  const { add, remove, isInWatchlist } = useWatchlist();
  const saved = isInWatchlist(id, mediaType);

  const handleToggle = () => {
    if (saved) {
      remove(id, mediaType);
    } else {
      add({
        id,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        slug,
        vote_average: voteAverage,
      });
    }
  };

  return (
    <Button
      variant={saved ? 'default' : 'outline'}
      size="lg"
      onClick={handleToggle}
      className="shrink-0 gap-2"
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? 'Saved' : 'Watchlist'}
    </Button>
  );
}
