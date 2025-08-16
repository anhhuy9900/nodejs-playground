import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

let users: { id: number; name: string }[] = [];

app.get('/users', (_req: Request, res: Response) => {
  res.json(users);
});

export default app;
