const API_URL = process.env.NEXTAUTH_API_URL || 'http://localhost:3001';

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

export const verificarAccesoService = {
  async verificarSolicitudCasillero(cedulaEstudiante, tipoPeriodo) {
    try {
      const response = await fetch(`${API_URL}/api/estudiante/verificar-acceso-solicitud`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cedulaEstudiante,
          tipoPeriodo
        })
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('Error en verificarSolicitudCasillero:', error);
      return { 
        error: true, 
        message: 'Error de red al verificar acceso a solicitud' 
      };
    }
  },

  async verificarCasilleroAsignado(cedulaEstudiante) {
    try {
      const response = await fetch(`${API_URL}/api/estudiante/${cedulaEstudiante}/casillero-asignado`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json'
        }
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('Error en verificarCasilleroAsignado:', error);
      return { 
        error: true, 
        message: 'Error de red al verificar casillero asignado' 
      };
    }
  },

  async verificarAccesoMiLocker(cedulaEstudiante) {
    try {
      const response = await fetch(`${API_URL}/api/estudiante/verificar-acceso-milocker`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cedulaEstudiante
        })
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('Error en verificarAccesoMiLocker:', error);
      return { 
        error: true, 
        message: 'Error de red al verificar acceso a Mi Locker' 
      };
    }
  }
};

