# Directory File Structure Analyzer

## 🔍 Проект: Рекурсивный Анализатор Файловой Системы

### 🎯 Цель Проекта
Создание веб-инструмента для глубокого анализа и визуализации структуры файловой системы с детальными метаданными.

### 🏗️ Архитектурная Спецификация

#### Системная Архитектура
- **Тип**: Клиент-серверное веб-приложение
- **Парадигма**: Событийно-ориентированное приложение с WebSocket-коммуникацией
- **Платформа**: Node.js с браузерным клиентом

#### Компоненты Системы

##### 1. Серверное Приложение
Центральный HTTP и WebSocket сервер, который:
- Обрабатывает подключения клиентов
- Инициирует сканирование файловой системы
- Передает результаты через WebSocket

##### 2. Утилиты Файловой Системы
Набор функций для:
- Валидации путей директорий
- Преобразования относительных путей
- Рекурсивного анализа структуры директорий

##### 3. Клиентское Приложение
Интерфейс для:
- Установления WebSocket-соединения
- Отправки запросов на сканирование
- Визуализации результатов

### 🔬 Алгоритмические Детали

#### Механизм Сканирования Директории
- Параллельное сканирование элементов директории
- Рекурсивный проход по вложенным директориям
- Сбор метаданных для каждого элемента

#### Структура Данных
```
{
  name: "Имя элемента",
  type: "file|directory|link|error", 
  size: 1024,           // Размер в байтах
  children: [ ... ],    // Вложенные элементы
  link: "/path/to/link" // Для символических ссылок
}
```

### 🛠️ Технический Стек
- **Backend**: 
  - Node.js
  - Express
  - WebSocket
  - `fs.promises`

- **Frontend**:
  - Vanilla JavaScript
  - WebSocket API

### 📊 Характеристики Производительности
- **Сложность**:
  - Временная: O(n * m)
  - Пространственная: O(n * m)
- **Параллельность**: Одновременная обработка элементов директории
- **Отказоустойчивость**: Продолжение работы при ошибках отдельных элементов

### 🔒 Ограничения
- Работа только с локальной файловой системой
- Базовая валидация путей

### 🚀 Установка и Запуск
```bash
# Клонирование репозитория
git clone <repository_url>

# Установка зависимостей
npm install

# Запуск сервера
node index.js

# Откройте в браузере
http://localhost:3000
```

### 📦 Зависимости
- `express`
- `ws`
- `node`