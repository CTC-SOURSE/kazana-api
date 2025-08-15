import { Router } from 'express';

const r = Router();

// Rider cancels booking
r.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  // TODO: hook to real cancel logic
  return res.status(200).json({ ok: true, id, action: 'booking.delete' });
});
r.post('/api/bookings/:id/cancel', (req, res) => {
  const { id } = req.params;
  // TODO: hook to real cancel logic
  return res.status(200).json({ ok: true, id, action: 'booking.cancel' });
});

// Driver cancels posted journey
r.delete('/api/driver/journeys/:id', (req, res) => {
  const { id } = req.params;
  // TODO: hook to real cancel logic
  return res.status(200).json({ ok: true, id, action: 'journey.delete' });
});
r.post('/api/driver/journeys/:id/cancel', (req, res) => {
  const { id } = req.params;
  // TODO: hook to real cancel logic
  return res.status(200).json({ ok: true, id, action: 'journey.cancel' });
});

export default r;
