import { Router } from 'express';
const router = Router();

// Driver cancels a posted trip
router.post('/driver/trips/:id/cancel', (req, res) => {
  // TODO: enforce your business rules; for now just 200 OK to unblock UI
  res.json({ ok:true, tripId: req.params.id, status:'cancelled' });
});

// Rider cancels a booking
router.post('/bookings/:id/cancel', (req, res) => {
  res.json({ ok:true, bookingId: req.params.id, status:'cancelled' });
});

export default router;
