// Aquí se inicializa express y se le dice que permita JSON
import express from 'express';
import config from './config/config';

const nodemailer = require("./routes/nodemailer.routes");
const administrador= require("./routes/administrativo/administrador.routes");
const profesor = require("./routes/administrativo/profesor.routes");
const estudiante = require("./routes/administrativo/estudiante.routes");
const especialidad = require("./routes/administrativo/especialidad.routes");
const sancion = require("./routes/administrativo/sancion.routes");

const app = express();
const cors = require("cors");

// Configuración
app.set("port", config.port);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas (Agregar todas las rutas que existan en Routes)
app.use("/nodemailer", nodemailer);
app.use("/administrador", administrador);
app.use("/profesor", profesor);
app.use("/estudiante", estudiante);
app.use("/especialidad", especialidad);
app.use("/sancion", sancion);

export default app;
