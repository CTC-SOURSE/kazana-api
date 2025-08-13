import { Booking, Journey } from "./types";
import { randomUUID } from "crypto";

const journeys: Journey[] = [];
const bookings: Booking[] = [];

const HOLD_MINUTES = 10;
const ORIGIN_DEST_MATCH_KM = 50; // simple proximity
const KM = 1000;

function toRad(d: number) { return d * Math.PI / 180; }
function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const la1 = toRad(aLat);
  const la2 = toRad(bLat);
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length <= 4) return "*".repeat(Math.max(0, digits.length - 2)) + digits.slice(-2);
  return digits.slice(0, 2) + "****" + digits.slice(-2);
}

export function createJourney(data: Omit<Journey, "id" | "cancelled" | "reservedSeats" | "createdAt">): Journey {
  const j: Journey = {
    id: randomUUID(),
    ...data,
    cancelled: false,
    reservedSeats: 0,
    createdAt: new Date().toISOString()
  };
  journeys.push(j);
  return j;
}

export function findJourney(id: string) {
  return journeys.find(j => j.id === id);
}

export function searchJourneys(params: {
  o_lat: number; o_lng: number; d_lat: number; d_lng: number;
  start: number; end: number; parcel?: boolean;
}) {
  sweepExpiredHolds();
  return journeys
    .filter(j => !j.cancelled)
    .filter(j => {
      const startTime = Date.parse(j.startTime);
      return startTime >= params.start && startTime <= params.end;
    })
    .filter(j => {
      if (params.parcel === true && j.allow_parcels !== true) return false;
      const oDist = haversineKm(params.o_lat, params.o_lng, j.origin.lat, j.origin.lng);
      const dDist = haversineKm(params.d_lat, params.d_lng, j.destination.lat, j.destination.lng);
      return oDist <= ORIGIN_DEST_MATCH_KM && dDist <= ORIGIN_DEST_MATCH_KM;
    })
    .map(j => ({
      ...j,
      driver_phone: maskPhone(j.driver_phone),
      availableSeats: Math.max(0, j.seats - j.reservedSeats)
    }));
}

export function createBookingHold(journeyId: string, riderName: string, seats: number): Booking | null {
  sweepExpiredHolds();
  const j = findJourney(journeyId);
  if (!j || j.cancelled) return null;
  const available = j.seats - j.reservedSeats;
  if (seats <= 0 || seats > available) return null;

  const now = new Date();
  const b: Booking = {
    id: randomUUID(),
    journey_id: j.id,
    rider_name: riderName,
    seats,
    status: "hold",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + HOLD_MINUTES * 60 * 1000).toISOString()
  };
  bookings.push(b);
  j.reservedSeats += seats;
  return b;
}

export function cancelBooking(id: string): Booking | null {
  const b = bookings.find(x => x.id === id);
  if (!b) return null;
  if (b.status === "hold") {
    const j = findJourney(b.journey_id);
    if (j) j.reservedSeats = Math.max(0, j.reservedSeats - b.seats);
  }
  b.status = "cancelled";
  return b;
}

export function cancelJourney(id: string): Journey | null {
  const j = findJourney(id);
  if (!j) return null;
  j.cancelled = true;
  // Mark holds as cancelled_by_driver and free seats
  bookings.filter(b => b.journey_id === j.id && b.status === "hold")
    .forEach(b => { b.status = "cancelled_by_driver"; });
  j.reservedSeats = 0;
  return j;
}

export function sweepExpiredHolds(): void {
  const now = Date.now();
  bookings.forEach(b => {
    if (b.status === "hold" && Date.parse(b.expiresAt) <= now) {
      b.status = "expired";
      const j = findJourney(b.journey_id);
      if (j) j.reservedSeats = Math.max(0, j.reservedSeats - b.seats);
    }
  });
}

export function getStats() {
  sweepExpiredHolds();
  const activeJourneys = journeys.filter(j => !j.cancelled).length;
  const totalBookings = bookings.length;
  const cancelled = bookings.filter(b => b.status === "cancelled" || b.status === "cancelled_by_driver").length;
  const successRate = totalBookings === 0 ? 1 : (totalBookings - cancelled) / totalBookings;
  return { activeJourneys, totalBookings, successRate };
}

export const store = { journeys, bookings };
