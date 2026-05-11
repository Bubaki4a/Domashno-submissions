# Roles

| Role | Submissions | Providers | Products | Users | Jobs | Profile |
|------|-------------|-----------|----------|-------|------|---------|
| **Administrator** | Yes | Yes | Yes | Yes (list, create) | Yes (trigger, list, retry) | Yes |
| **Manager** | Yes | No | Yes | No | No | Yes |
| **Operator** | Yes | No | Yes | No | No | Yes |

- **Administrator**: Full access. Can manage users, trigger import/enrich jobs, view pipeline runs and failed products, and retry failed products.
- **Manager** / **Operator**: Can use submissions, products, and profile. Cannot access Providers, Users, or Jobs (UI and API enforce this).

## API enforcement

Routes under `/api/users` and `/api/admin/jobs/*` require `requireRole('administrator')`. All other protected routes require only a valid JWT.

[← Architecture](ARCHITECTURE.md) · [Jobs (cron & manual triggers)](JOBS.md)
