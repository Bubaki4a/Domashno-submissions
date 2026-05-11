# ListFailedProductsUseCase

**File:** `backend/src/application/usecases/Job/ListFailedProductsUseCase.ts`

**Purpose:** List products that failed AI enrichment (e.g. for retry or inspection). Uses product repository's "AI status" query.

## Dependencies

- `IProductRepository`

## Input

`ListFailedProductsInput` – `{ providerId?: string; limit?: number }` (default limit 500)

## Output

`ProductAiStatusRow[]` (providerId, productId, error, etc.)

## Errors

None (repository errors propagate).

## Used by

- `jobController` – GET /api/admin/jobs/failed-products (admin only)

[← Back to Use Cases index](README.md)
