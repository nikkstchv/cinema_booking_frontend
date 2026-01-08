# Онлайн-бронирование билетов в кино

## Установка и запуск

### Требования

- Node.js 18+
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
npm run preview
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
NUXT_PUBLIC_API_BASE=http://localhost:3022
```

## Тестирование

### Unit и Integration тесты (Vitest)

```bash
# Запуск в watch режиме
npm run test

# Однократный запуск
npm run test:run

# С покрытием кода
npm run test:coverage
```

### E2E тесты (Playwright)

```bash
# Запуск E2E тестов
npm run test:e2e

# Запуск с UI
npm run test:e2e:ui
```

### Проверка типов

```bash
npm run typecheck
```

### Линтинг

```bash
npm run lint
```
