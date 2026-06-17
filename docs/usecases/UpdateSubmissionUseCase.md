# UpdateSubmissionUseCase

## Описание

Обновява съществуваща заявка (submission) по нейния `id`. Валидира новите данни чрез domain entity, запазва оригиналните `id` и `createdAt`, и записва целия актуализиран масив обратно в хранилището.

---

## Местоположение

```
backend/src/application/usecases/Submission/UpdateSubmissionUseCase.ts
```

---

## Зависимости

| Зависимост | Интерфейс | Описание |
|---|---|---|
| `repository` | `ISubmissionRepository` | Абстракция над хранилището за заявки |

---

## Входни данни

```typescript
id: string                       // идентификатор на заявката за обновяване

interface CreateSubmissionRequest {
  name: string;
  email: string;
  message: string;
}
```

---

## Изходни данни

```typescript
class UpdateSubmissionResponse {
  success: boolean;      // винаги true при успех
  message: string;       // "Submission updated successfully"
  id: string;            // оригиналният id (непроменен)
  name: string;
  email: string;
  message: string;
  createdAt: string;     // оригиналната дата на създаване (непроменена)
}
```

---

## Логика на изпълнение

1. Извиква `SubmissionEntity.create(request)` — валидира новите данни.
2. Зарежда всички заявки чрез `repository.findAll()`.
3. Търси заявката по `id`. При липса хвърля `Error('Submission not found')`.
4. Изгражда обновен обект, запазвайки `id` и `createdAt` от оригиналната заявка.
5. Записва целия актуализиран масив чрез `repository.saveAll(submissions)`.
6. Връща `new UpdateSubmissionResponse(updated)`.

---

## Валидационни правила

Идентични с `CreateSubmissionUseCase` — валидацията се извършва в `SubmissionEntity.create()`:

| Поле | Правило | Грешка |
|---|---|---|
| `name` | Задължително, не може да е само празни символи | `"Name is required"` |
| `email` | Задължително, валиден формат | `"Email is required"` / `"Invalid email format"` |
| `message` | Задължително, не може да е само празни символи | `"Message is required"` |

---

## Полета, запазени от оригиналната заявка

| Поле | Поведение |
|---|---|
| `id` | Не се променя — взема се от намерената заявка |
| `createdAt` | Не се променя — запазва оригиналния timestamp |

---

## Грешки

| Условие | Грешка |
|---|---|
| `id` не е намерен | `Error('Submission not found')` |
| Невалидни данни в `request` | Грешка от `SubmissionEntity.create()` |

---

## HTTP ендпойнт

```
PUT /api/submissions/:id
Authorization: Bearer <token>   (задължително)
Content-Type: application/json
```

**Примерна заявка:**
```json
{
  "name": "Иван Иванов",
  "email": "ivan.new@example.com",
  "message": "Обновено съобщение."
}
```

**Успешен отговор (200):**
```json
{
  "success": true,
  "message": "Submission updated successfully",
  "id": "1717862400000-ab3cd9ef1",
  "name": "Иван Иванов",
  "email": "ivan.new@example.com",
  "message": "Обновено съобщение.",
  "createdAt": "2024-06-08T12:00:00.000Z"
}
```

**Заявката не е намерена (404):**
```json
{
  "success": false,
  "error": "Submission not found"
}
```

**Невалидни данни (400):**
```json
{
  "success": false,
  "error": "Invalid email format"
}
```

---

## Бележка за имплементацията

`UpdateSubmissionUseCase` използва `repository.findAll()` + `repository.saveAll()` вместо директен `update` по `id`. Това е обусловено от `FileRepository`, чийто интерфейс не поддържа частичен update — записва целия файл наново.

---

## Примерна употреба

```typescript
const repository = createSubmissionRepository();
const useCase = new UpdateSubmissionUseCase(repository);

const response = await useCase.execute('1717862400000-ab3cd9ef1', {
  name: 'Иван Иванов',
  email: 'ivan.new@example.com',
  message: 'Обновено съобщение.',
});

console.log(response.createdAt); // оригиналната дата — непроменена
```