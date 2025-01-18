import crypto from "crypto";

const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const cipherCrypto = crypto.createCipheriv(algorithm, key, iv);

let encrypted = cipherCrypto.update('Hello World', 'utf8', 'hex');
encrypted += cipherCrypto.final('hex');

const decipherCrypto = crypto.createDecipheriv(algorithm, key, iv);

let decrypted = decipherCrypto.update(encrypted, 'hex', 'utf8');
decrypted += decipherCrypto.final('utf8');

console.log('\n\n--------------------------------');
console.log('LOG -> encrypted: ', encrypted);
console.log('LOG -> decrypted: ', decrypted);