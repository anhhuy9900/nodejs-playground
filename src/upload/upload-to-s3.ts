import express, { Request, Response } from "express";
import multer from "multer";
import { S3 } from 'aws-sdk';
import path from "path";
import fs from "fs";
import { generateFileName, generateFileNameWithoutExt } from '../utils';
import { AWS_ENV_REGION, AWS_ENV_ACCESS_KEY_ID, AWS_ENV_SECRET_ACCESS_KEY } from '../constants';

const app = express();

// const storage = multer.memoryStorage()
const storage = multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "tmp/uploads/s3");
    },
    filename(req, file, cb) {
      cb(null, `${generateFileName(file.originalname)}`);
    },
  });
const upload = multer({ storage })

// const upload = multer({})

const uploadToS3 = async ({ Key, Body }: Record<string, any>) => {
    const s3 = new S3({
        apiVersion: '2006-03-01',
        region: AWS_ENV_REGION,
        accessKeyId: AWS_ENV_ACCESS_KEY_ID,
        secretAccessKey: AWS_ENV_SECRET_ACCESS_KEY
    });
    console.log("AWS_ENV_REGION: ", AWS_ENV_REGION);
    console.log("AWS_ENV_ACCESS_KEY_ID: ", AWS_ENV_ACCESS_KEY_ID);
    console.log("AWS_ENV_SECRET_ACCESS_KEY: ", AWS_ENV_SECRET_ACCESS_KEY);
    await s3.putObject({
        Bucket: 'aws-practice-api-bucket',
        Key,
        Body,
    }).promise();
}

app.post("/upload-s3", upload.single('file'), async (req: Request, res: Response) => {
    
    const file: any = req.file;
    const fileKey = generateFileName(file.originalname);
    // const fileBody = file.buffer.data.join(',');
    const fileBody = fs.readFileSync(file.path)
    // console.log("fileBody: ", fileBody);

    await uploadToS3({
        Key: fileKey,
        Body: fileBody,
        ContentType: file.mimetype
    });
    fs.unlinkSync((file.path) as string);
    res.send({ status: 'upload file success', data: file })
});

app.listen(8000, function () {
  console.log("Start Upload file with port 8000");
});
