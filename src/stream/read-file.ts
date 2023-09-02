import fs, { } from 'fs';
import path from 'path';

const readableFIle = async () => {
    const stream = fs.createReadStream(path.resolve(__dirname, '../../data/example.txt'));
    stream.on('readable', () => {
        console.log(`Read => : ${stream.read()}`);

        while(stream.read() !== null ) {
            console.log(`Content Have Data => : ${stream.read()}`);
        }
    })
    
    stream.on('error', (error) => {
        console.error(`ERROR Stream file => `, error);
    })

    stream.on('end', () => {
        console.log('=================== Stream file END ===================');
    })
}

(async () => {
    readableFIle();
})();