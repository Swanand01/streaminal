import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { HeroBannerSkeleton } from '@/components/skeletons/hero-banner-skeleton';
import { MediaCarouselSkeleton } from '@/components/skeletons/media-carousel-skeleton';
import { JsonLd } from '@/components/jsonld';
import { generateWebSiteJsonLd } from '@/lib/seo';
import {
  HeroSection,
  ContinueWatchingSection,
  WatchlistSection,
  TrendingSection,
  PopularMoviesSection,
  PopularTVShowsSection,
  PopularAnimeSection,
} from '@/components/home-sections';

export const metadata: Metadata = {
  title: 'Streaminal - Watch Movies & TV Shows Online Free in HD',
  description:
    'Stream thousands of movies and TV shows online free in HD. Watch trending content, popular films, and TV series without subscription on Streaminal.',
  openGraph: {
    title: 'Streaminal - Watch Movies & TV Shows Online Free in HD',
    description:
      'Stream thousands of movies and TV shows online free in HD. Watch trending content without subscription.',
    type: 'website',
    siteName: 'Streaminal',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Streaminal - Watch Movies & TV Shows Online Free in HD',
    description: 'Stream thousands of movies and TV shows online free in HD.',
  },
};

export default function HomePage() {
  const websiteJsonLd = generateWebSiteJsonLd();

  return (
    <div className="bg-background min-h-screen">
      {websiteJsonLd && <JsonLd data={websiteJsonLd} />}
      <Navigation />

      <main>
        <Suspense fallback={<HeroBannerSkeleton />}>
          <HeroSection />
        </Suspense>

        <div className="relative z-10 space-y-8 py-4">
          <Suspense fallback={<MediaCarouselSkeleton />}>
            <ContinueWatchingSection />
          </Suspense>
          <Suspense fallback={<MediaCarouselSkeleton />}>
            <WatchlistSection />
          </Suspense>
        </div>

        <div className="relative z-10 space-y-12 pb-10">
          <Suspense fallback={<MediaCarouselSkeleton />}>
            <TrendingSection />
          </Suspense>

          <Suspense fallback={<MediaCarouselSkeleton />}>
            <PopularMoviesSection />
          </Suspense>

          <Suspense fallback={<MediaCarouselSkeleton />}>
            <PopularTVShowsSection />
          </Suspense>

          <Suspense fallback={<MediaCarouselSkeleton />}>
            <PopularAnimeSection />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
