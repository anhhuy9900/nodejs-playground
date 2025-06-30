import { eventEmitter } from './core';

function run() {
  for (let i = 0; i <= 10000000000; i++) {}

  console.log('--------- FINISH run function ---------');
}

const startProcess = () => {
  console.log('--------- startProcess ----------- ');

  new Promise((resolve) => {
    setTimeout(() => {
      resolve(run());
    }, 0);
  });

  console.log('--------- FINISH: startProcess ----------- ');
};

// const afterProcess = () => {
//   console.log('--------- afterProcess ----------- ');
// };

export const handleProcess = (eventName: string) => {
  eventEmitter.on(eventName, startProcess);
  // eventEmitter.on(eventName, afterProcess)
};
