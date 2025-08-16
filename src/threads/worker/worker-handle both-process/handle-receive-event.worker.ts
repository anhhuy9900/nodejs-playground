import cluster from 'node:cluster';
import * as os from 'node:os';

const numCPUs = Math.max(1, os.cpus().length);

class HandleReceiveEventWorker {
  start() {
    if (cluster.isPrimary) {
      // Fork workers
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      // Forward messages from parent to all workers
      process.on('message', (msg: any) => {
        console.log('HandleReceiveEventWorker -> msg: %j', msg);
        for (const id in cluster.workers) {
          const worker = cluster.workers[id];
          if (worker && worker.isConnected()) {
            worker.send(msg);
          }
        }
      });
      // Graceful shutdown
      process.on('SIGINT', this.shutdownMaster.bind(this));
      process.on('SIGTERM', this.shutdownMaster.bind(this));
    }
  }

  private shutdownMaster() {
    console.log(
      'HandleReceiveEventWorker -> shutdownMaster -> cluster.workers: %j',
      cluster.workers
    );
    for (const id in cluster.workers) {
      const worker = cluster.workers[id];
      if (worker && worker.isConnected()) {
        worker.kill();
      }
    }
    process.exit(0);
  }
}

new HandleReceiveEventWorker().start();
