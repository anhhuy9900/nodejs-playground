console.log('=========== Console Log=============')

console.info('=========== Console Info=============')

console.error('=========== Console Error=============')

console.error('=========== Console Error=============')

console.table([{ a: 1, b: 'Y' }, { a: 'Z', b: 2 }]);

// console.trace('=========== Show me ===========');

function processDelay() {
    for(let i = 0; i < 1000000; i++) {
        
    }
}
console.time('process');
// console.timeLog('process', 1)
processDelay();
console.timeEnd('process')