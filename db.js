const Database = require("better-sqlite3");

// Создаем или подключаемся к базе данных (файл появится в папке проекта)
const db = new Database("database.db");

// Создаем таблицу пользователей, если её нет
const createTable = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`;

db.exec(createTable);

module.exports = db;
