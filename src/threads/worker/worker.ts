import { parentPort } from 'worker_threads';

function delay(duration: number) {
  const startTime = Date.now();
  while (Date.now() - startTime < duration) {
    //event loop is blocked...
  }
}

let counter = 0;
// for (let i = 0; i < 900000000; i++) {
//   counter++;
// }
delay(10000);

parentPort?.postMessage(`${counter} iterations completed!`);
