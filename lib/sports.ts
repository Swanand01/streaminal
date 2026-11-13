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
  teams?: {
    home?: MatchTeam;
    away?: MatchTeam;
  };
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

interface PpvStream {
  id: number;
  name: string;
  source_tag?: string;
  poster?: string;
  starts_at: number;
  ends_at: number;
  always_live: number | boolean;
  locale?: string;
  iframe: string;
  viewers?: string;
  substreams?: PpvSubstream[];
}

interface PpvSubstream {
  id: number;
  source_tag?: string;
  locale?: string;
  iframe: string;
}

interface PpvCategory {
  category: string;
  streams: PpvStream[];
}

interface PpvResponse {
  success: boolean;
  timestamp: number;
  streams: PpvCategory[];
  error?: string;
}

async function fetchPpvStreams(): Promise<PpvResponse> {
  const url = `${SPORTS_BASE_URL}/streams`;
  const startedAt = Date.now();
  let response: Response;

  try {
    response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json, text/plain, */*',
        Origin: 'https://ppv.st',
        Referer: 'https://ppv.st/',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
      },
    });
  } catch (error) {
    console.error(
      'Sports API fetch failed',
      JSON.stringify({
        url,
        durationMs: Date.now() - startedAt,
        error: describeError(error),
      })
    );
    throw error;
  }

  if (!response.ok) {
    console.error(
      'Sports API returned an error',
      JSON.stringify({
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
      })
    );
    throw new Error(`Sports API error: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  let data: Partial<PpvResponse>;

  try {
    data = (await response.json()) as Partial<PpvResponse>;
  } catch (error) {
    console.error(
      'Sports API JSON parsing failed',
      JSON.stringify({
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        contentType,
        error: describeError(error),
      })
    );
    throw error;
  }

  if (!data.success || !Array.isArray(data.streams) || typeof data.timestamp !== 'number') {
    console.error(
      'Sports API returned an invalid response',
      JSON.stringify({
        url,
        durationMs: Date.now() - startedAt,
        status: response.status,
        contentType,
        success: data.success,
        streamsType: Array.isArray(data.streams) ? 'array' : typeof data.streams,
        timestampType: typeof data.timestamp,
        error: data.error,
        keys: Object.keys(data).slice(0, 20),
      })
    );
    throw new Error(data.error || 'Sports API returned an invalid response');
  }

  return data as PpvResponse;
}

function describeError(error: unknown) {
  if (!(error instanceof Error)) return { value: String(error) };

  const cause = error.cause;
  return {
    name: error.name,
    message: error.message,
    cause:
      cause instanceof Error
        ? { name: cause.name, message: cause.message }
        : cause == null
          ? undefined
          : String(cause),
  };
}

function isLive(stream: PpvStream, now: number): boolean {
  return (
    Boolean(stream.always_live) ||
    (stream.starts_at > 0 && stream.starts_at <= now && stream.ends_at >= now)
  );
}

function toMatch(stream: PpvStream, category: string): Match {
  return {
    id: String(stream.id),
    title: stream.name,
    category,
    date: stream.starts_at * 1000,
    poster: stream.poster,
    popular: Number(stream.viewers || 0) > 0,
    sources: [{ source: 'ppv', id: String(stream.id) }],
  };
}

function toStream(
  stream: Pick<PpvStream, 'id' | 'locale' | 'iframe' | 'source_tag'>,
  streamNo: number
): Stream {
  return {
    id: String(stream.id),
    streamNo,
    language: stream.locale || 'en',
    hd: /(^|\s)HD(\s|$)/i.test(stream.source_tag || ''),
    embedUrl: stream.iframe,
    source: stream.source_tag || 'PPV',
  };
}

export const getLiveMatches = cache(async (): Promise<Match[]> => {
  const data = await fetchPpvStreams();

  return data.streams.flatMap((category) =>
    category.streams
      .filter((stream) => isLive(stream, data.timestamp))
      .map((stream) => toMatch(stream, category.category))
  );
});

export async function getMatchStreams(source: string, id: string): Promise<Stream[]> {
  if (source !== 'ppv') return [];

  const data = await fetchPpvStreams();
  const match = data.streams
    .flatMap((category) => category.streams)
    .find((stream) => String(stream.id) === id);

  if (!match) return [];

  return [
    toStream(match, 1),
    ...(match.substreams || []).map((stream, index) => toStream(stream, index + 2)),
  ];
}

export function getBadgeUrl(id: string): string {
  return `${SPORTS_BASE_URL}/images/badge/${id}.webp`;
}
