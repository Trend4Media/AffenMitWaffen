import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import systemRoutes from './routes/systems.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Galaxy 555 Tracker API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/systems', systemRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(new URL('../dist/index.html', import.meta.url).pathname);
  });
}

app.listen(PORT, async () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log('');
  
  // Stelle sicher, dass ein Admin-Account existiert
  await ensureAdminExists();
});
