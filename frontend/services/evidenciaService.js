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
// tipo: 1 = evidencia inicial (al crear incidente), 2 = evidencia agregada después
export const subirEvidencias = async (archivos, tipo = 1) => {
    try {
        const formData = new FormData();
        
        // Agregar archivos al FormData
        archivos.forEach((archivo, index) => {
            formData.append('evidencias', archivo);
        });
        
        // Agregar el tipo de evidencia
        formData.append('tipo', tipo);

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

// Descargar evidencia
export const descargarEvidencia = async (evidencia) => {
    try {
        if (!evidencia) {
            return { error: true, message: 'Evidencia no disponible' };
        }

        // Construir la URL completa
        const url = evidencia.imgUrl 
            ? `${API_URL}${evidencia.imgUrl}` 
            : evidencia; // Si ya es una URL completa (string)
        
        const response = await fetch(url);
        
        if (!response.ok) {
            return { error: true, message: `Error al descargar: ${response.status}` };
        }
        
        const blob = await response.blob();
        const urlBlob = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlBlob;
        
        // Extraer el nombre del archivo
        const nombreArchivo = typeof evidencia === 'object' 
            ? (evidencia.nombreArchivo || url.split('/').pop() || 'evidencia.jpg')
            : url.split('/').pop() || 'evidencia.jpg';
        
        link.download = nombreArchivo;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);
        
        return { success: true, message: 'Evidencia descargada correctamente' };
    } catch (error) {
        return { error: true, message: 'Error de conexión con el servidor' };
    }
};
