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
        // En vez de lanzar excepción, retorna objeto de error
        return { error: true, message: errorMessage, code: errorCode };
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
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        // Si ocurre un error de red, retorna un objeto de error
        return { error: true, message: 'Error de red al obtener administradores' };
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
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al crear administrador' };
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
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al editar administrador' };
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
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al deshabilitar administrador' };
    }
};
