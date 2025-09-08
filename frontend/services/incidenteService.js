const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Funciones del servicio de incidentes
export const incidenteService = {
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
  listar: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidente`, {
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
