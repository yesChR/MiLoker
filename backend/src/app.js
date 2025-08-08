// Aquí se inicializa express y se le dice que permita JSON
import express from 'express';
import config from './config/config';
// Importación de las rutas
import nodemailer from "./routes/nodemailer.routes.js";
import authRoutes from "./routes/auth/auth.routes.js";
import administrador from "./routes/administrativo/administrador.routes.js";
import docente from "./routes/administrativo/docente.routes.js";
import estudiante from "./routes/administrativo/estudiante.routes.js";
import especialidad from "./routes/administrativo/especialidad.routes.js";
import sancion from "./routes/administrativo/sancion.routes.js";
import periodo from "./routes/administrativo/periodo.routes.js";
import casillero from "./routes/casillero/casillero.routes.js";
import estadoCasillero from "./routes/casillero/estadoCasillero.routes.js";
import solicitud from "./routes/solicitud/solicitud.routes.js";
import usuarios from "./routes/docente/usuarios.routes.js";
import alertas from "./routes/docente/alertas.routes.js";
import docenteRoutes from "./routes/docente/docente.routes.js";
import renunciaRoutes from "./routes/estudiante/renuncia.routes.js";
import milokerRoutes from "./routes/estudiante/miloker.routes.js";

const app = express();
import cors from 'cors';

// Configuración
app.set("port", config.port);

// Configurar CORS
const allowedOrigins = [
    'http://localhost:3000',
    'http://192.168.1.254:3000',
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// Rutas (Agregar todas las rutas que existan en Routes)
app.use("/nodemailer", nodemailer);

// Ruta de autenticación para NextAuth
app.use("/auth", authRoutes);

// Rutas del módulo administrativo
app.use("/administrativo/administrador", administrador);
app.use("/administrativo/docente", docente);
app.use("/administrativo/estudiante", estudiante);
app.use("/administrativo/especialidad", especialidad);
app.use("/administrativo/sancion", sancion);
app.use("/administrativo/periodo", periodo);

// Otras rutas
app.use("/casillero", casillero);
app.use("/estadoCasillero", estadoCasillero);
app.use("/solicitud", solicitud);
app.use("/usuarios", usuarios);
app.use("/alertas", alertas);
app.use("/docente", docenteRoutes);
app.use("/estudiante", renunciaRoutes);
app.use("/api/estudiante", milokerRoutes);

export default app;
