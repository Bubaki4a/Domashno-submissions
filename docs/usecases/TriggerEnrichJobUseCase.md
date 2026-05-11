# TriggerEnrichJobUseCase

**File:** `backend/src/application/usecases/Job/TriggerEnrichJobUseCase.ts`

**Purpose:** Trigger the enrich job (AI enhancement of products in batch). Delegates to `runEnrichJob`; returns run outcome.

## Dependencies

None (calls `runEnrichJob` from `jobs/enrichJob`)

## Input

`TriggerEnrichJobInput` – `{ providerId?: string; batchSize?: number }`

## Output

`JobTriggerOutcome` – same shape as import

## Errors

Same as import; batch size can be overridden (env `ENRICH_BATCH_SIZE` as default).

## Used by

- `jobController` – POST /api/admin/jobs/enrich (admin only)

[← Back to Use Cases index](README.md)
