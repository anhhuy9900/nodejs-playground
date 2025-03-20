import express, { Request, Response } from 'express';
import multer from 'multer';

const app = express();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'tmp/uploads');
  },
  filename(req, file, cb) {
    cb(null, `file-${Math.random()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  console.log('req.headers: ', req.headers);
  res.send({ status: 'upload file success', data: req['file'] });
});

app.listen(8000, function () {
  console.log('Start Upload file with port 8000');
});
