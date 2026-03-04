# InstaPreview Backend - Migración a Supabase

## ✅ Completado

### Archivos modificados/creados:
1. **package.json** - Quitado `better-sqlite3`, añadido `@supabase/supabase-js`
2. **src/lib/supabase.ts** - Nuevo cliente Supabase
3. **src/lib/db.ts** - Legacy (tipos mantenidos)
4. **src/lib/storage.ts** - Reescrito para Supabase Storage
5. **src/lib/env.ts** - Añadidas variables de Supabase
6. **src/app/api/clients/route.ts** - Migrado a Supabase
7. **src/app/api/clients/[id]/route.ts** - Migrado a Supabase
8. **src/app/api/posts/route.ts** - Migrado a Supabase
9. **src/app/api/posts/[id]/route.ts** - Migrado a Supabase
10. **src/app/api/upload/route.ts** - Migrado a Supabase Storage
11. **src/app/api/public/posts/route.ts** - Migrado a Supabase
12. **src/app/api/public/clients/[slug]/route.ts** - Migrado a Supabase
13. **src/app/api/public/download/[clientSlug]/route.ts** - Migrado a Supabase
14. **src/app/api/public/media/[...path]/route.ts** - Ahora redirige a Supabase CDN
15. **supabase/schema.sql** - Esquema de base de datos
16. **.env.example** - Variables de entorno actualizadas
17. **.env.local** - Variables de entorno actualizadas

---

## 🔧 Pasos manuales pendientes

### 1. Obtener Service Role Key de Supabase

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/settings/api
2. En la sección "Project API keys", copiar el valor de `service_role secret`
3. Pegarlo en `backend/.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)
   ```

⚠️ **IMPORTANTE**: Nunca expongas esta key en el frontend. Solo usar en el servidor.

---

### 2. Crear bucket en Supabase Storage

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/storage/buckets
2. Click "New bucket"
3. Nombre: `posts`
4. ✅ Marcar "Public bucket"
5. Click "Create bucket"

---

### 3. Aplicar esquema SQL

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/sql/new
2. Copiar el contenido de `backend/supabase/schema.sql`
3. Pegar en el editor SQL
4. Click "Run"

Esto creará:
- Tabla `clients`
- Tabla `posts` con foreign key y cascade delete
- Índices para performance
- Políticas RLS para lectura pública
- Triggers para `updated_at`

---

## 🧪 Testing

Una vez completados los pasos anteriores:

```bash
cd /home/amartin/clawd/projects/instapreview/backend
npm run dev
```

Probar en orden:

1. **POST /api/auth/login** - Login con password `cacahuete`
2. **POST /api/clients** - Crear un cliente
3. **GET /api/clients** - Listar clientes
4. **POST /api/posts** - Crear un post (necesita client_id)
5. **POST /api/upload** - Subir archivos (necesita clientSlug y postId)
6. **GET /api/public/posts?clientSlug=xxx** - Ver feed público

---

## 🚀 Deploy en Vercel

Variables de entorno a configurar en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://wkblzsefmvtlbbnginst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmx6c2VmbXZ0bGJibmdpbnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjUzMTIsImV4cCI6MjA4ODE0MTMxMn0.56Rn0NrLk-Ha1xYSD7vyZ74zuaWIv_BoPasYc0T-Ur0
SUPABASE_SERVICE_ROLE_KEY=(tu service role key)
ADMIN_PASSWORD=cacahuete
JWT_SECRET=instapreview_jarvis_2026_secure_key
```

---

## 📋 Resumen de cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Base de datos | SQLite local | PostgreSQL (Supabase) |
| Storage | Filesystem local | Supabase Storage (CDN) |
| Imágenes | `/api/public/media/...` | CDN de Supabase |
| Deploy | No funcionaba en Vercel | ✅ Compatible con Vercel |

---

## ⚠️ Notas importantes

- Las imágenes ahora se sirven desde el CDN de Supabase (mucho más rápido)
- Las operaciones de base de datos son asíncronas (usar `await`)
- El service_role key tiene privilegios totales - mantener solo en servidor
- Las URLs de imágenes antiguas (`/api/public/media/...`) siguen funcionando mediante redirección
