import express, { Request, Response } from 'express';
import { AsyncLocalStorage } from 'async_hooks';

const app = express();
const asyncLocal = new AsyncLocalStorage<{ userId: string }>();

app.use((req: Request, _res: Response, next) => {
  const userId = req.user?.id ?? 'anonymous';
  asyncLocal.run({ userId }, next);
});

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload; // optional if not guaranteed to exist
    }
  }
}
