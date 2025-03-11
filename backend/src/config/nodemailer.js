import nodemailer from "nodemailer";
import config from "./config";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth:{
        user: config.email,
        pass: config.pass,
    },
});

transporter.verify()
.then(()=> console.log("Conectado exitosamente"))
.catch(error => console.error(error));

module.exports = transporter;