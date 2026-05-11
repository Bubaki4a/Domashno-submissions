# TriggerImportJobUseCase

**File:** `backend/src/application/usecases/Job/TriggerImportJobUseCase.ts`

**Purpose:** Trigger the import job (fetch products from provider and persist). Delegates to `runImportJob`; returns run outcome.

## Dependencies

None (calls `runImportJob` from `jobs/importJob`)

## Input

`TriggerImportJobInput` – `{ providerId?: string }` (optional; when omitted, job may use default/provider from env)

## Output

`JobTriggerOutcome` – `{ runId, status, processedCount, successCount, failedCount, error? }`

## Errors

Job implementation may return partial success; check `status` and `error`.

## Used by

- `jobController` – POST /api/admin/jobs/import (admin only)

[← Back to Use Cases index](README.md)
