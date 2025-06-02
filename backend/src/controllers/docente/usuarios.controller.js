import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXEncargado.model.js';
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { crearUsuario, actualizarEstadoUsuarioEstudiante } from "../../controllers/usuario/usuario.controller.js";
import { ROLES } from "../../common/roles.js";
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
        // 1️⃣ Buscar primero si el estudiante existe
        const estudiante = await Estudiante.findOne({
            where: { cedula },
            attributes: ['correo'],
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

        // 3️⃣ Cambiar el estado del usuario a activo
        const { contraseñaGenerada } = await actualizarEstadoUsuarioEstudiante({ cedula, estado: ESTADOS.ACTIVO, transaction: t });

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

        // 6️⃣ Confirmar transacción
        await t.commit();
        res.status(200).json({ message: "Usuario habilitado y encargados asociados correctamente" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};

const procesarEstudiante = async (data, transaction) => {
    const { cedula, correo, seccion } = data;

    let usuario = await Usuario.findOne({ where: { cedula }, transaction });
    let estudiante = await Estudiante.findOne({ where: { cedula }, transaction });

    if (estudiante) {
        estudiante.seccion = seccion;
        await estudiante.save({ transaction });

        return {
            cedula,
            accion: "actualizado",
            mensaje: "Estudiante ya existía, se actualizó la sección.",
            usuario: usuario ? usuario.nombreUsuario : null
        };
    }

    // Crear usuario si no existe
    let usuarioCreado = usuario;
    let contraseñaGenerada = null;

    if (!usuario) {
        const resultadoUsuario = await crearUsuario({
            cedula,
            correo,
            rol: ROLES.ESTUDIANTE,
            transaction
        });
        usuarioCreado = resultadoUsuario.usuario;
        contraseñaGenerada = resultadoUsuario.contraseñaGenerada;
    }

    // Crear estudiante (después de crear usuario)
    estudiante = await Estudiante.create({ ...data }, { transaction });

    return {
        cedula,
        accion: "creado",
        mensaje: "Estudiante y usuario creados.",
        usuario: usuarioCreado ? usuarioCreado.nombreUsuario : null,
        contraseña: contraseñaGenerada,
        correo
    };
};

export const cargarEstudiantes = async (req, res) => {
    const t = await sequelize.transaction();
    const resultados = [];
    const estudiantesDataArchivo = [
        {
            cedula: 1001,
            nombre: "Ana",
            apellidoUno: "García",
            apellidoDos: "López",
            estado: 1,
            telefono: "88889999",
            correo: "ana.garcia@email.com",
            seccion: "A",
            fechaNacimiento: "2005-03-15",
            idEspecialidad: 1
        },
        {
            cedula: 1002,
            nombre: "Luis",
            apellidoUno: "Martínez",
            apellidoDos: "Pérez",
            estado: 1,
            telefono: "87776666",
            correo: "luis.martinez@email.com",
            seccion: "B",
            fechaNacimiento: "2004-11-22",
            idEspecialidad: 1
        },
    ];


    try {
        const estudiantesData = estudiantesDataArchivo;

        for (const data of estudiantesData) {
            const resultado = await procesarEstudiante(data, t);
            resultados.push(resultado);
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