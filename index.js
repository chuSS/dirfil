const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const { processDir, isValidPath } = require('./util');
const path = require('path');

// Создание экземпляра Express приложения
const app = express();
// Порт для HTTP и WebSocket сервера
const httpPort = 3000;

// Настройка статической файловой раздачи из директории public
app.use(express.static(path.join(__dirname, 'public')));

// Создание HTTP сервера с использованием Express
const server = http.createServer(app);
server.listen(httpPort, () => {
  console.log(`HTTP сервер запущен на порту ${httpPort}`);
});

// Создание WebSocket сервера поверх HTTP сервера
const wss = new WebSocket.Server({ server });

/**
 * Обработчик WebSocket соединений
 * Принимает путь директории от клиента, валидирует его и возвращает структуру файлов
 */
wss.on('connection', (ws, req) => {
  console.log('WebSocket соединение установлено');

  // Обработка сообщений от клиента
  ws.on('message', async (message) => {
    // Преобразование буфера в строку пути директории
    const dirPath = message.toString();
    console.log(`Получен путь директории: ${dirPath}`);

    // Валидация пути директории
    if (!await isValidPath(dirPath)) {
      console.error(`Некорректный путь директории: ${dirPath}`);
      ws.send(JSON.stringify({ error: `Некорректный путь директории: ${dirPath}` }));
      return;
    }

    // Замер времени обработки директории
    const startTime = Date.now();
    const result = await processDir(dirPath);
    const endTime = Date.now();
    const elapsedTime = (endTime - startTime);

    // Логирование результатов обработки
    console.log(`Директория ${dirPath} обработана за ${elapsedTime / 1000} секунд`);

    // Отправка результата клиенту в формате JSON
    const jsonResult = JSON.stringify(result, null, 2);
    ws.send(jsonResult);
  });
});

console.log(`WebSocket сервер запущен на порту ${httpPort}`);
