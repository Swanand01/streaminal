import { getLiveMatches, type Match } from '@/lib/sports';
import { SportsContent } from '@/components/sports/sports-content';

export async function Sports() {
  let liveMatches: Match[] = [];
  let initialError = false;

  try {
    liveMatches = await getLiveMatches();
  } catch (error) {
    console.error('Unable to load live sports:', error);
    initialError = true;
  }

  return <SportsContent initialLive={liveMatches} initialError={initialError} />;
}
