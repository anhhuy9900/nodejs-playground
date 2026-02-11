import cron, { ScheduledTask } from 'node-cron';
import { CronExpressionParser } from 'cron-parser';
import logger from '../logger/logger';

type Handler = () => void | Promise<void>;

const GLOBAL_KEY = Symbol.for('app.basic_cron_singleton');

type JobMeta = {
  pattern: string;
  timezone: string;
  active: boolean;
};

class Cron {
  private jobs = new Map<string, ScheduledTask>();
  private meta = new Map<string, JobMeta>();

  private constructor() {
    const shutdown = () => {
      this.stopAll();
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  }

  public static getInstance(): Cron {
    const g = globalThis as any;
    if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Cron();
    return g[GLOBAL_KEY] as Cron;
  }

  public schedule(id: string, pattern: string, handler: Handler, overwrite = false, timezone = 'Asia/Singapore'): void {
    if (this.jobs.has(id)) {
      if (!overwrite) return;
      this.stop(id);
      logger.logWarn(`[Cron] - Overwriting existing job "${id}"`);
    }

    const task = cron.schedule(pattern, async () => {
      try {
        await handler();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.logError(`[Cron] Job "${id}" error:`, message);
      }
    });

    this.jobs.set(id, task);
    this.meta.set(id, { pattern, timezone, active: true });
  }

  public stop(id: string): void {
    const task = this.jobs.get(id);
    if (!task) return;

    try {
      task.stop();
    } finally {
      this.jobs.delete(id);
      const m = this.meta.get(id);
      if (m) this.meta.set(id, { ...m, active: false });
      else this.meta.delete(id);
    }
  }

  public stopAll(): void {
    for (const id of this.jobs.keys()) this.stop(id);
  }

  getJobInfo(jobId: string): {
    jobId: string;
    isScheduled: boolean;
    nextRunTime: string | null;
    cronPattern: string | null;
    jobTime: number | null;
    error?: string | null;
  } {
    const task = this.jobs.get(jobId);
    const m = this.meta.get(jobId);

    if (!task || !m) {
      return {
        jobId,
        isScheduled: false,
        nextRunTime: null,
        cronPattern: null,
        jobTime: null,
        error: null,
      };
    }

    const cronPattern = m.pattern;
    const timezone = m.timezone;

    let nextRunTime: string | null = null;
    let jobTime: number | null = null;
    let error: string | null = null;

    try {
      const interval = CronExpressionParser.parse(cronPattern, { tz: 'Asia/Singapore' });
      const nextDate = interval.next().toDate();
      nextRunTime = nextDate.toISOString();
      jobTime = nextDate.getTime();
    } catch (err: any) {
      error = err?.message ?? 'Unknown parse error';
      logger.logError(`[Cron] Error parsing cron for job ${jobId}:`, error);
    }

    return {
      jobId,
      isScheduled: m.active,
      nextRunTime,
      cronPattern,
      jobTime,
      error,
    };
  }

  getAllJobsInfo(): Array<ReturnType<typeof this.getJobInfo>> {
    return Array.from(this.jobs.keys()).map((id) => this.getJobInfo(id));
  }
}

const cronService = Cron.getInstance();
export { Cron, cronService };
