const fs = require('fs').promises;
const path = require('path');

/**
 * Проверяет существование и доступность указанного пути директории
 * @param {string} dirPath - Путь к директории для проверки
 * @returns {Promise<boolean>} - Возвращает true, если путь существует и доступен, иначе false
 */
async function isValidPath(dirPath) {
  try {
    await fs.stat(dirPath);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Преобразует относительный путь в абсолютный
 * @param {string} relativePath - Относительный путь
 * @returns {string} - Абсолютный нормализованный путь
 */
function getAbsolutePath(relativePath) {
  if (path.isAbsolute(relativePath)) {
    return path.normalize(relativePath);
  }
  return path.resolve(process.cwd(), relativePath);
}

/**
 * Рекурсивный анализ содержимого директории с построением иерархической структуры файлов и поддиректорий
 * 
 * @description
 * Функция выполняет глубокое сканирование директории с параллельной обработкой элементов.
 * Поддерживает три типа элементов: файлы, директории и символические ссылки.
 * 
 * @algorithm
 * Многоуровневый рекурсивный обход файловой системы с параллельной обработкой:
 * 1. Чтение всех элементов директории с расширенной информацией
 * 2. Параллельная обработка каждого элемента с разветвлением логики:
 *    - Директории: рекурсивный вызов с накоплением вложенных элементов
 *    - Файлы: сбор метаданных (размер)
 *    - Символические ссылки: получение пути назначения
 * 3. Фильтрация успешно обработанных элементов
 * 4. Агрегация метаданных с вычислением суммарного размера каждой директории
 * 
 * @complexity
 * - Временная сложность: O(n * m)
 * - Пространственная сложность: O(n * m)
 * 
 * @characteristics
 * - Отказоустойчивость: ошибки отдельных элементов не останавливают весь процесс
 * - Параллельность: одновременная обработка элементов директории
 * - Гибкость: поддержка различных типов файловых объектов
 * 
 * @param {string} dirPath - Путь к директории для обработки
 * @returns {Promise<Object>} Объект с иерархической структурой директории
 * 
 * @example
 * // Возвращаемая структура данных
 * {
 *   name: 'root',
 *   type: 'directory',
 *   size: 1024,
 *   children: [
 *     {
 *       name: 'file.txt',
 *       type: 'file',
 *       size: 512
 *     },
 *     {
 *       name: 'subdir',
 *       type: 'directory',
 *       size: 512,
 *       children: [...]
 *     }
 *   ]
 * }
 * 
 * @performance
 * - Использует асинхронные операции с файловой системой
 * - Может потреблять много памяти для больших директорий
 * - Не обрабатывает специальные типы файлов (сокеты, pipe и др.)
 * 
 * @throws {Error} При невозможности чтения директории
 */
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
      type: 'error',
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
