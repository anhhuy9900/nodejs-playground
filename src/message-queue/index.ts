import express from 'express';
import { emailQueue, videoQueue } from './queue.config';
import { processEmail } from './processors/email.processor';
import { processVideo } from './processors/video.processor';

const app = express();
app.use(express.json());

emailQueue.process(3, processEmail);
videoQueue.process(2, processVideo);

emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id}:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job?.id}:`, err.message);
});

videoQueue.on('progress', (job, progress) => {
  console.log(`📊 Video ${job.id}: ${progress}%`);
});

app.post('/email/send', async (req, res) => {
  const job = await emailQueue.add(req.body, { priority: req.body.priority || 1 });
  res.json({ jobId: job.id });
});

app.post('/video/process', async (req, res) => {
  const job = await videoQueue.add(req.body, { delay: 5000 });
  res.json({ jobId: job.id });
});

app.get('/job/:queue/:id', async (req: any, res: any) => {
  const queue = req.params.queue === 'email' ? emailQueue : videoQueue;
  const job = await queue.getJob(req.params.id);

  if (!job) return res.status(404).json({ error: 'Job not found' });

  const state = await job.getState();
  const progress = job.progress();
  const logs = await queue.getJobLogs(req.params.id);

  res.json({ state, progress, logs });
});

app.get('/stats/:queue', async (req, res) => {
  const queue = req.params.queue === 'email' ? emailQueue : videoQueue;

  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);

  res.json({ waiting, active, completed, failed });
});

app.listen(3001, () => console.log('🚀 Queue server on http://localhost:3001'));
