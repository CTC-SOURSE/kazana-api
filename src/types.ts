export type Journey = {
  id: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  startTime: string; // ISO
  endTime: string;   // ISO
  seats: number;
  price: number;
  allow_parcels: boolean;
  driver_name: string;
  driver_phone: string; // masked on output
  cancelled: boolean;
  reservedSeats: number;
  createdAt: string;
};

export type Booking = {
  id: string;
  journey_id: string;
  rider_name: string;
  seats: number;
  status: 'hold' | 'cancelled';
  createdAt: string;
  expiresAt: string;
};

export type PackageBooking = {
  id: string;
  journey_id: string;
  sender_name: string;
  recipient_name?: string;
  phone?: string; // masked on output
  description?: string;
  weight_kg?: number;
  status: 'hold' | 'cancelled';
  createdAt: string;
  expiresAt: string;
};

export type Lang = 'en' | 'sn' | 'nd';
