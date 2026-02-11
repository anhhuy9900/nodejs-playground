import Queue from 'bull';

export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const emailQueue = new Queue('email-notifications', {
  redis: redisConfig,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export const videoQueue = new Queue('video-processing', {
  redis: redisConfig,
  limiter: { max: 5, duration: 1000 },
});
