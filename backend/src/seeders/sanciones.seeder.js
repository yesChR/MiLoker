/**
 * Seeder de Sanciones
 * Crea los tipos de sanciones por gravedad
 */

import { Sancion } from '../models/sancion.model.js';
import { ESTADOS } from '../common/estados.js';

const sanciones = [
    {
        gravedad: 'Leve',
        detalle: 'Sanción de gravedad leve',
        estado: ESTADOS.ACTIVO
    },
    {
        gravedad: 'Grave',
        detalle: 'Sanción de gravedad grave',
        estado: ESTADOS.ACTIVO
    },
    {
        gravedad: 'Muy Grave',
        detalle: 'Sanción de gravedad muy grave',
        estado: ESTADOS.ACTIVO
    },
];

export async function seedSanciones() {
    try {
        const sancionesExistentes = await Sancion.count();

        if (sancionesExistentes > 0) {
            return;
        }

        await Sancion.bulkCreate(sanciones);
        console.log('Sanciones creadas exitosamente');

    } catch (error) {
        console.error('Error al crear sanciones:', error.message);
        throw error;
    }
}
