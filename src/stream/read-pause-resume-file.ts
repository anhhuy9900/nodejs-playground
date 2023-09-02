import fs from 'fs';
import path from 'path';

const readablePauseAndResumeFile = async () => {
    const stream = fs.createReadStream(path.resolve(__dirname, '../../data/example.txt'));

    stream.on('readable', () => {
        console.log(`onReadable ->  ${stream.read()?.length || 0} bytes of data`);
    })

    stream.on('data', (chunk) => {
        console.log(`onData -> Read ${chunk.length} bytes of data`);
    })

    stream.pause();
    console.log('There will be no additional data for 10 second.');

    if (stream.isPaused()) {
        setTimeout(() => {
            stream.resume();
        }, 10000)
    }
    
    stream.on('error', (error) => {
        console.error(`ERROR Stream file => `, error);
    })

    stream.on('end', () => {
        console.log('=================== Stream file END ===================');
    })
}

(async () => {
    readablePauseAndResumeFile();
})();