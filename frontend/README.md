# Frontend

React (Vite + TypeScript) SPA for the Product Optimizer Platform. Provides login, submissions, providers, products, users (admin), jobs (admin), and profile. Built with [Vite](https://vitejs.dev/) and [React](https://react.dev/).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Vite) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Structure

- `src/pages/` – Home, Submissions, Providers, Products, ProductEdit, Users, Jobs, Profile, Login
- `src/components/` – Layout, Form, SubmissionList
- `src/contexts/` – AuthContext (login state, token, user, role)
- `src/services/` – `api.ts` (HTTP client and API methods)
- `src/domain/entities/` – User, Submission, Product types
- `src/presentation/` – requests/responses aligned with backend DTOs

## Auth

All app pages (except Login) require authentication. The frontend sends the JWT in requests to the backend; role-based visibility applies:

- **Administrator**: full access, including Users and Jobs.
- **Operator**: no access to Providers, Users, or Jobs; can use Submissions, Products, Profile.

## API base URL

The frontend calls the backend API (e.g. `http://localhost:3001`). Configure the base URL via environment or the app’s API service; see root [Setup](../docs/SETUP.md) for backend URL and CORS (`FRONTEND_URL`).
