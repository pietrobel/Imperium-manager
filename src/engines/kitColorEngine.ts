import type { Club } from '../types';

export interface ResolvedMatchKit {
  primary: string;
  secondary: string;
  outline: string;
  textColor: string;
  isReserveKit: boolean;
  kitLabel: string;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string | undefined): RGB {
  const clean = (hex || '#1e3a8a').replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map(c => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 30, g: 58, b: 138 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

/**
 * Weighted perceptual RGB distance (0 .. ~765).
 * Values < 150 mean two jerseys look too similar on the sand arena.
 */
export function colorDistance(hexA: string, hexB: string): number {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const rMean = (a.r + b.r) / 2;
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db
  );
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const RESERVE_PALETTE: { primary: string; secondary: string; outline: string; name: string }[] = [
  { primary: '#f8fafc', secondary: '#1e293b', outline: '#0f172a', name: 'Tunica Alba' },
  { primary: '#1d4ed8', secondary: '#fef08a', outline: '#ffffff', name: 'Blu Tirreno' },
  { primary: '#0f172a', secondary: '#d4af37', outline: '#f8fafc', name: 'Nero Ossidiana' },
  { primary: '#047857', secondary: '#f8fafc', outline: '#fef08a', name: 'Verde Alloro' },
  { primary: '#b91c1c', secondary: '#fef08a', outline: '#ffffff', name: 'Rosso Porpora' },
  { primary: '#7e22ce', secondary: '#facc15', outline: '#ffffff', name: 'Viola Imperiale' }
];

const SAND_ARENA_HEX = '#8f5c2c';

export function getClubReserveColors(club: Club): { primary: string; secondary: string; name: string } {
  if (club.colori?.reservePrimary) {
    return {
      primary: club.colori.reservePrimary,
      secondary: club.colori.reserveSecondary || club.colori.primary,
      name: 'Riserva Ufficiale'
    };
  }
  const homePrimary = club.colori?.primary || '#b91c1c';
  const awaySecondary = club.colori?.secondary || '#fef08a';
  if (
    colorDistance(homePrimary, awaySecondary) >= 165 &&
    colorDistance(SAND_ARENA_HEX, awaySecondary) >= 95
  ) {
    return {
      primary: awaySecondary,
      secondary: homePrimary,
      name: 'Secondaria Invertita'
    };
  }
  let best = RESERVE_PALETTE[0];
  let bestScore = -1;
  for (const opt of RESERVE_PALETTE) {
    const dHome = colorDistance(homePrimary, opt.primary);
    const dSand = colorDistance(SAND_ARENA_HEX, opt.primary);
    const score = Math.min(dHome * 1.15, dSand * 1.6) + dHome * 0.4;
    if (dHome >= 155 && score > bestScore) {
      bestScore = score;
      best = opt;
    }
  }
  return best;
}

export function resolveMatchKits(
  homeClub: Club,
  awayClub: Club
): { homeKit: ResolvedMatchKit; awayKit: ResolvedMatchKit } {
  const homePrimary = homeClub.colori?.primary || '#b91c1c';
  const homeSecondary = homeClub.colori?.secondary || '#fef08a';
  const homeLum = relativeLuminance(homePrimary);

  const homeKit: ResolvedMatchKit = {
    primary: homePrimary,
    secondary: homeSecondary,
    outline: homeLum > 0.65 ? '#0f172a' : '#fef08a',
    textColor: homeLum > 0.65 ? '#0f172a' : '#fef08a',
    isReserveKit: false,
    kitLabel: '1ª Maglia'
  };

  const awayPrimary = awayClub.colori?.primary || '#1e3a8a';
  const awaySecondary = awayClub.colori?.secondary || '#e2e8f0';

  const clashThreshold = 155;
  const sandThreshold = 95;

  const primaryDistHome = colorDistance(homePrimary, awayPrimary);
  const primaryDistSand = colorDistance(SAND_ARENA_HEX, awayPrimary);

  if (primaryDistHome >= clashThreshold && primaryDistSand >= sandThreshold) {
    const awayLum = relativeLuminance(awayPrimary);
    return {
      homeKit,
      awayKit: {
        primary: awayPrimary,
        secondary: awaySecondary,
        outline: awayLum > 0.65 ? '#0f172a' : '#ffffff',
        textColor: awayLum > 0.65 ? '#0f172a' : '#ffffff',
        isReserveKit: false,
        kitLabel: '1ª Maglia'
      }
    };
  }

  // 1. Prefer explicit club reserve colors if defined and high-contrast
  if (awayClub.colori?.reservePrimary) {
    const resPrimary = awayClub.colori.reservePrimary;
    const resSecondary = awayClub.colori.reserveSecondary || awayPrimary;
    if (
      colorDistance(homePrimary, resPrimary) >= clashThreshold &&
      colorDistance(SAND_ARENA_HEX, resPrimary) >= sandThreshold
    ) {
      const resLum = relativeLuminance(resPrimary);
      return {
        homeKit,
        awayKit: {
          primary: resPrimary,
          secondary: resSecondary,
          outline: resLum > 0.65 ? '#0f172a' : '#ffffff',
          textColor: resLum > 0.65 ? '#0f172a' : '#ffffff',
          isReserveKit: true,
          kitLabel: 'Maglia di Riserva'
        }
      };
    }
  }

  // 2. Try club's own secondary color next if distinct enough from homePrimary & sand
  const secDistHome = colorDistance(homePrimary, awaySecondary);
  const secDistSand = colorDistance(SAND_ARENA_HEX, awaySecondary);
  if (secDistHome >= clashThreshold + 20 && secDistSand >= sandThreshold) {
    const secLum = relativeLuminance(awaySecondary);
    return {
      homeKit,
      awayKit: {
        primary: awaySecondary,
        secondary: awayPrimary,
        outline: secLum > 0.65 ? '#0f172a' : '#ffffff',
        textColor: secLum > 0.65 ? '#0f172a' : '#ffffff',
        isReserveKit: true,
        kitLabel: 'Maglia di Riserva'
      }
    };
  }

  // 3. Pick optimal reserve kit maximizing distance from homePrimary and sand arena
  let bestOption = RESERVE_PALETTE[0];
  let bestScore = -1;
  for (const opt of RESERVE_PALETTE) {
    const dHome = colorDistance(homePrimary, opt.primary);
    const dSand = colorDistance(SAND_ARENA_HEX, opt.primary);
    const score = Math.min(dHome * 1.15, dSand * 1.6) + dHome * 0.4;
    if (dHome >= clashThreshold && score > bestScore) {
      bestScore = score;
      bestOption = opt;
    }
  }

  const bestLum = relativeLuminance(bestOption.primary);
  return {
    homeKit,
    awayKit: {
      primary: bestOption.primary,
      secondary: bestOption.secondary,
      outline: bestOption.outline,
      textColor: bestLum > 0.65 ? '#0f172a' : '#ffffff',
      isReserveKit: true,
      kitLabel: `Maglia di Riserva (${bestOption.name})`
    }
  };
}
