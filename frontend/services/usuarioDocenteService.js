const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar respuestas HTTP
const handleResponse = async (response) => {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorCode = response.status;
        let errorData = null;
        
        try {
            if (contentType && contentType.includes("application/json")) {
                errorData = await response.json();
                errorMessage = errorData.error || errorData.message || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
        }
        
        // Para errores 404, devolver null en lugar de lanzar excepción
        if (errorCode === 404) {
            return null;
        }
        
        const error = new Error(errorMessage);
        error.status = errorCode;
        error.data = errorData;
        throw error;
    }
    
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    } else {
        return await response.text();
    }
};

// Obtener datos del estudiante por cédula
export const obtenerDatosEstudiantePorCedula = async (cedula) => {
    try {
        const response = await fetch(`${API_URL}/usuarios/estudiante/${cedula}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await handleResponse(response);
        
        // Si handleResponse devuelve null (404), significa que no se encontró
        if (result === null) {
            return { error: 'Estudiante no encontrado', status: 404 };
        }
        
        return result;
    } catch (error) {
        console.error('Error al obtener datos del estudiante:', error);
        // Re-lanzar el error para que sea manejado por el componente
        throw error;
    }
};

// Habilitar usuario estudiante con encargados
export const habilitarUsuarioEstudiante = async (cedula, encargados) => {
    try {
        const response = await fetch(`${API_URL}/usuarios/habilitar/estudiante/${cedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encargados })
        });

        return await handleResponse(response);
    } catch (error) {
        console.error('Error al habilitar usuario estudiante:', error);
        throw error;
    }
};
