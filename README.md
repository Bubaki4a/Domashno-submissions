# Product Optimizer Platform

Full-stack application for managing submissions, providers, products, and background jobs (import/enrich) with role-based access. React frontend and Node.js backend using Clean Architecture.

## Project Structure

```
Platform/
├── docs/              # Documentation (API, architecture, setup)
├── frontend/          # Vite + React + TypeScript
├── backend/           # Node.js + Express + TypeScript (Clean Architecture)
└── package.json       # Root workspace configuration
```

## Features

- **Auth**: JWT login, profile update, roles (`administrator`, `manager`, `operator`)
- **Submissions**: Create, list, get, update (with validation)
- **Providers**: List providers, sync from external catalog (e.g. EasyGifts), normalize products
- **Products**: List, get, update, AI-powered enhance (DeepInfra)
- **Users**: List and create users (admin only)
- **Jobs**: Trigger import/enrich, list runs, failed products, retry (admin only); optional cron scheduler
- **Storage**: MySQL or file-based (configurable via `STORAGE_DRIVER`)

## Prerequisites

- Node.js (v16 or higher)
- npm
- MySQL (when using database storage)

## Installation

1. Install dependencies:

   ```bash
   npm install
   npm run install:all
   ```

2. Configure environment and database: see [Setup](docs/SETUP.md) for environment variables and database setup.

## Running the Application

**Development (both frontend and backend):**

```bash
npm run dev
```

See [Setup](docs/SETUP.md) for environment variables and database.

**Or run separately:**

```bash
npm run dev:backend
npm run dev:frontend
```

### Build for Production

```bash
npm run build
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health check**: http://localhost:3001/health

## API

See [API Reference](docs/API.md) for all endpoints (auth, submissions, providers, products, users, jobs).

## Architecture

Backend follows Clean Architecture (domain, application, infrastructure, presentation). Frontend is a React SPA with auth context and hash routing. See [Architecture](docs/ARCHITECTURE.md) for layers, data flow, and roles; [Use Cases](docs/usecases/README.md) for application-layer use cases (one file per use case in `docs/usecases/`).

## Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript, Clean Architecture
- **Storage**: MySQL (with migrations) or file
- **Auth**: JWT
- **AI**: DeepInfra (product enhancement)
- **Jobs**: node-cron (optional scheduled import/enrich)
