# Medical AI Assistant – Frontend

React frontend for the Medical AI Assistant. Connects to the FastAPI backend at `/api/v1/chat`.

## Requirements

- Node.js 18+
- npm or yarn

## Setup

```bash
cd frontend
npm install
```

## Run locally

1. Start the FastAPI backend first (from project root):

   ```bash
   uvicorn backend.main:app --reload
   ```

2. Start the frontend dev server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies `/api` requests to `http://127.0.0.1:8000`, so the frontend talks to your local backend.

## Build for production

```bash
npm run build
```

Output is in `dist/`. Serve it with any static file server, and ensure `/api` is proxied to your FastAPI backend.
