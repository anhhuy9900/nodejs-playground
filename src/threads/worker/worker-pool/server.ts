import express from 'express';
import { Worker } from 'worker_threads';
import path from 'path';

const app = express();
const port = 3000;

// Worker Pool to manage multiple workers
class WorkerPool {
  private workers: Worker[] = [];
  private readonly maxWorkers: number;
  private taskQueue: { task: any; resolve: Function; reject: Function }[] = [];
  private availableWorkers: Worker[] = [];

  constructor(workerPath: string, numWorkers: number = 4) {
    this.maxWorkers = numWorkers;

    // Create workers
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(workerPath);
      this.setupWorkerEventHandlers(worker);
      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  executeTask(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processNextTask();
    });
  }

  terminate() {
    this.workers.forEach((worker) => worker.terminate());
  }

  private setupWorkerEventHandlers(worker: Worker) {
    worker.on('message', (result) => {
      // Worker becomes available
      this.availableWorkers.push(worker);

      // Get the next task
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        nextTask.resolve(result);
        this.processNextTask();
      }
    });

    worker.on('error', (error) => {
      console.error('Worker error:', error);
      // Handle worker error
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        nextTask.reject(error);
      }
    });
  }

  private processNextTask() {
    if (this.taskQueue.length === 0 || this.availableWorkers.length === 0) {
      return;
    }

    const worker = this.availableWorkers.pop();
    const nextTask = this.taskQueue[0];

    if (worker && nextTask) {
      worker.postMessage(nextTask.task);
    }
  }
}

// Create a worker pool
const workerPool = new WorkerPool(path.join(__dirname, 'worker.js'));

// API endpoints
app.get('/compute/:number', async (req, res) => {
  try {
    const number = parseInt(req.params.number);
    const result = await workerPool.executeTask({ type: 'fibonacci', number });
    res.json({
      result,
      processId: process.pid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: 'Computation failed' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', processId: process.pid });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Main process ID: ${process.pid}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  workerPool.terminate();
  process.exit(0);
});
