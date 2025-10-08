/**
 * Seeder de Usuario Administrador Inicial
 * Crea un usuario administrador por defecto para el primer acceso al sistema.
 */

import bcrypt from 'bcrypt';
import { Usuario } from '../models/usuario.model.js';
import { Administrador } from '../models/administrador.model.js';
import { ROLES } from '../common/roles.js';

export async function seedUsuarioAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@miloker.edu.cr';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

        const adminExistente = await Usuario.findOne({
            where: { cedula: '000000000' }
        });

        if (adminExistente) {
            return;
        }

        const contraseñaHash = await bcrypt.hash(adminPassword, 10);

        await Usuario.create({
            cedula: '000000000',
            nombreUsuario: 'admin',
            contraseña: contraseñaHash,
            rol: ROLES.ADMINISTRADOR,
            estado: 2,
            token: null
        });

        await Administrador.create({
            cedulaUsuario: '000000000',
            nombre: 'Administrador',
            apellidoUno: 'Del',
            apellidoDos: 'Sistema',
            correo: adminEmail,
            telefono: '0000-0000'
        });

        console.log('   Usuario administrador creado');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Contraseña: ${adminPassword}`);

    } catch (error) {
        console.error('Error al crear usuario administrador:', error.message);
        throw error;
    }
}
