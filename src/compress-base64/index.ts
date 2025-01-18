import { promisify } from 'util';
import { gzip, gunzip } from 'zlib';
import fs from "fs";

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * Compresses Base64 string for storage
 * @param base64Data - The Base64 string to compress
 * @returns A Base64 string of the compressed data
 */
export async function compressBase64(base64Data: string): Promise<string> {
    const binaryData = Buffer.from(base64Data, 'base64'); // Decode Base64 to binary
    const compressed = await gzipAsync(binaryData); // Compress the binary data
    return compressed.toString('base64'); // Encode compressed data back to Base64
}

/**
 * Decompresses Base64 string for retrieval
 * @param compressedBase64 - The compressed Base64 string
 * @returns The original Base64 string
 */
export async function decompressBase64(compressedBase64: string): Promise<string> {
    const compressedData = Buffer.from(compressedBase64, 'base64'); // Decode Base64 to binary
    const decompressed = await gunzipAsync(compressedData); // Decompress the binary data
    return decompressed.toString('base64'); // Encode decompressed data back to Base64
}

(async () => {
    const fileData = fs.readFileSync('./file.txt');
    const base64Data = fileData.toString('base64');
    const compressedBase64 = await compressBase64(base64Data); // Compress Base64 string
    console.log('Compressed Base64:', compressedBase64);
})()