# Backend

Node.js + Express + TypeScript API with Clean Architecture. Handles auth (JWT), submissions, providers (sync/normalize), products (CRUD + AI enhance), users, and background jobs (import/enrich). Storage can be file-based or MySQL (see [Setup](../docs/SETUP.md)).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (tsx watch) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run production server (`node dist/...`) |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed default admin user |
| `npm run migration:create` | Create a new migration file |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:integration` | Integration tests (real DB + API) |
| `npm run test:all` | Unit then integration tests |

## Environment

See [Setup](../docs/SETUP.md) for all variables. Critical ones:

- `STORAGE_DRIVER` – `file` or `database`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` – for MySQL
- `JWT_SECRET` – required in production
- `EASYGIFTS_API_URL` – for EasyGifts provider sync
- `DEEP_INFRA_KEY` – for product enhancement (AI)

Copy `backend/.env.example` to `.env` and fill in values.

## Run

**Development:** `npm run dev` (from `backend/` or root `npm run dev:backend`).

**Production:** After `npm run build`, run `npm run start`.

## Database

When using `STORAGE_DRIVER=database`: create the MySQL database, then run migrations (`npm run migrate`) and seed (`npm run seed`). See [Setup](../docs/SETUP.md).

## Testing

### Unit tests

```bash
npm run test
```

Runs Vitest on `src/**/*.test.ts` (mocked dependencies).

### Integration tests

Integration tests use a **real MySQL database** and hit the HTTP API (health, auth, protected routes).

1. **Create the test database** (once):

   ```sql
   CREATE DATABASE somerch_product_optimizer_test;
   ```

2. **Run integration tests** (from `backend/`):

   ```bash
   npm run test:integration
   ```

   Tests read their configuration from `.env.test` (if present) or fall back to sane defaults (e.g. `DB_NAME=somerch_product_optimizer_test`, `STORAGE_DRIVER=database`). Before the suite, global setup runs migrations and seeds the admin user (`k@k.com` / `1`).

3. **.env.test**: copy the template and adjust if needed: `cp .env.test.example .env.test` (or create `backend/.env.test` from `backend/.env.test.example`). This configures DB host, user, password, and DB name for integration tests.

### Run all tests

```bash
npm run test:all
```

Runs unit tests then integration tests.
