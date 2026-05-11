# CreateUserUseCase

**File:** `backend/src/application/usecases/User/CreateUserUseCase.ts`

**Purpose:** Create a new user with email, password (hashed), name, and role. Used by admin-only user creation.

## Dependencies

- `IUserRepository`

## Input

`CreateUserInput` – `{ email: string; password: string; name: string; role: UserRole }` (`UserRole`: `administrator` | `manager` | `operator`)

## Output

`User` (created user, no password)

## Errors

Throws `"User with this email already exists"` if email is taken. Email is normalized to lowercase.

## Used by

- `userController` – POST /api/users (admin only)

[← Back to Use Cases index](README.md)
