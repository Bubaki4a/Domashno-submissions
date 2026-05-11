# GetSubmissionByIdUseCase

**File:** `backend/src/application/usecases/Submission/GetSubmissionByIdUseCase.ts`

**Purpose:** Return a single submission by id.

## Dependencies

- `ISubmissionRepository`

## Input

`id: string`

## Output

`UpdateSubmissionResponse` – single submission data

## Errors

Throws `"Submission not found"` if id does not exist.

## Used by

- `formController` – GET /api/submissions/:id

[← Back to Use Cases index](README.md)
