const fs = require('fs/promises');
const path = require('path');

async function copyDir(src, dest) {
  try {
    await fs.mkdir(dest, { recursive: true });

    const filesArr = await fs.readdir(src, { withFileTypes: true });

    await Promise.all(
      filesArr.map(async (file) => {
        const srcCopy = path.join(src, file.name);
        const destCopy = path.join(dest, file.name);

        if (file.isDirectory()) {
          await copyDir(srcCopy, destCopy);
        } else {
          await fs.copyFile(srcCopy, destCopy);
        }
      }),
    );

    //Delete unnecessary files
    const destFiles = await fs.readdir(dest);
    await Promise.all(
      destFiles.map(async (file) => {
        const srcFile = path.join(src, file);
        const destFile = path.join(dest, file);

        // Если файл в dest не существует в src, удаляем его
        if (!(await fs.stat(srcFile).catch(() => null))) {
          await fs.unlink(destFile);
        }
      }),
    );

    console.log('Folder copied:', src, '->', dest);
  } catch (error) {
    console.error('Error:', error);
  }
}

const srcOriginal = path.join(__dirname, 'files');
const destOriginal = path.join(__dirname, 'files-copy');

copyDir(srcOriginal, destOriginal);
