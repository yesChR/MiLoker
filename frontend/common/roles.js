// Roles de usuario (deben coincidir con el backend)
export const ROLES = {
    ESTUDIANTE: 1,
    PROFESOR: 2,
    ADMINISTRATIVO: 3
};

// Helper para obtener el texto del rol
export const obtenerTextoRol = (rol) => {
    const textos = {
        [ROLES.ESTUDIANTE]: 'Estudiante',
        [ROLES.PROFESOR]: 'Profesor',
        [ROLES.ADMINISTRATIVO]: 'Administrativo'
    };
    return textos[rol] || 'Desconocido';
};
