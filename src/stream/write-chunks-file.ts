import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { createFolder } from '../utils';

const writeableChunksFile = async () => {
    
    const chunks: Record<string, any>[] = [];
    const stream = fs.createReadStream(path.resolve(__dirname, '../../data/Sample-Spreadsheet-1000-rows.csv'));
    let num = 0;

    const tmpPath = path.resolve(__dirname, `../../tmp`);
    await createFolder(tmpPath);
    const folderPath = path.resolve(`${tmpPath}/write-data`);
    await createFolder(folderPath);

    stream.on('readable', () => {
        let chunk: any = null;
        while (null !== (chunk = stream.read())) {
            num++;
            console.log(`Read ${chunk.length} bytes of data`);
            chunks.push(chunk);
            const wr = fs.createWriteStream(`${folderPath}/file-${num}.csv`);
            wr.write(chunk);
            wr.on('finish', () => {
                console.log('================= Write data is now complete =================');
            });
        }
    });
    
    stream.on('error', (error) => {
        console.error(`ERROR Stream file => `, error);
    })
    

    stream.on('finish', () => {
        console.log("🚀 -------------------------------------------------------------🚀");
        console.log(`Compression folder process done: ${folderPath}`)
    })

    stream.on('end', async () => {
        
        zipFolder(num, folderPath)

        //Remove folder after zip the folder succeed
        fs.rmdirSync(folderPath, { recursive: true });
        console.log('=================== FINISH Write chunks file and zip folder ===================');
    });
}

const zipFolder = (num: number, folderPath: string) => {
    const zipFile = archiver('zip', { zlib: { level: 9 }});
    zipFile.pipe(fs.createWriteStream(`${folderPath}.zip`))
    for (let n = 1; n <= num; n++) {
            // Append test file
        zipFile.append(fs.createReadStream(`${folderPath}/file-${n}.csv`), { name: `file-${n}.csv` })
    }
    
    zipFile.finalize();
    console.log('=================== zip folder done ===================');
}



(async () => {
    writeableChunksFile();
})();