# Deployment Notes

## Backend

- Deploy `apps/api` to Render or Railway
- Provision PostgreSQL on Neon
- Set `DATABASE_URL`
- Set `PORT`
- Run Prisma migration before first seed
- Run seed script once after deployment database is ready

## Frontend

- Deploy `apps/web` to Vercel or Netlify
- Set `VITE_API_BASE_URL` to the deployed backend URL

## Why this deployment shape

- Separates UI and API cleanly
- Keeps infrastructure lightweight for an assessment
