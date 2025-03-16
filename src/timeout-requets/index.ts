import express, { NextFunction, Request, Response } from 'express';

const app = express();

// Middleware to set request timeout
const requestTimeout = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        console.log('Request timeout -> url: %s', req.url);
        res.status(408).send('Request Timeout');
      }
    }, duration);

    // Clear the timer if the response is sent before the timeout
    const clearTimer = () => clearTimeout(timer);

    res.on('finish', clearTimer);
    res.on('close', clearTimer);

    next();
  };
};

// app.use(requestTimeout);

app.get('/quick', requestTimeout(2000), (req: Request, res: Response) => {
  setTimeout(() => {
    res.send('Quick response!');
  }, 1000);
});

app.get('/slow', requestTimeout(5000), (req: Request, res: Response) => {
  setTimeout(() => {
    if (!res.headersSent) {
      res.send('Slow response!');
    }
  }, 8000);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
