# CinemaBook - Онлайн-бронирование билетов в кино

## 🛠️ Установка и запуск

### Требования

- Node.js 18+
- npm

### Установка зависимостей

```bash
npm install
```

### Запуск frontend

```bash
npm run dev
```

Приложение будет доступно на `http://localhost:3000`

## 📝 Скрипты

```bash
npm run dev          # Запуск dev сервера
npm run build        # Production сборка
npm run preview      # Превью production сборки
npm run lint         # Проверка кода
npm run typecheck    # Проверка типов
npm run test         # Запуск тестов в watch режиме
npm run test:run     # Одноразовый запуск тестов
npm run test:coverage # Тесты с покрытием
```

## 🧪 Тестирование

```bash
npm run test:run
```

Тесты:

- Unit тесты форматтеров и утилит
- Тесты Zod схем
- Тесты composables (useAuth, useBookings, useSessions, useMovies, useCinemas, useErrorHandler, useCountdown)
- Тесты компонентов (LoginForm, RegisterForm, SeatSelector, PaymentTimer)
- Тесты репозиториев с моками API клиента

## 📁 Переменные окружения

```env
NUXT_PUBLIC_API_BASE=http://localhost:3022
```
