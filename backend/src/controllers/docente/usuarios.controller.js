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
import { leerArchivoExcel } from "../../utils/excelReader.js";
import { obtenerEspecialidades } from "../../common/especialidades.js";
import { uploadExcel } from "../../config/multer.js";

export { uploadExcel };

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

const procesarEstudiante = async (data, transaction) => {
    const { cedula, correo, seccion } = data;

    const usuario = await Usuario.findOne({ where: { cedula }, transaction });
    const estudiante = await Estudiante.findOne({ where: { cedula }, transaction });

    if (estudiante) {
        estudiante.seccion = seccion;
        await estudiante.save({ transaction });

        return {
            cedula,
            accion: "actualizado",
            mensaje: "Estudiante ya existía, se actualizó la sección.",
            usuario: usuario?.nombreUsuario || null
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

    // Crear estudiante
    await Estudiante.create({ ...data }, { transaction });

    return {
        cedula,
        accion: "creado",
        mensaje: "Estudiante y usuario creados.",
        usuario: usuarioCreado?.nombreUsuario || null,
        contraseña: contraseñaGenerada,
        correo
    };
};

// Endpoint flexible para cargar estudiantes desde uno o múltiples archivos Excel
export const cargarEstudiantesDesdeExcel = async (req, res) => {
    const t = await sequelize.transaction();
    const resultados = [];
    const resumenArchivos = [];

    try {
        // Obtener especialidades una sola vez para optimizar performance
        const especialidadesCache = await obtenerEspecialidades();
        
        // Obtener archivos de diferentes formas (req.files viene de upload.any())
        const archivos = req.files || [];
        
        if (archivos.length === 0) {
            return res.status(400).json({ 
                error: "No se proporcionaron archivos Excel" 
            });
        }

        console.log(`Procesando ${archivos.length} archivo(s) Excel...`);

        // Procesar cada archivo
        for (let i = 0; i < archivos.length; i++) {
            const file = archivos[i];
            console.log(`Procesando archivo ${i + 1}/${archivos.length}: ${file.originalname}`);

            try {
                // Leer y procesar el archivo Excel con cache de especialidades
                const estudiantesData = await leerArchivoExcel(file.buffer, especialidadesCache);
                
                if (!estudiantesData || estudiantesData.length === 0) {
                    throw new Error(`No se encontraron datos válidos en el archivo: ${file.originalname}`);
                }

                const resultadosArchivo = [];

                // Procesar cada estudiante del archivo actual
                for (const data of estudiantesData) {
                    try {
                        const resultado = await procesarEstudiante(data, t);
                        resultadosArchivo.push(resultado);
                        resultados.push({
                            ...resultado,
                            archivo: file.originalname
                        });
                    } catch (error) {
                        // Si hay cualquier error al procesar, cancelar toda la transacción
                        await t.rollback();
                        return res.status(500).json({
                            error: "Error al procesar estudiante",
                            detalle: error.message,
                            archivo: file.originalname,
                            estudiante: `${data.nombre} ${data.apellidoUno} (${data.cedula})`,
                            mensaje: "Se canceló el proceso completo debido a errores al crear el estudiante"
                        });
                    }
                }

                // Resumen del archivo procesado
                resumenArchivos.push({
                    archivo: file.originalname,
                    totalEstudiantes: estudiantesData.length,
                    exitosos: resultadosArchivo.filter(r => r.accion !== "error").length,
                    errores: resultadosArchivo.filter(r => r.accion === "error").length
                });

            } catch (error) {
                // Error al procesar el archivo Excel (incluyendo especialidades no encontradas)
                await t.rollback();
                return res.status(400).json({ 
                    error: "Error al procesar archivo Excel",
                    archivo: file.originalname,
                    detalle: error.message,
                    mensaje: "Se canceló el proceso completo debido a errores en los datos"
                });
            }
        }

        await t.commit();
        
        // Respuesta adaptativa según cantidad de archivos
        const esMultiple = archivos.length > 1;
        
        return res.status(201).json({
            message: esMultiple 
                ? "Proceso de carga desde múltiples archivos Excel finalizado."
                : "Proceso de carga desde archivo Excel finalizado.",
            ...(esMultiple && { totalArchivos: archivos.length }),
            totalEstudiantes: resultados.length,
            exitosos: resultados.filter(r => r.accion !== "error").length,
            errores: resultados.filter(r => r.accion === "error").length,
            ...(esMultiple && { resumenPorArchivo: resumenArchivos }),
            resultados
        });
    } catch (error) {
        // Solo hacer rollback si la transacción aún está activa
        if (!t.finished) {
            await t.rollback();
        }
        return res.status(500).json({
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};