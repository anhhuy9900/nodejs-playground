import { NextFunction, Request, Response } from 'express';
import { V2 } from 'paseto';
import { CustomPayload, localKey } from './paseto.type';

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // Expecting the token in the Authorization header in the format "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    // For this middleware, we assume the token is a local (encrypted) token.
    // If you use implicit assertions or include a footer, add options accordingly.
    const payload: CustomPayload = await V2.verify(token, localKey, {
      // For example, you might use an implicit assertion:
      // implicitAssert: Buffer.from('expected-assertion')
    });

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return res.status(401).json({ message: 'Token expired' });
    }

    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(401).json({ message: 'Invalid token' });
  }
}
