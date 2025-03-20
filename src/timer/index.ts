import { scheduler, setTimeout } from 'timers/promises';

const runSchedulerWaitingProcess = async () => {
  console.log('============= START - runSchedulerWaitingProcess ===========');
  console.time('process');
  await scheduler.wait(10000);
  console.timeEnd('process');
  console.log('============= END - runSchedulerWaitingProcess ===========');
};
// runSchedulerWaitingProcess();

const runSetTimeout = async () => {
  console.log('============= START - runSetTimeout ===========');
  console.time('process');
  const res = await setTimeout(10000, true);
  console.timeEnd('process');
  console.log('runSetTimeout -> res: ', res);
  console.log('============= END - runSetTimeout ===========');
};
runSetTimeout();
