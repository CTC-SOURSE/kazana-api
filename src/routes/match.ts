import { Router } from 'express';
import { scoreJourney, getWeights, setWeights, Request as Req, Journey as J } from '../match/score';

const router = Router();

// Rank driver journeys for a rider request
router.post('/match/rides', (req, res) => {
  const { rider, journeys, limit = 10 } = req.body as { rider: Req; journeys: J[]; limit?: number };
  if (!rider || !journeys) return res.status(400).json({ error: 'rider & journeys required' });
  const ranked = journeys.map(j => ({ id: j.id, driverId: j.driverId, ...scoreJourney(j, rider) }))
                         .sort((a, b) => b.score - a.score)
                         .slice(0, limit);
  res.json({ weights: getWeights(), results: ranked });
});

// Same endpoint can serve packages: treat package pickup/drop as rider origin/destination
router.post('/match/packages', (req, res) => {
  const { request, journeys, limit = 10 } = req.body as { request: Req; journeys: J[]; limit?: number };
  if (!request || !journeys) return res.status(400).json({ error: 'request & journeys required' });
  const ranked = journeys.map(j => ({ id: j.id, driverId: j.driverId, ...scoreJourney(j, request) }))
                         .sort((a, b) => b.score - a.score)
                         .slice(0, limit);
  res.json({ weights: getWeights(), results: ranked });
});

// Model weights: inspect / update (guard with ADMIN_TOKEN)
router.get('/model/weights', (_req, res) => res.json(getWeights()));
router.post('/model/weights', (req, res) => {
  const token = req.header('x-admin-token');
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  setWeights(req.body || {});
  res.json(getWeights());
});

// Simple learning event sink (log-only for now)
router.post('/learn/event', (req, res) => {
  // expected payload example: { type:'clicked|booked|cancelled', riderId, driverId, features, score }
  console.log('learn-event', JSON.stringify(req.body));
  res.json({ ok: true });
});

export default router;
