import { sequelize } from "../../bd_config/conexion.js";
import { Estudiante } from "../../models/estudiante.model.js";
import { Usuario } from '../../models/usuario.model.js';
import { Encargado } from '../../models/encargado.model.js';
import { EstudianteXEncargado } from '../../models/estudianteXEncargado.model.js';

export const registrarUsuario = async (req, res) => {
    const cedula = req.params.cedula;
    const encargados = req.body.encargados;

    if (!cedula) {
        return res.status(400).json({ error: "Debe proporcionar una cédula como query param" });
    }

    if (!Array.isArray(encargados) || encargados.length === 0) {
        return res.status(400).json({ error: "Debe incluir al menos un encargado" });
    }

    const rol = 3;
    const token = "token_estatico";
    const contraseña = "123456";

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
        const existeUsuario = await Usuario.findOne({ where: { cedula }, transaction: t });
        if (existeUsuario) {
            await t.rollback();
            return res.status(409).json({ error: "El estudiante ya tiene un usuario registrado" });
        }

        // 3️⃣ Usar el correo del estudiante para generar el nombre de usuario
        const correo = estudiante.correo;
        const nombreUsuario = correo.split('@')[0];

        // 4️⃣ Crear usuario
        await Usuario.create({ cedula, nombreUsuario, token, contraseña, rol }, { transaction: t });

        // 5️⃣ Procesar encargados
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

        await t.commit();
        res.status(201).json({ message: "Usuario registrado y encargados asociados correctamente" });
    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ error: "Error interno del servidor", detalle: error.message });
    }
};
