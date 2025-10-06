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

// Subir evidencias
export const subirEvidencias = async (archivos) => {
    try {
        const formData = new FormData();
        
        // Agregar archivos al FormData
        archivos.forEach((archivo, index) => {
            formData.append('evidencias', archivo);
        });

        const response = await fetch(`${API_URL}/evidencia/upload`, {
            method: 'POST',
            body: formData, // No agregar Content-Type header, fetch lo hará automáticamente
        });

        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};

// Obtener evidencias de un incidente
export const obtenerEvidenciasIncidente = async (idIncidente) => {
    try {
        const response = await fetch(`${API_URL}/evidencia/incidente/${idIncidente}`, {
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

// Eliminar evidencia
export const eliminarEvidencia = async (idEvidencia) => {
    try {
        const response = await fetch(`${API_URL}/evidencia/${idEvidencia}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return await handleResponse(response);
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};
