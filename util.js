const fs = require('fs').promises;
const path = require('path');

async function isValidPath(dirPath) {
  try {
    await fs.stat(dirPath);
    return true;
  } catch (err) {
    return false;
  }
}

async function convertToNativePath(path) {
  return path.replace(/\\/g, '\\');
}

async function processDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    const tasks = files.map(async (file) => {
      try {
        const filePath = path.join(dirPath, file);
        const stats = await fs.lstat(filePath);
        if (stats.isDirectory()) {
          const dirObj = await processDir(filePath);
          return {
            name: file,
            type: 'directory',
            dirsize: dirObj.dirsize,
            children: dirObj.children,
          };
        } else if (stats.isFile()) {
          return {
            name: file,
            type: 'file',
            size: stats.size,
          };
        } else if (stats.isSymbolicLink()) {
          return {
            name: file,
            type: 'link',
          };
        }
      } catch (err) {
        if (err.code !== 'ENOENT' && err.code !== 'EPERM') {
          throw err;
        }
      }
    });
    const result = await Promise.all(tasks);
    const dirsize = result.reduce((acc, curr) => {
      if (curr?.type === 'directory') {
        return acc + curr.dirsize;
      } else if (curr?.type === 'file') {
        return acc + curr.size;
      } else {
        return acc;
      }
    }, 0);
    return {
      name: path.basename(dirPath),
      type: 'directory',
      dirsize: dirsize,
      children: result.length ? result : [],
    };
  } catch (err) {
    console.error(`Error processing directory ${dirPath}: ${err}`);
    throw err;
  }
}

module.exports = {
  isValidPath,
  processDir,
  convertToNativePath,
};