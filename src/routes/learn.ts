import { Router } from 'express';
import { getWeights, setWeights } from '../match/score';
import { appendEvent, readEvents, saveWeights } from '../match/persist';
import { trainFromRecent } from '../match/train';

const router = Router();

// Log learning events (jsonl)
router.post('/learn/event', (req, res) => {
  appendEvent({ ...(req.body||{}), ts: req.body?.ts ?? Date.now() });
  res.json({ ok: true });
});

// Inspect recent events (admin)
router.get('/learn/events', (req, res) => {
  const token = req.header('x-admin-token');
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const days = Math.max(1, Math.min(30, Number(req.query.days ?? 7)));
  res.json({ days, events: readEvents({ sinceMs: Date.now() - days*86400_000 }) });
});

// Read / update weights (admin)
router.get('/model/weights', (_req, res) => res.json(getWeights()));
router.post('/model/weights', (req, res) => {
  const token = req.header('x-admin-token');
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  setWeights(req.body || {});
  saveWeights(getWeights());
  res.json(getWeights());
});

// Train on recent events and persist (admin)
router.post('/model/train', (req, res) => {
  const token = req.header('x-admin-token');
  if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const days = Math.max(1, Math.min(30, Number(req.query.days ?? 7)));
  const out = trainFromRecent(days);
  if (out.updated) { setWeights(out.weights); saveWeights(out.weights); }
  res.json({ ok: true, ...out, current: getWeights() });
});

export default router;
