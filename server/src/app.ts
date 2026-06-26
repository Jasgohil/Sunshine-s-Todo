import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import tasksRouter from './routes/tasks';
import calendarRouter from './routes/calendar';
import journalRouter from './routes/journal';
import focusRouter from './routes/focus';
import jazzyRouter from './routes/jazzy';
import adminRouter from './routes/admin';
import authRouter from './routes/auth';

const app = express();

// Security HTTP headers
app.use(helmet());

// Enable CORS for frontend development server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Elevated for local dev/testing
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again after 15 minutes.' }
});

// Apply rate limiter to API routes
app.use('/api', limiter);

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/events', calendarRouter);
app.use('/api/journal', journalRouter);
app.use('/api/focus', focusRouter);
app.use('/api/jazzy', jazzyRouter);
app.use('/api/admin', adminRouter);

// Base / Healthcheck route
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

export default app;
