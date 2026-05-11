# SyncProviderUseCase

**File:** `backend/src/application/usecases/Provider/SyncProviderUseCase.ts`

**Purpose:** Fetch products from the given provider, save the raw source, then process and persist each product via `ProcessProductsUseCase`.

## Dependencies

- `IProvider` (injected instance)
- `IProviderRepository`
- `ProcessProductsUseCase`

## Input

None (provider identity comes from the injected `IProvider`)

## Output

`{ success: boolean; provider: string; sourceFilename: string; productsCount: number; processedCount: number; errors: string[] }`

## Errors

Does not throw; errors are collected and returned in `errors`. `success` is false if any error occurred.

## Used by

- `providerController` – POST /api/providers/:provider/sync

[← Back to Use Cases index](README.md)
