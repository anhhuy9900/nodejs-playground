import { Job } from 'bull';

interface EmailJob {
  to: string;
  subject: string;
  body: string;
}

export async function processEmail(job: Job<EmailJob>) {
  const { to, subject } = job.data;

  job.log(`📧 Sending to ${to}`);
  await job.progress(20);

  await new Promise((resolve) => setTimeout(resolve, 2000));
  await job.progress(80);

  console.log(`✅ Email sent: ${subject} -> ${to}`);
  await job.progress(100);

  return { sent: true, timestamp: new Date() };
}
