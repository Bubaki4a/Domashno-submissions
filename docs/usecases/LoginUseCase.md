# LoginUseCase

**File:** `backend/src/application/usecases/Auth/LoginUseCase.ts`

**Purpose:** Authenticate a user by email and password; return user data and a JWT.

## Dependencies

- `IUserRepository`

## Input

`LoginInput` – `{ email: string; password: string }`

## Output

`LoginResult` – `{ user: User; token: string }`

## Errors

Throws `"Invalid email or password"` if user not found or password does not match. JWT is signed with `JWT_SECRET` and `JWT_EXPIRES_IN` from env.

## Used by

- `authController` – POST /api/auth/login

[← Back to Use Cases index](README.md)
