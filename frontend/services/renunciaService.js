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

// Servicio para obtener información del casillero asignado a un estudiante
export const obtenerCasilleroEstudiante = async (cedulaEstudiante) => {
    try {
        console.log('=== DEBUG SERVICIO ===');
        console.log('Cédula enviada:', cedulaEstudiante);
        console.log('URL completa:', `${API_URL}/estudiante/casillero/${cedulaEstudiante}`);
        
        const response = await fetch(`${API_URL}/estudiante/casillero/${cedulaEstudiante}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        const resultado = await handleResponse(response);
        console.log('Resultado del servicio:', resultado);
        
        return resultado;
    } catch (error) {
        console.error('Error al obtener casillero del estudiante:', error);
        return {
            error: true,
            message: 'Error de conexión con el servidor'
        };
    }
};

// Servicio para renunciar al casillero por cédula del estudiante
export const renunciarCasillero = async (cedulaEstudiante) => {
    try {
        const response = await fetch(`${API_URL}/estudiante/renunciar/${cedulaEstudiante}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al renunciar al casillero:', error);
        return {
            error: true,
            message: 'Error de conexión con el servidor'
        };
    }
};
