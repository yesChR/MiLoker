const { Router } = require("express");
const nodemailer = Router();
import { enviarCorreo } from '../controllers/nodemailer.controller'

nodemailer.post("/", enviarCorreo);

module.exports = nodemailer;