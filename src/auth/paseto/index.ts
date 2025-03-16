import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { V2 } from 'paseto';
import { localKey, privateKey } from './paseto.type';
import { authenticateToken } from './auth.util';

const app = express();
app.use(bodyParser.json());

app.post('/login-local', async (_req: Request, res: Response) => {
  // In a real application, verify user credentials from req.body
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'user123',
    name: 'Alice',
    admin: true,
    iat: now,
    exp: now + 3600, // Token valid for 1 hour
  };

  try {
    // Optionally include a footer for additional metadata (not encrypted)
    const footer = 'local token footer';
    const token = await V2.sign(payload, localKey, { footer });
    res.json({ token });
  } catch (err) {
    console.error('Error generating local token:', err);
    res.status(500).json({ message: 'Error generating token' });
  }
});

// ----------------------------------------------------------------
// Endpoint to generate a public token (asymmetric signing)
app.post('/login-public', async (_req: Request, res: Response) => {
  // In a real application, verify user credentials from req.body
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: 'user456',
    name: 'Bob',
    admin: false,
    iat: now,
    exp: now + 3600, // Token valid for 1 hour
  };

  try {
    const footer = 'public token footer';
    const token = await V2.sign(payload, privateKey, { footer });
    res.json({ token });
  } catch (err) {
    console.error('Error generating public token:', err);
    res.status(500).json({ message: 'Error generating token' });
  }
});

app.get('/protected', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: 'Protected content accessed', user });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
