import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXencargado.model.js';
import { plantillaNuevaCuenta } from "../nodemailer/plantillas.js";
import { enviarCorreo } from "../nodemailer/nodemailer.controller.js";
import { actualizarEstadoUsuarioEstudiante } from "../../controllers/usuario/usuario.controller.js";
import { ESTADOS } from "../../common/estados.js";

// Función auxiliar para validar los datos de entrada
const validarDatosEntrada = (cedula, encargados) => {
    if (!cedula) {
        return { error: "Debe proporcionar una cédula como query param", status: 400 };
    }

    if (!Array.isArray(encargados) || encargados.length === 0) {
        return { error: "Debe incluir al menos un encargado", status: 400 };
    }

    if (encargados.length > 2) {
        return { error: "No se pueden registrar más de 2 encargados por estudiante", status: 400 };
    }

    return null; // Sin errores
};

// Función auxiliar para gestionar encargados
const gestionarEncargados = async (cedula, encargados, transaction) => {
    // 1. Obtener encargados actuales del estudiante
    const encargadosActuales = await EstudianteXEncargado.findAll({
        where: { cedulaEstudiante: cedula },
        attributes: ['cedulaEncargado'],
        transaction
    });

    const cedulasActuales = encargadosActuales.map(rel => rel.cedulaEncargado);
    const cedulasNuevas = encargados.map(enc => enc.cedula);

    // 2. Identificar cambios necesarios
    const cedulasAEliminar = cedulasActuales.filter(cedula => !cedulasNuevas.includes(cedula));
    const cedulasAAgregar = cedulasNuevas.filter(cedula => !cedulasActuales.includes(cedula));

    // 3. Eliminar solo las relaciones que ya no deben existir
    if (cedulasAEliminar.length > 0) {
        await EstudianteXEncargado.destroy({
            where: { 
                cedulaEstudiante: cedula,
                cedulaEncargado: cedulasAEliminar
            },
            transaction
        });
    }

    // 4. Procesar todos los encargados (agregar + actualizar)
    for (const encargado of encargados) {
        const { cedula: cedulaEncargado } = encargado;

        // Verificar si ya existe el encargado en la tabla Encargado
        let encargadoExistente = await Encargado.findOne({ 
            where: { cedula: cedulaEncargado }, 
            transaction 
        });

        if (!encargadoExistente) {
            // Crear nuevo encargado si no existe
            encargadoExistente = await Encargado.create(encargado, { transaction });
        } else {
            // Actualizar datos del encargado existente
            await encargadoExistente.update({
                nombre: encargado.nombre,
                apellidoUno: encargado.apellidoUno,
                apellidoDos: encargado.apellidoDos,
                parentesco: encargado.parentesco,
                correo: encargado.correo,
                telefono: encargado.telefono
            }, { transaction });
        }

        // 5. Crear relación solo si es nueva
        if (cedulasAAgregar.includes(cedulaEncargado)) {
            await EstudianteXEncargado.create({
                cedulaEstudiante: cedula,
                cedulaEncargado: cedulaEncargado
            }, { transaction });
        }
    }
};

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

    // Validar datos de entrada usando función auxiliar
    const errorValidacion = validarDatosEntrada(cedula, encargados);
    if (errorValidacion) {
        return res.status(errorValidacion.status).json({ error: errorValidacion.error });
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

        // Verificar si el usuario ya estaba activo para determinar si enviar correo
        const usuarioYaActivo = usuario.estado === ESTADOS.ACTIVO;
        const estudianteYaActivo = estudiante.estado === ESTADOS.ACTIVO;
        const yaEstabaHabilitado = usuarioYaActivo && estudianteYaActivo;

        let contraseñaGenerada = null;

        // Solo cambiar estado y generar contraseña si no estaba activo
        if (!yaEstabaHabilitado) {
            // Cambiar el estado del usuario a activo y generar nueva contraseña
            const resultado = await actualizarEstadoUsuarioEstudiante({ 
                cedula, 
                estado: ESTADOS.ACTIVO, 
                transaction: t 
            });
            contraseñaGenerada = resultado.contraseñaGenerada;

            // Actualizar también el estado del estudiante a activo
            await estudiante.update({ 
                estado: ESTADOS.ACTIVO 
            }, { transaction: t });
        }

        // Gestionar encargados usando función auxiliar
        await gestionarEncargados(cedula, encargados, t);

        // Enviar correo SOLO si el usuario no estaba habilitado anteriormente
        if (!yaEstabaHabilitado && contraseñaGenerada) {
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
        }

        await t.commit();
        
        // Respuesta diferenciada según la acción realizada
        const mensaje = yaEstabaHabilitado 
            ? "Encargados actualizados correctamente" 
            : "Usuario habilitado y encargados asociados correctamente";
            
        res.status(200).json({ 
            message: mensaje,
            usuarioHabilitado: !yaEstabaHabilitado,
            correoEnviado: !yaEstabaHabilitado && contraseñaGenerada !== null
        });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};

