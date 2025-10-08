/**
 * Seeder de Usuario Administrador Inicial
 * Crea un usuario administrador por defecto para el primer acceso al sistema.
 */

import bcrypt from 'bcrypt';
import { Usuario } from '../models/usuario.model.js';
import { Administrador } from '../models/administrador.model.js';
import { ROLES } from '../common/roles.js';
import { ESTADOS } from '../common/estados.js';

export async function seedUsuarioAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@miloker.edu.cr';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
        const adminCedula = '000000000';

        // Verificar si existe el usuario
        let usuarioExistente = await Usuario.findOne({
            where: { cedula: adminCedula }
        });

        // Verificar si existe el administrador
        let adminExistente = await Administrador.findOne({
            where: { cedula: adminCedula }
        });

        // Si ambos existen, no hacer nada
        if (usuarioExistente && adminExistente) {
            return;
        }

        const contraseñaHash = await bcrypt.hash(adminPassword, 10);

        // Crear usuario si no existe
        if (!usuarioExistente) {
            usuarioExistente = await Usuario.create({
                cedula: adminCedula,
                nombreUsuario: adminEmail,
                contraseña: contraseñaHash,
                rol: ROLES.ADMINISTRADOR,
                estado: ESTADOS.ACTIVO,
                token: null
            });
            console.log(' Usuario administrador creado');
        }

        // Crear administrador si no existe
        if (!adminExistente) {
            await Administrador.create({
                cedula: adminCedula,
                nombre: 'Administrador',
                apellidoUno: 'Del',
                apellidoDos: 'Sistema',
                correo: adminEmail,
                telefono: '0000-0000',
                estado: ESTADOS.ACTIVO
            });
            console.log(' Perfil de administrador creado');
        }

        console.log(`   Email: ${adminEmail}`);
        console.log(`   Contraseña: ${adminPassword}`);

    } catch (error) {
        console.error(' Error al crear usuario administrador:', error.message);
        throw error;
    }
}
