import { parentPort } from 'worker_threads';

parentPort?.on('message', (data: { numbers: number[] }) => {
  const result = data.numbers.reduce((acc, num) => {
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(num * i);
    }
    return acc + sum;
  }, 0);

  parentPort?.postMessage({ result, threadId: process.pid });
});
