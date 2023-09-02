import fs, { } from 'fs';
import path from 'path';
import { createFolder } from '../utils';

const writeFile = async () => {
    await createFolder(path.resolve(__dirname, '../../tmp'));
    const wr = fs.createWriteStream(path.resolve(__dirname, '../../tmp/example-write-file.txt'));
    for (let i = 0; i < 100; i++) {
        wr.write(`Number ${i}: It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout \r`);
    }
    wr.on('finish', () => {
        console.log('================= All writes are now complete =================');
    });
    wr.end('================= END Write =================');
}

(async () => {
    writeFile();
})();