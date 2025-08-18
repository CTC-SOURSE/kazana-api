import { kmBetween, Point } from './geo';

export type Journey = {
  id: string;
  driverId: string;
  origin: Point;
  destination: Point;
  seats: number;
  pricePerKm?: number;
  windowStart?: number;   // epoch ms
  windowEnd?: number;     // epoch ms
  driverRating?: number;  // 0..5
  langs?: string[];       // e.g. ['en','sn','nd']
};

export type Request = {
  origin: Point;
  destination: Point;
  whenStart?: number;
  whenEnd?: number;
  seats?: number;
  lang?: string;          // preferred language code
};

export type Features = {
  detourScore: number;    // 1 = perfect (no detour)
  timeOverlap: number;    // 0..1
  seatOk: number;         // 0/1
  reliability: number;    // 0..1
  langMatch: number;      // 0..1
  priceScore: number;     // 0..1
};

const defaultWeights: Record<keyof Features, number> = {
  detourScore: 0.35,
  timeOverlap: 0.25,
  reliability: 0.20,
  seatOk: 0.10,
  langMatch: 0.05,
  priceScore: 0.05,
};

let weights = { ...defaultWeights };
export const getWeights = () => weights;
export const setWeights = (w: Partial<typeof weights>) => { weights = { ...weights, ...w }; };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export function computeFeatures(j: Journey, r: Request): Features {
  const base = kmBetween(j.origin, j.destination);
  const withPickup = kmBetween(j.origin, r.origin) + kmBetween(r.origin, r.destination) + kmBetween(r.destination, j.destination);
  const detourKm = Math.max(0, withPickup - base);
  const detourScore = clamp01(1 - detourKm / 50); // >50km detour ≈ bad

  let timeOverlap = 0.5;
  if (j.windowStart && j.windowEnd && r.whenStart && r.whenEnd && r.whenEnd > r.whenStart) {
    const overlap = Math.min(j.windowEnd, r.whenEnd) - Math.max(j.windowStart, r.whenStart);
    const denom = r.whenEnd - r.whenStart;
    timeOverlap = clamp01(overlap > 0 ? overlap / denom : 0);
  }

  const seatOk = (j.seats ?? 0) >= (r.seats ?? 1) ? 1 : 0;
  const reliability = clamp01((j.driverRating ?? 4) / 5);
  const langMatch = r.lang ? (j.langs?.includes(r.lang) ? 1 : 0) : 0.5;

  let priceScore = 0.5;
  if (typeof j.pricePerKm === 'number') {
    const target = 0.10; // tweak to your market
    priceScore = clamp01(1 - Math.abs(j.pricePerKm - target) / target);
  }

  return { detourScore, timeOverlap, seatOk, reliability, langMatch, priceScore };
}

export function scoreJourney(j: Journey, r: Request) {
  const f = computeFeatures(j, r);
  const s =
    f.detourScore * weights.detourScore +
    f.timeOverlap * weights.timeOverlap +
    f.reliability * weights.reliability +
    f.seatOk * weights.seatOk +
    f.langMatch * weights.langMatch +
    f.priceScore * weights.priceScore;
  return { score: Number(s.toFixed(6)), features: f };
}
