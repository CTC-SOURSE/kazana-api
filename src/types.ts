export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface Journey {
  id: string;
  origin: Location;
  destination: Location;
  startTime: string; // ISO
  endTime: string;   // ISO
  seats: number;
  price: number;
  allow_parcels: boolean;
  driver_name: string;
  driver_phone: string; // stored full; masked on output
  cancelled: boolean;
  reservedSeats: number;
  createdAt: string; // ISO
}

export type BookingStatus = 'hold' | 'cancelled' | 'expired' | 'cancelled_by_driver';

export interface Booking {
  id: string;
  journey_id: string;
  rider_name: string;
  seats: number;
  status: BookingStatus;
  createdAt: string; // ISO
  expiresAt: string; // ISO
}
