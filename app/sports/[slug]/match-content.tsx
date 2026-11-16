'use client';

import { useQuery } from '@tanstack/react-query';
import { getLiveMatches } from '@/lib/sports';
import { SportsPlayer } from '@/components/sports/sports-player';
import { MatchInfo } from '@/components/sports/match-info';

interface MatchContentProps {
  matchId: string;
}

export function MatchContent({ matchId }: MatchContentProps) {
  const {
    data: liveMatches = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['sports', 'live'],
    queryFn: getLiveMatches,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
  const match = liveMatches.find((m) => m.id === matchId);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Loading match...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Unable to load this match.</p>
        <button className="text-sm underline" onClick={() => refetch()}>
          Try again
        </button>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-muted-foreground">Match not found or no longer live</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full pt-20">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <SportsPlayer sources={match.sources} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:px-8 lg:px-12">
        <MatchInfo match={match} />
      </div>
    </>
  );
}
