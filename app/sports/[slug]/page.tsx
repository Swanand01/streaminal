import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation';
import { SportsDetailsSkeleton } from '@/components/skeletons/sports-details-skeleton';
import { MatchContent } from './match-content';
import { extractMatchIdFromSlug } from '@/lib/utils';

interface MatchPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  await params;

  return {
    title: 'Watch Live Sports | Streaminal',
    description: 'Stream this match live online free on Streaminal.',
    openGraph: {
      title: 'Watch Live Sports | Streaminal',
      description: 'Stream this match live online free.',
      type: 'website',
      siteName: 'Streaminal',
    },
  };
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { slug } = await params;
  const matchId = extractMatchIdFromSlug(slug);

  return (
    <div className="bg-background min-h-screen">
      <Navigation />
      <Suspense fallback={<SportsDetailsSkeleton />}>
        <MatchContent matchId={matchId ?? ''} />
      </Suspense>
    </div>
  );
}
