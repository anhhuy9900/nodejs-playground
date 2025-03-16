import { parentPort } from 'worker_threads';

/**
 * Calculates the Fibonacci number at position n
 * Time Complexity: O(2^n) - Exponential time complexity due to recursive calls
 * Space Complexity: O(n) - Linear space complexity due to call stack depth
 */
function calculateFibonacci(n: number): number {
  if (n <= 1) return n;
  return calculateFibonacci(n - 1) + calculateFibonacci(n - 2);
}

/**
 * Message handler for worker thread
 * Time Complexity: O(1) for message handling
 * Space Complexity: O(1) for storing task data
 * Note: Overall complexity depends on the task type:
 * - fibonacci: O(2^n) time complexity from calculateFibonacci
 */
parentPort?.on('message', (task) => {
  try {
    let result;

    switch (task.type) {
      case 'fibonacci':
        result = calculateFibonacci(task.number);
        break;
      default:
        throw new Error('Unknown task type');
    }

    parentPort?.postMessage({
      result,
      workerId: process.pid,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    parentPort?.postMessage({ error: 'Computation failed' });
  }
});

// Log when worker starts
console.log(`Worker started with ID: ${process.pid}`);
