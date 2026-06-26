import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';
import { CalendarEvent } from '../types';
import * as z from 'zod';

const router = Router();

// Zod validation schemas
const eventCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().optional(),
  category: z.enum(['Work', 'Personal', 'Study', 'Health', 'Social']),
  color: z.string().default('#F5C518'),
  reminder: z.boolean().default(true),
});

// Apply auth middleware to all calendar routes
router.use(authMiddleware as any);

// GET /api/events — Get all events for user (with optional month/year filter)
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { month, year } = req.query; // optional filters
  try {
    const allEvents = LocalDb.get('events');
    let userEvents = allEvents.filter(e => e.uid === uid);

    if (month && year) {
      // Filter by YYYY-MM prefix
      const prefix = `${year}-${String(month).padStart(2, '0')}`;
      userEvents = userEvents.filter(e => e.date.startsWith(prefix));
    }

    return res.json(userEvents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// POST /api/events — Create an event
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const validation = eventCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const newEvent: CalendarEvent = {
      id: 'event-' + Math.random().toString(36).substr(2, 9),
      uid,
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      color: data.color,
      reminder: data.reminder,
    };

    const allEvents = LocalDb.get('events');
    allEvents.push(newEvent);
    LocalDb.set('events', allEvents);

    return res.status(201).json(newEvent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:eventId — Update an event
router.put('/:eventId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { eventId } = req.params;
  try {
    const validation = eventCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const allEvents = LocalDb.get('events');
    const idx = allEvents.findIndex(e => e.id === eventId && e.uid === uid);

    if (idx === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const updatedEvent: CalendarEvent = {
      ...allEvents[idx],
      title: data.title,
      description: data.description,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      category: data.category,
      color: data.color,
      reminder: data.reminder,
    };

    allEvents[idx] = updatedEvent;
    LocalDb.set('events', allEvents);

    return res.json(updatedEvent);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:eventId — Delete an event
router.delete('/:eventId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { eventId } = req.params;
  try {
    const allEvents = LocalDb.get('events');
    const idx = allEvents.findIndex(e => e.id === eventId && e.uid === uid);

    if (idx === -1) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const filtered = allEvents.filter(e => e.id !== eventId || e.uid !== uid);
    LocalDb.set('events', filtered);

    return res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete event' });
  }
});

// GET /api/events/timeline — Chronological timeline of all events
router.get('/timeline', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const allEvents = LocalDb.get('events');
    const userEvents = allEvents.filter(e => e.uid === uid);

    // Sort descending chronologically (newest first)
    const sorted = userEvents.sort((a, b) => {
      return `${b.date} ${b.startTime}`.localeCompare(`${a.date} ${a.startTime}`);
    });

    return res.json(sorted);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve timeline' });
  }
});

export default router;
