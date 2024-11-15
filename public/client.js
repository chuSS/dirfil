// Установка WebSocket соединения с текущим хостом и портом
const socket = new WebSocket(`ws://${window.location.hostname}:${window.location.port}`);

// Обработчик события открытия WebSocket соединения
socket.addEventListener('open', () => {
  console.log('WebSocket соединение установлено');
});

// Обработчик входящих сообщений от сервера
socket.addEventListener('message', (event) => {
  // Парсинг полученных JSON-данных
  const results = JSON.parse(event.data);
  // Отображение результатов на странице
  displayResults(results);
});

// Обработчик ошибок WebSocket соединения
socket.addEventListener('error', (event) => {
  console.error('Ошибка WebSocket:', event);
});

// Обработчик события отправки формы с путем директории
document.getElementById('dirForm').addEventListener('submit', (event) => {
  // Предотвращение стандартной отправки формы
  event.preventDefault();
  
  // Получение пути директории из поля ввода
  const dirPath = document.getElementById('dirPath').value;
  
  // Отправка пути директории на сервер через WebSocket
  socket.send(dirPath);
});

/**
 * Отображает результаты, полученные от сервера, в элементе results
 * @param {Object} results - Объект с информацией о структуре директории
 */
function displayResults(results) {
  const resultsElement = document.getElementById('results');
  // Преобразование результатов в красиво отформатированный JSON
  resultsElement.textContent = JSON.stringify(results, null, 2);
}
