import fs from 'fs';
import { IExif, IExifElement, TagValues, load, dump, insert } from 'piexif-ts';
import path from 'path';

const filePath = 'portrait-6.jpg';
const jpegData = fs.readFileSync(filePath).toString('binary');

const zeroth: IExifElement = {};

zeroth[TagValues.ImageIFD.Make] = 'Canon';
zeroth[TagValues.ImageIFD.Model] = 'Canon EOS 5D';
zeroth[TagValues.ImageIFD.XResolution] = [300, 1];
zeroth[TagValues.ImageIFD.YResolution] = [300, 1];
zeroth[TagValues.ImageIFD.Orientation] = 1;

const exifObj: IExif = {"0th":zeroth};
const exifBytes = dump(exifObj);

// Insert the EXIF metadata back into the image
const newJpegData = insert(exifBytes, jpegData);

// Convert binary data back to Buffer and save to a new file
const outputFilePath = path.join(__dirname, 'portrait-6-with-new-metadata.jpg');
fs.writeFileSync(outputFilePath, Buffer.from(newJpegData, 'binary'));

console.log('Metadata successfully added to the image!');
