import sharp from 'sharp';

sharp('./portrait-3.jpg')
    .metadata()
    .then((metadata) => {
        console.log(metadata);
    })
    .catch((err) => {
        console.error('Error extracting metadata', err);
    });
