const transporter = require("../../config/nodemailer");
import config from "../../config/config.js";

// Función reutilizable para enviar correos
export async function enviarCorreo({ to, subject, text, html }) {
    const formato = {
        from: `${config.email}`,
        to,
        subject,
        text,
        html,
    };
    return new Promise((resolve, reject) => {
        transporter.sendMail(formato, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return reject(error);
            }
            resolve(info);
        });
    });
}

