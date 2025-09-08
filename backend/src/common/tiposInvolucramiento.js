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

// Helper para validar tipo
export const esTipoValido = (tipo) => {
    return Object.values(TIPOS_INVOLUCRAMIENTO).includes(tipo);
};
