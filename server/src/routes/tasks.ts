import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware';
import { LocalDb } from '../services/localDb';
import { Task, Subtask } from '../types';
import * as z from 'zod';

const router = Router();

// Zod validation schemas
const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  status: z.enum(['active', 'completed']).default('active'),
});

const taskCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  dueDate: z.string().optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

// Apply auth middleware to all task routes
router.use(authMiddleware as any);

// GET /api/tasks — Retrieve all tasks for authenticated user
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const allTasks = LocalDb.get('tasks');
    // Filter by user ID
    const userTasks = allTasks.filter(t => t.uid === uid);
    return res.json(userTasks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// POST /api/tasks — Create a new task
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  try {
    const validation = taskCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const taskId = 'task-' + Math.random().toString(36).substr(2, 9);
    
    // Format subtasks
    const formattedSubtasks: Subtask[] = data.subtasks?.map(sub => ({
      id: sub.id || 'subtask-' + Math.random().toString(36).substr(2, 9),
      parentTaskId: taskId,
      title: sub.title,
      status: sub.status as 'active' | 'completed',
      createdAt: new Date().toISOString(),
    })) || [];

    const newTask: Task = {
      id: taskId,
      uid,
      title: data.title,
      description: data.description,
      priority: data.priority as 'high' | 'medium' | 'low',
      status: 'active',
      dueDate: data.dueDate,
      subtasks: formattedSubtasks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allTasks = LocalDb.get('tasks');
    allTasks.unshift(newTask);
    LocalDb.set('tasks', allTasks);

    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT /api/tasks/:taskId — Update an existing task
router.put('/:taskId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const taskId = req.params.taskId as string;
  try {
    const validation = taskCreateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const data = validation.data;
    const allTasks = LocalDb.get('tasks');
    const taskIdx = allTasks.findIndex(t => t.id === taskId && t.uid === uid);

    if (taskIdx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const existingTask = allTasks[taskIdx];
    
    // Format and merge subtasks preserving completion if applicable
    const formattedSubtasks: Subtask[] = data.subtasks?.map(sub => {
      const match = existingTask.subtasks?.find(s => s.title === sub.title);
      return {
        id: sub.id || match?.id || 'subtask-' + Math.random().toString(36).substr(2, 9),
        parentTaskId: taskId,
        title: sub.title,
        status: (sub.status || match?.status || 'active') as 'active' | 'completed',
        createdAt: match?.createdAt || new Date().toISOString(),
      };
    }) || [];

    const updatedTask: Task = {
      ...existingTask,
      title: data.title,
      description: data.description,
      priority: data.priority as 'high' | 'medium' | 'low',
      dueDate: data.dueDate,
      subtasks: formattedSubtasks,
      updatedAt: new Date().toISOString(),
    };

    allTasks[taskIdx] = updatedTask;
    LocalDb.set('tasks', allTasks);

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// PATCH /api/tasks/:taskId/status — Toggle task completion status
router.patch('/:taskId/status', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const taskId = req.params.taskId as string;
  const { status } = req.body; // 'active' or 'completed'

  if (status !== 'active' && status !== 'completed') {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const allTasks = LocalDb.get('tasks');
    const taskIdx = allTasks.findIndex(t => t.id === taskId && t.uid === uid);

    if (taskIdx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = allTasks[taskIdx];
    const newStatus = status as 'active' | 'completed';
    
    // If completing task, also complete all its subtasks!
    const updatedSubtasks = task.subtasks?.map(sub => ({
      ...sub,
      status: newStatus
    })) || [];

    const updatedTask = {
      ...task,
      status: newStatus,
      subtasks: updatedSubtasks,
      updatedAt: new Date().toISOString(),
    };

    allTasks[taskIdx] = updatedTask;
    LocalDb.set('tasks', allTasks);

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

// DELETE /api/tasks/:taskId — Delete a task
router.delete('/:taskId', async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const uid = req.user!.uid;
  const taskId = req.params.taskId as string;
  try {
    const allTasks = LocalDb.get('tasks');
    const taskIdx = allTasks.findIndex(t => t.id === taskId && t.uid === uid);

    if (taskIdx === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const filtered = allTasks.filter(t => t.id !== taskId || t.uid !== uid);
    LocalDb.set('tasks', filtered);

    return res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
