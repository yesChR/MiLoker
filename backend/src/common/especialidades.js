import { Especialidad } from '../models/especialidad.model.js';

// Constantes para referencia rápida (IDs comunes)
export const ESPECIALIDADES_ID = {
    ADMINISTRACION_LOGISTICA: 1,
    ADMINISTRACION_ADUANERA: 2,
    GESTION_PRODUCCION: 3,
    CONFIGURACION_REDES: 4,
    SALUD_OCUPACIONAL: 5
};

function getEspecialidadesPorDefecto() {
    return [
        { idEspecialidad: 1, nombre: "ADMINISTRACION LOGISTICA Y DISTRIBUCION" },
        { idEspecialidad: 2, nombre: "ADMINISTRACION Y OPERACION ADUANERA" },
        { idEspecialidad: 3, nombre: "GESTION DE LA PRODUCCION" },
        { idEspecialidad: 4, nombre: "CONFIGURACION Y SOPORTE DE REDES" },
        { idEspecialidad: 5, nombre: "SALUD OCUPACIONAL" }
    ];
}

export async function obtenerEspecialidades() {
    try {
        const especialidades = await Especialidad.findAll({
            where: { estado: 1 }, // Solo especialidades activas
            attributes: ['idEspecialidad', 'nombre'],
            order: [['idEspecialidad', 'ASC']]
        });
        return especialidades;
    } catch (error) {
        console.error('Error al obtener especialidades:', error.message);
        // Si hay error, devolver especialidades por defecto
        return getEspecialidadesPorDefecto();
    }
}

export async function obtenerIdEspecialidad(nombreEspecialidad, especialidadesCache = null) {
    if (!nombreEspecialidad) {
        throw new Error(`Especialidad requerida: No se proporcionó nombre de especialidad`);
    }

    // Usar cache si está disponible, sino obtener especialidades
    const especialidades = especialidadesCache || await obtenerEspecialidades();

    // Limpiar el nombre de especialidad (quitar comillas, espacios, etc.)
    const nombreNormalizado = limpiarNombreEspecialidad(nombreEspecialidad);

    // Buscar coincidencia exacta
    let especialidadEncontrada = especialidades.find(esp =>
        esp.nombre.toUpperCase().trim() === nombreNormalizado
    );

    if (especialidadEncontrada) {
        return especialidadEncontrada.idEspecialidad;
    }

    // Buscar coincidencia parcial (palabras clave)
    especialidadEncontrada = especialidades.find(esp => {
        const nombreEsp = esp.nombre.toUpperCase();
        const palabrasClave = nombreNormalizado.split(' ');

        return palabrasClave.some(palabra =>
            palabra.length > 3 && nombreEsp.includes(palabra)
        );
    });

    if (especialidadEncontrada) {
        return especialidadEncontrada.idEspecialidad;
    }

    // Si no se encuentra, lanzar error específico
    throw new Error(`Especialidad no encontrada: "${nombreEspecialidad}". Las especialidades disponibles son: ${especialidades.map(e => e.nombre).join(', ')}`);
}

function limpiarNombreEspecialidad(nombre) {
    if (!nombre) return "";

    return nombre.toString()
        .replace(/^['"`]+/, '') // Quitar comillas al inicio
        .replace(/['"`]+$/, '') // Quitar comillas al final
        .trim() // Quitar espacios
        .toUpperCase(); // Convertir a mayúsculas
}