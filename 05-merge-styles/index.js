const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'styles');

(async () => {
  try {
    const styleArr = [];
    let filesInfo = await fs.promises.readdir(dirPath);
    filesInfo = filesInfo.filter((file) => path.parse(file).ext === '.css');

    //Read files, in folder "styles"
    for (let i = 0; i < filesInfo.length; i++) {
      const filePath = `${dirPath}/${filesInfo[i]}`;

      const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

      await new Promise((resolve, reject) => {
        readStream.on('data', (text) => {
          styleArr.push(text);
        });
        readStream.on('end', () => resolve());
        readStream.on('error', (err) => reject(err));
      });
    }

    const bundlePath = path.join(__dirname, 'project-dist/bundle.css');
    const writeStream = fs.createWriteStream(bundlePath, {
      flags: 'w',
      encoding: 'utf8',
    });

    //Create and write file "bundle.css"
    await new Promise((resolve, reject) => {
      writeStream.write(styleArr.join(''), 'utf8', (writeError) => {
        if (writeError) {
          reject(writeError);
        } else {
          writeStream.end();
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('Error:', err);
  }
})();
