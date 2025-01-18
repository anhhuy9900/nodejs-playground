import { sign } from 'jsonwebtoken';

const createToken = (payload: any, secret: string) => {
    const token = sign(payload, secret, { expiresIn: '24h' });
    return token;
};

// Example usage
const payload = { userId: 123, username: 'johndoe' };
const secret = 'jwt-secret';
const token = createToken(payload, secret);

console.log('JWT Token:', token);