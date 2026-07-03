# Architecture

## High-level design

```text
React UI
  |
  | HTTP / JSON
  v
Express API
  |
  | Prisma
  v
PostgreSQL
```

## Backend design

- Route layer handles HTTP concerns
- Service layer holds business logic
- Repository layer owns database access
- Zod schemas validate request payloads
- Prisma models keep persistence explicit and typed

## Frontend design

- One dashboard-oriented application shell
- Feature modules for employees and insights
- Simple `useEffect`-based data fetching
- Local component state for filters, modal state, and forms

## Why this architecture

- Strong type safety across the stack
- Minimal frontend complexity
- Scales cleanly to reporting and CRUD flows
