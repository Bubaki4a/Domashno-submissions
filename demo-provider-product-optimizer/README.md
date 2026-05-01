# Product Optimizer Platform

Full-stack application with React frontend and Node.js backend using Clean Architecture.

## Project Structure

```
Platform/
├── frontend/          # Vite + React + TypeScript
├── backend/           # Node.js + Express + TypeScript (Clean Architecture)
└── package.json       # Root workspace configuration
```

## Features

- ✅ React + TypeScript frontend with component-based architecture
- ✅ Node.js + Express backend with Clean Architecture
- ✅ Form submission with validation
- ✅ Data persistence in JSON file
- ✅ Display list of all submissions
- ✅ Modern UI with responsive design

## Prerequisites

- Node.js (v16 or higher)
- npm

## Installation

1. Install root dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

Or install all at once:
```bash
npm run install:all
```

## Running the Application

### Development Mode

**Start both frontend and backend with one command:**
```bash
npm run dev
```

This will start both the backend server (port 3001) and frontend dev server (port 5173) simultaneously in the same terminal.

**Or run separately:**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Or from root:**
```bash
npm run dev:backend
npm run dev:frontend
```

### Build for Production

Build both frontend and backend:
```bash
npm run build
```

Or build separately:
```bash
npm run build:frontend
npm run build:backend
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## API Endpoints

- `POST /api/submit` - Submit a new form
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello world"
  }
  ```

- `GET /api/submissions` - Get all submissions

## Architecture

### Backend (Clean Architecture)

- **Domain Layer**: Business entities and validation
- **Application Layer**: Business logic and use cases
- **Infrastructure Layer**: File system operations and Express server
- **Presentation Layer**: HTTP controllers and routes

### Frontend

- **Pages**: Page-level components
- **Components**: Reusable UI components
- **Services**: API communication
- **Types**: TypeScript type definitions

## Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express, TypeScript
- **Architecture**: Clean Architecture pattern
