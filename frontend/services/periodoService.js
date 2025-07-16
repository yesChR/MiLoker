const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar respuestas HTTP
const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.error || error.message || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
        }
        
        throw new Error(errorMessage);
    }
    
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    
    return await response.text();
};

// Obtener todos los períodos
export const getPeriodos = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/visualizar`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener períodos:', error);
        throw error;
    }
};

// Obtener estado actual de todos los períodos
export const getEstadoPeriodos = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/estado`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estado de períodos:', error);
        throw error;
    }
};

// Obtener período activo por tipo
export const getPeriodoActivo = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/activo/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener período activo:', error);
        throw error;
    }
};

// Verificar si un período está vigente
export const verificarPeriodoVigente = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/vigente/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al verificar período vigente:', error);
        throw error;
    }
};

// Actualizar o crear un período
export const actualizarPeriodo = async (periodoData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/actualizar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(periodoData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al actualizar período:', error);
        throw error;
    }
};

// Restablecer todas las asignaciones
export const restablecerAsignaciones = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/restablecer`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al restablecer asignaciones:', error);
        throw error;
    }
};

// Obtener historial de períodos por tipo
export const getHistorialPeriodos = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/historial/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener historial de períodos:', error);
        throw error;
    }
};

// Obtener período específico por ID
export const getPeriodoPorId = async (idPeriodo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/${idPeriodo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener período por ID:', error);
        throw error;
    }
};

// Formatear fecha para mostrar
export const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

// Convertir fecha de DatePicker a formato de BD
export const convertirFechaParaBD = (datePickerValue) => {
    if (!datePickerValue) return null;
    
    // Si es un objeto de @internationalized/date
    if (datePickerValue.toDate) {
        return datePickerValue.toDate().toISOString();
    }
    
    // Si es una fecha normal
    if (datePickerValue instanceof Date) {
        return datePickerValue.toISOString();
    }
    
    return datePickerValue;
};
