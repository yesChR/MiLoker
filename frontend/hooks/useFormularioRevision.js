import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Toast } from '../components/CustomAlert';
import { obtenerDetallesIncidente, actualizarEstadoIncidente, obtenerHistorialIncidente } from '../services/incidenteService';

export const useFormularioRevision = (idIncidente) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [detalles, setDetalles] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [solucion, setSolucion] = useState('');
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
    const [observaciones, setObservaciones] = useState('');
    const [error, setError] = useState(null);

    // Cargar detalles del incidente
    const cargarDetalles = async () => {
        if (!idIncidente) {
            setError('ID de incidente no proporcionado');
            return;
        }

        try {
            setError(null);
            setLoading(true);
            console.log('Cargando detalles para ID:', idIncidente); // Debug

            const [resultado, historialData] = await Promise.all([
                obtenerDetallesIncidente(idIncidente),
                obtenerHistorialIncidente(idIncidente)
            ]);

            console.log('Detalles recibidos:', resultado); // Debug
            console.log('Historial recibido:', historialData); // Debug

            if (resultado) {
                setDetalles(resultado);
                setEstadoSeleccionado(resultado.idEstadoIncidente);
                setSolucion(resultado.solucion || '');
            }

            setHistorial(historialData || []);
        } catch (error) {
            console.error('Error al cargar detalles:', error);
            setError(error.message || 'No se pudieron cargar los detalles del incidente');
            Toast.error('Error', 'No se pudieron cargar los detalles del incidente');
        } finally {
            setLoading(false);
        }
    };

    // Actualizar estado del incidente
    const actualizarEstado = async () => {
        if (!session?.user?.id) {
            Toast.error('Error', 'No hay sesión de usuario');
            return;
        }

        try {
            setLoading(true);
            await actualizarEstadoIncidente(idIncidente, {
                nuevoEstado: estadoSeleccionado,
                observaciones,
                solucion,
                usuarioModificador: session.user.id
            });

            Toast.success('Éxito', 'Estado actualizado correctamente');
            await cargarDetalles(); // Recargar detalles
        } catch (error) {
            Toast.error('Error', 'No se pudo actualizar el estado del incidente');
            console.error('Error al actualizar estado:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar detalles al montar el componente
    useEffect(() => {
        if (idIncidente) {
            cargarDetalles();
        }
    }, [idIncidente]);

    return {
        loading,
        detalles,
        historial,
        solucion,
        setSolucion,
        estadoSeleccionado,
        setEstadoSeleccionado,
        observaciones,
        setObservaciones,
        actualizarEstado
    };
};