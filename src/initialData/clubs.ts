import type { Club } from '../types';
import { CLUBS_PART1 } from './clubsDataPart1';
import { CLUBS_PART2 } from './clubsDataPart2';
import { CLUBS_PART3 } from './clubsDataPart3';

/**
 * Magister Ludorum World Database - 450 Ancient Historical Clubs (50 BC)
 * 30 leagues with 15 clubs each, organized geographically and culturally.
 */
export const INITIAL_CLUBS: Record<string, Club> = {
  ...CLUBS_PART1,
  ...CLUBS_PART2,
  ...CLUBS_PART3
};
