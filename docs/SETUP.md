# Setup Guide

This guide covers prerequisites, installation, environment variables, database setup, and running the Product Optimizer Platform.

## Prerequisites

- **Node.js** v16 or higher
- **npm**
- **MySQL** (when using database storage; not required for file storage)

## Installation

1. Clone the repository and go to the project root.

2. Install dependencies:

   ```bash
   npm install
   npm run install:all
   ```

   `install:all` installs root, frontend, and backend workspace dependencies.

## Environment Variables

Configure the backend by copying `backend/.env.example` to `backend/.env` and filling in values. All variables are optional and have defaults where noted.

| Variable | Description | Default |
|----------|-------------|---------|
| **Server** | | |
| `PORT` | Backend HTTP port | `3001` |
| `FRONTEND_URL` | Allowed CORS origin for the frontend | `http://localhost:5173` |
| **Database** | | |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | (empty) |
| `DB_NAME` | MySQL database name | `somerch_product_optimizer` |
| `DB_CONNECTION_LIMIT` | Connection pool size | (driver default) |
| **Storage** | | |
| `STORAGE_DRIVER` | `file` or `database` | `file` |
| `DATA_FILE_PATH` | Path to JSON file (file driver only) | (internal default) |
| **Auth** | | |
| `JWT_SECRET` | Secret for signing JWT tokens | `dev-secret-change-in-production` |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) | `7d` |
| **AI (product enhancement)** | | |
| `AI_PROVIDER` | AI provider; currently only `deepinfra` | `deepinfra` |
| `DEEP_INFRA_KEY` | DeepInfra API key (required for enhance) | (required if using AI) |
| `DEEP_INFRA_MODEL` | Model name (optional) | (provider default) |
| `AI_PROMPT_VERSION` | Prompt version for logging | `v1` |
| **Providers** | | |
| `EASYGIFTS_API_URL` | EasyGifts API base URL (required for EasyGifts provider) | (required for sync) |
| **Jobs (cron)** | | |
| `CRON_ENABLED` | Enable scheduled jobs (`true` / `1`) | (disabled) |
| `CRON_IMPORT_SCHEDULE` | Cron expression for import job | `0 */6 * * *` (every 6 hours) |
| `CRON_ENRICH_SCHEDULE` | Cron expression for enrich job | `*/15 * * * *` (every 15 minutes) |
| `ENRICH_BATCH_SIZE` | Max products per enrich run | `25` |

## Database Setup (when using `STORAGE_DRIVER=database`)

1. Create the MySQL database:

   ```sql
   CREATE DATABASE somerch_product_optimizer;
   ```

2. Set database-related env vars in `backend/.env` (e.g. `DB_NAME`, `DB_USER`, `DB_PASSWORD`).

3. Run migrations (from project root or from `backend/`):

   ```bash
   npm run migrate
   ```

   Or from backend:

   ```bash
   cd backend
   npm run migrate
   ```

4. Seed the default admin user (from `backend/`):

   ```bash
   cd backend
   npm run seed
   ```

   This creates an administrator with email `k@k.com` and password `1` if no user with that email exists. **Change the password after first login in production.**

## Running the Application

**Development (both frontend and backend):**

```bash
npm run dev
```

- Backend: http://localhost:3001  
- Frontend: http://localhost:5173  

**Or run separately:**

```bash
npm run dev:backend   # Backend only
npm run dev:frontend  # Frontend only
```

## Build for Production

```bash
npm run build
```

This builds both backend and frontend. To run the backend in production:

```bash
cd backend
npm run start
```

Serve the frontend `frontend/dist` with your preferred static file server or reverse proxy.

## Testing

- **Unit tests**: See [Backend README](../backend/README.md) for `npm run test`.
- **Integration tests**: Require a test database; see [Backend README](../backend/README.md) for `npm run test:integration` and test DB setup.
