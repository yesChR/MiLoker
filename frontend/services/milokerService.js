const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
    try {
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.message || 'Error en la petición' };
        }
        return data;
    } catch (error) {
        return { error: true, message: 'Error al procesar la respuesta del servidor' };
    }
};

// Servicio para obtener los periodos de solicitud y asignación
export const obtenerPeriodos = async () => {
    try {
        const response = await fetch(`${API_URL}/api/estudiante/periodos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener periodos:', error);
        return {
            error: true,
            message: 'Error de conexión con el servidor'
        };
    }
};

// Servicio para obtener información completa del estudiante
export const obtenerInformacionEstudiante = async (cedulaEstudiante) => {
    try {
        const response = await fetch(`${API_URL}/api/estudiante/informacion/${cedulaEstudiante}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener información del estudiante:', error);
        return {
            error: true,
            message: 'Error de conexión con el servidor'
        };
    }
};
