'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Media, getImageUrl, getTitle, getReleaseYear } from '@/lib/tmdb';
import { generateSlug } from '@/lib/utils';
import { Star, Film, Tv, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MediaCardProps {
  media: Media;
  variant?: 'grid' | 'carousel';
  showMediaType?: boolean;
  onRemove?: () => void;
}

export function MediaCard({
  media,
  variant = 'carousel',
  showMediaType = true,
  onRemove,
}: MediaCardProps) {
  const mediaType = media.media_type || 'movie';
  const route = mediaType === 'tv' ? 'tv-shows' : 'movies';
  const title = getTitle(media);
  const href = media.href ?? `/${route}/${generateSlug(title, media.id)}`;
  const year = getReleaseYear(media);
  const rating = media.vote_average?.toFixed(1);
  const label = media.subtitle ?? (year ? String(year) : null);

  const widthClass = variant === 'grid' ? 'w-full ' : 'w-[160px] flex-shrink-0 md:w-[200px]';

  return (
    <div className={`group relative ${widthClass}`}>
      {onRemove && (
        <button
          onClick={onRemove}
          className="bg-background/80 hover:bg-background absolute top-2 right-2 z-10 rounded-full p-1 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
          aria-label="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <Link href={href}>
        <div className="bg-muted relative aspect-2/3 overflow-hidden rounded-md transition-transform duration-300 group-hover:scale-105">
          {media.poster_path ? (
            <Image
              src={getImageUrl(media.poster_path, 'w342')}
              alt={title}
              fill
              sizes={
                variant === 'grid'
                  ? '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw'
                  : '(max-width: 768px) 160px, 200px'
              }
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center">
              No Image
            </div>
          )}

          {showMediaType && (
            <Badge variant="secondary" className="absolute top-2 left-2 backdrop-blur-sm">
              {mediaType === 'tv' ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
              {mediaType === 'tv' ? 'TV' : 'Movie'}
            </Badge>
          )}

          {!onRemove && media.vote_average > 0 && (
            <Badge variant="secondary" className="absolute top-2 right-2 backdrop-blur-sm">
              <Star className="fill-primary text-primary h-3 w-3" />
              {rating}
            </Badge>
          )}
        </div>

        <div className="mt-2 space-y-1">
          <h3 className="text-foreground text-md line-clamp-1 leading-tight font-medium">
            {title}
          </h3>
          {label && <p className="text-muted-foreground text-sm">{label}</p>}
        </div>
      </Link>
    </div>
  );
}
