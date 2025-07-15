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

// Obtener todos los administradores
export const getAdministradores = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/administrador/visualizar`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener administradores:', error);
        throw error;
    }
};

// Crear un nuevo administrador
export const createAdministrador = async (adminData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/administrador/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en createAdministrador servicio:', error);
        throw error;
    }
};

// Editar un administrador existente
export const updateAdministrador = async (cedula, adminData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/administrador/editar/${cedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al editar administrador:', error);
        throw error;
    }
};

// Deshabilitar un administrador
export const disableAdministrador = async (cedula) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/administrador/deshabilitar/${cedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al deshabilitar administrador:', error);
        throw error;
    }
};
