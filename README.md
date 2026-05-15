# Portfolio (Vite + Express)

This repo contains:
- Frontend: Vite + React (static build)
- Backend: Express API + Postgres database + local uploads

## Environment variables

Backend (VPS):
- `PORT` (default `8787`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET` (required in production)
- `PUBLIC_BASE_URL` (example: `https://api.example.com`)
- `CORS_ORIGIN` (comma-separated frontend origins)
- `DATABASE_URL` (Postgres connection string)
- `DATABASE_SSL` (`true` if your Postgres requires SSL)

Frontend (static host):
- `VITE_API_BASE_URL` (example: `https://api.example.com`)

## Local development

```bash
npm install
npm run dev
```

## Import existing JSON data into Postgres

```bash
npm run db:import
```

Optional: point to a custom JSON file.

```bash
STORE_JSON_PATH=/absolute/path/to/portfolio-store.json npm run db:import
```

## VPS deployment (backend)

1) Install dependencies
```bash
npm install
```

2) Set environment variables (example)
```bash
export PORT=8787
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD=change-me
export JWT_SECRET=change-me
export DATABASE_URL=postgres://user:pass@host:5432/portfolio
export DATABASE_SSL=false
export PUBLIC_BASE_URL=https://api.example.com
export CORS_ORIGIN=https://your-frontend.com
```

3) Start the server
```bash
npm run start
```

The backend serves uploads from `/uploads` and API routes under `/api/*`.

## Frontend deployment

1) Build
```bash
npm install
VITE_API_BASE_URL=https://api.example.com npm run build
```

2) Deploy the `dist` folder to your static host.

## Notes
- Uploads are stored on the backend filesystem under `public/uploads`.
- `PUBLIC_BASE_URL` ensures image URLs are absolute when frontend and backend are on different domains.
- `CORS_ORIGIN` must include the exact frontend origin for admin login to work with cookies.
