import { Router } from 'express';
const r = Router();

r.post('/api/notify/whatsapp', async (req, res) => {
  try {
    const { to, text } = req.body || {};
    if (!to || !text) return res.status(400).json({ ok:false, error:'missing to/text' });

    const token   = process.env.WA_TOKEN   || '';
    const phoneId = process.env.WA_PHONE_ID|| '';

    // If not configured yet, respond OK so the UI flow isn't blocked
    if (!token || !phoneId) {
      console.warn('[WA] Missing WA_TOKEN/WA_PHONE_ID -> mock OK response');
      return res.status(200).json({ ok:true, mock:true, to, text });
    }

    const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;
    const r2 = await fetch(url, {
      method:'POST',
      headers:{ 'Authorization':`Bearer ${token}`, 'Content-Type':'application/json' },
      body: JSON.stringify({
        messaging_product:'whatsapp',
        to, type:'text', text:{ body:text }
      })
    });
    const data = await r2.json();
    return res.status(r2.ok?200:500).json({ ok:r2.ok, data });
  } catch (e:any) {
    return res.status(500).json({ ok:false, error:e?.message || 'unknown' });
  }
});

export default r;
