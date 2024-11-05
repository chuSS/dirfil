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

function getAbsolutePath(relativePath) {
  if (path.isAbsolute(relativePath)) {
    return path.normalize(relativePath);
  }
  return path.resolve(process.cwd(), relativePath);
}

async function processDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const tasks = files.map(async (dirent) => {
      const filePath = path.join(dirPath, dirent.name);
      try {
        if (dirent.isDirectory()) {
          const dirObj = await processDir(filePath);
          return {
            name: dirent.name,
            type: 'directory',
            size: dirObj.size,
            children: dirObj.children,
          };
        } else if (dirent.isFile()) {
          const stats = await fs.stat(filePath);
          return {
            name: dirent.name,
            type: 'file',
            size: stats.size,
          };
        } else if (dirent.isSymbolicLink()) {
          const linkPath = await fs.readlink(filePath);
          return {
            name: dirent.name,
            type: 'link',
            link: linkPath,
          };
        } else {
          console.warn(`Неизвестный тип файла: ${filePath}`);
          return null;
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.warn(`Файл или директория не существует: ${filePath}`);
          return null;
        } else if (err.code === 'EPERM') {
          console.warn(`Нет прав доступа к: ${filePath}`);
          return null;
        } else {
          console.error(`Непредвиденная ошибка при обработке ${filePath}: ${err.message}`);
          return null;
        }
      }
    });

    const result = (await Promise.all(tasks)).filter(Boolean);
    const size = result.reduce((acc, curr) => 
      acc + (curr.type === 'directory' ? curr.size : curr.size || 0), 0);

    return {
      name: path.basename(dirPath),
      type: 'directory',
      size,
      children: result,
    };
  } catch (err) {
    console.error(`Ошибка при обработке директории ${dirPath}: ${err}`);
    return {
      name: path.basename(dirPath),
      type: 'directory',
      size: 0,
      children: [],
      error: err.message
    };
  }
}

module.exports = {
  isValidPath,
  getAbsolutePath,
  processDir,
};
