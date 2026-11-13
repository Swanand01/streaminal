import Link from 'next/link';
import Image from 'next/image';
import { Match, getBadgeUrl } from '@/lib/sports';
import { Badge } from '@/components/ui/badge';
import { generateMatchSlug } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
}

export function MatchCard({ match }: MatchCardProps) {
  const home = match.teams?.home;
  const away = match.teams?.away;

  // Fall back to parsing common event title formats when team data isn't populated.
  const titleParts = match.title.split(/ (?:vs\.?|at) /i);
  const homeName = home?.name || titleParts[0]?.trim() || 'TBD';
  const awayName = away?.name || titleParts[1]?.trim() || 'TBD';

  return (
    <Link
      href={`/sports/${generateMatchSlug(match.title, match.id)}`}
      className="bg-card border-border group block overflow-hidden rounded-lg border transition-colors hover:border-white/20"
    >
      {match.poster && (
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          <Image
            src={match.poster}
            alt={match.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
      )}

      <div className="p-4">
        {/* Header: sport + live indicator */}
        <div className="mb-4 flex items-center justify-between">
          <Badge variant="outline" className="capitalize">
            {match.category}
          </Badge>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
            LIVE
          </span>
        </div>

        {match.poster ? (
          <h2 className="text-foreground line-clamp-2 text-sm leading-5 font-medium">
            {match.title}
          </h2>
        ) : (
          /* Teams */
          <div className="flex items-center justify-between gap-2">
            {/* Home team */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              {home?.badge ? (
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={getBadgeUrl(home.badge)}
                    alt={homeName}
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="bg-muted h-12 w-12 shrink-0 rounded-full" />
              )}
              <span className="text-foreground line-clamp-2 text-sm leading-tight font-medium">
                {homeName}
              </span>
            </div>

            {/* VS */}
            <span className="text-muted-foreground shrink-0 text-xs font-bold">VS</span>

            {/* Away team */}
            <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
              {away?.badge ? (
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={getBadgeUrl(away.badge)}
                    alt={awayName}
                    fill
                    sizes="48px"
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="bg-muted h-12 w-12 shrink-0 rounded-full" />
              )}
              <span className="text-foreground line-clamp-2 text-sm leading-tight font-medium">
                {awayName}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
