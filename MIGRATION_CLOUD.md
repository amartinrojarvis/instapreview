# 🔄 Migración InstaPreview → Cloud

**Desde:** Local (SQLite + filesystem)  
**Hacia:** Cloud (Supabase + Vercel)

---

## 📋 Cambios Necesarios

### 1. Base de datos: SQLite → Supabase Postgres

**Actual:** `better-sqlite3` con archivo local  
**Nuevo:** `@supabase/supabase-js` o Prisma/Drizzle

```typescript
// Nuevo: src/lib/db.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Queries cambian de:
// db.prepare('SELECT * FROM clients').all()
// A:
// const { data, error } = await supabase.from('clients').select('*')
```

**Schema a migrar:**
```sql
-- Tabla clients
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla posts
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('single', 'carousel', 'video')),
  position INTEGER DEFAULT 0,
  caption TEXT,
  hashtags TEXT,
  likes_count INTEGER DEFAULT 0,
  storage_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Storage: Filesystem → Supabase Storage

**Actual:** Archivos en `backend/uploads/{clientSlug}/{postId}/`  
**Nuevo:** Bucket `posts` en Supabase Storage

```typescript
// Subir archivo
const { data, error } = await supabase.storage
  .from('posts')
  .upload(`${clientSlug}/${postId}/${filename}`, file)

// URL pública
const { data } = supabase.storage
  .from('posts')
  .getPublicUrl(`${clientSlug}/${postId}/${filename}`)
```

### 3. Auth: JWT local → Supabase Auth

**Actual:** Password + JWT en cookie  
**Nuevo:** Supabase Auth (magic link o password)

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'xxx'
})

// El auth se maneja automáticamente con cookies
```

### 4. Estructura: Monorepo → Single Next.js

**Actual:**
```
instapreview/
├── backend/   (Next.js API routes)
└── frontend/  (Next.js pages)
```

**Nuevo:**
```
instapreview/
├── src/app/           # Frontend + API routes
│   ├── api/           # API routes (antes backend)
│   ├── preview/       # Preview público
│   └── admin/         # Panel admin
├── src/lib/supabase.ts
└── src/components/
```

---

## 🛠️ Plan de Migración

### Fase 1: Setup (30 min)
- [ ] Crear proyecto Supabase
- [ ] Crear bucket `posts` (público)
- [ ] Crear tablas clients y posts
- [ ] Configurar Auth (email/password)
- [ ] Copiar credenciales

### Fase 2: Refactor Backend (2-3h)
- [ ] Reemplazar `better-sqlite3` por `@supabase/supabase-js`
- [ ] Migrar endpoints `/api/clients` → Supabase
- [ ] Migrar endpoints `/api/posts` → Supabase
- [ ] Migrar `/api/upload` → Supabase Storage
- [ ] Migrar `/api/public/*` → usar Storage directo
- [ ] Migrar auth a Supabase Auth

### Fase 3: Refactor Frontend (1-2h)
- [ ] Actualizar `lib/api.ts` para usar Supabase
- [ ] Fix URLs de imágenes (usar public URL de Storage)
- [ ] Unificar en un solo proyecto

### Fase 4: Deploy (30 min)
- [ ] Crear repo GitHub
- [ ] Conectar Vercel
- [ ] Configurar env vars
- [ ] Test completo

---

## 📊 Esfuerzo Estimado

| Tarea | Tiempo | Complejidad |
|-------|--------|-------------|
| Setup Supabase | 30 min | 🟢 Baja |
| Migrar DB layer | 2-3h | 🟡 Media |
| Migrar Storage | 1h | 🟡 Media |
| Migrar Auth | 1h | 🟡 Media |
| Unificar proyecto | 2h | 🟡 Media |
| Deploy | 30 min | 🟢 Baja |
| **Total** | **~7-8h** | |

---

## 💡 Alternativa: Mantener Local + Tunnel

Si la migración es mucho trabajo ahora, alternativa rápida:

```bash
# Exponer local con Cloudflare Tunnel (gratis)
npx cloudflared tunnel --url http://localhost:3001
```

Pros:
- Sin cambios de código
- URL pública temporal
- Gratis

Contras:
- Solo funciona mientras tu máquina está encendida
- No es profesional para demos a clientes

---

## 🎯 Recomendación

**Opción A (ideal):** Migrar a Supabase + Vercel cuando InstaPreview esté estable y funcional. Inversión de ~1 día de trabajo.

**Opción B (rápida):** Usar Cloudflare Tunnel para demos puntuales mientras se desarrolla.

**Próximo paso:** Decidir después de que Smith termine el rediseño UI.

---

*Documento creado: 2026-03-04*
