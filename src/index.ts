import path from 'path';
import waRoutes from "./routes/wa";
import csp from "./middleware/csp";
import cancelRoutes from "./routes/cancel";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import {
  addBooking, cancelBooking, addJourney, cancelJourney,
  searchJourneys, stats, safeJourney, addPackageBooking, cancelPackage,
  sweepExpired
} from './store';
import { Lang } from './types';

dotenv.config();

const app = express();
app.use(csp);
app.use(cancelRoutes);

app.set('trust proxy', 1);
app.use(helmet());
app.use(morgan('tiny'));
app.use(rateLimit({ windowMs: 60_000, max: 100, standardHeaders: true, legacyHeaders: false }));

app.use(cors());
app.use(express.json({ limit: '200kb' }));

// prevent noisy 404s from browsers requesting /favicon.ico
app.get("/favicon.ico", (_req, res) => res.status(204).end());


app.use("/embed", express.static("public/embed", { maxAge: "1h" }));


// ---- i18n (en, sn, nd) ----
const messages: Record<Lang, Record<string, string>> = {
  en: {
    invalid_request: 'invalid request',
    journey_created: 'journey created',
    journey_cancelled: 'journey cancelled',
    journey_not_found: 'Journey not found',
    seats_min_1: 'seats must be at least 1',
    not_enough_seats: 'Not enough seats available',
    booking_created: 'booking placed on 10-min hold',
    booking_cancelled: 'booking cancelled',
    parcels_not_allowed: 'Parcels not allowed on this journey',
    parcel_created: 'package placed on 10-min hold',
    parcel_cancelled: 'package cancelled',
    no_parcel_capacity: 'No parcel capacity left for this journey',
  },
  sn: {
    invalid_request: 'chikumbiro chisiri pamutemo',
    journey_created: 'rwendo rwagadzirwa',
    journey_cancelled: 'rwendo rwabviswa',
    journey_not_found: 'Rwendo haruwanikwi',
    seats_min_1: 'nzvimbo dzinofanira kuva dzinenge 1',
    not_enough_seats: 'nzvimbo hadzina kukwana',
    booking_created: 'booking yaiswa pa-hold kwemaminitsi gumi',
    booking_cancelled: 'booking yabviswa',
    parcels_not_allowed: 'Mapakeji haabvumidzwe parwendo urwu',
    parcel_created: 'package yaiswa pa-hold kwemaminitsi gumi',
    parcel_cancelled: 'package yabviswa',
    no_parcel_capacity: 'hapana nzvimbo yesarudzo yemapakeji yasara',
  },
  nd: {
    invalid_request: 'isikhalazo esingavunyelwayo',
    journey_created: 'uhambo lwenziwe',
    journey_cancelled: 'uhambo lukhanselwe',
    journey_not_found: 'Uhambo alutholakali',
    seats_min_1: 'izihlalo okungenani kube yi-1',
    not_enough_seats: 'izihlalo azanele',
    booking_created: 'ibhukhi lifakwe ku-hold yemizuzu eyi-10',
    booking_cancelled: 'ibhukhi likhanseliwe',
    parcels_not_allowed: 'Imipakethe ayivunyelwanga kulolu hambo',
    parcel_created: 'ipakethe ifakwe ku-hold yemizuzu eyi-10',
    parcel_cancelled: 'ipakethe ikhanseliwe',
    no_parcel_capacity: 'akusekho indawo yemipakethe kulolu hambo',
  },
};

const pickLang = (req: express.Request): Lang => {
  const q = (req.query.lang as string | undefined)?.toLowerCase();
  const h = req.headers['accept-language']?.toString().slice(0,2).toLowerCase();
  const cand = (q || h || 'en') as Lang;
  return (['en','sn','nd'] as Lang[]).includes(cand) ? cand : 'en';
};
const t = (lang: Lang, key: string) => messages[lang][key] || messages.en[key] || key;

// background expiry sweeper
setInterval(() => sweepExpired(), 30_000).unref();

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// ---- Journeys ----
app.post('/api/journeys', (req, res) => {
  const lang = pickLang(req);
  try {
    const {
      origin, destination, startTime, endTime,
      seats, price, allow_parcels, driver_name, driver_phone
    } = req.body || {};
    if (!origin || !destination || !startTime || !endTime ||
        typeof seats !== 'number' || typeof price !== 'number' ||
        !driver_name || !driver_phone) {
      return res.status(400).json({ ok: false, error: t(lang,'invalid_request') });
    }
    const j = addJourney({
      origin, destination, startTime, endTime,
      seats, price, allow_parcels: !!allow_parcels,
      driver_name, driver_phone
    });
    res.status(201).json({ ok: true, message: t(lang,'journey_created'), journey: safeJourney(j) });
  } catch {
    res.status(400).json({ ok: false, error: t(lang,'invalid_request') });
  }
});

