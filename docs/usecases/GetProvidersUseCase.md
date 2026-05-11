# GetProvidersUseCase

**File:** `backend/src/application/usecases/Provider/GetProvidersUseCase.ts`

**Purpose:** Build the list of configured providers (e.g. EasyGifts) with display name, configuration status, last sync timestamp, and products count.

## Dependencies

- `IProviderRepository`
- `IProductRepository`

## Input

None

## Output

`ProviderInfo[]` – `{ name, displayName, isConfigured, lastSync?, productsCount? }`

## Notes

Provider "configured" is determined by env (e.g. `EASYGIFTS_API_URL` for EasyGifts). Last sync is derived from stored source filenames.

## Used by

- `providerController` – GET /api/providers

[← Back to Use Cases index](README.md)
