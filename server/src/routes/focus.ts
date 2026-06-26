import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';
import { FocusSession } from '../types';
import * as z from 'zod';

const router = Router();

// Zod validation schemas
const focusSessionSchema = z.object({
  mode: z.enum(['25/5', '50/10', '90/20', 'custom']),
  durationMinutes: z.number().min(1),
  startedAt: z.string(),
  completedAt: z.string(),
  notes: z.string().optional(),
});

// Apply auth middleware
router.use(authMiddleware as any);

// POST /api/focus/session — Record a completed focus session
router.post('/session', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const validation = focusSessionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const newSession: FocusSession = {
      id: 'session-' + Math.random().toString(36).substr(2, 9),
      uid,
      mode: data.mode,
      durationMinutes: data.durationMinutes,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      notes: data.notes,
    };

    const allFocus = LocalDb.get('focus');
    allFocus.push(newSession);
    LocalDb.set('focus', allFocus);

    return res.status(201).json(newSession);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record focus session' });
  }
});

// GET /api/focus/stats — Retrieve analytics statistics for focus sessions
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const allFocus = LocalDb.get('focus');
    const userSessions = allFocus.filter(s => s.uid === uid);

    const todayStr = new Date().toISOString().split('T')[0];

    // Helper: check if a date is within past N days
    const isWithinDays = (dateStr: string, days: number) => {
      const date = new Date(dateStr);
      const limit = new Date();
      limit.setDate(limit.getDate() - days);
      return date >= limit;
    };

    // Calculate today's minutes
    const todayMinutes = userSessions
      .filter(s => s.completedAt.startsWith(todayStr))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate week minutes (past 7 days)
    const weekMinutes = userSessions
      .filter(s => isWithinDays(s.completedAt, 7))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    // Calculate month minutes (past 30 days)
    const monthMinutes = userSessions
      .filter(s => isWithinDays(s.completedAt, 30))
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    const totalSessions = userSessions.length;
    const longestSession = userSessions.reduce((max, s) => Math.max(max, s.durationMinutes), 0);

    // Group daily breakdown for past 7 days (e.g. for charts)
    const dailyBreakdown: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      dailyBreakdown[dayKey] = 0;
    }

    userSessions.forEach(s => {
      const dayKey = s.completedAt.split('T')[0];
      if (dayKey in dailyBreakdown) {
        dailyBreakdown[dayKey] += s.durationMinutes;
      }
    });

    const dailyBreakdownList = Object.entries(dailyBreakdown).map(([date, minutes]) => {
      const dayName = new Date(date).toLocaleDateString(undefined, { weekday: 'short' });
      return { date, day: dayName, minutes };
    });

    // Group 30-day trend for past 30 days
    const thirtyDayTrend: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().split('T')[0];
      thirtyDayTrend[dayKey] = 0;
    }

    userSessions.forEach(s => {
      const dayKey = s.completedAt.split('T')[0];
      if (dayKey in thirtyDayTrend) {
        thirtyDayTrend[dayKey] += s.durationMinutes;
      }
    });

    const thirtyDayTrendList = Object.entries(thirtyDayTrend).map(([date, minutes], index) => {
      return {
        day: index + 1,
        date,
        minutes
      };
    });

    // Group weekly breakdown (past 4 weeks) for monthly chart
    const weeklyBreakdownMinutes = { W1: 0, W2: 0, W3: 0, W4: 0 };
    const nowMs = Date.now();
    userSessions.forEach(s => {
      const completedMs = new Date(s.completedAt).getTime();
      const diffDays = Math.floor((nowMs - completedMs) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weeklyBreakdownMinutes.W4 += s.durationMinutes;
      } else if (diffDays >= 7 && diffDays < 14) {
        weeklyBreakdownMinutes.W3 += s.durationMinutes;
      } else if (diffDays >= 14 && diffDays < 21) {
        weeklyBreakdownMinutes.W2 += s.durationMinutes;
      } else if (diffDays >= 21 && diffDays < 28) {
        weeklyBreakdownMinutes.W1 += s.durationMinutes;
      }
    });

    const monthlyBreakdownList = Object.entries(weeklyBreakdownMinutes).map(([week, minutes]) => {
      return {
        week,
        hours: parseFloat((minutes / 60).toFixed(1))
      };
    });

    // Simple Streak Calculation (days in a row including today or yesterday)
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hadSession = userSessions.some(s => s.completedAt.startsWith(dateStr));
      if (hadSession) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If we haven't worked today yet, check yesterday to keep streak alive
        if (streak === 0 && checkDate.toISOString().split('T')[0] === todayStr) {
          checkDate.setDate(checkDate.getDate() - 1);
          const hadSessionYesterday = userSessions.some(s => s.completedAt.startsWith(checkDate.toISOString().split('T')[0]));
          if (hadSessionYesterday) {
            streak = 1;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
        }
        break;
      }
    }

    return res.json({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      totalSessions,
      longestSession,
      streak,
      dailyBreakdown: dailyBreakdownList,
      monthlyBreakdown: monthlyBreakdownList,
      thirtyDayTrend: thirtyDayTrendList,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to calculate stats' });
  }
});

// GET /api/focus/sessions — Retrieve list of focus sessions for current user (most recent first)
router.get('/sessions', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const allFocus = LocalDb.get('focus');
    const userSessions = allFocus
      .filter(s => s.uid === uid)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    return res.json(userSessions);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve focus sessions' });
  }
});

// DELETE /api/focus/session/:id — Delete a specific focus session
router.delete('/session/:id', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const { id } = req.params;
  try {
    const allFocus = LocalDb.get('focus');
    const index = allFocus.findIndex(s => s.id === id && s.uid === uid);
    if (index === -1) {
      return res.status(404).json({ error: 'Focus session not found' });
    }
    allFocus.splice(index, 1);
    LocalDb.set('focus', allFocus);
    return res.json({ success: true, message: 'Focus session deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete focus session' });
  }
});

export default router;
