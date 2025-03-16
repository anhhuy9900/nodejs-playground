import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const streamPipe = async () => {
  const write = fs.createWriteStream(
    path.resolve(__dirname, '../../data/example-write-file-pipe.csv.gz')
  );
  const stream = fs.createReadStream(
    path.resolve(__dirname, '../../data/Sample-Spreadsheet-1000-rows.csv')
  );
  stream.pipe(zlib.createGzip());
  stream.pipe(write);

  stream.on('error', (error) => {
    console.error('Stream Read Data ERROR: ', error);
  });
  write.on('error', (error) => {
    console.error('Write Data ERROR: ', error);
  });
};

(async () => {
  streamPipe();
})();
