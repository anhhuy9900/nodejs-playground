import events from 'events';

const eventEmitter = new events.EventEmitter();

const doAction1 = () => {
  console.log('========== doAction1 ===========');
  setTimeout(() => {
    let total = 0;
    for (let i = 1; i <= 10000; i++) {
      total++;
    }
    console.log('========== doAction1 - total ===========> ', total);
  }, 10000);
};

const doAction2 = () => {
  console.log('========== doAction2 ===========');
};

// Add Event Listeners
eventEmitter.addListener('doAction1', doAction1);
eventEmitter.addListener('doAction2', doAction2);

const runProcess = () => {
  eventEmitter.emit('doAction1');
  eventEmitter.emit('doAction2');
};

runProcess();
