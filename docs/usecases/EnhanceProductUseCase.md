# EnhanceProductUseCase

**File:** `backend/src/application/usecases/Product/EnhanceProductUseCase.ts`

**Purpose:** Load a normalized product, call the AI (e.g. DeepInfra) to generate "5 events where this product works as a merchant/corporate gift", normalize the AI response, and return the product with the new events. Does **not** persist; the client saves via the product update API.

## Dependencies

- `IProductRepository`
- `IChatCompletionClient`

## Input

`EnhanceProductInput` – `{ providerId: string; productId: string }`

## Output

`EnhanceProductResult` – `{ product: NormalizedProduct (with events); events: string }`

## Errors

Throws `"Product not found"` if the product does not exist. AI/key errors propagate (e.g. missing `DEEP_INFRA_KEY`).

## Used by

- `productController` – POST /api/products/:providerId/:id/enhance

[← Back to Use Cases index](README.md)
