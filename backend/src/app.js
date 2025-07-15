// Aquí se inicializa express y se le dice que permita JSON
import express from 'express';
import config from './config/config';
// Importación de las rutas
import nodemailer from "./routes/nodemailer.routes.js";
import administrador from "./routes/administrativo/administrador.routes.js";
import docente from "./routes/administrativo/docente.routes.js";
import estudiante from "./routes/administrativo/estudiante.routes.js";
import especialidad from "./routes/administrativo/especialidad.routes.js";
import sancion from "./routes/administrativo/sancion.routes.js";
import periodo from "./routes/administrativo/periodo.routes.js";
import casillero from "./routes/casillero/casillero.routes.js";
import solicitud from "./routes/solicitud/solicitud.routes.js";
import usuarios from "./routes/docente/usuarios.routes.js";
import alertas from "./routes/docente/alertas.routes.js";

const app = express();
const cors = require("cors");

// Configuración
app.set("port", config.port);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas (Agregar todas las rutas que existan en Routes)
app.use("/nodemailer", nodemailer);

// Rutas del módulo administrativo
app.use("/administrativo/administrador", administrador);
app.use("/administrativo/docente", docente);
app.use("/administrativo/estudiante", estudiante);
app.use("/administrativo/especialidad", especialidad);
app.use("/administrativo/sancion", sancion);
app.use("/administrativo/periodo", periodo);

// Otras rutas
app.use("/casillero", casillero);
app.use("/solicitud", solicitud);
app.use("/usuarios", usuarios);
app.use("/alertas", alertas);

export default app;
