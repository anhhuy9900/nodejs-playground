import { runProcess } from './core';
import { handleProcess } from './handle';
import { handleProcessSecond } from './handle-second';

(() => {
  const eventName = 'call-process';

  handleProcess(eventName);
  handleProcessSecond(eventName);

  // Promise.all([handleProcess(eventName), handleProcess2(eventName)])

  runProcess(eventName);
})();
