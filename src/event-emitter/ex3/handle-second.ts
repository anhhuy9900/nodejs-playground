import { eventEmitter } from './core';

const startProcess = () => {
    console.log('--------- startProcess Second ----------- ') 
}

const afterProcess = () => {
    console.log('--------- afterProcess Second ----------- ') 
}

export const handleProcessSecond = (eventName: string) => {
    eventEmitter.on(eventName, startProcess)
    // eventEmitter.on(eventName, afterProcess)
}