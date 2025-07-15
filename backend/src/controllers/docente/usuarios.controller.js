import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXEncargado.model.js';
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { actualizarEstadoUsuarioEstudiante } from "../../controllers/usuario/usuario.controller.js";
import { ESTADOS } from "../../common/estados.js";

export const habilitarUsuarioEstudiante = async (req, res) => {
    const cedula = req.params.cedula;
    const encargados = req.body.encargados;

    if (!cedula) {
        return res.status(400).json({ error: "Debe proporcionar una cédula como query param" });
    }

    if (!Array.isArray(encargados) || encargados.length === 0) {
        return res.status(400).json({ error: "Debe incluir al menos un encargado" });
    }

    const t = await sequelize.transaction();

    try {
        // Buscar si el estudiante existe
        const estudiante = await Estudiante.findOne({
            where: { cedula },
            attributes: ['correo'],
            transaction: t
        });

        if (!estudiante) {
            await t.rollback();
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        // Verificar si ya tiene un usuario creado
        const usuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ error: "El estudiante no tiene un usuario registrado" });
        }

        // Cambiar el estado del usuario a activo
        const { contraseñaGenerada } = await actualizarEstadoUsuarioEstudiante({ 
            cedula, 
            estado: ESTADOS.ACTIVO, 
            transaction: t 
        });

        // Procesar encargados
        for (const encargado of encargados) {
            const { cedula: cedulaEncargado } = encargado;

            // Verificar si ya existe el encargado
            let encargadoExistente = await Encargado.findOne({ 
                where: { cedula: cedulaEncargado }, 
                transaction: t 
            });

            if (!encargadoExistente) {
                encargadoExistente = await Encargado.create(encargado, { transaction: t });
            }

            // Verificar si ya existe la relación
            const yaRelacion = await EstudianteXEncargado.findOne({
                where: {
                    cedulaEstudiante: cedula,
                    cedulaEncargado: cedulaEncargado
                },
                transaction: t
            });

            if (!yaRelacion) {
                await EstudianteXEncargado.create({
                    cedulaEstudiante: cedula,
                    cedulaEncargado: cedulaEncargado
                }, { transaction: t });
            }
        }

        // Enviar correo de bienvenida
        await enviarCorreo({
            to: estudiante.correo,
            subject: "Tu cuenta ha sido creada",
            text: `Hola ${estudiante.nombre} ${estudiante.apellidoUno}, tu contraseña es: ${contraseñaGenerada}`,
            html: plantillaNuevaCuenta({
                titulo: "Bienvenido a MiLoker",
                mensaje: `Hola ${estudiante.nombre} ${estudiante.apellidoUno}, tu cuenta ha sido creada exitosamente. Aquí tienes tus credenciales de acceso:`,
                datos: [
                    { label: "Usuario", valor: usuario.nombreUsuario },
                    { label: "Contraseña", valor: contraseñaGenerada }
                ]
            })
        });

        await t.commit();
        res.status(200).json({ message: "Usuario habilitado y encargados asociados correctamente" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};

