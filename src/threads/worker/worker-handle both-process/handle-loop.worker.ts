class HandleLoopWorker {
  start() {
    let i = 0;
    const max = 10;
    const interval = setInterval(() => {
      console.log('HandleLoopWorker -> i: %s', i);
      if (i > max) {
        clearInterval(interval);
        process.exit(0);
        return;
      }
      process.send && process.send({ value: i });
      i++;
    }, 50);

    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));
  }
}

new HandleLoopWorker().start();
