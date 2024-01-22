const fs = require('fs');
const path = require('path');

async function readFiles(readPath, readType) {
  let filesInfo = await fs.promises.readdir(readPath);
  filesInfo = filesInfo.filter(
    (file) => path.parse(file).ext === `.${readType}`,
  );

  const dataArr = [];

  for (let i = 0; i < filesInfo.length; i++) {
    const filePath = `${readPath}/${filesInfo[i]}`;

    const readStream = fs.createReadStream(filePath, { encoding: 'utf8' });

    await new Promise((resolve, reject) => {
      readStream.on('data', (inside) => {
        dataArr.push({ name: path.parse(filesInfo[i]).name, data: inside });
      });
      readStream.on('end', () => resolve());
      readStream.on('error', (err) => reject(err));
    });
  }
  return dataArr;
}

async function writeFile(dist, fileName, data, flag) {
  const filePath = path.join(dist, fileName);
  const writeStream = fs.createWriteStream(filePath, {
    flags: flag,
    encoding: 'utf8',
  });

  await new Promise((resolve, reject) => {
    writeStream.write(data, 'utf8', (writeError) => {
      if (writeError) {
        reject(writeError);
      } else {
        writeStream.end();
        resolve();
      }
    });
  });
}

async function copyDir(originalPath, copyPath) {
  await fs.promises.mkdir(copyPath, { recursive: true });

  const filesArr = await fs.promises.readdir(originalPath, {
    withFileTypes: true,
  });

  await new Promise((resolve, reject) => {
    try {
      filesArr.map(async (file) => {
        const originalFilePath = path.join(originalPath, file.name);
        const copyFilePath = path.join(copyPath, file.name);

        if (file.isDirectory()) {
          await copyDir(originalFilePath, copyFilePath);
        } else {
          await fs.promises.copyFile(originalFilePath, copyFilePath);
        }
      });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

(async () => {
  try {
    const templatePath = path.join(__dirname, 'template.html');
    const componentsPath = path.join(__dirname, 'components');
    const stylesPath = path.join(__dirname, 'styles');

    //Read "template.html"
    const templateRead = fs.createReadStream(templatePath, {
      encoding: 'utf8',
    });
    let template;
    await new Promise((resolve, reject) => {
      templateRead.on('data', (inside) => {
        template = inside;
      });
      templateRead.on('end', () => resolve());
      templateRead.on('error', (err) => reject(err));
    });

    //Create layout from components
    const componentsInfo = await readFiles(componentsPath, 'html');

    for (const component of componentsInfo) {
      const regex = new RegExp(`{{${component.name}}}`, 'g');
      template = template.replace(regex, component.data);
    }

    //Create folder "project-dist"
    const projectDist = path.join(__dirname, 'project-dist');

    await fs.promises.mkdir(projectDist, { recursive: true });

    //Create and write "index.html" from "components"
    await writeFile(projectDist, 'index.html', template, 'w');

    //Unite styles
    const stylesInfo = await readFiles(stylesPath, 'css');
    const styleArr = [];

    for (const style of stylesInfo) {
      styleArr.push(style.data);
    }

    await writeFile(projectDist, 'style.css', styleArr.join(''), 'w');

    //Copy folder "assets" to "project-dist"
    const assetsOriginalPath = path.join(__dirname, 'assets');
    const assetsCopyPath = path.join(projectDist, 'assets');

    copyDir(assetsOriginalPath, assetsCopyPath);
  } catch (err) {
    console.error('Error:', err);
  }
})();
