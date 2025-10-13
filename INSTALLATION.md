# Manual de Instalación - MiLoker

Guía paso a paso para instalar MiLoker en Ubuntu Server.

## Requisitos del Sistema

- Ubuntu Server 20.04+
- Node.js v18+
- MySQL 8.0+
- 4 GB RAM mínimo
- 20 GB espacio en disco

## Instalación en Ubuntu Server

### 1. Actualizar el Sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version
```

### 3. Instalar MySQL

```bash
sudo apt install mysql-server -y
sudo systemctl start mysql
sudo systemctl enable mysql
sudo mysql_secure_installation
```

### 4. Instalar PM2

```bash
sudo npm install -g pm2
```

### 5. Instalar nginx

```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Configurar Base de Datos

Acceder a MySQL:

```bash
sudo mysql -u root -p
```

Crear base de datos y usuario:

```sql
CREATE DATABASE miloker_db;
CREATE USER 'miloker_user'@'localhost' IDENTIFIED BY 'tu_contraseña';
GRANT ALL PRIVILEGES ON miloker_db.* TO 'miloker_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Configurar Backend

### 1. Clonar el proyecto

```bash
cd /var/www
sudo git clone https://github.com/yesChR/MiLoker.git
sudo chown -R $USER:$USER /var/www/MiLoker
cd /var/www/MiLoker/backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env`:

```bash
nano .env
```

Agregar:

```env
PORT=5000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=3306
DB_NAME=miloker_db
DB_USER=miloker_user
DB_PASSWORD=tu_contraseña

JWT_SECRET=tu_secreto_jwt_seguro
JWT_EXPIRES_IN=24h

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
EMAIL_FROM=MiLoker <tu_correo@gmail.com>

FRONTEND_URL=http://tu-dominio.com
```

### 4. Inicializar base de datos

```bash
npm run build
npm run seed
```

### 5. Crear carpeta de uploads

```bash
mkdir -p public/uploads/evidencias
chmod 755 public/uploads
```

## Configurar Frontend

### 1. Ir a carpeta frontend

```bash
cd /var/www/MiLoker/frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local`:

```bash
nano .env.local
```

Agregar:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://tu-dominio.com
NEXTAUTH_SECRET=tu_secreto_nextauth
```

### 4. Compilar para producción

```bash
npm run build
```

## Desplegar con PM2

### Backend

```bash
cd /var/www/MiLoker/backend
pm2 start dist/index.js --name miloker-backend
pm2 save
pm2 startup
```

### Frontend

```bash
cd /var/www/MiLoker/frontend
pm2 start npm --name miloker-frontend -- start
pm2 save
```

## Configurar nginx

Crear archivo de configuración:

```bash
sudo nano /etc/nginx/sites-available/miloker
```

Agregar:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/MiLoker/backend/public/uploads;
    }
}
```

Habilitar sitio:

```bash
sudo ln -s /etc/nginx/sites-available/miloker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Configurar Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

## Comandos Útiles

### PM2

```bash
pm2 status              # Ver estado
pm2 logs               # Ver logs
pm2 restart all        # Reiniciar todo
pm2 stop all           # Detener todo
```

### Actualizar sistema

```bash
cd /var/www/MiLoker
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart miloker-backend

# Frontend
cd ../frontend
npm install
npm run build
pm2 restart miloker-frontend
```

### Backup de base de datos

```bash
mysqldump -u miloker_user -p miloker_db > backup.sql
```

## Solución de Problemas

**Error de conexión a MySQL:**
```bash
sudo systemctl status mysql
sudo systemctl restart mysql
```

**El backend no inicia:**
```bash
pm2 logs miloker-backend
# Revisar el archivo .env
```

**Problemas de permisos:**
```bash
sudo chown -R $USER:$USER /var/www/MiLoker
chmod -R 755 /var/www/MiLoker
```

**nginx no funciona:**
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

---

**Desarrolladores:** Yeslin Chinchilla Ruiz, Roger Calderón Urbina  
**Supervisor:** Profesor Luiz Azofeifa - CTP de Liverpool, Limón  
**Universidad de Costa Rica - TCU**
