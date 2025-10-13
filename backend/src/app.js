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
import docenteRoutes from "./routes/docente/docente.routes.js";
import renunciaRoutes from "./routes/estudiante/renuncia.routes.js";
import milokerRoutes from "./routes/estudiante/miloker.routes.js";
import informeRoutes from "./routes/informe/informe.routes.js";
import { incidenteRoutes } from "./routes/incidente/incidente.routes.js";
import uploadRoutes from "./routes/evidencia/upload.routes.js";
import evidenciaRoutes from "./routes/evidencia/evidencia.routes.js";

const app = express();
import cors from 'cors';

// Configuración
app.set("port", config.port);

// Configurar CORS
const allowedOrigins = [
    config.frontend_url,
    config.frontend_local_url,
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
}));

app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('public/uploads'));

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
app.use("/docente", docenteRoutes);
app.use("/estudiante", renunciaRoutes);
app.use("/api/estudiante", milokerRoutes);
app.use("/informe", informeRoutes);
app.use("/incidente", incidenteRoutes);
app.use("/upload", uploadRoutes);
app.use("/evidencia", evidenciaRoutes);

export default app;
