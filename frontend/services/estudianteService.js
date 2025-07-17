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

// Obtener todos los estudiantes
export const getEstudiantes = async () => {
    try {
        const response = await fetch(`${API_URL}/administrativo/estudiante/visualizar`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        throw error;
    }
};

// Cargar estudiantes desde archivo(s) Excel
export const cargarEstudiantesExcel = async (files) => {
    try {
        const formData = new FormData();
        
        // Agregar todos los archivos al FormData usando el mismo nombre que espera multer.any()
        files.forEach((file) => {
            formData.append('files', file); // Usar 'files' como nombre genérico para todos los archivos
        });

        const response = await fetch(`${API_URL}/administrativo/estudiante/cargar/estudiantes`, {
            method: 'POST',
            body: formData, // No establecer Content-Type, el navegador lo hará automáticamente con boundary
        });
        
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al cargar estudiantes desde Excel:', error);
        throw error;
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
        return await handleResponse(response);
    } catch (error) {
        console.error('Error al editar estudiante:', error);
        throw error;
    }
};