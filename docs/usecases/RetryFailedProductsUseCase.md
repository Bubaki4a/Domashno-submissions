# RetryFailedProductsUseCase

**File:** `backend/src/application/usecases/Job/RetryFailedProductsUseCase.ts`

**Purpose:** Reset the "failed" AI status for products so they can be picked up again by the enrich job. Optionally scoped by provider.

## Dependencies

- `IProductRepository`

## Input

`RetryFailedProductsInput` – `{ providerId?: string }`

## Output

`number` – count of products reset

## Errors

None (repository errors propagate).

## Used by

- `jobController` – POST /api/admin/jobs/retry-failed (admin only)

[← Back to Use Cases index](README.md)
