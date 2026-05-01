import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { formRouter } from '../../presentation/controllers/formController';

const PORT = process.env.PORT || 3001;

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Product Optimizer API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        submit: 'POST /api/submit',
        submissions: 'GET /api/submissions',
        updateSubmission: 'PUT /api/submissions/:id',
        deleteSubmission: 'DELETE /api/submissions/:id',
        restoreSubmission: 'POST /api/submissions/:id/restore',
      },
    });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api', formRouter);

  // Log all registered routes for debugging
  console.log('📋 Registered API routes:');
  console.log('  POST /api/submit');
  console.log('  GET /api/submissions');
  console.log('  PUT /api/submissions/:id');

  return app;
}

export function startServer(): void {
  const app = createServer();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use.`);
      console.error(`💡 Please stop the process using port ${PORT} or change the PORT environment variable.`);
      console.error(`💡 To find and kill the process: netstat -ano | findstr :${PORT}`);
      process.exit(1);
    } else {
      console.error('❌ Server error:', error);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ Server closed. Port released.');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}
