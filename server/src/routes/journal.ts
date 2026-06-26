import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';
import { JournalEntry } from '../types';
import * as z from 'zod';

const router = Router();

// Zod validation schemas
const journalCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  mood: z.enum(['Calm', 'Happy', 'Energetic', 'Tired', 'Sad', 'Anxious', 'Grateful']),
});

// Apply auth middleware to all journal routes
router.use(authMiddleware as any);

// GET /api/journal — Get all entries for user
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const allEntries = LocalDb.get('journal');
    const userEntries = allEntries.filter(e => e.uid === uid);

    // Sort descending (newest first)
    const sorted = userEntries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return res.json(sorted);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve journal entries' });
  }
});

// GET /api/journal/:entryId — Get single entry
router.get('/:entryId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { entryId } = req.params;
  try {
    const allEntries = LocalDb.get('journal');
    const entry = allEntries.find(e => e.id === entryId && e.uid === uid);

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    return res.json(entry);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve journal entry' });
  }
});

// POST /api/journal — Create a new entry
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const validation = journalCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const newEntry: JournalEntry = {
      id: 'journal-' + Math.random().toString(36).substr(2, 9),
      uid,
      title: data.title,
      content: data.content,
      mood: data.mood,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allEntries = LocalDb.get('journal');
    allEntries.unshift(newEntry);
    LocalDb.set('journal', allEntries);

    return res.status(201).json(newEntry);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// PUT /api/journal/:entryId — Update an entry
router.put('/:entryId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { entryId } = req.params;
  try {
    const validation = journalCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const allEntries = LocalDb.get('journal');
    const idx = allEntries.findIndex(e => e.id === entryId && e.uid === uid);

    if (idx === -1) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const updatedEntry: JournalEntry = {
      ...allEntries[idx],
      title: data.title,
      content: data.content,
      mood: data.mood,
      updatedAt: new Date().toISOString(),
    };

    allEntries[idx] = updatedEntry;
    LocalDb.set('journal', allEntries);

    return res.json(updatedEntry);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// DELETE /api/journal/:entryId — Delete an entry
router.delete('/:entryId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { entryId } = req.params;
  try {
    const allEntries = LocalDb.get('journal');
    const idx = allEntries.findIndex(e => e.id === entryId && e.uid === uid);

    if (idx === -1) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    const filtered = allEntries.filter(e => e.id !== entryId || e.uid !== uid);
    LocalDb.set('journal', filtered);

    return res.json({ success: true, message: 'Journal entry deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
