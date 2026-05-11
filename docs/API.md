# API Reference

Base URL: `http://localhost:3001/api` (or your backend `PORT` and host).

## Authentication

Protected routes require a JWT in the request header:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`. The response includes `data.token` and `data.user`.

- **Public**: `POST /api/auth/login`
- **Protected** (any logged-in user): submissions, providers, products, `GET /api/auth/me`, `PUT /api/auth/profile`
- **Admin only** (role `administrator`): `GET /api/users`, `POST /api/users`, all ` /api/admin/jobs/*` routes

---

## Auth

### POST /api/auth/login

Login and get a JWT. Public.

**Request body:**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "User Name",
      "role": "administrator",
      "createdAt": "2026-01-15T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Errors:** 400 (missing email/password), 401 (invalid credentials).

---

### GET /api/auth/me

Return the current user. Requires auth.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "administrator",
    "createdAt": "2026-01-15T10:00:00.000Z"
  }
}
```

---

### PUT /api/auth/profile

Update current user profile. Requires auth.

**Request body (all optional):**

```json
{
  "name": "New Name",
  "email": "new@example.com",
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

**Response (200):** Same shape as `GET /api/auth/me` `data`. Errors: 400 (e.g. wrong current password), 401.

---

## Submissions

All submission routes require auth.

### POST /api/submit

Create a submission.

**Request body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello world"
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello world",
    "createdAt": "2026-01-15T10:00:00.000Z"
  },
  "message": "Submission created successfully"
}
```

---

### GET /api/submissions

List all submissions (e.g. sorted by date).

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "message": "Hello world",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/submissions/:id

Get one submission by id. Returns 404 if not found.

**Response (200):** Same single-submission shape as in the list above (in `data`).

---

### PUT /api/submissions/:id

Update a submission. Body same as POST /api/submit. Returns 404 if not found.

**Response (200):** Same as POST response with updated fields.

---

## Providers

All provider routes require auth.

### GET /api/providers

List configured providers and their status.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "name": "easygifts",
        "displayName": "EasyGifts",
        "isConfigured": true,
        "lastSync": "2026-01-15T10:00:00.000Z",
        "productsCount": 42
      }
    ]
  }
}
```

---

### POST /api/providers/:provider/sync

Sync products from the given provider (e.g. `easygifts`). Requires `EASYGIFTS_API_URL` for EasyGifts.

**Response (200 or 207):**

```json
{
  "success": true,
  "data": {
    "provider": "easygifts",
    "sourceFilename": "...",
    "productsCount": 100,
    "processedCount": 98,
    "errors": []
  },
  "message": "Successfully synchronized 98 products from easygifts"
}
```

207 is used when sync completed with some errors; `errors` array and message reflect that.

---

### POST /api/providers/:provider/normalize

Normalize products for the given provider.

**Response (200 or 207):**

```json
{
  "success": true,
  "data": {
    "processedCount": 98,
    "errors": [],
    "provider": "easygifts"
  },
  "message": "Successfully normalized 98 products"
}
```

---

## Products

All product routes require auth.

### GET /api/products

List normalized products. Optional query: `category`, `name`, `catalogNumber`, `providerId`.

**Example:** `GET /api/products?providerId=easygifts&category=Gifts`

**Response (200):**

```json
{
  "products": [
    {
      "id": "prod-123",
      "providerId": "easygifts",
      "name": "Product Name",
      "category": "Gifts",
      "sku": "SKU-001",
      "price": "19.99",
      "description": "...",
      "imageUrl": "https://...",
      "stock": 10,
      "provider": "easygifts",
      "normalizedName": "...",
      "normalizedDescription": "...",
      "normalizedCategory": "...",
      "events": []
    }
  ]
}
```

---

### GET /api/products/:providerId/:id

Get one product by provider and id. Returns 404 if not found.

**Response (200):** Single product object (same shape as in the list) with `providerId` included.

---

### PUT /api/products/:providerId/:id

Update a product. Body can include: `name`, `price`, `description`, `imageUrl`, `category`, `sku`, `stock`, `provider`, `normalizedName`, `normalizedDescription`, `normalizedCategory`, `metadata`, `events`. Omitted fields keep existing values.

**Response (200):** Updated product object with `providerId`.

---

### POST /api/products/:providerId/:id/enhance

Call AI to generate suggested “events” (e.g. merchant gift ideas). Does not persist; client can save via PUT. Requires `DEEP_INFRA_KEY`.

**Response (200):**

```json
{
  "id": "prod-123",
  "providerId": "easygifts",
  "name": "...",
  "events": ["Event 1", "Event 2", "..."],
  "...": "other product fields"
}
```

Errors: 404 (product not found), 503 (e.g. AI key missing).

---

## Users (admin only)

Require role `administrator`.

### GET /api/users

List all users.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin",
      "role": "administrator",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/users

Create a user.

**Request body:**

```json
{
  "email": "newuser@example.com",
  "password": "secure-password",
  "name": "Display Name",
  "role": "operator"
}
```

`role` can be `administrator`, `manager`, or `operator`; defaults to `operator` if invalid or omitted.

**Response (201):** Same user shape as in the list (no password).

---

## Jobs (admin only)

All job routes are under `/api/admin/jobs` and require role `administrator`.

### POST /api/admin/jobs/import

Trigger import job. Optional body: `{ "providerId": "easygifts" }`.

**Response (200 or 207):**

```json
{
  "success": true,
  "runId": 1,
  "status": "success",
  "processedCount": 50,
  "successCount": 50,
  "failedCount": 0,
  "error": null
}
```

---

### POST /api/admin/jobs/enrich

Trigger enrich job. Optional body: `{ "providerId": "easygifts", "batchSize": 25 }`.

**Response (200 or 207):** Same shape as import (runId, status, processedCount, successCount, failedCount, error).

---

### GET /api/admin/jobs

List pipeline runs. Query: `job_name`, `status`, `limit`.

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jobName": "import",
      "providerId": "easygifts",
      "status": "success",
      "startedAt": "2026-01-15T10:00:00.000Z",
      "finishedAt": "2026-01-15T10:05:00.000Z",
      "processedCount": 50,
      "successCount": 50,
      "failedCount": 0,
      "error": null,
      "metadata": {}
    }
  ]
}
```

---

### GET /api/admin/jobs/:id

Get one pipeline run by id. Returns 404 if not found.

**Response (200):** Single run object as in the list above.

---

### GET /api/admin/jobs/failed-products

List products that failed enrichment. Query: `provider_id` (optional).

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "providerId": "easygifts",
      "productId": "prod-123",
      "error": "AI timeout",
      "...": "other fields"
    }
  ]
}
```

---

### POST /api/admin/jobs/retry-failed

Reset failed products so they can be retried. Optional body: `{ "providerId": "easygifts" }`.

**Response (200):**

```json
{
  "success": true,
  "resetCount": 5
}
```

---

## Root and health

- **GET /** – API info and list of endpoint groups (no auth).
- **GET /health** – Health check; returns `{ "status": "ok", "timestamp": "..." }` (no auth).
