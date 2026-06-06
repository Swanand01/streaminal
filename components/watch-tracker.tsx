'use client';

import { useEffect } from 'react';
import { useContinueWatching } from '@/hooks/use-continue-watching';

interface WatchTrackerProps {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  slug: string;
  voteAverage: number;
  seasonNumber?: number;
  episodeNumber?: number;
  episodeName?: string;
}

const THRESHOLD_MS = 30_000;

export function WatchTracker({
  id,
  mediaType,
  title,
  posterPath,
  slug,
  voteAverage,
  seasonNumber,
  episodeNumber,
  episodeName,
}: WatchTrackerProps) {
  const { track } = useContinueWatching();

  useEffect(() => {
    const timer = setTimeout(() => {
      track({
        id,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        slug,
        vote_average: voteAverage,
        season_number: seasonNumber,
        episode_number: episodeNumber,
        episode_name: episodeName,
      });
    }, THRESHOLD_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, seasonNumber, episodeNumber]);

  return null;
}
