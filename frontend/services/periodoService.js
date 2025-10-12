const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar respuestas HTTP
const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorCode = response.status;
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
        return { error: true, message: errorMessage, code: errorCode };
    }
    
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    
    return await response.text();
};

// Obtener todos los períodos
export const getPeriodos = async () => {
    try {
        const url = `${API_URL}/administrativo/periodo/visualizar`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener períodos' };
    }
};

// Obtener estado actual de todos los períodos
export const getEstadoPeriodos = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/estado`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener estado de períodos' };
    }
};

// Obtener período activo por tipo
export const getPeriodoActivo = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/activo/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener período activo' };
    }
};

// Verificar si un período está vigente
export const verificarPeriodoVigente = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/vigente/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al verificar período vigente' };
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
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al actualizar período' };
    }
};

// Restablecer todas las asignaciones
export const restablecerAsignaciones = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/restablecer`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al restablecer asignaciones' };
    }
};

// Obtener historial de períodos por tipo
export const getHistorialPeriodos = async (tipo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/historial/${tipo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener historial de períodos' };
    }
};

// Obtener período específico por ID
export const getPeriodoPorId = async (idPeriodo) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/${idPeriodo}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener período por ID' };
    }
};

// Obtener períodos para mostrar en tarjetas
export const getPeriodosParaTarjetas = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/periodo/tarjetas`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener períodos para tarjetas' };
    }
};

// Formatear fecha para mostrar con fecha y hora
export const formatearFecha = (fecha) => {
    if (!fecha) return "No definida";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
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
