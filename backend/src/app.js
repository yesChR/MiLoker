// Aquí se inicializa express y se le dice que permita JSON
import express from 'express';
import config from './config/config';

const nodemailer = require("./routes/nodemailer.routes");

const app = express();
const cors = require("cors");

// Configuración
app.set("port", config.port);

// Middleware
app.use(cors());
app.use(express.json());

// Rutas (Agregar todas las rutas que existan en Routes)
app.use("/nodemailer", nodemailer);

export default app;
