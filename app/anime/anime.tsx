import { discoverTVShows, getTVGenres } from '@/lib/tmdb';
import { BrowseContent } from '@/components/browse-content';

const ANIME_PARAMS = {
  with_genres: '16',
  with_original_language: 'ja',
  with_keywords: '210024',
  without_keywords: '198385',
};

export async function Anime() {
  const [genres, initialData] = await Promise.all([
    getTVGenres().catch(() => []),
    discoverTVShows({
      page: 1,
      sort_by: 'popularity.desc',
      ...ANIME_PARAMS,
    }).catch(() => ({ results: [], total_pages: 0, total_results: 0, page: 1 })),
  ]);

  return (
    <BrowseContent
      mediaType="tv"
      title="Anime"
      initialGenres={genres}
      initialData={initialData}
      lockedParams={ANIME_PARAMS}
      itemLabel="anime"
    />
  );
}
