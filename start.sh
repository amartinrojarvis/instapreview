#!/bin/bash
# InstaPreview - Script de arranque rápido
# Uso: ./start.sh          -> Arranca back + front en terminales separadas
#      ./start.sh backend  -> Solo backend
#      ./start.sh frontend -> Solo frontend
#      ./start.sh restart  -> Reinicia todo
#      ./start.sh restart backend  -> Reinicia solo backend
#      ./start.sh restart frontend -> Reinicia solo frontend

set -e

PROJECT_ROOT="/home/amartin/clawd/projects/instapreview"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════╗"
    echo "║        InstaPreview - Arranque           ║"
    echo "╚══════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_env() {
    local dir=$1
    local name=$2
    if [ ! -f "$dir/.env.local" ]; then
        echo -e "${RED}❌ Error: No existe $dir/.env.local${NC}"
        echo -e "${YELLOW}💡 Copia el ejemplo: cp $dir/.env.example $dir/.env.local${NC}"
        return 1
    fi
    return 0
}

start_backend() {
    echo -e "${GREEN}▶️  Arrancando Backend (puerto 3001)...${NC}"
    cd "$BACKEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
        npm install
    fi
    
    gnome-terminal --tab --title="InstaPreview Backend" -- bash -c "
        echo -e '${BLUE}Backend corriendo en http://localhost:3001${NC}'
        echo -e '${BLUE}Admin: http://localhost:3001/login${NC}'
        echo ''
        cd $BACKEND_DIR && npm run dev
    " 2>/dev/null || \
    konsole --new-tab -p tabtitle="InstaPreview Backend" -e bash -c "
        echo -e '${BLUE}Backend corriendo en http://localhost:3001${NC}'
        echo -e '${BLUE}Admin: http://localhost:3001/login${NC}'
        echo ''
        cd $BACKEND_DIR && npm run dev
    " 2>/dev/null || \
    xterm -T "InstaPreview Backend" -e bash -c "
        echo 'Backend corriendo en http://localhost:3001'
        echo 'Admin: http://localhost:3001/login'
        cd $BACKEND_DIR && npm run dev
    " 2>/dev/null || {
        echo -e "${YELLOW}⚠️  No se pudo abrir terminal automática. Arrancando en background...${NC}"
        cd "$BACKEND_DIR" && npm run dev > /tmp/instapreview-backend.log 2>&1 &
        echo $! > /tmp/instapreview-backend.pid
        echo -e "${GREEN}✅ Backend arrancado en background (PID: $(cat /tmp/instapreview-backend.pid))${NC}"
        echo -e "${YELLOW}   Logs: tail -f /tmp/instapreview-backend.log${NC}"
    }
}

start_frontend() {
    echo -e "${GREEN}▶️  Arrancando Frontend (puerto 3000)...${NC}"
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
        npm install
    fi
    
    gnome-terminal --tab --title="InstaPreview Frontend" -- bash -c "
        echo -e '${BLUE}Frontend corriendo en http://localhost:3000${NC}'
        echo -e '${BLUE}Preview ejemplo: http://localhost:3000/preview/cliente-demo${NC}'
        echo ''
        cd $FRONTEND_DIR && npm run dev
    " 2>/dev/null || \
    konsole --new-tab -p tabtitle="InstaPreview Frontend" -e bash -c "
        echo -e '${BLUE}Frontend corriendo en http://localhost:3000${NC}'
        echo -e '${BLUE}Preview ejemplo: http://localhost:3000/preview/cliente-demo${NC}'
        echo ''
        cd $FRONTEND_DIR && npm run dev
    " 2>/dev/null || \
    xterm -T "InstaPreview Frontend" -e bash -c "
        echo 'Frontend corriendo en http://localhost:3000'
        echo 'Preview ejemplo: http://localhost:3000/preview/cliente-demo'
        cd $FRONTEND_DIR && npm run dev
    " 2>/dev/null || {
        echo -e "${YELLOW}⚠️  No se pudo abrir terminal automática. Arrancando en background...${NC}"
        cd "$FRONTEND_DIR" && npm run dev > /tmp/instapreview-frontend.log 2>&1 &
        echo $! > /tmp/instapreview-frontend.pid
        echo -e "${GREEN}✅ Frontend arrancado en background (PID: $(cat /tmp/instapreview-frontend.pid))${NC}"
        echo -e "${YELLOW}   Logs: tail -f /tmp/instapreview-frontend.log${NC}"
    }
}

