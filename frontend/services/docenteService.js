const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

export const getDocentes = async (search, filters) => {
    try {
        let url = `${API_URL}/administrativo/docente/visualizar`;
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (filters) params.append('filters', JSON.stringify(filters));
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener docentes' };
    }
};

export const createDocente = async (docenteData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/docente/crear`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docenteData),
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al crear docente' };
    }
};

export const updateDocente = async (cedula, docenteData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/docente/editar/${cedula}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(docenteData),
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al editar docente' };
    }
};

export const disableDocente = async (cedula) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/docente/deshabilitar/${cedula}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al deshabilitar docente' };
    }
};
