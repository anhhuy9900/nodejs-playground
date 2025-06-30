import { EventEmitter } from 'events';

class HandleEmitter extends EventEmitter {
  constructor() {
    super();
  }

  doAction(data: string) {
    console.log('Method called with data:', data);
    this.emit('doAction', data);
  }
}

const handleEmitter = new HandleEmitter();

handleEmitter.on('doAction', (data: string) => {
  console.log('Event received with data:', data);
});

(() => {
  for (let i = 1; i <= 10; i++) {
    console.log('Process loop i: ', i);
    if (i === 10) {
      handleEmitter.doAction('Hello, world!');
    }
  }
})();
