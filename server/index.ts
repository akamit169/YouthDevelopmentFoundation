// Load environment variables first
import { config } from 'dotenv';
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database';
import { handleDemo } from './routes/demo';
import testRoutes from './routes/test';
import authRoutes from './routes/auth';
import scholarshipRoutes from './routes/scholarships';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../spa');
  app.use(express.static(staticPath));
}

// API routes
app.get('/api/demo', handleDemo);
app.get('/api/ping', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/test', testRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Youth Dreamers Foundation API is running',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/demo',
      '/api/ping', 
      '/api/test/connection',
      '/api/auth/login',
      '/api/auth/register',
      '/health'
    ]
  });
});

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/health')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // In development, proxy to Vite dev server
  res.redirect('http://localhost:5173' + req.path);
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 API demo: http://localhost:${PORT}/api/demo`);
      console.log(`🔗 API ping: http://localhost:${PORT}/api/ping`);
      console.log(`🔗 Create users: http://localhost:${PORT}/api/auth/create-default-users`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export function createServer() {
  return app;
}