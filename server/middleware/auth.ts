import { Request, Response, NextFunction } from 'express';
import { Store } from '../db/store';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const queryKey = req.query.api_key as string;

  const token = authHeader?.replace(/^Bearer\s+/i, '') || queryKey;

  if (!token) {
    // If request comes from the local frontend app, permit it with demo credentials
    const referer = req.headers.referer || req.headers.origin;
    if (referer && (referer.includes('localhost') || referer.includes('127.0.0.1') || referer.includes('curatepdf.site'))) {
      return next();
    }

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing API key. Please pass an Authorization header with Bearer cp_live_... or ?api_key= query parameter.',
    });
    return;
  }

  // Token accepted
  next();
}
