/**
 * Sistema de Seeders - Inicialización automática de datos
 * 
 * Este archivo ejecuta todos los seeders necesarios para inicializar la base de datos
 * con los datos básicos requeridos por la aplicación.
 */

import { sequelize } from '../bd_config/conexion.js';
import { seedEspecialidades } from './especialidades.seeder.js';
import { seedEstadosIncidente } from './estadosIncidente.seeder.js';
import { seedEstadosCasillero } from './estadosCasillero.seeder.js';

/**
 * Ejecuta todos los seeders en orden
 */
export async function runSeeders() {
    console.log('Iniciando seeders...\n');
    
    try {
        // Verificar conexión
        await sequelize.authenticate();
        console.log('Conexion a la base de datos establecida\n');

        // Ejecutar seeders en orden
        await seedEspecialidades();
        await seedEstadosIncidente();
        await seedEstadosCasillero();

        console.log('\nTodos los seeders ejecutados correctamente');
        return true;
    } catch (error) {
        console.error('\nError al ejecutar seeders:', error.message);
        throw error;
    }
}

/**
 * Ejecuta los seeders solo si es necesario (verifica si ya existen datos)
 */
export async function runSeedersIfNeeded() {
    try {
        const { Especialidad } = await import('../models/especialidad.model.js');
        
        // Verificar si ya hay datos
        const count = await Especialidad.count();
        
        if (count === 0) {
            console.log('Base de datos vacia. Ejecutando seeders iniciales...\n');
            await runSeeders();
        } else {
            console.log('Base de datos ya tiene datos iniciales\n');
        }
    } catch (error) {
        console.error('Error al verificar seeders:', error.message);
    }
}
