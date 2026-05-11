# ListPipelineRunsUseCase

**File:** `backend/src/application/usecases/Job/ListPipelineRunsUseCase.ts`

**Purpose:** List pipeline runs (import/enrich job executions) with optional filters.

## Dependencies

- `IPipelineRunRepository`

## Input

`ListPipelineRunsFilters` – `{ jobName?: string; status?: PipelineRunStatus; limit?: number }`

## Output

`PipelineRun[]` – id, jobName, providerId, status, startedAt, finishedAt, processedCount, successCount, failedCount, error, metadata

## Errors

None (repository errors propagate).

## Used by

- `jobController` – GET /api/admin/jobs (admin only)

[← Back to Use Cases index](README.md)
