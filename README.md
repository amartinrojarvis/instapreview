# InstaPreview 🚀

Preview de feed de Instagram para clientes.

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

## Estructura

```
instapreview/
├── backend/          # Next.js API + Admin panel
├── frontend/         # Next.js Preview público
└── start.sh          # Script de arranque
```

## Primer uso

1. Asegúrate de tener `.env.local` en ambas carpetas (ya creados)
2. Ejecuta `./start.sh`
3. Abre http://localhost:3001/login
4. Login con la contraseña configurada en `backend/.env.local`
5. Crea un cliente y sube contenido
6. Ve al preview: http://localhost:3000/preview/[slug-del-cliente]
