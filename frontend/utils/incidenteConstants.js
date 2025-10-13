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
    REPORTADO: 1,
    EN_INVESTIGACION: 2,
    RESUELTO: 3,
    CERRADO: 4
};

// Helper para obtener el texto del estado
export const obtenerTextoEstado = (estado) => {
    const textos = {
        [ESTADOS_INCIDENTE.REPORTADO]: 'Reportado',
        [ESTADOS_INCIDENTE.EN_INVESTIGACION]: 'En Investigación',
        [ESTADOS_INCIDENTE.RESUELTO]: 'Resuelto',
        [ESTADOS_INCIDENTE.CERRADO]: 'Cerrado'
    };
    return textos[estado] || 'Estado Desconocido';
};

// Helper para obtener color según el estado
export const obtenerColorEstado = (estado) => {
    const colores = {
        [ESTADOS_INCIDENTE.REPORTADO]: 'warning',
        [ESTADOS_INCIDENTE.EN_INVESTIGACION]: 'primary',
        [ESTADOS_INCIDENTE.RESUELTO]: 'success',
        [ESTADOS_INCIDENTE.CERRADO]: 'default'
    };
    return colores[estado] || 'default';
};

// Helper para obtener los estados siguientes permitidos
export const obtenerEstadosSiguientes = (estadoActual) => {
    const transiciones = {
        [ESTADOS_INCIDENTE.REPORTADO]: [
            ESTADOS_INCIDENTE.EN_INVESTIGACION,
            ESTADOS_INCIDENTE.CERRADO  // Puede cerrarse si no procede
        ],
        [ESTADOS_INCIDENTE.EN_INVESTIGACION]: [
            ESTADOS_INCIDENTE.RESUELTO,
            ESTADOS_INCIDENTE.CERRADO
        ],
        [ESTADOS_INCIDENTE.RESUELTO]: [
            ESTADOS_INCIDENTE.CERRADO
        ],
        [ESTADOS_INCIDENTE.CERRADO]: []
    };
    
    return transiciones[estadoActual] || [];
};
