import { Request, Response, NextFunction } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  io?: SocketIOServer;
}

/**
 * Extracts JWT from Authorization header (Bearer) or httpOnly cookie.
 * Sets req.user on success, returns 401/403 on failure.
 */
export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  // 2. Fall back to httpOnly cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * Optional auth — does NOT block if token is missing.
 */
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      req.user = decoded;
    } catch {
      // silently ignore
    }
  }

  next();
};
