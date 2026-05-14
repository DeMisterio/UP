#!/usr/bin/env bash
set -e

echo "→ Настройка Infinite Tower Maze..."

# Зависимости в корне (если держишь package.json на верхнем уровне репо)
if [ -f package.json ]; then
  echo "→ Установка корневых зависимостей..."
  npm install
fi

# Зависимости сервера (когда появится папка /server со своим package.json)
if [ -f server/package.json ]; then
  echo "→ Установка зависимостей сервера..."
  npm install --prefix server
fi

# Лёгкий статический сервер для p5.js клиента
echo "→ Установка live-server глобально..."
npm install -g live-server

echo "✅ Готово."
echo "   Клиент:  live-server client --port=3000"
echo "   Сервер:  npm start --prefix server"