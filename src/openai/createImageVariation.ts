import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import sharp from 'sharp';

const openai = new OpenAI({
  apiKey: 'apiKey',
});

async function createImageVariation(): Promise<void> {
  console.log('Creating image variation...', __dirname);
  try {
    const inputPath = path.join(__dirname, 'chandung-4.png');
    const outputPath = path.join(__dirname, 'converted_image.png');

    // Convert the image to RGBA format
    await sharp(inputPath).ensureAlpha().toFile(outputPath);

    const inputPathMark = path.join(__dirname, 'mask-2.png');
    const outputPathMark = path.join(__dirname, 'mask-2-change.png');
    await sharp(inputPathMark).ensureAlpha().toFile(outputPathMark);

    const response = await openai.images.edit({
      image: fs.createReadStream(outputPath),
      // mask: fs.createReadStream(outputPathMark),
      // prompt: "girl on the beach with red hair but the angle of her face is not changed",
      // prompt: "Change background with beautiful landscape and hair's style and color for a person inside picture but the angle of her face is not changed",
      prompt: 'Change background for a picture',
      n: 1,
    });

    // const response = await openai.images.createVariation({
    //     image: fs.createReadStream(outputPath),
    //     n: 5
    // });

    console.log(response.data);
  } catch (error) {
    console.error('Error creating image variation:', error);
  }
}

createImageVariation();
