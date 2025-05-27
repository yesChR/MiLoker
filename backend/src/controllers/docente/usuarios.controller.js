import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXEncargado.model.js';
import { actualizarEstadoUsuario } from "../usuario/usuario.controller.js";
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";

const ROL_ESTUDIANTE = 3;
const ESTADO_ACTIVO = 2;

export const habilitarUsuario = async (req, res) => {
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
        // 1️⃣ Buscar primero si el estudiante existe
        const estudiante = await Estudiante.findOne({
            where: { cedula },
            transaction: t
        });

        if (!estudiante) {
            await t.rollback();
            return res.status(404).json({ error: "Estudiante no encontrado" });
        }

        // 2️⃣ Verificar si ya tiene un usuario creado
        const usuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        if (!usuario) {
            await t.rollback();
            return res.status(404).json({ error: "El estudiante no tiene un usuario registrado" });
        }

        // 3️⃣ Cambiar el estado del usuario a activo (2)
        await actualizarEstadoUsuario({ cedula, estado: ESTADO_ACTIVO, transaction: t });

        // 4️⃣ Procesar encargados
        for (const encargado of encargados) {
            const {
                cedula: cedulaEncargado,
                nombre,
                apellidoUno,
                apellidoDos,
                parentesco,
                correo: correoEncargado,
                telefono
            } = encargado;

            // Verificar si ya existe el encargado
            let encargadoExistente = await Encargado.findOne({ where: { cedula: cedulaEncargado }, transaction: t });

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

        // 5️⃣ Enviar correo de bienvenida al usuario
        await enviarCorreo({
            to: correo,
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

        // 6️⃣ Confirmar transacción
        await t.commit();
        res.status(200).json({ message: "Usuario habilitado y encargados asociados correctamente" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};


export const crearEstudiantesYUsuariosBatch = async (req, res) => {
    const t = await sequelize.transaction();
    const resultados = [];
    const estudiantesData = req.body.estudiantes;

    try {
        for (const data of estudiantesData) {
            // Buscar si el estudiante ya existe
            let estudiante = await Estudiante.findOne({
                where: { cedula: data.cedula },
                transaction: t
            });

            let usuario = await Usuario.findOne({
                where: { cedula: data.cedula },
                transaction: t
            });

            if (estudiante) {
                // Si el estudiante existe, actualiza la sección si es diferente
                if (data.seccion && estudiante.seccion !== data.seccion) {
                    estudiante.seccion = data.seccion;
                    await estudiante.save({ transaction: t });
                }
                resultados.push({
                    cedula: data.cedula,
                    accion: "actualizado",
                    mensaje: "Estudiante ya existía, sección actualizada si era necesario.",
                    usuario: usuario ? usuario.nombreUsuario : null
                });
                continue; // No crear usuario ni estudiante de nuevo
            }

            // Si el estudiante no existe, lo crea
            estudiante = await Estudiante.create({
                cedula: data.cedula,
                nombre: data.nombre,
                apellidoUno: data.apellidoUno,
                apellidoDos: data.apellidoDos,
                estado: data.estado ?? 1,
                telefono: data.telefono,
                correo: data.correo,
                seccion: data.seccion,
                fechaNacimiento: data.fechaNacimiento,
                idEspecialidad: data.idEspecialidad
            }, { transaction: t });

            let contraseñaGenerada = null;
            let usuarioCreado = null;

            // Si el usuario no existe, lo crea      
            if (!usuario) {
                contraseñaGenerada = generatePassword.generate({
                    length: 10,
                    numbers: true,
                    symbols: true,
                    uppercase: true,
                    lowercase: true,
                    strict: true
                });
                const contraseñaHash = await bcrypt.hash(contraseñaGenerada, 10);

                usuarioCreado = await Usuario.create({
                    cedula: data.cedula,
                    nombreUsuario: data.correo.split('@')[0],
                    contraseña: contraseñaHash,
                    rol: data.rol ?? 3, // 3 = Estudiante
                    estado: 2, // Activo
                    token: null
                }, { transaction: t });
            }

            resultados.push({
                cedula: data.cedula,
                accion: "creado",
                mensaje: "Estudiante y usuario creados.",
                usuario: usuarioCreado ? usuarioCreado.nombreUsuario : null,
                contraseña: contraseñaGenerada,
                correo: data.correo
            });
        }

        await t.commit();
        return res.status(201).json({
            message: "Proceso de carga finalizado.",
            resultados
        });
    } catch (error) {
        await t.rollback();
        return res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};