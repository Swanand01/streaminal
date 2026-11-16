import { cache } from 'react';

const SPORTS_BASE_URL = process.env.NEXT_PUBLIC_SPORTS_API_URL!.replace(/\/+$/, '');

export interface MatchTeam {
  name: string;
  badge: string;
}

export interface MatchSource {
  source: string;
  id: string;
}

export interface Match {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: { home?: MatchTeam; away?: MatchTeam };
  sources: MatchSource[];
}

export interface Stream {
  id: string;
  streamNo: number;
  language: string;
  hd: boolean;
  embedUrl: string;
  source: string;
}

interface StreamFreeSource {
  quality: string;
  url: string;
  live: boolean;
}

interface StreamFreeTeam {
  name: string;
  logo?: string;
}

interface StreamFreeStream {
  name: string;
  category: string;
  stream_key: string;
  match_timestamp: number;
  viewers?: number;
  thumbnail_url?: string;
  sources: StreamFreeSource[];
  team1?: StreamFreeTeam;
  team2?: StreamFreeTeam;
}

interface StreamFreeResponse {
  count: number;
  streams: StreamFreeStream[];
}

interface StreamFreeSourcesResponse {
  stream_key: string;
  sources: StreamFreeSource[];
}

async function fetchSportsApi<T>(path: string): Promise<T> {
  const url = `${SPORTS_BASE_URL}/v1/${path}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Sports API error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchStreams(): Promise<StreamFreeResponse> {
  const data = await fetchSportsApi<Partial<StreamFreeResponse>>('streams');

  if (!Array.isArray(data.streams)) {
    throw new Error('Sports API returned an invalid streams response');
  }

  return {
    count: typeof data.count === 'number' ? data.count : data.streams.length,
    streams: data.streams,
  };
}

function toTeam(team?: StreamFreeTeam): MatchTeam | undefined {
  if (!team) return undefined;
  return { name: team.name, badge: team.logo || '' };
}

function toMatch(stream: StreamFreeStream): Match {
  return {
    id: stream.stream_key,
    title: stream.name,
    category: stream.category,
    date: stream.match_timestamp * 1000,
    poster: stream.thumbnail_url,
    popular: Number(stream.viewers || 0) > 0,
    teams:
      stream.team1 || stream.team2
        ? { home: toTeam(stream.team1), away: toTeam(stream.team2) }
        : undefined,
    sources: [{ source: 'streamfree', id: stream.stream_key }],
  };
}

function toStream(stream: StreamFreeSource, streamKey: string, streamNo: number): Stream {
  return {
    id: `${streamKey}-${streamNo}`,
    streamNo,
    language: 'en',
    hd: /^(?:HD|FHD|4K)$/i.test(stream.quality),
    embedUrl: stream.url,
    source: stream.quality || 'StreamFree',
  };
}

export const getLiveMatches = cache(async (): Promise<Match[]> => {
  const data = await fetchStreams();
  return data.streams.filter((stream) => stream.sources.some((source) => source.live)).map(toMatch);
});

export async function getMatchStreams(source: string, id: string): Promise<Stream[]> {
  if (source !== 'streamfree') return [];

  const data = await fetchSportsApi<Partial<StreamFreeSourcesResponse>>(
    `sources/${encodeURIComponent(id)}`
  );

  if (!Array.isArray(data.sources)) return [];

  return data.sources
    .filter((stream) => stream.live)
    .map((stream, index) => toStream(stream, id, index + 1));
}

export function getBadgeUrl(id: string): string {
  return id;
}
