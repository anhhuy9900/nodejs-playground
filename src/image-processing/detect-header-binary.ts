import * as fs from 'fs';

const signatures: { [key: string]: number[] } = {
    png: [0x89, 0x50, 0x4E, 0x47],
    jpg: [0xFF, 0xD8, 0xFF],
};

const detectFileType = (filePath: string): string => {
    const buffer = Buffer.alloc(4);

    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);

    for (const sign of Object.entries(signatures)) {
        const [fileType, signature] = sign;
        console.log(`File sign ----> : ${sign}`);
        const match = signature.every((byte, index) => buffer[index] === byte);
        if (match) {
            return fileType;
        }
    }

    return 'unknown';
};

// Example usage
const fileType = detectFileType('./portrait-3.jpg');
console.log(`File type: ${fileType}`);