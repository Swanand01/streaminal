'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediaPlayer } from '@/components/media-player';
import { MediaOverview } from '@/components/media-overview';
import { WatchlistButton } from '@/components/watchlist-button';
import { WatchTracker } from '@/components/watch-tracker';
import { TVShowTabs } from './tv-show-tabs';
import { SimilarMediaSection } from '@/components/similar-media-section';
import { getTitle } from '@/lib/tmdb';
import { generateSlug } from '@/lib/utils';
import type { MediaDetails, Season, Media, Video, Review } from '@/lib/tmdb';

interface TVShowContentProps {
  tvId: number;
  initialShow: MediaDetails;
  initialSeasonData: Season;
  similarShows: Media[];
  videos: Video[];
  reviews: Review[];
  initialSeason: number;
  initialEpisode: number;
}

export function TVShowContent({
  tvId,
  initialShow,
  initialSeasonData,
  similarShows,
  videos,
  reviews,
  initialSeason,
  initialEpisode,
}: TVShowContentProps) {
  const router = useRouter();
  const slug = generateSlug(getTitle(initialShow), tvId);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);

  const handleSeasonChange = (season: number) => {
    setSelectedEpisode(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    router.push(`/tv-shows/${slug}?season=${season}&episode=1`);
  };

  const handleEpisodeChange = (episode: number) => {
    setSelectedEpisode(episode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = `/tv-shows/${slug}?season=${initialSeason}&episode=${episode}`;
    window.history.replaceState(null, '', url);
  };

  const currentEpisode = initialSeasonData?.episodes.find(
    (ep) => ep.episode_number === selectedEpisode
  );
  const episodeOverview = currentEpisode?.overview;

  return (
    <>
      {/* Video Player Section */}
      <div className="relative w-full pt-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <MediaPlayer type="tv" mediaId={tvId} season={initialSeason} episode={selectedEpisode} />
          <WatchTracker
            key={`${initialSeason}-${selectedEpisode}`}
            id={tvId}
            mediaType="tv"
            title={getTitle(initialShow)}
            posterPath={initialShow.poster_path}
            slug={slug}
            voteAverage={initialShow.vote_average}
            seasonNumber={initialSeason}
            episodeNumber={selectedEpisode}
            episodeName={currentEpisode?.name}
          />
        </div>
      </div>

      {/* Show Info with Sidebar Layout */}
      <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="min-w-0 flex-1">
            <MediaOverview
              media={initialShow}
              overviewText={episodeOverview}
              actions={
                <WatchlistButton
                  id={tvId}
                  mediaType="tv"
                  title={getTitle(initialShow)}
                  posterPath={initialShow.poster_path}
                  slug={slug}
                  voteAverage={initialShow.vote_average}
                />
              }
            />
            <TVShowTabs
              show={initialShow}
              selectedSeason={initialSeason}
              selectedEpisode={selectedEpisode}
              seasonData={initialSeasonData}
              videos={videos}
              reviews={reviews}
              onSeasonChange={handleSeasonChange}
              onEpisodeChange={handleEpisodeChange}
            />
          </div>

          {/* Recommendations Sidebar */}
          <SimilarMediaSection items={similarShows} />
        </div>
      </div>
    </>
  );
}
