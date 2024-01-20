const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

readStream.on('data', (text) => {
  console.log('TEXT:', text);
});

readStream.on('error', (error) => {
  console.error('ERROR:', error);
});
