export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAdmin: boolean;
  token?: string;
}

export interface Task {
  id: string;
  uid: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  parentTaskId: string;
  title: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  uid: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  category: 'Work' | 'Personal' | 'Study' | 'Health' | 'Social';
  color: string;
  reminder: boolean;
}

export interface JournalEntry {
  id: string;
  uid: string;
  title: string;
  content: string;
  mood: 'Calm' | 'Happy' | 'Energetic' | 'Tired' | 'Sad' | 'Anxious' | 'Grateful';
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  uid: string;
  mode: '25/5' | '50/10' | '90/20' | 'custom';
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  notes?: string;
}
