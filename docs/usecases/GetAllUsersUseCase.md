# GetAllUsersUseCase

**File:** `backend/src/application/usecases/User/GetAllUsersUseCase.ts`

**Purpose:** Return all users (no password). Used by admin-only user list.

## Dependencies

- `IUserRepository`

## Input

None

## Output

`User[]`

## Errors

None (repository errors propagate).

## Used by

- `userController` – GET /api/users (admin only)

[← Back to Use Cases index](README.md)
