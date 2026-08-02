import express, { Request, Response, NextFunction } from 'express';
import next from 'next';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import path from 'path';

// Routes
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import friendRoutes from './routes/friendRoutes';
import locationRoutes from './routes/locationRoutes';
import groupRoutes from './routes/groupRoutes';
import notificationRoutes from './routes/notificationRoutes';
import savedPlaceRoutes from './routes/savedPlaceRoutes';

// Socket handler
import { initSocketHandlers } from './socket/socketHandlers';

export const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = express();
  const httpServer = createServer(server);

  // ── Socket.IO ──────────────────────────────────────────────
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io',
  });

  initSocketHandlers(io);

  // ── Global Middleware ──────────────────────────────────────
  server.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
  server.use(helmet({ contentSecurityPolicy: false }));
  server.use(morgan('[:date[iso]] :method :url :status :response-time ms', {
    skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico'),
  }));
  server.use(express.json({ limit: '10mb' }));
  server.use(express.urlencoded({ extended: true }));
  server.use(cookieParser());

  // ── Rate Limiting ──────────────────────────────────────────
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please try again later.' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
  });

  // ── Database ───────────────────────────────────────────────
  try {
    await prisma.$connect();
    console.log('✅  Prisma connected to the database');
  } catch (err) {
    console.error('❌  Database connection failed:', err);
  }

  // ── Health Check ───────────────────────────────────────────
  server.get('/api/health', (_req: Request, res: Response) => {
    res.json({ success: true, message: 'LocaLink API is running', timestamp: new Date() });
  });

  // ── Attach io to requests ──────────────────────────────────
  server.use((req: Request, _res: Response, next: NextFunction) => {
    (req as Request & { io: SocketIOServer }).io = io;
    next();
  });

  // ── API Routes v1 ──────────────────────────────────────────
  server.use('/api/v1/auth', authLimiter, authRoutes);
  server.use('/api/v1/users', apiLimiter, userRoutes);
  server.use('/api/v1/friends', apiLimiter, friendRoutes);
  server.use('/api/v1/location', apiLimiter, locationRoutes);
  server.use('/api/v1/groups', apiLimiter, groupRoutes);
  server.use('/api/v1/notifications', apiLimiter, notificationRoutes);
  server.use('/api/v1/saved-places', apiLimiter, savedPlaceRoutes);
  server.use('/api/v1/upload', apiLimiter, uploadRoutes);

  // Legacy routes (keep backward compat)
  server.use('/api/users', apiLimiter, userRoutes);
  server.use('/api/auth', authLimiter, authRoutes);
  server.use('/api/upload', apiLimiter, uploadRoutes);

  // ── Static Files ───────────────────────────────────────────
  server.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // ── Next.js Handler ────────────────────────────────────────
  server.use((req: Request, res: Response) => {
    return handle(req, res);
  });

  // ── Global Error Handler ───────────────────────────────────
  server.use((err: Error & { statusCode?: number }, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌  Server Error:', err);

    const statusCodeMap: Record<string, number> = {
      'User already exists with this email': 409,
      'Invalid email or password': 401,
      'Unauthorized': 401,
      'Not found': 404,
      'Token is invalid or has expired': 400,
    };

    const statusCode = err.statusCode || statusCodeMap[err.message] || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  });

  // ── Start Server ───────────────────────────────────────────
  httpServer.listen(port, () => {
    console.log(`🚀  LocaLink ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('❌  Server startup failed:', err);
  process.exit(1);
});
