import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { incidenteService } from '../services/incidenteService';

export const useIncidentes = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [incidentes, setIncidentes] = useState([]);

  // Crear un nuevo incidente
  const crearIncidente = useCallback(async (incidenteData) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await incidenteService.crear(incidenteData);
      
      // Actualizar la lista local si es necesario
      setIncidentes(prev => [resultado.incidente, ...prev]);
      
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Listar incidentes
  const listarIncidentes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validar que la sesión esté disponible
      if (!session?.user?.id || !session?.user?.role) {
        setIncidentes([]);
        setLoading(false);
        return [];
      }
      
      // Obtener info del usuario de la sesión
      const usuarioInfo = {
        cedulaUsuario: session.user.id,
        rol: session.user.role,
        idEspecialidad: session.user.idEspecialidad
      };
      
      const resultado = await incidenteService.listar(usuarioInfo);
      setIncidentes(resultado);
      
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session]);

  // Agregar involucrado
  const agregarInvolucrado = useCallback(async (idIncidente, involucradoData) => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await incidenteService.agregarInvolucrado(idIncidente, involucradoData);
      
      // Actualizar el incidente en la lista local
      setIncidentes(prev => 
        prev.map(incidente => 
          incidente.idIncidente === idIncidente 
            ? { ...incidente, ...resultado.incidente }
            : incidente
        )
      );
      
      return resultado;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar error
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    incidentes,
    crearIncidente,
    listarIncidentes,
    agregarInvolucrado,
    limpiarError
  };
};
