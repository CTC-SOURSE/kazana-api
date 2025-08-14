import { Booking, Journey, PackageBooking } from './types';

const HOLD_MINUTES = 10;
const MAX_PARCELS_PER_JOURNEY = Number(process.env.MAX_PARCELS_PER_JOURNEY || 20);

const journeys: Journey[] = [];
const bookings: Booking[] = [];
const packages: PackageBooking[] = [];

const uuid = () =>
  (globalThis as any).crypto?.randomUUID?.() ||
  Math.random().toString(36).slice(2) + Date.now().toString(36);

const nowISO = () => new Date().toISOString();

export const maskPhone = (p?: string) =>
  !p ? p : p.replace(/\d(?=\d{4})/g, '*');

export function safeJourney(j: Journey): Journey {
  return { ...j, driver_phone: maskPhone(j.driver_phone) };
}

export function addJourney(data: Omit<Journey,'id'|'cancelled'|'reservedSeats'|'createdAt'>) {
  const j: Journey = {
    id: uuid(),
    ...data,
    cancelled: false,
    reservedSeats: 0,
    createdAt: nowISO(),
  };
  journeys.push(j);
  return j;
}

export function findJourney(id: string) {
  return journeys.find(j => j.id === id);
}

export function cancelJourney(id: string) {
  const j = findJourney(id);
  if (!j || j.cancelled) return null;
  j.cancelled = true;
  return j;
}

export function addBooking(journey_id: string, rider_name: string, seats: number) {
  sweepExpired();
  const j = findJourney(journey_id);
  if (!j || j.cancelled) throw new Error('journey_not_found');
  if (seats < 1) throw new Error('seats_min_1');
  const available = j.seats - j.reservedSeats;
  if (available < seats) throw new Error('not_enough_seats');

  j.reservedSeats += seats;
  const b: Booking = {
    id: uuid(),
    journey_id,
    rider_name,
    seats,
    status: 'hold',
    createdAt: nowISO(),
    expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
  };
  bookings.push(b);
  return b;
}

export function cancelBooking(id: string) {
  const b = bookings.find(x => x.id === id);
  if (!b || b.status !== 'hold') return null;
  b.status = 'cancelled';
  const j = findJourney(b.journey_id);
  if (j) j.reservedSeats = Math.max(0, j.reservedSeats - b.seats);
  return b;
}

export function addPackageBooking(journey_id: string, payload: Omit<PackageBooking,'id'|'status'|'createdAt'|'expiresAt'|'journey_id'>) {
  sweepExpired();
  const j = findJourney(journey_id);
  if (!j || j.cancelled) throw new Error('journey_not_found');
  if (!j.allow_parcels) throw new Error('parcels_not_allowed');

  const activeForJourney = packages.filter(
    p => p.journey_id === journey_id &&
         p.status === 'hold' &&
         new Date(p.expiresAt).getTime() > Date.now()
  ).length;
  if (activeForJourney >= MAX_PARCELS_PER_JOURNEY) throw new Error('no_parcel_capacity');

  const pkg: PackageBooking = {
    id: uuid(),
    journey_id,
    ...payload,
    phone: payload.phone ? maskPhone(payload.phone) : payload.phone,
    status: 'hold',
    createdAt: nowISO(),
    expiresAt: new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString(),
  };
  packages.push(pkg);
  return pkg;
}

export function cancelPackage(id: string) {
  const p = packages.find(x => x.id === id);
  if (!p || p.status !== 'hold') return null;
  p.status = 'cancelled';
  return p;
}

export function searchJourneys(q: {
  o_lat: number; o_lng: number; d_lat: number; d_lng: number;
  start: string; end: string; parcel?: boolean;
}) {
  const within = (a: number, b: number, tol = 1.0) => Math.abs(a - b) <= tol;
  const startMs = Date.parse(q.start), endMs = Date.parse(q.end);
  return journeys
    .filter(j => !j.cancelled)
    .filter(j =>
      within(j.origin.lat, q.o_lat) &&
      within(j.origin.lng, q.o_lng) &&
      within(j.destination.lat, q.d_lat) &&
      within(j.destination.lng, q.d_lng) &&
      Date.parse(j.startTime) >= startMs &&
      Date.parse(j.endTime)   <= endMs &&
      (!q.parcel || j.allow_parcels)
    )
    .map(safeJourney);
}

export function stats() {
  const activeJourneys = journeys.filter(j => !j.cancelled).length;
  const totalBookings  = bookings.length;
  const totalPackages  = packages.length;
  const successRate    = 0; // mock
  return { activeJourneys, totalBookings, totalPackages, successRate };
}

export function sweepExpired() {
  const now = Date.now();
  for (const b of bookings) {
    if (b.status === 'hold' && Date.parse(b.expiresAt) <= now) {
      b.status = 'cancelled';
      const j = findJourney(b.journey_id);
      if (j) j.reservedSeats = Math.max(0, j.reservedSeats - b.seats);
    }
  }
  for (const p of packages) {
    if (p.status === 'hold' && Date.parse(p.expiresAt) <= now) {
      p.status = 'cancelled';
    }
  }
}

// expose raw arrays for admin/testing if needed (not exported by default)
export const __memory = { journeys, bookings, packages };
