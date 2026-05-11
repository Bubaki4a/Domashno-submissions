import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import { authRouter } from '../../presentation/controllers/authController';
import { formRouter } from '../../presentation/controllers/formController';
import { providerRouter } from '../../presentation/controllers/providerController';
import { productRouter } from '../../presentation/controllers/productController';
import { userRouter } from '../../presentation/controllers/userController';
import { jobRouter } from '../../presentation/controllers/jobController';
import { authMiddleware, requireRole } from './authMiddleware';
import { startScheduler } from '../jobs/scheduler';

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
        providers: 'GET /api/providers',
        syncProvider: 'POST /api/providers/:provider/sync',
        normalize: 'POST /api/providers/:provider/normalize',
        products: 'GET /api/products',
        product: 'GET /api/products/:providerId/:id',
        updateProduct: 'PUT /api/products/:providerId/:id',
        enhanceProduct: 'POST /api/products/:providerId/:id/enhance',
      },
    });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth (public)
  app.use('/api', authRouter);

  // Protected API routes (require login)
  app.use('/api', authMiddleware, formRouter);
  app.use('/api', authMiddleware, providerRouter);
  app.use('/api', authMiddleware, productRouter);
  app.use('/api', userRouter);
  app.use('/api/admin/jobs', authMiddleware, requireRole('administrator'), jobRouter);

  // Log all registered routes for debugging
  console.log('📋 Registered API routes:');
  console.log('  POST /api/auth/login');
  console.log('  GET /api/auth/me (auth required)');
  console.log('  POST /api/submit (auth required)');
  console.log('  GET /api/submissions (auth required)');
  console.log('  PUT /api/submissions/:id (auth required)');
  console.log('  GET /api/providers (auth required)');
  console.log('  POST /api/providers/:provider/sync (auth required)');
  console.log('  POST /api/providers/:provider/normalize (auth required)');
  console.log('  GET /api/products (auth required)');
  console.log('  GET /api/products/:providerId/:id (auth required)');
  console.log('  PUT /api/products/:providerId/:id (auth required)');
  console.log('  POST /api/products/:providerId/:id/enhance (auth required)');
  console.log('  GET /api/users (admin only)');
  console.log('  POST /api/users (admin only)');
  console.log('  POST /api/admin/jobs/import (admin only)');
  console.log('  POST /api/admin/jobs/enrich (admin only)');
  console.log('  GET /api/admin/jobs (admin only)');
  console.log('  GET /api/admin/jobs/:id (admin only)');
  console.log('  GET /api/admin/jobs/failed-products (admin only)');
  console.log('  POST /api/admin/jobs/retry-failed (admin only)');

  return app;
}

export function startServer(): void {
  const app = createServer();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    startScheduler();
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
