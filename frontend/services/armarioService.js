const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Función auxiliar para manejar respuestas
const handleResponse = async (response) => {
    try {
        const data = await response.json();
        if (!response.ok) {
            return { error: true, message: data.error || data.message || 'Error en la petición' };
        }
        return data;
    } catch (error) {
        return { error: true, message: 'Error al procesar la respuesta del servidor' };
    }
};

// Obtener armarios por especialidad
export const obtenerArmariosPorEspecialidad = async (idEspecialidad) => {
    try {
        const response = await fetch(`${API_URL}/casillero/armarios/especialidad/${idEspecialidad}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};

// Obtener todos los armarios
export const obtenerTodosLosArmarios = async () => {
    try {
        const response = await fetch(`${API_URL}/casillero/armarios/todos`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};
