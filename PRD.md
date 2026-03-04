# InstaPreview - Product Requirements Document
## Sistema de Previews de Instagram para Clientes

**Fecha:** 2026-03-03  
**Status:** Ready for development  
**Desarrollador:** CodeSmith (OpenAI Codex)

---

## 🎯 Objetivo

Sistema web para que Alberto pueda subir hasta 4 publicaciones de Instagram (foto, carrusel o video) por cliente, y mostrarles una preview realista tipo Instagram donde puedan ver cómo quedarán antes de publicar.

---

## 📁 Estructura del Proyecto

```
/home/amartin/clawd/projects/instapreview/
├── frontend/                 # Next.js 14 - Despliegue en Vercel
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Landing simple
│   │   │   ├── preview/
│   │   │   │   └── [clientId]/
│   │   │   │       └── page.tsx  # Vista cliente (feed Instagram)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── InstagramFeed.tsx    # Feed tipo Instagram
│   │   │   ├── InstagramPost.tsx    # Post individual
│   │   │   ├── CarouselViewer.tsx   # Carrusel swipeable
│   │   │   └── VideoPlayer.tsx      # Video con controles
│   │   └── lib/
│   │       └── api.ts        # Cliente API
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                  # Next.js 14 - ThinkPad local
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   │   ├── auth/
│   │   │   │   │   └── route.ts     # Login con password
│   │   │   │   ├── clients/
│   │   │   │   │   └── route.ts     # CRUD clientes
│   │   │   │   ├── posts/
│   │   │   │   │   └── route.ts     # CRUD publicaciones
│   │   │   │   └── upload/
│   │   │   │       └── route.ts     # Upload archivos
│   │   │   ├── admin/
│   │   │   │   └── page.tsx         # Panel admin (protegido)
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── ClientManager.tsx
│   │   │   └── PostUploader.tsx
│   │   ├── lib/
│   │   │   ├── db.ts         # SQLite client
│   │   │   ├── auth.ts       # Middleware auth
│   │   │   └── storage.ts    # File system storage
│   │   └── middleware.ts     # Auth middleware
│   ├── uploads/              # Directorio para archivos
│   ├── database/
│   │   └── instapreview.db   # SQLite database
│   ├── package.json
│   └── next.config.js
│
└── docs/
    └── README.md
```

---

## 🎨 Diseño Frontend (Vista Cliente)

### Feed tipo Instagram
- **Header:** Logo cliente + título "Preview"
- **Grid:** Posts en layout Instagram (1 columna móvil, 3 desktop)
- **Post individual:**
  - Header: Avatar genérico + nombre cliente + "•"
  - Media: Imagen/video/carrusel (swipeable)
  - Actions: Like, comment, share, save (iconos, no funcionales)
  - Likes: "X me gusta"
  - Caption: Username + texto + hashtags
  - Comments: "Ver X comentarios"
  - Timestamp: "HACE X HORAS"
- **Botón flotante:** "Descargar todo" (ZIP con las 4 publicaciones)

