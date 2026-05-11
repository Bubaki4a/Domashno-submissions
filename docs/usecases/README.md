# Use Cases Documentation

Use cases live in `backend/src/application/usecases/`. Each use case encapsulates one business operation, depends on repositories or other services via constructor injection, and is invoked by the presentation layer (controllers).

## By domain

### Auth

- [LoginUseCase](LoginUseCase.md)
- [GetMeUseCase](GetMeUseCase.md)
- [UpdateProfileUseCase](UpdateProfileUseCase.md)

### Submission

- [CreateSubmissionUseCase](CreateSubmissionUseCase.md)
- [GetAllSubmissionsUseCase](GetAllSubmissionsUseCase.md)
- [GetSubmissionByIdUseCase](GetSubmissionByIdUseCase.md)
- [UpdateSubmissionUseCase](UpdateSubmissionUseCase.md)

### Provider

- [GetProvidersUseCase](GetProvidersUseCase.md)
- [SyncProviderUseCase](SyncProviderUseCase.md)
- [ProcessProductsUseCase](ProcessProductsUseCase.md)
- [NormalizeProductsUseCase](NormalizeProductsUseCase.md)

### Product

- [EnhanceProductUseCase](EnhanceProductUseCase.md)

### User

- [GetAllUsersUseCase](GetAllUsersUseCase.md)
- [CreateUserUseCase](CreateUserUseCase.md)

### Job

- [TriggerImportJobUseCase](TriggerImportJobUseCase.md)
- [TriggerEnrichJobUseCase](TriggerEnrichJobUseCase.md)
- [ListPipelineRunsUseCase](ListPipelineRunsUseCase.md)
- [GetPipelineRunByIdUseCase](GetPipelineRunByIdUseCase.md)
- [ListFailedProductsUseCase](ListFailedProductsUseCase.md)
- [RetryFailedProductsUseCase](RetryFailedProductsUseCase.md)

## Summary table

| Use case | Domain | Used by (controller / endpoint) |
|----------|--------|----------------------------------|
| [LoginUseCase](LoginUseCase.md) | Auth | authController – POST /auth/login |
| [GetMeUseCase](GetMeUseCase.md) | Auth | authController – GET /auth/me |
| [UpdateProfileUseCase](UpdateProfileUseCase.md) | Auth | authController – PUT /auth/profile |
| [CreateSubmissionUseCase](CreateSubmissionUseCase.md) | Submission | formController – POST /submit |
| [GetAllSubmissionsUseCase](GetAllSubmissionsUseCase.md) | Submission | formController – GET /submissions |
| [GetSubmissionByIdUseCase](GetSubmissionByIdUseCase.md) | Submission | formController – GET /submissions/:id |
| [UpdateSubmissionUseCase](UpdateSubmissionUseCase.md) | Submission | formController – PUT /submissions/:id |
| [GetProvidersUseCase](GetProvidersUseCase.md) | Provider | providerController – GET /providers |
| [SyncProviderUseCase](SyncProviderUseCase.md) | Provider | providerController – POST /providers/:provider/sync |
| [ProcessProductsUseCase](ProcessProductsUseCase.md) | Provider | SyncProviderUseCase (internal) |
| [NormalizeProductsUseCase](NormalizeProductsUseCase.md) | Provider | providerController – POST /providers/:provider/normalize |
| [EnhanceProductUseCase](EnhanceProductUseCase.md) | Product | productController – POST /products/:providerId/:id/enhance |
| [GetAllUsersUseCase](GetAllUsersUseCase.md) | User | userController – GET /users (admin) |
| [CreateUserUseCase](CreateUserUseCase.md) | User | userController – POST /users (admin) |
| [TriggerImportJobUseCase](TriggerImportJobUseCase.md) | Job | jobController – POST /admin/jobs/import (admin) |
| [TriggerEnrichJobUseCase](TriggerEnrichJobUseCase.md) | Job | jobController – POST /admin/jobs/enrich (admin) |
| [ListPipelineRunsUseCase](ListPipelineRunsUseCase.md) | Job | jobController – GET /admin/jobs (admin) |
| [GetPipelineRunByIdUseCase](GetPipelineRunByIdUseCase.md) | Job | jobController – GET /admin/jobs/:id (admin) |
| [ListFailedProductsUseCase](ListFailedProductsUseCase.md) | Job | jobController – GET /admin/jobs/failed-products (admin) |
| [RetryFailedProductsUseCase](RetryFailedProductsUseCase.md) | Job | jobController – POST /admin/jobs/retry-failed (admin) |

[← Back to docs](../ARCHITECTURE.md)
