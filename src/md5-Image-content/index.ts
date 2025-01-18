import fs from 'fs';
import crypto from 'crypto';
import path from "path";

function md5Image(filePath: string) {
    const fileBuffer = fs.readFileSync(path.join(__dirname, filePath));
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    return hash;
}

// Example usage
const filePath = 'image.jpg';
const md5Hash = md5Image(filePath);
console.log(`MD5 Hash: ${md5Hash}`);