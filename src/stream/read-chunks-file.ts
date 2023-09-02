import fs from 'fs';
import path from 'path';

const readableChunksFile = async () => {
    const chunks: Record<string, any>[] = [];
    const stream = fs.createReadStream(path.resolve(__dirname, '../../data/Sample-Spreadsheet-1000-rows.csv'));
    stream.on('readable', () => {
        let chunk: any = null;
        while(null !== (chunk = stream.read()) ) {
            console.log(`Read ${chunk.length} bytes of data`);
            chunks.push(chunk);
        }
    })
    
    stream.on('error', (error) => {
        console.error(`ERROR Stream file => `, error);
    })

    stream.on('end', () => {
        console.log('=================== Stream file END ===================');
        console.log('Buffer - chunks => ', chunks);
        //! Output -> chunks will an array buffer like that
        // Buffer - chunks =>  [
        //     <Buffer 31 2c 22 45 6c 64 6f 6e 20 42 61 73 65 20 66 6f 72 20 73 74 61 63 6b 61 62 6c 65 20 73 74 6f 72 61 67 65 20 73 68 65 6c 66 2c 20 70 6c 61 74 69 6e 75 ... 65486 more bytes>,
        //     <Buffer 68 65 72 20 53 63 68 69 6c 64 2c 31 31 39 36 38 2c 32 36 2e 30 39 2c 33 2e 33 38 2c 30 2e 38 35 2c 50 72 69 6e 63 65 20 45 64 77 61 72 64 20 49 73 6c ... 55720 more bytes>
        // ]
        //console.log('File content => ', chunks.join(','));
    })
}

(async () => {
    readableChunksFile();
})();