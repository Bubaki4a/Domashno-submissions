# Background Jobs

## Cron jobs

When `CRON_ENABLED=true` (or `1`), the backend scheduler runs two jobs:

| Job | Default schedule | Env var | Description |
|-----|------------------|---------|-------------|
| **Import** | Every 6 hours (`0 */6 * * *`) | `CRON_IMPORT_SCHEDULE` | Fetches products from configured providers (e.g. EasyGifts) and stores them. |
| **Enrich** | Every 15 minutes (`*/15 * * * *`) | `CRON_ENRICH_SCHEDULE` | Runs AI enhancement on a batch of products (batch size from `ENRICH_BATCH_SIZE`, default 25). |

Cron uses standard cron expressions (e.g. [cron expression format](https://crontab.guru/)).

## Manual triggers

Administrators can trigger the same jobs via the API (and from the Jobs page in the UI):

- **POST /api/admin/jobs/import** – Optional body: `{ "providerId": "easygifts" }`.
- **POST /api/admin/jobs/enrich** – Optional body: `{ "providerId": "easygifts", "batchSize": 25 }`.

Pipeline run history, failed products, and retry are available via:

- **GET /api/admin/jobs** – List runs (optional query: `job_name`, `status`, `limit`).
- **GET /api/admin/jobs/:id** – One run by id.
- **GET /api/admin/jobs/failed-products** – Products that failed enrichment (optional query: `provider_id`).
- **POST /api/admin/jobs/retry-failed** – Reset failed products for retry (optional body: `{ "providerId": "easygifts" }`).

See [API Reference](API.md) for full request/response details.

[← Architecture](ARCHITECTURE.md) · [Roles](ROLES.md)
