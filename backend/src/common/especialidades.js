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
        { id: 1, nombre: "ADMINISTRACION LOGISTICA Y DISTRIBUCION" },
        { id: 2, nombre: "ADMINISTRACION Y OPERACION ADUANERA" },
        { id: 3, nombre: "GESTION DE LA PRODUCCION" },
        { id: 4, nombre: "CONFIGURACION Y SOPORTE DE REDES" },
        { id: 5, nombre: "SALUD OCUPACIONAL" }
    ];
}

export async function obtenerEspecialidades() {
    try {
        const especialidades = await Especialidad.findAll({
            where: { estado: 1 }, // Solo especialidades activas
            attributes: ['id', 'nombre'],
            order: [['id', 'ASC']]
        });
        return especialidades;
    } catch (error) {
        console.error('Error al obtener especialidades:', error.message);
        // Si hay error, devolver especialidades por defecto
        return getEspecialidadesPorDefecto();
    }
}

export async function obtenerIdEspecialidad(nombreEspecialidad) {
    if (!nombreEspecialidad) return 1; // ID por defecto

    const especialidades = await obtenerEspecialidades();

    // Limpiar el nombre de especialidad (quitar comillas, espacios, etc.)
    const nombreNormalizado = limpiarNombreEspecialidad(nombreEspecialidad);

    // Buscar coincidencia exacta
    let especialidadEncontrada = especialidades.find(esp =>
        esp.nombre.toUpperCase().trim() === nombreNormalizado
    );

    if (especialidadEncontrada) {
        return especialidadEncontrada.id;
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
        return especialidadEncontrada.id;
    }

    console.warn(`No se encontró especialidad para: "${nombreEspecialidad}". Usando ID por defecto.`);
    return 1; // ID por defecto
}

function limpiarNombreEspecialidad(nombre) {
    if (!nombre) return "";

    return nombre.toString()
        .replace(/^['"`]+/, '') // Quitar comillas al inicio
        .replace(/['"`]+$/, '') // Quitar comillas al final
        .trim() // Quitar espacios
        .toUpperCase(); // Convertir a mayúsculas
}