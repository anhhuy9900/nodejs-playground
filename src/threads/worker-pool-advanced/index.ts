import express from 'express';
import path from 'path';
import { DynamicWorkerPool } from './WorkerPool';

const app = express();
app.use(express.json());

const pool = new DynamicWorkerPool(path.join(__dirname, 'heavy-compute.worker.js'), {
  minWorkers: 2,
  maxWorkers: 8,
  idleTimeout: 10000,
  taskTimeout: 30000,
});

pool.on('worker:created', (stats) => console.log('✅ Worker created:', stats));
pool.on('worker:terminated', (stats) => console.log('❌ Worker terminated:', stats));

app.post('/compute', async (req, res) => {
  try {
    const result = await pool.execute({ numbers: req.body.numbers });
    res.json({ result, stats: pool.getStats() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/stats', (req, res) => res.json(pool.getStats()));

const server = app.listen(3000, () => {
  console.log('🚀 Worker Pool server on http://localhost:3000');
});

process.on('SIGTERM', async () => {
  await pool.destroy();
  server.close();
});
