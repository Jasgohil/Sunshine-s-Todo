import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { Task, CalendarEvent, JournalEntry, FocusSession, User } from '../types';

const DB_FILE = path.join(process.cwd(), 'db.json');

interface DatabaseSchema {
  users: Record<string, User>;
  tasks: Task[];
  events: CalendarEvent[];
  journal: JournalEntry[];
  focus: FocusSession[];
}

const getDefaultDb = (): DatabaseSchema => {
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return {
    users: {
      'mock-admin-uid': {
        uid: 'mock-admin-uid',
        displayName: 'Sunshine Admin',
        email: 'ishika@sunshine.com',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin',
        isAdmin: true,
      },
      'mock-user-uid': {
        uid: 'mock-user-uid',
        displayName: 'Sunshine User',
        email: 'sunshine@example.com',
        photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=User',
        isAdmin: false,
      }
    },
    tasks: [
      {
        id: 'task-1',
        uid: 'mock-admin-uid',
        title: 'Design high-fidelity dashboard layout',
        description: 'Ensure layout is fully responsive, dark-mode first with gold accents.',
        priority: 'high',
        status: 'active',
        dueDate: todayStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: []
      },
      {
        id: 'task-2',
        uid: 'mock-admin-uid',
        title: 'Review weekly calendar timeline spec',
        description: 'Map category dots and event detail panel layout.',
        priority: 'medium',
        status: 'active',
        dueDate: todayStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: []
      },
      {
        id: 'task-3',
        uid: 'mock-admin-uid',
        title: 'Refactor Auth context with Zod validation',
        priority: 'high',
        status: 'completed',
        dueDate: todayStr,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtasks: []
      }
    ],
    events: [
      {
        id: 'event-1',
        uid: 'mock-admin-uid',
        title: 'Productivity Design Sync',
        description: 'Align on layouts and assets with the client.',
        date: todayStr,
        startTime: '14:00',
        endTime: '15:00',
        category: 'Work',
        color: '#F5C518',
        reminder: true,
      },
      {
        id: 'event-2',
        uid: 'mock-admin-uid',
        title: 'Dental Checkup',
        date: tomorrowStr,
        startTime: '10:30',
        endTime: '11:30',
        category: 'Health',
        color: '#EF4444',
        reminder: true,
      },
      {
        id: 'event-3',
        uid: 'mock-admin-uid',
        title: 'Dinner with Jazzy ❤️',
        description: 'Reserve table at the garden bistro.',
        date: tomorrowStr,
        startTime: '19:30',
        endTime: '21:30',
        category: 'Social',
        color: '#FF8C42',
        reminder: false,
      }
    ],
    journal: [
      {
        id: 'journal-1',
        uid: 'mock-admin-uid',
        title: 'Finding quiet in the middle of chaos',
        content: '<h3>A Peaceful Afternoon</h3><p>Today was incredibly busy, but I managed to slip away for a 20-minute walk in the local garden. The sun was shining beautifully, casting long golden beams through the tree leaves. It reminded me of the core tagline: <i>"always leave room for a little sunshine."</i></p><p>I came back to my desk refreshed and managed to finish styling the core dashboard widgets. Tomorrow is all about integrating the calendar grids. One step at a time.</p>',
        mood: 'Grateful',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ],
    focus: []
  };
};

export class LocalDb {
  private static cache: DatabaseSchema | null = null;
  private static mongoClient: MongoClient | null = null;
  private static mongoCollection: any = null;
  private static isMongoConnected = false;

  /**
   * Initializes the database.
   * If MONGODB_URI is provided, it connects to the cloud database and syncs state.
   * Otherwise, it falls back to the local db.json file.
   */
  public static async init(): Promise<void> {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        console.log('🔌 Connecting to MongoDB cloud database...');
        const client = new MongoClient(mongoUri);
        await client.connect();
        
        const db = client.db('sunshine_todo');
        this.mongoCollection = db.collection('app_state');
        this.mongoClient = client;
        this.isMongoConnected = true;
        console.log('✅ Connected to MongoDB successfully.');

        // Try to load the state document
        const doc = await this.mongoCollection.findOne({ _id: 'sunshine_db_state' });
        if (doc && doc.data) {
          this.cache = doc.data as DatabaseSchema;
          // Backup locally to db.json
          fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2));
          console.log('📥 Database state loaded from MongoDB cloud.');
        } else {
          console.log('❓ No database state found in MongoDB. Uploading initial state...');
          const initialData = this.readLocal();
          this.cache = initialData;
          await this.mongoCollection.updateOne(
            { _id: 'sunshine_db_state' },
            { $set: { data: initialData } },
            { upsert: true }
          );
          console.log('📤 Initial database state uploaded to MongoDB.');
        }
        return;
      } catch (err) {
        console.error('❌ Failed to connect to MongoDB. Falling back to local db.json:', err);
      }
    } else {
      console.log('ℹ️ MONGODB_URI not set. Operating in offline/local file mode (db.json).');
    }

    // Fallback to local db.json
    this.cache = this.readLocal();
    console.log('💾 Loaded database from local db.json file.');
  }

  private static readLocal(): DatabaseSchema {
    if (!fs.existsSync(DB_FILE)) {
      const defaultDb = getDefaultDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error('⚠️ Error reading local db file, resetting to default:', e);
      const defaultDb = getDefaultDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
      return defaultDb;
    }
  }

  private static writeLocal() {
    if (!this.cache) return;
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.cache, null, 2));
    } catch (err) {
      console.error('❌ Error writing local db file:', err);
    }
  }

  /**
   * Retrieves data synchronously from the memory cache.
   */
  public static get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    if (!this.cache) {
      this.cache = this.readLocal();
    }
    return this.cache[key];
  }

  /**
   * Sets data synchronously in the memory cache, writes to local file,
   * and asynchronously pushes the updates to MongoDB in the background.
   */
  public static set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    if (!this.cache) {
      this.cache = this.readLocal();
    }
    this.cache[key] = value;
    
    // 1. Write to local file
    this.writeLocal();

    // 2. Asynchronously sync to MongoDB in background if connected
    if (this.isMongoConnected && this.mongoCollection) {
      this.mongoCollection.updateOne(
        { _id: 'sunshine_db_state' },
        { $set: { data: this.cache } },
        { upsert: true }
      ).catch((err: any) => {
        console.error('❌ Background MongoDB sync failed:', err);
      });
    }
  }
}