stop_all() {
    echo -e "${YELLOW}🛑 Deteniendo InstaPreview...${NC}"
    
    if [ -f /tmp/instapreview-backend.pid ]; then
        kill $(cat /tmp/instapreview-backend.pid) 2>/dev/null && echo -e "${GREEN}✅ Backend detenido${NC}"
        rm -f /tmp/instapreview-backend.pid
    fi
    
    if [ -f /tmp/instapreview-frontend.pid ]; then
        kill $(cat /tmp/instapreview-frontend.pid) 2>/dev/null && echo -e "${GREEN}✅ Frontend detenido${NC}"
        rm -f /tmp/instapreview-frontend.pid
    fi
    
    # Matar procesos por puerto como fallback
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}✅ Todo detenido${NC}"
}

stop_backend() {
    echo -e "${YELLOW}🛑 Deteniendo Backend...${NC}"
    if [ -f /tmp/instapreview-backend.pid ]; then
        kill $(cat /tmp/instapreview-backend.pid) 2>/dev/null && echo -e "${GREEN}✅ Backend detenido${NC}"
        rm -f /tmp/instapreview-backend.pid
    fi
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
}

stop_frontend() {
    echo -e "${YELLOW}🛑 Deteniendo Frontend...${NC}"
    if [ -f /tmp/instapreview-frontend.pid ]; then
        kill $(cat /tmp/instapreview-frontend.pid) 2>/dev/null && echo -e "${GREEN}✅ Frontend detenido${NC}"
        rm -f /tmp/instapreview-frontend.pid
    fi
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
}

show_status() {
    echo -e "${BLUE}📊 Estado de InstaPreview:${NC}"
    echo ""
    
    if lsof -ti:3001 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: http://localhost:3001 (activo)${NC}"
    else
        echo -e "${RED}❌ Backend: (detenido)${NC}"
    fi
    
    if lsof -ti:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: http://localhost:3000 (activo)${NC}"
    else
        echo -e "${RED}❌ Frontend: (detenido)${NC}"
    fi
    
    echo ""
    echo "URLs útiles:"
    echo "  - Admin: http://localhost:3001/login"
    echo "  - Preview cliente: http://localhost:3000/preview/[client-slug]"
}

# Main
case "${1:-all}" in
    all)
        print_banner
        check_env "$BACKEND_DIR" "backend" || exit 1
        check_env "$FRONTEND_DIR" "frontend" || exit 1
        start_backend
        sleep 2
        start_frontend
        echo ""
        echo -e "${GREEN}✅ InstaPreview arrancado!${NC}"
        echo ""
        echo "📍 URLs:"
        echo "   Backend:  http://localhost:3001"
        echo "   Frontend: http://localhost:3000"
        echo "   Admin:    http://localhost:3001/login"
        echo ""
        echo -e "${YELLOW}💡 Para detener: ./start.sh stop${NC}"
        ;;
    backend)
        check_env "$BACKEND_DIR" "backend" || exit 1
        start_backend
        ;;
    frontend)
        check_env "$FRONTEND_DIR" "frontend" || exit 1
        start_frontend
        ;;
    stop)
        stop_all
        ;;
    status)
        show_status
        ;;
    restart)
        case "${2:-all}" in
            backend)
                echo -e "${BLUE}🔄 Reiniciando Backend...${NC}"
                stop_backend
                sleep 1
                check_env "$BACKEND_DIR" "backend" || exit 1
                start_backend
                ;;
            frontend)
                echo -e "${BLUE}🔄 Reiniciando Frontend...${NC}"
                stop_frontend
                sleep 1
                check_env "$FRONTEND_DIR" "frontend" || exit 1
                start_frontend
                ;;
            all)
                echo -e "${BLUE}🔄 Reiniciando InstaPreview...${NC}"
                stop_all
                sleep 1
                check_env "$BACKEND_DIR" "backend" || exit 1
                check_env "$FRONTEND_DIR" "frontend" || exit 1
                start_backend
                sleep 2
                start_frontend
                echo ""
                echo -e "${GREEN}✅ InstaPreview reiniciado!${NC}"
                ;;
            *)
                echo "Uso: ./start.sh restart [all|backend|frontend]"
                exit 1
                ;;
        esac
        ;;
    *)
        echo "Uso: ./start.sh [all|backend|frontend|stop|restart|status]"
        echo ""
        echo "  all              - Arranca backend + frontend (default)"
        echo "  backend          - Solo backend (puerto 3001)"
        echo "  frontend         - Solo frontend (puerto 3000)"
        echo "  stop             - Detiene todo"
        echo "  restart [svc]    - Reinicia todo, backend o frontend"
        echo "  status           - Muestra estado"
        exit 1
        ;;
esac
