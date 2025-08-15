import { Router } from 'express';
const r = Router();

function ok(res:any, id:string, action:string) {
  return res.status(200).json({ ok:true, id, action });
}

/* Rider booking cancel (both verbs) */
r.delete('/api/bookings/:id', (req, res) => ok(res, req.params.id, 'booking.delete'));
r.post('/api/bookings/:id/cancel', (req, res) => ok(res, req.params.id, 'booking.cancel'));

/* Driver journey/trip cancel – accept both route shapes used by the UI */
r.delete('/api/driver/journeys/:id', (req, res) => ok(res, req.params.id, 'journey.delete'));
r.post('/api/driver/journeys/:id/cancel', (req, res) => ok(res, req.params.id, 'journey.cancel'));

r.delete('/api/driver/trips/:id', (req, res) => ok(res, req.params.id, 'trip.delete'));
r.post('/api/driver/trips/:id/cancel', (req, res) => ok(res, req.params.id, 'trip.cancel'));

export default r;
