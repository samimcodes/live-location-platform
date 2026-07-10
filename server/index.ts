import express, { Request, Response } from 'express';
import next from 'next';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
const prisma = new PrismaClient();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

app.prepare().then(async () => {
  const server = express();

  // Middleware
  server.use(cors());
  server.use(helmet({ contentSecurityPolicy: false })); // Disable CSP in dev if needed, or configure properly
  server.use(morgan('[:date[iso]] :method :url :status :response-time ms - :res[content-length]', {
    skip: (req) => req.url.startsWith('/_next/') || req.url.includes('favicon.ico')
  }));
  server.use(express.json());
  server.use(cookieParser());

  // Database Connection using Prisma
  try {
    await prisma.$connect();
    console.log('Prisma connected to the database successfully!');
  } catch (err) {
    console.error('Error connecting to the database with Prisma:', err);
  }

  // API Routes
  server.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  server.use('/api/users', userRoutes);
  server.use('/api/auth', authRoutes);
  server.use('/api/upload', uploadRoutes);

  // Serve uploaded files statically
  server.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Let Next.js handle all other routes
  server.use((req: Request, res: Response) => {
    return handle(req, res);
  });

  // Global Error Handler
  server.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
    console.error(err);
    
    let statusCode = err.statusCode || 500;
    if (err.message === 'User already exists with this email') statusCode = 409;
    if (err.message === 'Invalid email or password') statusCode = 401;
    if (err.message === 'Unauthorized') statusCode = 401;
    
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ 
      success: false,
      message: message,
      data: null
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Error starting server', err);
  process.exit(1);
});
