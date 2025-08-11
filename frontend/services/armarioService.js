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

// Obtener estudiante asignado a un casillero (a través de solicitudes)
export const obtenerEstudiantePorCasillero = async (idCasillero) => {
    try {
        const response = await fetch(`${API_URL}/casillero/estudiante/${idCasillero}`, {
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

// Crear nuevo armario
export const crearArmario = async (armarioData) => {
    try {
        const response = await fetch(`${API_URL}/casillero/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(armarioData),
        });
        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};

// Editar casillero
export const editarCasillero = async (idCasillero, casilleroData) => {
    try {
        const response = await fetch(`${API_URL}/casillero/editar/${idCasillero}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(casilleroData),
        });
        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};

// Obtener armarios (función legacy para compatibilidad)
export const visualizarArmarios = async () => {
    try {
        const response = await fetch(`${API_URL}/casillero/visualizar`, {
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
