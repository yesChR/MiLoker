/**
 * Seeder de Estados de Incidente
 * 
 * Inserta los estados de incidente en la base de datos
 */

import { EstadoIncidente } from '../models/estadoIncidente.model.js';

const estadosIncidente = [
    { idEstadoIncidente: 1, nombre: 'REPORTADO', descripcion: 'Incidente reportado, pendiente de revisión' },
    { idEstadoIncidente: 2, nombre: 'EN INVESTIGACION', descripcion: 'Incidente en proceso de investigación' },
    { idEstadoIncidente: 3, nombre: 'RESUELTO', descripcion: 'Incidente resuelto' },
    { idEstadoIncidente: 4, nombre: 'CERRADO', descripcion: 'Caso cerrado definitivamente' }
];

export async function seedEstadosIncidente() {
    console.log('Insertando estados de incidente...');
    
    try {
        // Usar bulkCreate con updateOnDuplicate
        await EstadoIncidente.bulkCreate(estadosIncidente, {
            updateOnDuplicate: ['nombre', 'descripcion'],
            ignoreDuplicates: false
        });

        const count = await EstadoIncidente.count();
        console.log(`   ${count} estados de incidente insertados/actualizados`);
        
        return true;
    } catch (error) {
        console.error('   Error al insertar estados de incidente:', error.message);
        throw error;
    }
}

/**
 * Revertir el seeder
 */
export async function revertEstadosIncidente() {
    console.log('Eliminando estados de incidente...');
    
    try {
        const deleted = await EstadoIncidente.destroy({ where: {} });
        console.log(`   ${deleted} estados de incidente eliminados`);
        return true;
    } catch (error) {
        console.error('   Error al eliminar estados de incidente:', error.message);
        throw error;
    }
}
