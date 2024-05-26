import events from 'events';

const processEvents = (length = 2) => {
    const e = new events.EventEmitter();
    setTimeout(() => {
        for (let i = 0; i <= length; i++) {
            e.emit('FirstEvent', i);

            console.log('Process task: ', i);

            e.emit('SecondEvent', i);
        }
    }, 1000)

    return e;
}

const process = processEvents(3);

process.on('FirstEvent', function (data) {
    console.log('FirstEvent the process for ' + data);
});

process.on('SecondEvent', function (data) {
    console.log('SecondEvent the process for ' + data);
});