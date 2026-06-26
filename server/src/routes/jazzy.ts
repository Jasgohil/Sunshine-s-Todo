import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';

const router = Router();

// Apply auth middleware to all jazzy routes
router.use(authMiddleware as any);

// GET /api/jazzy/daily — Get today's scheduled inspiration note, or fallback message
router.get('/daily', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const notes = LocalDb.get('jazzyNotes');
    
    // Find published note scheduled for today
    const todayNote = notes.find(n => n.scheduledDate === todayStr && n.isPublished);

    if (todayNote) {
      return res.json({
        id: todayNote.id,
        content: todayNote.content,
        scheduledDate: todayNote.scheduledDate,
        isCustom: true,
      });
    }

    // Fallback rotating messages pool if no custom note is scheduled
    const fallbackMessages = [
      "You are capable of doing amazing things, even on the days when it feels like just getting out of bed is a victory. Take a deep breath and take one tiny step forward. You've got this, Sunshine! ❤️",
      "Don't compare your chapter one to someone else's chapter twenty. Everyone moves at their own pace, and where you are right now is exactly where you need to be. Be gentle with yourself today.",
      "Remember that the clouds always pass, and the sun always returns. If today is a bit gray, hold on, because your sunshine is just behind the horizon. Keep shining your light!",
      "A quiet mind is a powerful mind. Take five minutes today to just sit, breathe, and appreciate how far you have come. I am so proud of your progress and who you are becoming."
    ];

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const msgIdx = dayOfYear % fallbackMessages.length;

    return res.json({
      id: 'fallback-msg-' + msgIdx,
      content: fallbackMessages[msgIdx],
      scheduledDate: todayStr,
      isCustom: false,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve daily note' });
  }
});

// GET /api/jazzy/poem — Get today's rotating poem from the library
router.get('/poem', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  try {
    const poems = LocalDb.get('poems');
    
    if (poems.length === 0) {
      return res.status(404).json({ error: 'No poems available' });
    }

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const poemIdx = dayOfYear % poems.length;

    return res.json(poems[poemIdx]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve daily poem' });
  }
});

export default router;
