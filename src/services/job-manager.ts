import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import logger from './logger';
import configs from '@/configs';

export interface ICSVRow {}

export type JobStatus = 'normal' | 'exception' | 'active' | 'success';

export interface JobEntry {
  status: JobStatus;
  progress: number;
  result?: string;
  error?: any;
}

class JobManager {
  private readonly CSV_STORAGE_PATH = configs.FILES_STORAGE_PATH;
  jobs = new Map<string, JobEntry>();

  addJob(jobFn: () => Promise<any>, rootJobId?: string): string {
    const jobId = rootJobId || uuid();

    this.jobs.set(jobId, { status: 'normal', progress: 0 });

    jobFn()
      .then((result) => {
        const job = this.jobs.get(jobId);
        if (job) {
          job.status = 'success';
          job.progress = 100;
          job.result = result;
        }
      })
      .catch((error) => {
        logger.logError('JobManager ~ addJob ~ error', error);
        const job = this.jobs.get(jobId);
        if (job) {
          job.status = 'exception';
          job.progress = 100;
          job.error = error;
        }
      })
      .finally(() => {
        this.cleanJob(jobId); // 5 phút
      });

    return jobId;
  }

  async scanExistsJob(path: string) {
    const dirPath = `${this.CSV_STORAGE_PATH}/${path}`;

    if (!fs.existsSync(dirPath)) {
      return;
    }

    const files = await fs.promises.readdir(dirPath);
    files.forEach((fileName) => {
      const jobId = fileName.split('jira_worklog_')[1];
      if (jobId) {
        const fullPath = join(dirPath, fileName);

        setTimeout(() => {
          this.cleanFile(fullPath);
        }, 30_000);
      }
    });
  }

  cleanJob(jobId: string, delayMs = 300_000) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    setTimeout(() => {
      if (job.status == 'success' && job.result) {
        this.cleanFile(job.result);
      }
      this.jobs.delete(jobId);
    }, delayMs); // 5 minutes cached
  }

  cleanFile(path: string) {
    if (fs.existsSync(path)) {
      fs.unlink(path, (err) => {
        if (err) logger.logError(`❌ Failed to delete file ${path}:`, err);
        logger.logInfo(`cleaned file ${path}`);
      });
    }
  }

  setProgress(jobId: string, progress: number): boolean {
    const job = this.jobs.get(jobId);
    if (!job || !['normal', 'active'].includes(job?.status)) return false;

    job.status = 'active';
    job.progress = Math.max(0, Math.min(progress, 100));
    return true;
  }

  getProgress(jobId: string): number | null {
    const job = this.jobs.get(jobId);
    return job ? job.progress : null;
  }

  checkJobStatus(jobId: string): JobStatus | 'not_found' {
    const job = this.jobs.get(jobId);
    return job ? job.status : 'not_found';
  }

  getJob(jobId: string): JobEntry | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return job;
  }

  getJobError(jobId: string): any {
    const job = this.jobs.get(jobId);
    if (!job) return null;
    return job.status == 'exception' ? job.error : null;
  }

  deleteJob(jobId: string): boolean {
    return this.jobs.delete(jobId);
  }
}

const csvJobManager = new JobManager();
export { csvJobManager };
