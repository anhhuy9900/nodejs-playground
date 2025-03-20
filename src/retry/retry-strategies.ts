class RetryStrategies {
  private baseDelay: number;
  private maxDelay: number;
  private maxRetries: number;
  private jitter: number;

  constructor(options: Record<string, any>) {
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.maxRetries = options.maxRetries || 5;
    this.jitter = options.jitter || true;
  }

  async execute(fn: any) {
    let retries = 0;
    while (true) {
      try {
        return await fn();
      } catch (error: any) {
        console.log('Retrying... error: ', error.message);
        if (retries >= this.maxRetries) {
          throw new Error(`Failed after ${retries} retries: ${error.message}`);
        }

        await this.wait(this.calculateDelay(retries));
        console.log('Retrying... Attempt: ', retries);
        retries++;
      }
    }
  }

  calculateDelay(retryCount: number) {
    let delay = Math.min(this.maxDelay, Math.pow(2, retryCount) * this.baseDelay);

    // Add jitter to prevent thundering herd problem
    if (this.jitter) {
      delay = delay * (0.5 + Math.random());
    }

    return delay;
  }

  wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

let globalVal = 0;
const retryStrategies = new RetryStrategies({
  baseDelay: 1000,
  maxDelay: 30000,
  maxRetries: 5,
  jitter: true,
});
retryStrategies
  .execute(() => {
    if (globalVal < 3) {
      globalVal++;
      throw new Error('Error');
    }
    console.log('The function run success: ', globalVal);
  })
  .then();
