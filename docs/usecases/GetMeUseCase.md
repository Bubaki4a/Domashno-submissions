# GetMeUseCase

**File:** `backend/src/application/usecases/Auth/GetMeUseCase.ts`

**Purpose:** Return the current user by id (no password).

## Dependencies

- `IUserRepository`

## Input

`userId: number`

## Output

`User | null`

## Errors

None; returns `null` if user not found.

## Used by

- `authController` – GET /api/auth/me

[← Back to Use Cases index](README.md)
