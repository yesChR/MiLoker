/**
 * Seeder de Estados de Casillero
 * 
 * Inserta los estados de casillero en la base de datos
 */

import { EstadoCasillero } from '../models/estadoCasillero.model.js';

const estadosCasillero = [
    { idEstadoCasillero: 1, nombre: 'DISPONIBLE', descripcion: 'Casillero disponible para asignar' },
    { idEstadoCasillero: 2, nombre: 'OCUPADO', descripcion: 'Casillero asignado a un estudiante' },
    { idEstadoCasillero: 3, nombre: 'EN MANTENIMIENTO', descripcion: 'Casillero en proceso de reparación' },
    { idEstadoCasillero: 4, nombre: 'DAÑADO', descripcion: 'Casillero dañado, no disponible' },
    { idEstadoCasillero: 5, nombre: 'FUERA DE SERVICIO', descripcion: 'Casillero dado de baja permanentemente' }
];

export async function seedEstadosCasillero() {
    console.log('Insertando estados de casillero...');
    
    try {
        // Usar bulkCreate con updateOnDuplicate
        await EstadoCasillero.bulkCreate(estadosCasillero, {
            updateOnDuplicate: ['nombre', 'descripcion'],
            ignoreDuplicates: false
        });

        const count = await EstadoCasillero.count();
        console.log(`   ${count} estados de casillero insertados/actualizados`);
        
        return true;
    } catch (error) {
        console.error('   Error al insertar estados de casillero:', error.message);
        throw error;
    }
}

/**
 * Revertir el seeder
 */
export async function revertEstadosCasillero() {
    console.log('Eliminando estados de casillero...');
    
    try {
        const deleted = await EstadoCasillero.destroy({ where: {} });
        console.log(`   ${deleted} estados de casillero eliminados`);
        return true;
    } catch (error) {
        console.error('   Error al eliminar estados de casillero:', error.message);
        throw error;
    }
}
