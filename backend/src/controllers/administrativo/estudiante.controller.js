import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from "../../models/usuario.model.js";
import { Especialidad } from "../../models/especialidad.model.js";
import { Solicitud } from "../../models/solicitud.model.js";
import { sequelize } from "../../bd_config/conexion.js";
import { ESTADOS } from "../../common/estados.js";
import { crearUsuario } from "../../controllers/usuario/usuario.controller.js";
import { ROLES } from "../../common/roles.js";
import { uploadExcel } from "../../config/multer.js";
import { leerArchivoExcel } from "../../utils/excelReader.js";
import { obtenerEspecialidades } from "../../common/especialidades.js";
import { Op } from "sequelize";
export { uploadExcel };

// Procesar estudiantes en lotes para optimizar performance
const procesarEstudiantesEnLotes = async (estudiantesData, transaction, tamañoLote = 50) => {
    const resultados = [];
    
    // 1. Obtener todos los datos necesarios de una vez (optimización)
    const cedulas = estudiantesData.map(e => e.cedula);
    const usuariosExistentes = await Usuario.findAll({
        where: { cedula: cedulas },
        attributes: ['cedula', 'nombreUsuario'],
        raw: true,
        transaction
    });
    
    const estudiantesExistentes = await Estudiante.findAll({
        where: { cedula: cedulas },
        attributes: ['cedula', 'seccion'],
        raw: true,
        transaction
    });
    
    // Crear mapas para búsqueda rápida
    const mapaUsuarios = new Map(usuariosExistentes.map(u => [u.cedula, u]));
    const mapaEstudiantes = new Map(estudiantesExistentes.map(e => [e.cedula, e]));
    
    // 2. Separar estudiantes en: actualizar, crear con usuario, crear sin usuario
    const paraActualizar = [];
    const paraCrearConUsuario = [];
    const paraCrearSinUsuario = [];
    
    for (const data of estudiantesData) {
        const existeEstudiante = mapaEstudiantes.has(data.cedula);
        const existeUsuario = mapaUsuarios.has(data.cedula);
        
        if (existeEstudiante) {
            paraActualizar.push(data);
        } else if (existeUsuario) {
            paraCrearConUsuario.push(data);
        } else {
            paraCrearSinUsuario.push(data);
        }
    }
        
    // 3. Actualizar estudiantes existentes (por lotes)
    if (paraActualizar.length > 0) {
        console.log(`Actualizando ${paraActualizar.length} estudiantes...`);
        for (let i = 0; i < paraActualizar.length; i += tamañoLote) {
            const lote = paraActualizar.slice(i, i + tamañoLote);
            
            // Actualizar uno por uno pero en lote controlado
            for (const data of lote) {
                await Estudiante.update(
                    { seccion: data.seccion },
                    { where: { cedula: data.cedula }, transaction }
                );
                
                resultados.push({
                    cedula: data.cedula,
                    accion: "actualizado",
                    mensaje: "Estudiante ya existía, se actualizó la sección.",
                    usuario: mapaUsuarios.get(data.cedula)?.nombreUsuario || null
                });
            }
            
        }
    }
    
    // 4. Crear estudiantes que ya tienen usuario (por lotes)
    if (paraCrearConUsuario.length > 0) {
        console.log(`Creando ${paraCrearConUsuario.length} estudiantes con usuario existente...`);
        for (let i = 0; i < paraCrearConUsuario.length; i += tamañoLote) {
            const lote = paraCrearConUsuario.slice(i, i + tamañoLote);
            
            await Estudiante.bulkCreate(lote, {
                transaction,
                validate: false, // Más rápido
                ignoreDuplicates: true
            });
            
            lote.forEach(data => {
                resultados.push({
                    cedula: data.cedula,
                    accion: "creado",
                    mensaje: "Estudiante creado con usuario existente.",
                    usuario: mapaUsuarios.get(data.cedula)?.nombreUsuario || null
                });
            });
        }
    }
    
    // 5. Crear usuarios y estudiantes nuevos (por lotes)
    if (paraCrearSinUsuario.length > 0) {
        console.log(`Creando ${paraCrearSinUsuario.length} usuarios y estudiantes nuevos...`);
        for (let i = 0; i < paraCrearSinUsuario.length; i += tamañoLote) {
            const lote = paraCrearSinUsuario.slice(i, i + tamañoLote);
            
            // Crear usuarios y estudiantes
            for (const data of lote) {
                const resultadoUsuario = await crearUsuario({
                    cedula: data.cedula,
                    correo: data.correo,
                    estado: ESTADOS.INACTIVO,
                    rol: ROLES.ESTUDIANTE,
                    transaction
                });
                
                await Estudiante.create(data, { transaction });
                
                resultados.push({
                    cedula: data.cedula,
                    accion: "creado",
                    mensaje: "Estudiante y usuario creados.",
                    usuario: resultadoUsuario.usuario?.nombreUsuario || null,
                    contraseña: resultadoUsuario.contraseñaGenerada,
                    correo: data.correo
                });
            }
        }
    }
    
    return resultados;
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

                console.log(`Total de estudiantes en archivo: ${estudiantesData.length}`);

                // Procesar estudiantes en lotes (optimizado)
                try {
                    const resultadosArchivo = await procesarEstudiantesEnLotes(estudiantesData, t);
                    
                    // Agregar nombre de archivo a cada resultado
                    resultadosArchivo.forEach(resultado => {
                        resultados.push({
                            ...resultado,
                            archivo: file.originalname
                        });
                    });

                    // Resumen del archivo procesado
                    resumenArchivos.push({
                        archivo: file.originalname,
                        totalEstudiantes: estudiantesData.length,
                        exitosos: resultadosArchivo.filter(r => r.accion !== "error").length,
                        errores: resultadosArchivo.filter(r => r.accion === "error").length
                    });
                    
                    console.log(`Archivo procesado exitosamente`);

                } catch (error) {
                    // Si hay error al procesar lote, cancelar toda la transacción
                    await t.rollback();
                    return res.status(500).json({
                        error: "Error al procesar estudiantes en lote",
                        detalle: error.message,
                        archivo: file.originalname,
                        mensaje: "Se canceló el proceso completo debido a errores al procesar los datos"
                    });
                }

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

// Visualizar estudiantes
export const visualizar = async (req, res) => {
    try {
        // Devolver todos los estudiantes sin filtros - filtrado se hace en frontend
        const estudiantes = await Estudiante.findAll({
            include: [
                {
                    model: Usuario,
                    as: "usuario",
                    attributes: ["cedula", "nombreUsuario", "rol"]
                },
                {
                    model: Especialidad,
                    as: "especialidad"
                },
                {
                    model: Solicitud,
                    as: "solicitudes"
                }
            ]
        });
        res.status(200).json(estudiantes);
    } catch (error) {
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};

// Editar estudiante
export const editarEstudiante = async (req, res) => {
    const { cedula } = req.params;
    const { nombre, apellidoUno, apellidoDos, estado, telefono, correo, seccion, fechaNacimiento, idEspecialidad } = req.body;
    
    const t = await sequelize.transaction();
    
    try {
        const existeEstudiante = await Estudiante.findByPk(cedula, { transaction: t });
        if (!existeEstudiante) {
            await t.rollback();
            return res.status(404).json({ error: "El estudiante no existe" });
        }

        // Preparar datos para actualizar estudiante (sin incluir correo ya que no se puede cambiar)
        const updateData = {
            nombre, 
            apellidoUno, 
            apellidoDos, 
            estado, 
            telefono, 
            seccion, 
            idEspecialidad
        };
        
        // Solo incluir fechaNacimiento si se envía desde el frontend
        if (fechaNacimiento !== undefined) {
            updateData.fechaNacimiento = fechaNacimiento;
        }
        
        // Actualizar datos del estudiante
        await Estudiante.update(updateData, { where: { cedula }, transaction: t });

        // Actualizar solo los campos apropiados del usuario (sin datos estáticos)
        const camposUsuario = { estado };
        
        await Usuario.update(
            camposUsuario,
            { where: { cedula }, transaction: t }
        );

        await t.commit();
        res.status(200).json({ message: "Estudiante y usuario editados exitosamente" });
    } catch (error) {
        await t.rollback();
        console.error('Error al editar estudiante:', error);
        res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
};