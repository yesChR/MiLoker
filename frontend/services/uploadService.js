const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Servicio para subir evidencias de incidentes
export const uploadService = {
  // Subir múltiples archivos de evidencia
  subirEvidencias: async (archivos) => {
    try {
      const formData = new FormData();
      
      // Agregar cada archivo al FormData
      archivos.forEach((archivo, index) => {
        formData.append('evidencias', archivo);
      });

      const response = await fetch(`${API_BASE_URL}/upload/evidencias`, {
        method: 'POST',
        body: formData
        // No agregar Content-Type header, el navegador lo hace automáticamente con boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir evidencias');
      }

      const resultado = await response.json();
      return resultado; // Debe retornar un array con las URLs de los archivos subidos
    } catch (error) {
      console.error('Error en uploadService.subirEvidencias:', error);
      throw error;
    }
  },

  // Eliminar archivo de evidencia
  eliminarEvidencia: async (nombreArchivo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/upload/evidencias/${nombreArchivo}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar evidencia');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en uploadService.eliminarEvidencia:', error);
      throw error;
    }
  }
};

export default uploadService;
