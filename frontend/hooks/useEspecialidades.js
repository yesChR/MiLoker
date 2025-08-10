import { useState, useEffect } from 'react';
import { getEspecialidades } from '../services/especialidadService';

export const useEspecialidades = () => {
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEspecialidades = async () => {
            try {
                setLoading(true);
                const result = await getEspecialidades();
                
                if (result && result.error) {
                    setError(result.message);
                    setEspecialidades([]);
                } else {
                    setEspecialidades(result || []);
                    setError(null);
                }
            } catch (err) {
                setError('Error al cargar las especialidades');
                setEspecialidades([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEspecialidades();
    }, []);

    return {
        especialidades,
        loading,
        error,
        refetch: () => {
            const fetchEspecialidades = async () => {
                try {
                    setLoading(true);
                    const result = await getEspecialidades();
                    
                    if (result && result.error) {
                        setError(result.message);
                        setEspecialidades([]);
                    } else {
                        setEspecialidades(result || []);
                        setError(null);
                    }
                } catch (err) {
                    setError('Error al cargar las especialidades');
                    setEspecialidades([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchEspecialidades();
        }
    };
};
