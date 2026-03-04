# InstaPreview 🚀

Preview de feed de Instagram para clientes.

## ⚡ Estado Actual

✅ Backend migrado a Supabase PostgreSQL
✅ Frontend con diseño tipo Instagram
✅ Admin panel funcional
✅ CORS configurado para endpoints públicos

🔧 **Pendiente:** Configurar Service Role Key de Supabase (ver abajo)

## Arranque rápido

```bash
cd /home/amartin/clawd/projects/instapreview
./start.sh
```

Esto abre:
- **Backend** en http://localhost:3001
- **Frontend** en http://localhost:3000

## URLs importantes

| URL | Descripción |
|-----|-------------|
| http://localhost:3001/login | Panel de administración |
| http://localhost:3000/preview/[slug] | Preview del cliente |

## Comandos

```bash
./start.sh                    # Arranca todo
./start.sh backend            # Solo backend
./start.sh frontend           # Solo frontend
./start.sh stop               # Detiene todo
./start.sh restart            # Reinicia todo
./start.sh restart backend    # Reinicia solo backend
./start.sh restart frontend   # Reinicia solo frontend
./start.sh status             # Muestra estado
```

## Configuración de Supabase (Obligatorio)

### 1. Obtener Service Role Key

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/settings/api
2. Copiar el valor de `service_role secret`
3. Editar `backend/.env.local`:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ... (tu service role key)
```

### 2. Crear Bucket Storage

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/storage/buckets
2. Click "New bucket"
3. Nombre: `posts`
4. ✅ Marcar "Public bucket"
5. Click "Create bucket"

### 3. Aplicar Schema SQL

1. Ir a: https://app.supabase.com/project/wkblzsefmvtlbbnginst/sql/new
2. Copiar contenido de `backend/supabase/schema.sql`
3. Click "Run"

## Estructura

```
instapreview/
├── backend/          # Next.js API + Admin panel
│   ├── src/app/api/  # Endpoints API
│   ├── supabase/     # Schema SQL
│   └── .env.local    # Configuración (editar!)
├── frontend/         # Next.js Preview público
└── start.sh          # Script de arranque
```

## Primer uso

1. Completa la configuración de Supabase (arriba)
2. Ejecuta `./start.sh`
3. Abre http://localhost:3001/login
4. Login con password: `cacahuete`
5. Crea un cliente y sube contenido
6. Ve al preview: http://localhost:3000/preview/[slug-del-cliente]

## Deploy en Vercel

Ver documento completo: `ESTADO_ACTUAL.md`

## Documentación adicional

- `ESTADO_ACTUAL.md` - Estado detallado y troubleshooting
- `MIGRATION.md` - Notas de migración a Supabase
- `backend/supabase/schema.sql` - Esquema de base de datos
