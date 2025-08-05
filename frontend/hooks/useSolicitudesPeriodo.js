import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { obtenerSolicitudesPorEstado } from '../services/solicitudService';

const useSolicitudesPeriodo = (estado) => {
  const { data: session, status } = useSession();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState(null);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar que tenemos sesión y especialidad del docente
      if (status !== 'authenticated' || !session?.user?.idEspecialidad) {
        setError('No se pudo obtener la información del docente');
        setSolicitudes([]);
        setPeriodo(null);
        return;
      }
      
      // Enviar especialidad al backend para filtrar las solicitudes
      const resultado = await obtenerSolicitudesPorEstado(estado, session.user.idEspecialidad);
      
      if (resultado.error) {
        setError(resultado.message);
        setSolicitudes([]);
        setPeriodo(null);
      } else {
        // Ya no necesitamos filtrar aquí, el backend lo hace
        setSolicitudes(resultado.data.solicitudes || []);
        setPeriodo(resultado.data.periodo || null);
      }
    } catch (err) {
      setError('Error inesperado al cargar las solicitudes');
      setSolicitudes([]);
      setPeriodo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (estado && status !== 'loading') {
      cargarSolicitudes();
    }
  }, [estado, status, session]);

  const refrescar = () => {
    cargarSolicitudes();
  };

  return {
    solicitudes,
    loading,
    error,
    periodo,
    refrescar,
    total: solicitudes.length
  };
};

export default useSolicitudesPeriodo;
