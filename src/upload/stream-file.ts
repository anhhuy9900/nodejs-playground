import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const app = express();

app.post("/upload-stream", async (req: Request, res: Response) => {
    console.log("req.headers: ", req.headers);

    const fileType = req.headers['content-type']?.split('/')?.[1];
    const filePath = path.join(__dirname, `../../tmp/uploads/stream-file-${Math.random()}.${fileType}`);
    const data = await uploadFile(req, filePath).catch(err => res.send({ status: 'error', err }));
    res.send({ status: 'upload file success', data })
});

const uploadFile = (req: Record<string, any>, filePath: string) => {
  return new Promise((resolve, reject) => {
    const stream: any = fs.createWriteStream(filePath);
    
    // With the open - event, data will start being written
    // from the request to the stream's destination path
    stream.on("open", () => {
      console.log("Stream open ...  0.00%");
      req.pipe(stream);
    });

    // Whenever a data chunk is being processed, it's 'drained' to/from somewhere. 
    // You can use this event to e.g. monitor how many bytes have been streamed.
    stream.on("drain", () => {
      const written = parseInt(stream.bytesWritten);
      console.log(`Written content ${written}`);

      // Calculate the length of file
      const total = parseInt(req.headers["content-length"]);

      //Calculate how many percent in upload processing
      const writtenPercent = ((written / total) * 100).toFixed(2);

      console.log(`Processing  ...  ${writtenPercent}% done`);
    });

    // After all, data has been sent, the stream closes
    stream.on("close", () => {
      console.log("Processing  ...  100%");
      resolve(filePath);
    });

    // If something goes wrong, reject the promise
    stream.on("error", (err: Error) => {
      console.error(err);
      reject(err);
    });
  });
};

app.listen(8000, function () {
  console.log("Start Stream Upload file with port 8000");
});
