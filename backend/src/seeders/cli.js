#!/usr/bin/env node

/**
 * CLI para ejecutar seeders manualmente
 * 
 * Uso:
 *   npm run seed              - Ejecuta todos los seeders
 *   npm run seed:revert       - Revierte todos los seeders (ELIMINA DATOS)
 *   node src/seeders/cli.js seed:especialidades  - Ejecuta solo especialidades
 */

import { runSeeders, runSeedersIfNeeded } from './index.js';
import { seedEspecialidades, revertEspecialidades } from './especialidades.seeder.js';
import { seedEstadosIncidente, revertEstadosIncidente } from './estadosIncidente.seeder.js';
import { seedEstadosCasillero, revertEstadosCasillero } from './estadosCasillero.seeder.js';

const command = process.argv[2] || 'seed';

const commands = {
    'seed': async () => {
        console.log('Ejecutando todos los seeders...\n');
        await runSeeders();
    },
    'seed:check': async () => {
        console.log('Verificando e insertando seeders si es necesario...\n');
        await runSeedersIfNeeded();
    },
    'seed:especialidades': async () => {
        console.log('Ejecutando seeder de especialidades...\n');
        await seedEspecialidades();
    },
    'seed:estados-incidente': async () => {
        console.log('Ejecutando seeder de estados de incidente...\n');
        await seedEstadosIncidente();
    },
    'seed:estados-casillero': async () => {
        console.log('Ejecutando seeder de estados de casillero...\n');
        await seedEstadosCasillero();
    },
    'seed:revert': async () => {
        console.log('PRECAUCION: Esto eliminara TODOS los datos de seeders\n');
        await revertEstadosCasillero();
        await revertEstadosIncidente();
        await revertEspecialidades();
        console.log('\nSeeders revertidos');
    },
    'help': () => {
        console.log(`
CLI de Seeders - MiLoker

Comandos disponibles:

  npm run seed                    Ejecuta todos los seeders
  npm run seed:check              Verifica e inserta solo si es necesario
  npm run seed:revert             Revierte todos los seeders (ELIMINA DATOS)
  
  node src/seeders/cli.js seed:especialidades       Ejecuta solo especialidades
  node src/seeders/cli.js seed:estados-incidente    Ejecuta solo estados incidente
  node src/seeders/cli.js seed:estados-casillero    Ejecuta solo estados casillero
  node src/seeders/cli.js help                      Muestra esta ayuda

Ejemplos:
  npm run seed                    # Producción: inserta todos los datos
  npm run seed:check              # Desarrollo: solo inserta si no existen
        `);
    }
};

async function main() {
    try {
        const commandFn = commands[command];
        
        if (!commandFn) {
            console.error(`Comando desconocido: ${command}`);
            commands.help();
            process.exit(1);
        }

        await commandFn();
        
        console.log('\nProceso completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('\nError:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
