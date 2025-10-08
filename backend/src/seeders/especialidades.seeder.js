/**
 * Seeder de Especialidades
 * 
 * Inserta las especialidades iniciales en la base de datos
 */

import { Especialidad } from '../models/especialidad.model.js';
import { ESTADOS } from '../common/estados.js';

const especialidades = [
    { idEspecialidad: 1, nombre: 'ADMINISTRACION LOGISTICA Y DISTRIBUCION', estado: ESTADOS.ACTIVO },
    { idEspecialidad: 2, nombre: 'ADMINISTRACION Y OPERACION ADUANERA', estado: ESTADOS.ACTIVO },
    { idEspecialidad: 3, nombre: 'GESTION DE LA PRODUCCION', estado: ESTADOS.ACTIVO },
    { idEspecialidad: 4, nombre: 'CONFIGURACION Y SOPORTE DE REDES', estado: ESTADOS.ACTIVO },
    { idEspecialidad: 5, nombre: 'SALUD OCUPACIONAL', estado: ESTADOS.ACTIVO }
];

export async function seedEspecialidades() {
    console.log('Insertando especialidades...');
    
    try {
        // Usar bulkCreate con updateOnDuplicate para insertar o actualizar
        await Especialidad.bulkCreate(especialidades, {
            updateOnDuplicate: ['nombre', 'estado'],
            ignoreDuplicates: false
        });

        const count = await Especialidad.count();
        console.log(`   ${count} especialidades insertadas/actualizadas`);
        
        return true;
    } catch (error) {
        console.error('   Error al insertar especialidades:', error.message);
        throw error;
    }
}

/**
 * Revertir el seeder (eliminar especialidades)
 * PRECAUCIÓN: Solo usar en desarrollo
 */
export async function revertEspecialidades() {
    console.log('Eliminando especialidades...');
    
    try {
        const deleted = await Especialidad.destroy({ where: {} });
        console.log(`   ${deleted} especialidades eliminadas`);
        return true;
    } catch (error) {
        console.error('   Error al eliminar especialidades:', error.message);
        throw error;
    }
}
