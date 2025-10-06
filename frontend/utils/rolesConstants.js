// Roles de usuarios (deben coincidir con el backend)
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

// Helper para verificar si es profesor
export const esProfesor = (rol) => rol === ROLES.PROFESOR;

// Helper para verificar si es estudiante
export const esEstudiante = (rol) => rol === ROLES.ESTUDIANTE;

// Helper para verificar si es administrativo
export const esAdministrativo = (rol) => rol === ROLES.ADMINISTRATIVO;
