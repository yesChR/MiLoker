// Tipos de involucramiento (deben coincidir con el backend)
export const TIPOS_INVOLUCRAMIENTO = {
    REPORTANTE: 1,
    RESPONSABLE: 2,
    TESTIGO: 3,
    AFECTADO: 4
};

// Helper para obtener el texto del tipo
export const obtenerTextoTipo = (tipo) => {
    const textos = {
        [TIPOS_INVOLUCRAMIENTO.REPORTANTE]: 'Reportante',
        [TIPOS_INVOLUCRAMIENTO.RESPONSABLE]: 'Responsable',
        [TIPOS_INVOLUCRAMIENTO.TESTIGO]: 'Testigo',
        [TIPOS_INVOLUCRAMIENTO.AFECTADO]: 'Afectado'
    };
    return textos[tipo] || 'Desconocido';
};

// Estados de incidentes
export const ESTADOS_INCIDENTE = {
    REPORTADO_ESTUDIANTE: 1,
    REPORTADO_PROFESOR: 2,
    EN_INVESTIGACION: 3,
    RESPONSABLE_IDENTIFICADO: 4,
    RESUELTO: 5,
    CERRADO: 6
};

// Helper para obtener el texto del estado
export const obtenerTextoEstado = (estado) => {
    const textos = {
        [ESTADOS_INCIDENTE.REPORTADO_ESTUDIANTE]: 'Reportado por Estudiante',
        [ESTADOS_INCIDENTE.REPORTADO_PROFESOR]: 'Reportado por Profesor',
        [ESTADOS_INCIDENTE.EN_INVESTIGACION]: 'En Investigación',
        [ESTADOS_INCIDENTE.RESPONSABLE_IDENTIFICADO]: 'Responsable Identificado',
        [ESTADOS_INCIDENTE.RESUELTO]: 'Resuelto',
        [ESTADOS_INCIDENTE.CERRADO]: 'Cerrado'
    };
    return textos[estado] || 'Estado Desconocido';
};

// Helper para obtener color según el estado
export const obtenerColorEstado = (estado) => {
    const colores = {
        [ESTADOS_INCIDENTE.REPORTADO_ESTUDIANTE]: 'warning',
        [ESTADOS_INCIDENTE.REPORTADO_PROFESOR]: 'primary',
        [ESTADOS_INCIDENTE.EN_INVESTIGACION]: 'secondary',
        [ESTADOS_INCIDENTE.RESPONSABLE_IDENTIFICADO]: 'danger',
        [ESTADOS_INCIDENTE.RESUELTO]: 'success',
        [ESTADOS_INCIDENTE.CERRADO]: 'default'
    };
    return colores[estado] || 'default';
};
