import events from 'events';

export const eventEmitter = new events.EventEmitter();

export const time = () => {
    const currentDate = new Date();
    return `${currentDate.getHours()}:${currentDate.getMinutes()}:${currentDate.getSeconds()}`;
  };


export const runProcess = (eventName: string) => {
    console.log("🚀 ---------------------------------------------------------🚀");
    console.log("🚀 ~ file: core.ts:7 ~ runProcess ~ eventName:", eventName);
    console.log("🚀 ---------------------------------------------------------🚀");
    eventEmitter.emit(eventName);
}