import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXEncargado.model.js';
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { actualizarEstadoUsuarioEstudiante } from "../../controllers/usuario/usuario.controller.js";
import { ESTADOS } from "../../common/estados.js";

export const visualizar = async (req, res) => {
    const cedula = req.params.cedula;
    
    if (!cedula) {
        return res.status(400).json({ error: "Debe proporcionar una cédula como parámetro" });
    }
    
    try {
        // Buscar el estudiante con sus datos completos
        const estudiante = await Estudiante.findOne({
            where: { cedula },
            include: [
                {
                    model: Usuario,
                    as: 'usuario', // Usar el alias definido en la asociación
                    attributes: ['nombreUsuario', 'estado'],
                    required: false
                },
                {
                    model: EstudianteXEncargado,
                    include: [
                        {
                            model: Encargado,
                            attributes: ['cedula', 'nombre', 'apellidoUno', 'apellidoDos', 'parentesco', 'correo', 'telefono']
                        }
                    ],
                    required: false
                }
            ]
        });

        if (!estudiante) {
            return res.status(404).json({ 
                error: "Estudiante no encontrado",
                message: "No se encontró ningún estudiante con la cédula proporcionada"
            });
        }

        // Formatear la respuesta de manera segura
        const encargados = estudiante.estudianteXencargados && Array.isArray(estudiante.estudianteXencargados) ? 
            estudiante.estudianteXencargados.map(rel => rel.encargado).filter(enc => enc !== null) : [];

        const respuesta = {
            estudiante: {
                cedula: estudiante.cedula || '',
                nombre: estudiante.nombre || '',
                apellidoUno: estudiante.apellidoUno || '',
                apellidoDos: estudiante.apellidoDos || '',
                correo: estudiante.correo || '',
                telefono: estudiante.telefono || '',
                fechaNacimiento: estudiante.fechaNacimiento || null,
                seccion: estudiante.seccion || '',
                estado: estudiante.estado || ''
            },
            usuario: estudiante.usuario ? {
                nombreUsuario: estudiante.usuario.nombreUsuario || '',
                estado: estudiante.usuario.estado || ''
            } : null,
            encargados: encargados || []
        };

        return res.status(200).json(respuesta);
    } catch (error) {
        console.error("Error al obtener datos del estudiante:", error);
        
        // Enviar respuesta de error estructurada
        return res.status(500).json({ 
            error: "Error interno del servidor", 
            message: "Error al procesar la solicitud",
            detalle: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

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

        // Actualizar también el estado del estudiante a activo
        await estudiante.update({ 
            estado: ESTADOS.ACTIVO 
        }, { transaction: t });

        // Procesar encargados
        for (const encargado of encargados) {
            const { cedula: cedulaEncargado } = encargado;

            // Verificar si ya existe el encargado
            let encargadoExistente = await Encargado.findOne({ 
                where: { cedula: cedulaEncargado }, 
                transaction: t 
            });

            if (!encargadoExistente) {
                // Crear nuevo encargado si no existe
                encargadoExistente = await Encargado.create(encargado, { transaction: t });
            } else {
                // Actualizar datos del encargado existente
                await encargadoExistente.update({
                    nombre: encargado.nombre,
                    apellidoUno: encargado.apellidoUno,
                    apellidoDos: encargado.apellidoDos,
                    parentesco: encargado.parentesco,
                    correo: encargado.correo,
                    telefono: encargado.telefono
                }, { transaction: t });
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