### Estilo visual
- Fondo: Blanco (#FFFFFF) o modo oscuro opcional
- Tipografía: Instagram-like (San Francisco / Inter)
- Iconos: Heroicons o similar
- Animaciones: Like con corazón, swipe carrusel, hover effects

---

## 🔧 Backend (Panel Admin)

### Autenticación
- **Login:** Simple password en variable `ADMIN_PASSWORD`
- **Session:** JWT token en localStorage
- **Protección:** Middleware en rutas /admin/*

### Gestión de Clientes
- **Crear cliente:** Nombre, código (slug para URL), descripción
- **Listar clientes:** Tabla con nombre, código, posts activos, URL pública
- **Eliminar cliente:** Con confirmación (borra posts + archivos)
- **URL pública:** `https://instapreview.vercel.app/preview/[client-slug]`

### Gestión de Posts (máx 4 por cliente)
- **Crear post:**
  - Tipo: single (foto) / carousel (2-10 imágenes) / video
  - Archivos: Upload múltiple (drag & drop)
  - Caption: Texto + hashtags
  - Orden: 1-4 (posición en el feed)
- **Editar post:** Modificar caption, reordenar, reemplazar archivos
- **Eliminar post:** Con confirmación
- **Preview inmediato:** Ver cómo queda antes de guardar

### Almacenamiento Archivos
- **Ruta:** `/home/amartin/clawd/projects/instapreview/backend/uploads/[client-slug]/[post-id]/`
- **Nomenclatura:**
  - Foto: `1.jpg`, `2.jpg`, etc.
  - Video: `video.mp4`
  - Thumbnail video: `thumb.jpg`
- **Límites:**
  - Fotos: 10MB max, JPG/PNG/WebP
  - Videos: 100MB max, MP4/MOV
  - Carrusel: máx 10 imágenes

---

## 🗄️ Esquema Base de Datos (SQLite)

```sql
-- Tabla: clients
CREATE TABLE clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,  -- URL-friendly
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: posts
CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    type TEXT CHECK(type IN ('single', 'carousel', 'video')) NOT NULL,
    position INTEGER CHECK(position BETWEEN 1 AND 4),
    caption TEXT,
    hashtags TEXT,  -- Separados por espacios
    likes_count INTEGER DEFAULT 0,  -- Para mostrar en preview
    file_count INTEGER DEFAULT 1,  -- 1 para single/video, N para carousel
    storage_path TEXT NOT NULL,  -- Ruta relativa en uploads/
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    UNIQUE(client_id, position)  -- Máx 4 posts por cliente
);

-- Índices
CREATE INDEX idx_posts_client ON posts(client_id);
CREATE INDEX idx_posts_position ON posts(client_id, position);
CREATE INDEX idx_clients_slug ON clients(slug);
```

---

## 🔌 API Endpoints

### Auth
- `POST /api/auth/login` - { password } → { token, expires }
- `POST /api/auth/logout` - Invalida token
- `GET /api/auth/verify` - Verifica token válido

### Clientes (protegido)
- `GET /api/clients` - Lista todos los clientes
- `POST /api/clients` - Crea nuevo cliente
- `GET /api/clients/[id]` - Detalle cliente
- `PUT /api/clients/[id]` - Actualiza cliente
- `DELETE /api/clients/[id]` - Elimina cliente + posts

### Posts (protegido)
- `GET /api/posts?clientId=xxx` - Posts de un cliente
- `POST /api/posts` - Crea nuevo post
- `GET /api/posts/[id]` - Detalle post
- `PUT /api/posts/[id]` - Actualiza post
- `DELETE /api/posts/[id]` - Elimina post

### Upload (protegido)
- `POST /api/upload` - Multipart/form-data → { fileUrl, filePath }

### Público (no auth)
- `GET /api/public/clients/[slug]` - Info cliente público
- `GET /api/public/posts?clientSlug=xxx` - Posts públicos de cliente
- `GET /api/public/download/[clientSlug]` - ZIP con todas las publicaciones

---

## 📦 Dependencias

### Frontend (Vercel)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.0.0",
    "lucide-react": "^0.300.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### Backend (ThinkPad)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "better-sqlite3": "^9.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "multer": "^1.4.5",
    "archiver": "^6.0.0",
    "uuid": "^9.0.0",
    "tailwindcss": "^3.4.0"
  }
}
```

---

## 🔐 Variables de Entorno

### Backend (.env.local)
```
ADMIN_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=clave_secreta_jwt_random
UPLOAD_DIR=./uploads
DATABASE_URL=./database/instapreview.db
PORT=3001
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Deployment

### Frontend (Vercel)
1. Push a GitHub: `instapreview-frontend`
2. Import en Vercel
3. Configurar env var: `NEXT_PUBLIC_API_URL`
4. Deploy automático

### Backend (ThinkPad)
1. Instalar dependencias: `npm install`
2. Crear directorios: `mkdir -p uploads database`
3. Setear `.env.local`
4. Build: `npm run build`
5. Start: `npm start` (pm2 para producción)
6. Nginx reverse proxy si es necesario

---

## ✅ Checklist Desarrollo

### Fase 1: Backend Core
- [ ] Setup proyecto Next.js backend
- [ ] Configurar SQLite con better-sqlite3
- [ ] Crear tablas (clients, posts)
- [ ] Implementar auth (password + JWT)
- [ ] CRUD clientes
- [ ] CRUD posts
- [ ] Upload archivos (multer)
- [ ] API pública para frontend
- [ ] Endpoint download ZIP

### Fase 2: Frontend Core
- [ ] Setup proyecto Next.js frontend
- [ ] Configurar Tailwind
- [ ] Página preview/[clientId]
- [ ] Componente InstagramFeed
- [ ] Componente InstagramPost
- [ ] Carrusel swipeable
- [ ] Video player
- [ ] Botón descargar ZIP

### Fase 3: Panel Admin
- [ ] Login page
- [ ] Dashboard admin
- [ ] Gestión clientes (lista, crear, editar, eliminar)
- [ ] Gestión posts (upload, preview, ordenar, eliminar)
- [ ] Protección rutas admin

### Fase 4: Polish
- [ ] Animaciones Framer Motion
- [ ] Responsive design
- [ ] Modo oscuro opcional
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications

### Fase 5: Documentación
- [ ] README.md con instrucciones
- [ ] .env.example
- [ ] Guía deployment

---

## 📝 Notas adicionales

- **URL pública cliente:** `https://instapreview.vercel.app/preview/[slug]`
- **Límite posts:** Hard limit de 4 por cliente en DB
- **Orden posts:** Campo position (1-4), editable por drag & drop o select
- **Preview realista:** Usar métricas reales de Instagram (ratios, espaciado, iconos)
- **Descarga:** ZIP contiene todas las imágenes/videos + caption en txt

---

## 🎯 Entregables esperados

1. **Backend funcional** en `/projects/instapreview/backend/`
2. **Frontend funcional** en `/projects/instapreview/frontend/`
3. **Base de datos** inicializada con SQLite
4. **Documentación** en `/projects/instapreview/docs/`
5. **README** con instrucciones de uso y deployment

---

**¿Listo para empezar el desarrollo?** Adelante CodeSmith.
