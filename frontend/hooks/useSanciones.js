import { useState, useEffect } from 'react';
import { getSanciones } from '../services/sancionService';
import { Toast } from '../components/CustomAlert';

export const useSanciones = () => {
    const [sanciones, setSanciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarSanciones = async () => {
        try {
            setLoading(true);
            setError(null);

            const resultado = await getSanciones();
            
            if (resultado.error) {
                setError(resultado.message);
                setSanciones([]);
            } else {
                // Filtrar solo sanciones activas
                const sancionesActivas = Array.isArray(resultado) 
                    ? resultado.filter(s => s.estado === 1 || s.estado === 2) 
                    : [];
                setSanciones(sancionesActivas);
            }
        } catch (error) {
            console.error('Error al cargar sanciones:', error);
            setError(error.message);
            Toast.error('Error', 'No se pudieron cargar las sanciones');
            setSanciones([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarSanciones();
    }, []);

    return {
        sanciones,
        loading,
        error,
        recargar: cargarSanciones
    };
};
