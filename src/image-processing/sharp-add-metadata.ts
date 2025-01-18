import fs from 'fs';
import sharp from 'sharp';
import path from 'path';

const inputFilePath = 'images/upload-with-bg.jpg';
const outputFilePath = path.join(__dirname, 'images/b8976382-fba7-4fae-93c4-ce90d9b0f33b-new-metadata.jpg');
const iccProfilePath = path.join(__dirname, 'sRGB_v4_ICC_preference.icc');

const iccProfileBuffer = fs.readFileSync(iccProfilePath);
const iccProfileBase64 = iccProfileBuffer.toString('base64');


sharp(inputFilePath)
    .withMetadata({
        exif: {
            IFD0: {
                'XResolution': '1/1',
                'YResolution': '1/1',
                'ResolutionUnit': '2',
                'Orientation': '1',
                'JFIFVersion': '1.1',
                'JFIFThumbnailWidth': '0',
                'JFIFThumbnailHeight': '0'
            }
        },
        icc: iccProfileBase64
    })
    .toFile(outputFilePath)
    .then(() => {
        console.log('Image with ICC profile and metadata successfully saved!');
    })
    .catch((err) => {
        console.error('Error processing image:', err);
    });
