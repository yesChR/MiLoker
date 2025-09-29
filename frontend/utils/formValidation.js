export const validarArchivo = (file) => {
    if (!file) return false;
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    return file.size <= MAX_SIZE && TIPOS_PERMITIDOS.includes(file.type);
};

export const validarFormulario = (formData) => {
    if (!formData.idCasillero) {
        return { valido: false, mensaje: "Por favor selecciona un casillero" };
    }
    
    if (!formData.detalle.trim()) {
        return { valido: false, mensaje: "Por favor describe el incidente" };
    }
    
    return { valido: true };
};

export const obtenerDetalleIncidente = (incidente) => {
    if (incidente.esReportanteProfesor) {
        return "Reportado como profesor.";
    }
    if (incidente.esReportanteDueno) {
        return "Has reportado un incidente en tu propio casillero.";
    }
    if (incidente.tieneDuenoConocido) {
        return "Se ha registrado al dueño del casillero como afectado.";
    }
    return "El casillero reportado no tiene dueño asignado actualmente.";
};