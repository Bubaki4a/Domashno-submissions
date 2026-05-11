# GetPipelineRunByIdUseCase

**File:** `backend/src/application/usecases/Job/GetPipelineRunByIdUseCase.ts`

**Purpose:** Return a single pipeline run by id.

## Dependencies

- `IPipelineRunRepository`

## Input

`id: number`

## Output

`PipelineRun | null`

## Errors

None; returns `null` if not found.

## Used by

- `jobController` – GET /api/admin/jobs/:id (admin only)

[← Back to Use Cases index](README.md)
