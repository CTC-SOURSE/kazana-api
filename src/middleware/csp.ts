import type { Request, Response, NextFunction } from 'express';

export default function csp(_req: Request, res: Response, next: NextFunction) {
  // allow Lovable preview + local dev to embed the widget
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.lovable.dev http://localhost:5173"
  );
  // avoid older headers blocking if present
  res.removeHeader('X-Frame-Options');
  next();
}
