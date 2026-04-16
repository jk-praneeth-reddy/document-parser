# Document Parser

Upload and parse your documents with ease.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Multer
- **Infrastructure:** Docker, Docker Compose

## Getting Started

### Option 1: Docker (Recommended)

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repo
git clone <repo-url>
cd document-parser

# 2. Create the backend env file
cp backend/.env.example backend/.env

# 3. Start everything
docker compose up --build
```

Services will be available at:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000

---

### Option 2: Run Locally (without Docker)

**Prerequisites:** Node.js installed.

#### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### Frontend (in a separate terminal)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173.

---

## Environment Variables

The backend requires a `.env` file (copy from `.env.example`):

```
NODE_ENV=development
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

> The `.env` file is not committed to git. Always create it from `.env.example` before running the project.

## Available Scripts

### Backend (`cd backend`)

| Script | Description |
|---|---|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run compiled production build |
| `npm test` | Run tests |
| `npm run type-check` | Type-check without emitting |

### Frontend (`cd frontend`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run type-check` | Type-check without emitting |
