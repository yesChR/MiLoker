const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const informeService = {
    // Obtener casilleros por especialidad
    obtenerCasillerosPorEspecialidad: async (idEspecialidad) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/informe/casilleros/especialidad/${idEspecialidad}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener casilleros por especialidad:', error);
            throw error;
        }
    },

    // Obtener historial específico de un casillero
    obtenerHistorialCasillero: async (idCasillero, idEspecialidad) => {
        try {
            const url = `${API_BASE_URL}/informe/casillero/${idCasillero}/${idEspecialidad}`;
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener historial del casillero:', error);
            throw error;
        }
    },

    // Obtener historial completo de un estudiante
    obtenerHistorialEstudiante: async (cedulaEstudiante) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/informe/estudiante/${cedulaEstudiante}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener historial del estudiante:', error);
            throw error;
        }
    },

    // Obtener estadísticas generales de casilleros
    obtenerEstadisticasGenerales: async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/informe/estadisticas`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener estadísticas generales:', error);
            throw error;
        }
    }
};
