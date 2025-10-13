# MiLoker

Sistema de Gestión de Casilleros Estudiantiles

## Descripción

MiLoker es un sistema web para la gestión de casilleros en instituciones educativas. Permite a los estudiantes solicitar casilleros, a los docentes administrar las solicitudes y a los administradores supervisar todo el proceso.

## Características

- Solicitud y asignación de casilleros
- Gestión de incidentes y sanciones
- Generación de informes en PDF
- Sistema de roles (Estudiante, Docente, Administrativo)
- Notificaciones por correo electrónico

## Tecnologías

**Backend:**
- Node.js + Express
- MySQL + Sequelize
- JWT + Nodemailer

**Frontend:**
- Next.js 15
- React 18
- TailwindCSS
- HeroUI

## Instalación

Para instrucciones detalladas, consulte [INSTALLATION.md](./INSTALLATION.md)

**Requisitos:**
- Node.js v18+
- MySQL 8.0+
- npm

**Inicio rápido:**
```bash
# Clonar repositorio
git clone https://github.com/yesChR/MiLoker.git
cd MiLoker

# Backend
cd backend
npm install
# Configurar .env
npm run build
npm run seed
npm run dev

# Frontend
cd ../frontend
npm install
# Configurar .env.local
npm run dev
```

## Estructura

```
MiLoker/
├── backend/          # API REST
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── seeders/
│   └── public/uploads/
└── frontend/         # Aplicación Next.js
    ├── pages/
    ├── components/
    └── services/
```

## Equipo

**Desarrolladores:**
- Yeslin Chinchilla Ruiz
- Roger Calderón Urbina

**Proyecto:** Trabajo Comunal Universitario (TCU)  
Universidad de Costa Rica

**Supervisor:** Profesor Luiz Azofeifa  
CTP de Liverpool, Limón

## Documentación

- [Manual de Instalación](./INSTALLATION.md)
- [Manual de Usuario](./MANUAL_USUARIO.md)

---

**Versión:** 1.0.0 | **Año:** 2025