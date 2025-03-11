const transporter = require("../config/nodemailer");
import config from "../config/config";

export const enviarCorreo = async (req, res) => {
    const { email, asunto, texto, contenido } = req.body;
    console.log(email);
    const formato = {
        from: `${ config.email }`,
        to: email,
        subject: asunto,
        text: texto,
        html: contenido,
    }
    transporter.sendMail(formato, (error, info) => {
        if (error) {
            console.error('Error al enviar el correo:', error);
            return res.status(500).json({ message: 'Error al enviar el correo', error });
        }
        console.log('Correo enviado:', info.response);
        res.status(200).json({ message: 'Correo enviado', info });
    })
    return res.status(200);

}

