import type { Request, Response, NextFunction } from 'express';
export default function csp(_req: Request, res: Response, next: NextFunction) {
  res.setHeader(
    'Content-Security-Policy',
    [
      "frame-ancestors 'self' https://*.lovable.dev https://*.lovableproject.com http://localhost:5173",
      "base-uri 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  );
  res.removeHeader('X-Frame-Options');
  next();
}
