import { useState, useEffect } from 'react';
import { obtenerSolicitudesPorEstado } from '../services/solicitudService';

const useSolicitudesPeriodo = (estado) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState(null);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const resultado = await obtenerSolicitudesPorEstado(estado);
      
      if (resultado.error) {
        setError(resultado.message);
        setSolicitudes([]);
        setPeriodo(null);
      } else {
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
    if (estado) {
      cargarSolicitudes();
    }
  }, [estado]);

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