app.get('/api/search', (req, res) => {
  const lang = pickLang(req);
  const { o_lat, o_lng, d_lat, d_lng, start, end, parcel } = req.query as any;
  const required = [o_lat,o_lng,d_lat,d_lng,start,end].every(Boolean);
  if (!required) return res.status(400).json({ ok:false, error: t(lang,'invalid_request') });
  const data = searchJourneys({
    o_lat: Number(o_lat), o_lng: Number(o_lng),
    d_lat: Number(d_lat), d_lng: Number(d_lng),
    start: String(start), end: String(end),
    parcel: parcel === 'true',
  });
  res.json({ ok: true, count: data.length, journeys: data });
});

// ---- Bookings ----
app.post('/api/bookings', (req, res) => {
  const lang = pickLang(req);
  try {
    const { journey_id, rider_name, seats } = req.body || {};
    if (!journey_id || !rider_name || typeof seats !== 'number')
      return res.status(400).json({ ok:false, error: t(lang,'invalid_request') });

    const booking = addBooking(journey_id, rider_name, seats);
    res.status(201).json({ ok:true, message: t(lang,'booking_created'), booking, hold_minutes: 10 });
  } catch (err: any) {
    const code = String(err.message || '');
    const map: Record<string, number> = {
      journey_not_found: 404, seats_min_1: 400, not_enough_seats: 409,
    };
    res.status(map[code] || 400).json({ ok:false, code, error: t(lang, code || 'invalid_request') });
  }
});

app.delete('/api/bookings/:id/cancel', (req, res) => {
  const lang = pickLang(req);
  const b = cancelBooking(req.params.id);
  if (!b) return res.status(404).json({ ok:false, error: t(lang,'invalid_request') });
  res.json({ ok:true, message: t(lang,'booking_cancelled'), booking: b });
});

// ---- Packages ----
app.post('/api/packages', (req, res) => {
  const lang = pickLang(req);
  try {
    const { journey_id, sender_name, recipient_name, phone, description, weight_kg } = req.body || {};
    if (!journey_id || !sender_name)
      return res.status(400).json({ ok:false, error: t(lang,'invalid_request') });

    const pkg = addPackageBooking(journey_id, { sender_name, recipient_name, phone, description, weight_kg });
    res.status(201).json({ ok:true, message: t(lang,'parcel_created'), package: pkg, hold_minutes: 10 });
  } catch (err: any) {
    const code = String(err.message || '');
    const map: Record<string, number> = {
      journey_not_found: 404, parcels_not_allowed: 403, no_parcel_capacity: 409
    };
    res.status(map[code] || 400).json({ ok:false, code, error: t(lang, code || 'invalid_request') });
  }
});

app.delete('/api/packages/:id/cancel', (req, res) => {
  const lang = pickLang(req);
  const p = cancelPackage(req.params.id);
  if (!p) return res.status(404).json({ ok:false, error: t(lang,'invalid_request') });
  res.json({ ok:true, message: t(lang,'parcel_cancelled'), package: p });
});

// ---- Driver cancel ----
app.delete('/api/journeys/:id', (req, res) => {
  const lang = pickLang(req);
  const j = cancelJourney(req.params.id);
  if (!j) return res.status(404).json({ ok:false, error: t(lang,'journey_not_found') });
  res.json({ ok:true, message: t(lang,'journey_cancelled'), journey: safeJourney(j) });
});

// ---- Admin ----
app.get('/api/admin/stats', (_req, res) => res.json({ ok:true, ...stats() }));


/* === basic ops === */
app.use((req,_res,next)=>{ console.log(`[${new Date().toISOString()}]`, req.method, req.path); next(); });
app.get('/healthz', (_req,res)=>res.send('ok'));

app.use("/api", waRoutes);

app.use(waRoutes);

// === Explicit CSP for widget embed (Lovable / localhost) ===

app.get('/embed/widget.html', (_req, res) => {
  // allow lovable + localhost to embed
  res.removeHeader('X-Frame-Options');
  res.setHeader(
    'Content-Security-Policy',
    [
      "frame-ancestors 'self' https://*.lovableproject.com https://*.lovable.dev http://localhost:5173",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );
  res.sendFile(path.resolve(__dirname, '../public/embed/widget.html'));
});

// ---------- Health/ping for Railway ----------
app.get('/', (_req, res) => res.status(200).send('ok'));
app.get('/health', (_req, res) => res.status(200).send('ok'));

// ---------- Explicit CSP for the embed widget ----------
app.get('/embed/widget.html', (_req, res) => {
  // allow lovable + localhost to embed
  res.removeHeader('X-Frame-Options');
  res.setHeader('Content-Security-Policy',
    "frame-ancestors 'self' https://*.lovableproject.com https://*.lovable.dev http://localhost:5173; " +
    "base-uri 'self'; upgrade-insecure-requests"
  );
  res.sendFile(path.resolve(__dirname, '../public/embed/widget.html'));
});

// ---------- Listen on Railway PORT ----------
  console.log(`KAZANA API listening on :${PORT}`);
});

/* === normalized server listener === */
const PORT: number = Number(process.env.PORT) || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`KAZANA API listening on :${PORT}`);
});
