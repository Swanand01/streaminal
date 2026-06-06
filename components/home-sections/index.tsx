import { HeroCarousel } from '@/components/hero-carousel';
import { MediaCarousel } from '@/components/media/media-carousel';
import { getTrending, getPopularMovies, getPopularTVShows } from '@/lib/tmdb';

export { ContinueWatchingSection, WatchlistSection } from './user-sections';

export async function HeroSection() {
  const trending = (await getTrending('all', 'day').catch(() => [])).filter(
    (item) => item.media_type !== 'person'
  );

  if (!trending || trending.length === 0) return null;

  return <HeroCarousel items={trending.slice(0, 5)} />;
}

export async function TrendingSection() {
  const trending = (await getTrending('all', 'day').catch(() => [])).filter(
    (item) => item.media_type !== 'person'
  );

  if (!trending || trending.length === 0) return null;

  return <MediaCarousel title="Trending Now" items={trending} />;
}

export async function PopularMoviesSection() {
  const popularMovies = await getPopularMovies().catch(() => []);

  if (!popularMovies || popularMovies.length === 0) return null;

  return <MediaCarousel title="Popular Movies" items={popularMovies} showMediaType={false} />;
}

export async function PopularTVShowsSection() {
  const popularTVShows = await getPopularTVShows().catch(() => []);

  if (!popularTVShows || popularTVShows.length === 0) return null;

  return <MediaCarousel title="Popular TV Shows" items={popularTVShows} showMediaType={false} />;
}
