const fs = require('fs');
const path = require('path');

const secretFolderPath = path.join(__dirname, 'secret-folder');

fs.readdir(secretFolderPath, (err, files) => {
  if (err) {
    console.error('Error reading secret folder:', err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(secretFolderPath, file);

    fs.stat(filePath, (statErr, stats) => {
      if (statErr) {
        console.error(`Error getting statistics for file ${file}:`, statErr);
        return;
      }

      if (stats.isFile()) {
        const fileData = path.parse(file);
        console.log(
          `${fileData.name} - ${fileData.ext.slice(1)} - ${stats.size} byte`,
        );
      }
    });
  });
});