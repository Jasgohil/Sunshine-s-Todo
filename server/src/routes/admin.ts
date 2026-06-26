import { Router, Response } from 'express';
import { authMiddleware, adminMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';
import { JazzyNote, Poem } from '../types';
import * as z from 'zod';

const router = Router();

// Zod validation schemas
const noteCreateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  isPublished: z.boolean().default(true),
});

const poemCreateSchema = z.object({
  title: z.string().min(1, 'Poem title is required'),
  content: z.string().min(1, 'Poem content is required'),
  author: z.string().default('Anonymous'),
});

// Apply auth AND admin middleware to all admin routes
router.use(authMiddleware as any);
router.use(adminMiddleware as any);

// ==========================================
// 1. Jazzy Inspiration Notes CRUD
// ==========================================

// GET /api/admin/notes — Get all scheduled daily notes
router.get('/notes', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const notes = LocalDb.get('jazzyNotes');
    // Sort descending by date
    const sorted = notes.sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
    return res.json(sorted);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve admin notes' });
  }
});

// POST /api/admin/notes — Create / Schedule a new daily note
router.post('/notes', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const validation = noteCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const newNote: JazzyNote = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      content: data.content,
      scheduledDate: data.scheduledDate,
      isPublished: data.isPublished,
      createdAt: new Date().toISOString(),
    };

    const notes = LocalDb.get('jazzyNotes');
    notes.push(newNote);
    LocalDb.set('jazzyNotes', notes);

    return res.status(201).json(newNote);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to schedule note' });
  }
});

// PUT /api/admin/notes/:noteId — Update a scheduled daily note
router.put('/notes/:noteId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { noteId } = req.params;
  try {
    const validation = noteCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const notes = LocalDb.get('jazzyNotes');
    const idx = notes.findIndex(n => n.id === noteId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const updatedNote: JazzyNote = {
      ...notes[idx],
      content: data.content,
      scheduledDate: data.scheduledDate,
      isPublished: data.isPublished,
    };

    notes[idx] = updatedNote;
    LocalDb.set('jazzyNotes', notes);

    return res.json(updatedNote);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update scheduled note' });
  }
});

// PATCH /api/admin/notes/:noteId/publish — Toggle publish status of a note
router.patch('/notes/:noteId/publish', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { noteId } = req.params;
  try {
    const notes = LocalDb.get('jazzyNotes');
    const idx = notes.findIndex(n => n.id === noteId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    notes[idx].isPublished = !notes[idx].isPublished;
    LocalDb.set('jazzyNotes', notes);

    return res.json(notes[idx]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to toggle publish status' });
  }
});

// DELETE /api/admin/notes/:noteId — Delete a scheduled daily note
router.delete('/notes/:noteId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { noteId } = req.params;
  try {
    const notes = LocalDb.get('jazzyNotes');
    const idx = notes.findIndex(n => n.id === noteId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const filtered = notes.filter(n => n.id !== noteId);
    LocalDb.set('jazzyNotes', filtered);

    return res.json({ success: true, message: 'Scheduled note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete note' });
  }
});

// ==========================================
// 2. Poetry Pool Management
// ==========================================

// GET /api/admin/poems — Get all poems in pool
router.get('/poems', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const poems = LocalDb.get('poems');
    return res.json(poems);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve poems pool' });
  }
});

// POST /api/admin/poems — Create / Add a new poem to pool
router.post('/poems', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const validation = poemCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const newPoem: Poem = {
      id: 'poem-' + Math.random().toString(36).substr(2, 9),
      title: data.title,
      content: data.content,
      author: data.author,
      createdAt: new Date().toISOString(),
    };

    const poems = LocalDb.get('poems');
    poems.push(newPoem);
    LocalDb.set('poems', poems);

    return res.status(201).json(newPoem);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add poem to pool' });
  }
});

// DELETE /api/admin/poems/:poemId — Delete a poem from pool
router.delete('/poems/:poemId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const { poemId } = req.params;
  try {
    const poems = LocalDb.get('poems');
    const idx = poems.findIndex(p => p.id === poemId);

    if (idx === -1) {
      return res.status(404).json({ error: 'Poem not found in pool' });
    }

    const filtered = poems.filter(p => p.id !== poemId);
    LocalDb.set('poems', filtered);

    return res.json({ success: true, message: 'Poem removed from pool successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove poem' });
  }
});

export default router;
