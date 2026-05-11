# NormalizeProductsUseCase

**File:** `backend/src/application/usecases/Provider/NormalizeProductsUseCase.ts`

**Purpose:** For a given provider id, load all products, normalize names/descriptions/categories and compute metadata (tags, keywords, SEO, quality score), then save normalized records.

## Dependencies

- `IProductRepository`

## Input

`provider: string` (e.g. `"easygifts"`)

## Output

`{ processedCount: number; errors: string[] }`

## Errors

Throws if provider is empty. Per-product errors are collected in `errors`.

## Used by

- `providerController` – POST /api/providers/:provider/normalize

[← Back to Use Cases index](README.md)
