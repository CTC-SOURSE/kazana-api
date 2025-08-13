import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  createBookingHold,
  createJourney,
  searchJourneys,
  cancelBooking,
  cancelJourney,
  getStats,
  sweepExpiredHolds,
  findJourney,
  store
} from "./store";
import { Journey } from "./types";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// POST /api/journeys
app.post("/api/journeys", (req, res) => {
  const b = req.body ?? {};
  // Light validation (manual)
  const required = ["origin","destination","startTime","endTime","seats","price","allow_parcels","driver_name","driver_phone"];
  for (const k of required) if (b[k] === undefined) return res.status(400).json({ error: `Missing: ${k}` });

  const okLoc = (v: any) => v && typeof v.lat === "number" && typeof v.lng === "number" && typeof v.name === "string";
  if (!okLoc(b.origin) || !okLoc(b.destination)) return res.status(400).json({ error: "Invalid origin/destination" });
  if (isNaN(Date.parse(b.startTime)) || isNaN(Date.parse(b.endTime))) return res.status(400).json({ error: "Invalid times" });
  if (typeof b.seats !== "number" || b.seats <= 0) return res.status(400).json({ error: "Invalid seats" });
  if (typeof b.price !== "number" || b.price < 0) return res.status(400).json({ error: "Invalid price" });
  if (typeof b.allow_parcels !== "boolean") return res.status(400).json({ error: "Invalid allow_parcels" });
  if (typeof b.driver_name !== "string" || typeof b.driver_phone !== "string") return res.status(400).json({ error: "Invalid driver fields" });

  const j = createJourney({
    origin: b.origin,
    destination: b.destination,
    startTime: b.startTime,
    endTime: b.endTime,
    seats: b.seats,
    price: b.price,
    allow_parcels: b.allow_parcels,
    driver_name: b.driver_name,
    driver_phone: b.driver_phone
  });

  // Return masked phone
  const result = searchJourneys({
    o_lat: j.origin.lat, o_lng: j.origin.lng,
    d_lat: j.destination.lat, d_lng: j.destination.lng,
    start: Date.parse(j.startTime), end: Date.parse(j.endTime)
  }).find(x => x.id === j.id) || j;

  return res.status(201).json(result);
});

// GET /api/search
app.get("/api/search", (req, res) => {
  const q = req.query;
  const required = ["o_lat","o_lng","d_lat","d_lng","start","end"];
  for (const k of required) if (!(k in q)) return res.status(400).json({ error: `Missing query: ${k}` });

  const o_lat = Number(q.o_lat), o_lng = Number(q.o_lng);
  const d_lat = Number(q.d_lat), d_lng = Number(q.d_lng);
  const start = Date.parse(String(q.start));
  const end = Date.parse(String(q.end));
  if ([o_lat,o_lng,d_lat,d_lng].some(Number.isNaN) || isNaN(start) || isNaN(end)) {
    return res.status(400).json({ error: "Invalid numeric/time parameters" });
  }
  const parcel = (typeof q.parcel === "string") ? ["1","true","yes"].includes(String(q.parcel).toLowerCase()) : undefined;

  const results = searchJourneys({ o_lat, o_lng, d_lat, d_lng, start, end, parcel });
  return res.json({ results, count: results.length });
});

// POST /api/bookings
app.post("/api/bookings", (req, res) => {
  const { journey_id, rider_name, seats } = req.body ?? {};
  if (!journey_id || typeof rider_name !== "string" || typeof seats !== "number") {
    return res.status(400).json({ error: "journey_id (string), rider_name (string), seats (number) required" });
  }
  const j = findJourney(journey_id);
  if (!j || j.cancelled) return res.status(404).json({ error: "Journey not found" });

  const b = createBookingHold(journey_id, rider_name, seats);
  if (!b) return res.status(400).json({ error: "Insufficient seats or invalid request" });

  return res.status(201).json({ booking: b, hold_minutes: 10 });
});

// DELETE /api/bookings/:id/cancel
app.delete("/api/bookings/:id/cancel", (req, res) => {
  const b = cancelBooking(req.params.id);
  if (!b) return res.status(404).json({ error: "Booking not found" });
  return res.json({ booking: b });
});

// DELETE /api/journeys/:id
app.delete("/api/journeys/:id", (req, res) => {
  const j = cancelJourney(req.params.id);
  if (!j) return res.status(404).json({ error: "Journey not found" });
  return res.json({ journey: { ...j, driver_phone: "****" } });
});

// GET /api/admin/stats
app.get("/api/admin/stats", (_req, res) => {
  const s = getStats();
  return res.json(s);
});

// Sweep expired holds periodically
setInterval(sweepExpiredHolds, 60 * 1000);

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`KAZANA API running on http://localhost:${PORT}`);
});
