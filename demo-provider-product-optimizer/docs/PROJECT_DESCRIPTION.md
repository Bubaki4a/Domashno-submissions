# Описание на проекта - Product Optimizer Platform

## Какво прави проекта

**Product Optimizer Platform** е full-stack уеб приложение за управление на submissions (подавания). Приложението позволява на потребителите да:

- **Създават** нови submissions чрез форма с валидация (име, имейл, съобщение)
- **Преглеждат** всички създадени submissions в списък, сортиран по дата
- **Редактират** съществуващи submissions с запазване на оригиналния ID и дата на създаване

Данните се съхраняват в JSON файл (`backend/data/submissions.json`), а приложението използва Clean Architecture за ясно разделение на отговорностите.

## Архитектура на проекта

Проектът следва **Clean Architecture** с четко разделени слоеве:

### Backend структура

```
backend/
├── src/
│   ├── domain/                    # Домейн слой - бизнес entities и правила
│   │   └── entities/
│   │       └── Submission/
│   │           ├── SubmissionEntity.ts      # Entity клас с валидация
│   │           └── Submission.ts             # Тип дефиниции
│   │
│   ├── application/               # Приложен слой - use cases
│   │   └── usecases/
│   │       └── Submission/
│   │           ├── CreateSubmissionUseCase.ts    # Use case за създаване
│   │           ├── GetAllSubmissionsUseCase.ts    # Use case за всички
│   │           └── UpdateSubmissionUseCase.ts    # Use case за обновяване
│   │
│   ├── infrastructure/            # Инфраструктурен слой
│   │   ├── fileSystem/
│   │   │   └── fileRepository.ts  # Репозиторий за JSON файлове
│   │   └── web/
│   │       └── server.ts          # Express сървър
│   │
│   └── presentation/              # Презентационен слой
│       ├── controllers/
│       │   └── formController.ts  # HTTP контролери
│       ├── requests/              # Request DTOs
│       └── responses/             # Response DTOs
│
└── data/
    └── submissions.json           # JSON файл за данни
```

### Frontend структура

```
frontend/
├── src/
│   ├── pages/               # Страници на приложението
│   │   ├── HomePage/        # Начална страница с форма
│   │   └── SubmissionsPage/ # Страница за преглед на всички submissions
│   │
│   ├── components/          # Преизползваеми компоненти
│   │   ├── Form/            # Форма за създаване/редактиране
│   │   ├── SubmissionList/  # Списък с submissions
│   │   └── Layout/          # Основен layout компонент
│   │
│   ├── services/            # API комуникация
│   │   └── api.ts           # API service клас
│   │
│   ├── models/              # TypeScript типове
│   │   └── Submission.ts    # Submission модел
│   │
│   └── App.tsx              # Главен компонент с routing
```

## Поток на данни

1. **Frontend** → Изпраща HTTP заявка към API
2. **Controller** → Приема заявката и извиква съответния Use Case
3. **Use Case** → Използва Domain Entity за валидация и бизнес логика
4. **Repository** → Запазва/извлича данни от JSON файл
5. **Response** → Връща резултат към frontend

## Технологичен стек

### Backend
- **Node.js** - JavaScript runtime среда
- **Express** - Web framework за HTTP сървър
- **TypeScript** - Типизиран JavaScript за по-добра поддръжка на кода
- **Clean Architecture** - Архитектурен модел за разделение на отговорности

### Frontend
- **React 19** - Модерна JavaScript библиотека за UI
- **TypeScript** - Типизиран JavaScript
- **Vite** - Бърз build tool и dev server
- **CSS Modules** - Стилизиране на компоненти

### Съхранение на данни
- **JSON файл** (`backend/data/submissions.json`) - Просто файлово базирано съхранение
- Лесно за миграция към реална база данни в бъдеще

## API Endpoints

### POST `/api/submit`
Създава нов submission.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan@example.com",
  "message": "Това е тестово съобщение"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abc123",
    "name": "Иван Иванов",
    "email": "ivan@example.com",
    "message": "Това е тестово съобщение",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

### GET `/api/submissions`
Връща всички submissions, сортирани по дата (най-новите първи).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1234567890-abc123",
      "name": "Иван Иванов",
      "email": "ivan@example.com",
      "message": "Това е тестово съобщение",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

### PUT `/api/submissions/:id`
Обновява съществуващ submission.

**Request Body:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan.updated@example.com",
  "message": "Обновено съобщение"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1234567890-abc123",
    "name": "Иван Иванов",
    "email": "ivan.updated@example.com",
    "message": "Обновено съобщение",
    "createdAt": "2026-01-15T10:30:00.000Z"
  }
}
```

## Валидация

- **Frontend**: Проверка за празни полета, email формат, визуална обратна връзка
- **Backend**: Всички полета задължителни, email regex валидация, trim на whitespace, автоматично lowercase на email

## Архитектурни принципи

### Clean Architecture слоеве

1. **Domain Layer** - Бизнес entities и валидация
   - `SubmissionEntity` - валидира и създава entities
   - Независим от външни библиотеки

2. **Application Layer** - Use Cases (бизнес операции)
   - `CreateSubmissionUseCase` - създаване на нов submission
   - `GetAllSubmissionsUseCase` - извличане на всички submissions
   - `UpdateSubmissionUseCase` - обновяване на съществуващ submission
   - Dependency injection на репозитории

3. **Infrastructure Layer** - Външни зависимости
   - `FileRepository` - работа с JSON файлове
   - Express сървър конфигурация

4. **Presentation Layer** - HTTP интерфейс
   - `formController` - HTTP контролери
   - Request/Response DTOs

## Инсталация и стартиране

### Изисквания
- Node.js (v16+)
- npm

### Инсталация
```bash
npm install                    # Root зависимости
cd frontend && npm install     # Frontend зависимости
cd ../backend && npm install  # Backend зависимости

# Или наведнъж:
npm run install:all
```

### Стартиране
```bash
npm run dev                    # Стартира frontend и backend едновременно

# Или отделно:
npm run dev:backend            # Backend на порт 3001
npm run dev:frontend           # Frontend на порт 5173
```

### Build
```bash
npm run build                  # Build на всичко
```

### Достъп
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## Структура на данните

```typescript
{
  id: string;        // Уникален ID (генериран автоматично)
  name: string;      // Име на потребителя
  email: string;     // Имейл (lowercase)
  message: string;   // Съобщение
  createdAt: string; // ISO timestamp
}
```

## Технологичен стек

- **Backend**: Node.js, Express, TypeScript, Clean Architecture
- **Frontend**: React 19, TypeScript, Vite
- **Съхранение**: JSON файл (лесно заменяемо с база данни)
