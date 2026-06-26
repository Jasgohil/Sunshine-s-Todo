import dotenv from 'dotenv';
import app from './app';
import { LocalDb } from './services/localDb';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Initialize the database (MongoDB or local db.json fallback) before starting the server
const startServer = async () => {
  try {
    await LocalDb.init();
    app.listen(PORT, () => {
      console.log(`☀️  Sunshine's Todo Backend running on port ${PORT}`);
      console.log(`🔗 Health check available at http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error('❌ Critical database initialization error:', err);
    process.exit(1);
  }
};

startServer();

