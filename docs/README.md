# InstaPreview

Sistema de previews tipo Instagram para clientes.

## Estructura
- `backend/` (Next.js 14) — API + Admin + SQLite + uploads (local ThinkPad)
- `frontend/` (Next.js 14) — Vista pública `/preview/[slug]` (Vercel)

## Requisitos
- Node.js 20+

## Backend (local)

```bash
cd backend
cp .env.example .env.local
# edita .env.local (ADMIN_PASSWORD, JWT_SECRET)

npm install
npm run dev
# corre en http://localhost:3001
```

Admin:
- `http://localhost:3001/login`
- `http://localhost:3001/admin`

Uploads:
- Se guardan en `backend/uploads/<client-slug>/<post-id>/...`

## Frontend (local)

```bash
cd frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

npm install
npm run dev
# corre en http://localhost:3000
```

Vista cliente:
- `http://localhost:3000/preview/<client-slug>`

Descarga ZIP:
- Botón "Descargar todo" llama a `GET /api/public/download/<clientSlug>` en el backend.

## API (resumen)
- Auth: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/verify`
- CRUD: `GET/POST /api/clients`, `GET/PUT/DELETE /api/clients/:id`
- CRUD: `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`
- Upload: `POST /api/upload` (multipart)
- Público: `GET /api/public/posts?clientSlug=...`, `GET /api/public/download/<clientSlug>`, `GET /api/public/media/...`

## Notas
- El auth es intencionalmente simple (password + JWT cookie) para uso interno.
- SQLite se auto-inicializa en el primer arranque (`better-sqlite3`).
