import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Toast } from '../components/CustomAlert';
import { obtenerDetallesIncidente, actualizarEstadoIncidente, obtenerHistorialIncidente } from '../services/incidenteService';
import { transformarIncidente } from '../utils/incidenteUtils';

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
            console.log('Cargando detalles para ID:', idIncidente);

            const [resultado, historialData] = await Promise.all([
                obtenerDetallesIncidente(idIncidente),
                obtenerHistorialIncidente(idIncidente)
            ]);

            console.log('Detalles recibidos del backend:', resultado);
            console.log('Historial recibido:', historialData);

            if (resultado) {
                // Transformar los datos al formato esperado por el frontend
                const datosTransformados = transformarIncidente(resultado);
                console.log('Datos transformados:', datosTransformados);
                
                setDetalles(datosTransformados);
                setEstadoSeleccionado(resultado.idEstadoIncidente);
                setSolucion(resultado.solucionPlanteada || '');
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
    const actualizarEstado = async (detalleModificado, nuevasEvidencias = []) => {
        if (!session?.user?.id) {
            Toast.error('Error', 'No hay sesión de usuario');
            return;
        }

        try {
            setLoading(true);
            
            // Subir nuevas evidencias si existen
            let evidenciasIds = [];
            if (nuevasEvidencias.length > 0) {
                const { subirEvidencias } = await import('../services/evidenciaService');
                const resultadoUpload = await subirEvidencias(nuevasEvidencias);
                
                if (resultadoUpload.error) {
                    Toast.error('Error', 'No se pudieron subir las evidencias');
                    return;
                }
                
                evidenciasIds = resultadoUpload.evidencias?.map(e => e.idEvidencia) || [];
            }
            
            await actualizarEstadoIncidente(idIncidente, {
                nuevoEstado: estadoSeleccionado,
                observaciones,
                solucion,
                detalle: detalleModificado,
                usuarioModificador: session.user.id,
                evidenciasIds: evidenciasIds
            });

            Toast.success('Éxito', 'Incidente actualizado correctamente');
            await cargarDetalles(); // Recargar detalles
        } catch (error) {
            Toast.error('Error', 'No se pudo actualizar el incidente');
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