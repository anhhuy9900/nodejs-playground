import express, { Request, Response, NextFunction } from 'express';
import { HealthChecker, HealthStatus } from './health-check';

const app = express();
const healthChecker = new HealthChecker();

let isShuttingDown = false;
const activeRequests = new Set<any>();

healthChecker.register('database', async () => {
  // Simulate DB check
  return true;
});

healthChecker.register('redis', async () => {
  return true;
});

app.use((req: any, res: any, next: any) => {
  if (isShuttingDown) {
    res.set('Connection', 'close');
    return res.status(503).json({ error: 'Server is shutting down' });
  }

  activeRequests.add(req);
  res.on('finish', () => activeRequests.delete(req));

  next();
});

app.get('/health', async (req, res) => {
  const health = await healthChecker.check();
  const status = health.status === HealthStatus.HEALTHY ? 200 : 503;
  res.status(status).json(health);
});

app.get('/ready', (req: any, res: any) => {
  if (isShuttingDown) {
    return res.status(503).json({ ready: false });
  }
  res.json({ ready: true });
});

app.get('/api/data', async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  res.json({ message: 'Data processed' });
});

const server = app.listen(3004, () => {
  console.log('🚀 Server on http://localhost:3004');
});

async function gracefulShutdown(signal: string) {
  console.log(`\n📢 ${signal} received, starting graceful shutdown...`);
  isShuttingDown = true;

  server.close(() => {
    console.log('✅ HTTP server closed');
  });

  const timeout = setTimeout(() => {
    console.log('⚠️ Forcefully shutting down');
    process.exit(1);
  }, 30000);

  console.log(`⏳ Waiting for ${activeRequests.size} active requests...`);

  while (activeRequests.size > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  clearTimeout(timeout);
  console.log('✅ All requests completed');
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
