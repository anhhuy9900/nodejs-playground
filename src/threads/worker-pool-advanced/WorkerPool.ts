import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import path from 'path';

interface Task<T = any> {
  id: string;
  data: T;
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  createdAt: number;
}

interface PoolOptions {
  minWorkers: number;
  maxWorkers: number;
  idleTimeout: number;
  taskTimeout: number;
}

export class DynamicWorkerPool extends EventEmitter {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Task[] = [];
  private activeTasks = new Map<number, Task>();
  private workerScript: string;
  private options: PoolOptions;

  constructor(workerScript: string, options: Partial<PoolOptions> = {}) {
    super();
    this.workerScript = workerScript;
    this.options = {
      minWorkers: options.minWorkers ?? 2,
      maxWorkers: options.maxWorkers ?? 10,
      idleTimeout: options.idleTimeout ?? 30000,
      taskTimeout: options.taskTimeout ?? 60000,
    };

    this.initMinWorkers();
  }

  private initMinWorkers(): void {
    for (let i = 0; i < this.options.minWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker(): Worker {
    const worker = new Worker(this.workerScript);

    worker.on('message', (result) => {
      const task = this.activeTasks.get(worker.threadId);
      if (task) {
        task.resolve(result);
        this.activeTasks.delete(worker.threadId);
        this.returnWorker(worker);
      }
    });

    worker.on('error', (error) => {
      const task = this.activeTasks.get(worker.threadId);
      if (task) {
        task.reject(error);
        this.activeTasks.delete(worker.threadId);
      }
      this.removeWorker(worker);
      this.emit('worker:error', error);
    });

    this.workers.push(worker);
    this.idleWorkers.push(worker);
    this.emit('worker:created', { total: this.workers.length });

    return worker;
  }

  private returnWorker(worker: Worker): void {
    this.idleWorkers.push(worker);
    this.processQueue();

    if (this.idleWorkers.length > this.options.minWorkers && this.taskQueue.length === 0) {
      setTimeout(() => {
        if (this.idleWorkers.includes(worker) && this.taskQueue.length === 0) {
          this.removeWorker(worker);
        }
      }, this.options.idleTimeout);
    }
  }

  private removeWorker(worker: Worker): void {
    const index = this.workers.indexOf(worker);
    if (index !== -1) this.workers.splice(index, 1);

    const idleIndex = this.idleWorkers.indexOf(worker);
    if (idleIndex !== -1) this.idleWorkers.splice(idleIndex, 1);

    worker.terminate();
    this.emit('worker:terminated', { total: this.workers.length });
  }

  private processQueue(): void {
    while (this.taskQueue.length > 0 && this.idleWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.idleWorkers.pop()!;

      this.activeTasks.set(worker.threadId, task);

      const timeout = setTimeout(() => {
        task.reject(new Error(`Task ${task.id} timeout`));
        this.activeTasks.delete(worker.threadId);
        this.removeWorker(worker);
      }, this.options.taskTimeout);

      worker.postMessage(task.data);
      worker.once('message', () => clearTimeout(timeout));
    }
  }

  async execute<T = any>(data: T): Promise<any> {
    return new Promise((resolve, reject) => {
      const task: Task<T> = {
        id: Math.random().toString(36),
        data,
        resolve,
        reject,
        createdAt: Date.now(),
      };

      this.taskQueue.push(task);

      if (this.idleWorkers.length === 0 && this.workers.length < this.options.maxWorkers) {
        this.createWorker();
      }

      this.processQueue();
    });
  }

  getStats() {
    return {
      total: this.workers.length,
      idle: this.idleWorkers.length,
      active: this.activeTasks.size,
      queued: this.taskQueue.length,
    };
  }

  async destroy(): Promise<void> {
    for (const worker of this.workers) {
      await worker.terminate();
    }
    this.workers = [];
    this.idleWorkers = [];
    this.taskQueue = [];
    this.activeTasks.clear();
  }
}
