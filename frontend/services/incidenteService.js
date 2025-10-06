const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Funciones del servicio de incidentes
const incidenteService = {
  // Crear un nuevo incidente
  crear: async (incidenteData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incidenteData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.crear:', error);
      throw error;
    }
  },

  // Listar incidentes
  listar: async (usuarioInfo) => {
    try {
      // Construir query params para filtrado por rol y especialidad
      const params = new URLSearchParams();
      if (usuarioInfo?.cedulaUsuario) params.append('cedulaUsuario', usuarioInfo.cedulaUsuario);
      if (usuarioInfo?.rol) params.append('rol', usuarioInfo.rol);
      if (usuarioInfo?.idEspecialidad) params.append('idEspecialidad', usuarioInfo.idEspecialidad);

      const response = await fetch(`${API_BASE_URL}/incidente?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los incidentes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.listar:', error);
      throw error;
    }
  },

  // Obtener un incidente por ID
  obtenerPorId: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.obtenerPorId:', error);
      throw error;
    }
  },

  // Obtener detalles completos de un incidente
  obtenerDetalles: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${id}/detalles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener los detalles del incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.obtenerDetalles:', error);
      throw error;
    }
  },

  // Obtener historial de cambios de un incidente
  obtenerHistorial: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${id}/historial`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el historial del incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.obtenerHistorial:', error);
      throw error;
    }
  },

  // Actualizar estado de un incidente
  actualizarEstado: async (id, data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${id}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado del incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.actualizarEstado:', error);
      throw error;
    }
  },

  // Obtener un incidente por ID
  obtenerPorId: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener el incidente');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.obtenerPorId:', error);
      throw error;
    }
  },

  // Agregar involucrado a un incidente
  agregarInvolucrado: async (idIncidente, involucradoData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente/${idIncidente}/involucrado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(involucradoData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al agregar involucrado');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en incidenteService.agregarInvolucrado:', error);
      throw error;
    }
  }
};

// Exportar el servicio
export { incidenteService };

// Exportaciones individuales para uso directo
export const obtenerDetallesIncidente = async (id) => {
  if (!id) return null;
  const response = await fetch(`${API_BASE_URL}/incidente/${id}/detalles`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener los detalles del incidente');
  }

  return await response.json();
};

export const obtenerHistorialIncidente = async (id) => {
  if (!id) return [];
  const response = await fetch(`${API_BASE_URL}/incidente/${id}/historial`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener el historial del incidente');
  }

  return await response.json();
};

export const actualizarEstadoIncidente = async (id, data) => {
  if (!id) throw new Error('ID de incidente requerido');
  const response = await fetch(`${API_BASE_URL}/incidente/${id}/estado`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el estado del incidente');
  }

  return await response.json();
};

export const agregarInvolucrado = async (idIncidente, involucradoData) => {
  return await incidenteService.agregarInvolucrado(idIncidente, involucradoData);
};
