const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export const getDocentes = async () => {
    try {
        const response = await fetch(`${API_URL}/profesor/visualizar`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        throw error;
    }
};

export const createDocente = async (docenteData) => {
    try {
        const response = await fetch(`${API_URL}/profesor/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docenteData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error en createDocente servicio:', error);
        throw error;
    }
};

export const updateDocente = async (cedula, docenteData) => {
    try {
        const response = await fetch(`${API_URL}/profesor/editar/${cedula}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docenteData),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al editar docente:', error);
        throw error;
    }
};

export const disableDocente = async (cedula) => {
    try {
        const response = await fetch(`${API_URL}/profesor/deshabilitar/${cedula}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al deshabilitar docente:', error);
        throw error;
    }
};
