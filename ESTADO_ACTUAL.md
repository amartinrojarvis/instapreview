# InstaPreview - Estado Actual y Configuración

## ✅ Completado

### Backend (Next.js + Supabase)
- ✅ Migración a Supabase PostgreSQL completada
- ✅ Todos los endpoints API migrados:
  - `/api/auth/login` - Autenticación
  - `/api/clients` - CRUD de clientes
  - `/api/posts` - CRUD de posts
  - `/api/upload` - Subida de archivos a Supabase Storage
  - `/api/public/posts` - Feed público (con CORS)
  - `/api/public/download/[slug]` - Descarga ZIP (con CORS)
- ✅ Cliente Supabase configurado con Service Role Key
- ✅ CORS implementado para endpoints públicos
- ✅ Admin Dashboard funcional
- ✅ Subida de archivos a Supabase Storage

### Frontend (Next.js)
- ✅ Diseño tipo Instagram completo
- ✅ Página de preview `/preview/[clientId]`
- ✅ Componentes UI (InstagramFeed, InstagramPost, ProfileHeader, etc.)
- ✅ Consumo de API backend configurado
- ✅ Soporte para imágenes, carruseles y videos
- ✅ Botón de descarga ZIP

## 🔧 Configuración Pendiente

### 1. Supabase Service Role Key
**Archivo:** `backend/.env.local`

El `SUPABASE_SERVICE_ROLE_KEY` tiene un placeholder. Necesitas:

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/settings/api
2. Copiar el valor de `service_role secret`
3. Pegarlo en `backend/.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)
```

### 2. Crear Bucket en Supabase Storage
1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/storage/buckets
2. Click "New bucket"
3. Nombre: `posts`
4. ✅ Marcar "Public bucket"
5. Click "Create bucket"

### 3. Aplicar Esquema SQL (si no está hecho)
1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/sql/new
2. Copiar el contenido de `backend/supabase/schema.sql`
3. Click "Run"

## 🚀 Arrancar en Local

```bash
cd /home/amartin/clawd/projects/instapreview

# Opción 1: Script automático
./start.sh

# Opción 2: Manual
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## 📋 URLs

- Backend: http://localhost:3001
- Admin: http://localhost:3001/login
- Frontend: http://localhost:3000
- Preview cliente: http://localhost:3000/preview/[client-slug]

**Login admin:**
- Password: `cacahuete`

## 🧪 Flujo de Test

1. **Crear cliente:**
   - Ir a http://localhost:3001/login
   - Login con password `cacahuete`
   - Crear un cliente (ej: slug "demo-cliente")

2. **Crear post:**
   - Seleccionar el cliente
   - Crear un post tipo "single" o "carousel"
   - Subir imágenes

3. **Ver preview:**
   - Ir a http://localhost:3000/preview/demo-cliente
   - Verificar que se muestra el feed tipo Instagram

4. **Descargar ZIP:**
   - Click en botón "Descargar todo"
   - Verificar que se descarga el ZIP con los archivos

## 🚀 Deploy en Vercel

### Variables de entorno en Vercel:

**Backend:**
```
NEXT_PUBLIC_SUPABASE_URL=https://wkblzsefmvtlbbnginst.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYmx6c2VmbXZ0bGJibmdpbnN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NjUzMTIsImV4cCI6MjA4ODE0MTMxMn0.56Rn0NrLk-Ha1xYSD7vyZ74zuaWIv_BoPasYc0T-Ur0
SUPABASE_SERVICE_ROLE_KEY=(tu service role key)
ADMIN_PASSWORD=cacahuete
JWT_SECRET=instapreview_jarvis_2026_secure_key
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://tu-backend.vercel.app
```

## ⚠️ Notas Importantes

1. **Service Role Key:** Nunca expongas esta key en el frontend. Solo usar en el servidor.

2. **CORS:** Los endpoints públicos ya tienen CORS configurado para permitir peticiones desde cualquier origen.

3. **Storage:** Las imágenes se sirven directamente desde el CDN de Supabase (más rápido que pasar por el backend).

4. **Límites:**
   - Máximo 4 posts por cliente
   - Carrusel: máximo 10 imágenes
   - Imágenes: máximo 10MB
   - Videos: máximo 100MB

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verificar que `.env.local` existe en `backend/`
- Verificar que todas las variables están definidas

### Error: "Bucket not found"
- Crear el bucket "posts" en Supabase Storage
- Marcarlo como público

### Error de CORS
- Los endpoints públicos ya tienen CORS configurado
- Si persiste, verificar que el backend está usando `withCors()` en las respuestas

### Las imágenes no cargan
- Verificar que el bucket "posts" es público
- Verificar que las URLs en la respuesta de la API son correctas
