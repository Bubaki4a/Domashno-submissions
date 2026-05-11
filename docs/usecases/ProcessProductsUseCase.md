# ProcessProductsUseCase

**File:** `backend/src/application/usecases/Provider/ProcessProductsUseCase.ts`

**Purpose:** Transform a list of raw provider products into domain products and save them (one by one) to the product repository. Used by `SyncProviderUseCase`.

## Dependencies

- `IProductRepository`

## Input

- `provider: IProvider`
- `rawProducts: any[]`

## Output

`{ processedCount: number; errors: string[] }`

## Errors

Per-product failures are pushed to `errors`; use case does not throw.

## Used by

- `SyncProviderUseCase` (internal)

[← Back to Use Cases index](README.md)
