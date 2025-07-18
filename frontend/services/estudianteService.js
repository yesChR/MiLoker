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

// Obtener todos los estudiantes
export const getEstudiantes = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/estudiante/visualizar`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al obtener estudiantes' };
    }
};

// Cargar estudiantes desde archivo(s) Excel
export const cargarEstudiantesExcel = async (files) => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('files', file);
        });
        const response = await fetch(`${API_URL}/administrativo/estudiante/cargar/estudiantes`, {
            method: 'POST',
            body: formData,
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al cargar estudiantes desde Excel' };
    }
};

// Editar un estudiante existente
export const updateEstudiante = async (cedula, estudianteData) => {
    try {
        const response = await fetch(`${API_URL}/administrativo/estudiante/editar/${cedula}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(estudianteData),
        });
        const result = await handleResponse(response);
        return result;
    } catch (error) {
        return { error: true, message: 'Error de red al editar estudiante' };
    }
};