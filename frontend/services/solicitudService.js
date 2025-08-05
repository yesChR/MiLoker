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
      // No hacer nada extra
    }
    
    return {
      error: true,
      message: errorMessage,
      code: errorCode
    };
  }
  
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }
  
  return await response.text();
};

// Crear nueva solicitud de casillero
export async function crearSolicitud(solicitudData) {
  try {
    const res = await fetch(`${API_URL}/solicitud/crear`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(solicitudData)
    });
    
    const data = await handleResponse(res);
    console.log(res)
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al crear la solicitud" };
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al crear la solicitud' };
  }
}

// Obtener estado de solicitud optimizado (desde período activo)
export async function obtenerEstadoSolicitud(cedula) {
  try {
    const res = await fetch(`${API_URL}/solicitud/estado/${cedula}`);
    
    const data = await handleResponse(res);
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al obtener el estado de la solicitud" };
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al obtener el estado de la solicitud' };
  }
}

// Obtener solicitudes por cédula (todas las solicitudes históricas)
export async function obtenerSolicitudesPorCedula(cedula) {
  try {
    const res = await fetch(`${API_URL}/solicitud/visualizar/${cedula}`);
    
    const data = await handleResponse(res);
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al obtener las solicitudes" };
    }
    
    // Ordenar por fecha de solicitud para obtener la más reciente primero
    if (Array.isArray(data)) {
      data.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud));
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al obtener las solicitudes' };
  }
}

// Obtener todas las solicitudes
export async function obtenerTodasLasSolicitudes() {
  try {
    const res = await fetch(`${API_URL}/solicitud/visualizar`);
    
    const data = await handleResponse(res);
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al obtener las solicitudes" };
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al obtener las solicitudes' };
  }
}

// Obtener solicitudes por estado del periodo activo
export async function obtenerSolicitudesPorEstado(estado, idEspecialidad = null) {
  try {
    let url = `${API_URL}/solicitud/por-estado/${estado}`;
    
    // Agregar especialidad como query parameter si se proporciona
    if (idEspecialidad) {
      url += `?idEspecialidad=${idEspecialidad}`;
    }
    
    const res = await fetch(url);
    
    const data = await handleResponse(res);
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al obtener las solicitudes por estado" };
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al obtener las solicitudes por estado' };
  }
}

// Procesar solicitud (aprobar casillero específico o rechazar toda la solicitud)
export async function procesarSolicitud(idSolicitud, idCasilleroAprobado = null, justificacion = '') {
  try {
    const body = {};

    // Si hay un casillero específico, es una aprobación
    if (idCasilleroAprobado && idCasilleroAprobado !== 'ninguna') {
      body.idCasilleroAprobado = idCasilleroAprobado;
      body.justificacion = justificacion || 'Solicitud aprobada';
    } 
    // Si no hay casillero o es 'ninguna', es un rechazo
    else {
      body.justificacion = justificacion;
    }

    const res = await fetch(`${API_URL}/solicitud/procesar/${idSolicitud}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await handleResponse(res);
    
    if (data && data.error) {
      return { error: true, message: data.message || "Error al procesar la solicitud" };
    }
    
    return { success: true, data };
  } catch (error) {
    return { error: true, message: 'Error de red al procesar la solicitud' };
  }
}
