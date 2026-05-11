# UpdateProfileUseCase

**File:** `backend/src/application/usecases/Auth/UpdateProfileUseCase.ts`

**Purpose:** Update the current user's profile: name, email, and/or password (password change requires current password).

## Dependencies

- `IUserRepository`

## Input

`UpdateProfileInput` – `{ userId: number; name?: string; email?: string; currentPassword?: string; newPassword?: string }`

## Output

`User` (updated, no password)

## Errors

Throws if user not found, name/email empty, email already in use, or (for password change) current password missing/incorrect.

## Used by

- `authController` – PUT /api/auth/profile

[← Back to Use Cases index](README.md)
