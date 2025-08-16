import { ChildProcess, fork } from 'child_process';

const handleLoopWorker: ChildProcess = fork('./handle-loop.worker.js');
const handleReceiveEventWorker: ChildProcess = fork('./handle-receive-event.worker.js');

// Forward messages from handleLoopWorker to socketWorker
handleLoopWorker.on('message', (msg: any) => {
  handleReceiveEventWorker.send && handleReceiveEventWorker.send(msg);
});

// Handle shutdown gracefully
function shutdown() {
  console.log('Shutting down...');
  handleLoopWorker.kill();
  handleReceiveEventWorker.kill();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
