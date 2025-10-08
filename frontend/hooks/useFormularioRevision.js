import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Toast } from '../components/CustomAlert';
import { obtenerDetallesIncidente, actualizarEstadoIncidente, obtenerHistorialIncidente } from '../services/incidenteService';
import { transformarIncidente } from '../utils/incidenteUtils';
import { ROLES } from '../utils/rolesConstants';

export const useFormularioRevision = (idIncidente) => {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [detalles, setDetalles] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [solucion, setSolucion] = useState('');
    const [estadoSeleccionado, setEstadoSeleccionado] = useState(null);
    const [sancionSeleccionada, setSancionSeleccionada] = useState(null);
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

            const [resultado, historialData] = await Promise.all([
                obtenerDetallesIncidente(idIncidente),
                obtenerHistorialIncidente(idIncidente)
            ]);

            if (resultado) {
                // Transformar los datos al formato esperado por el frontend
                const datosTransformados = transformarIncidente(resultado);
                
                setDetalles(datosTransformados);
                setEstadoSeleccionado(resultado.idEstadoIncidente);
                setSancionSeleccionada(resultado.idSancion || null);
                setSolucion(resultado.solucionPlanteada || '');
            }

            setHistorial(historialData || []);
        } catch (error) {
            setError(error.message || 'No se pudieron cargar los detalles del incidente');
            Toast.error('Error', 'No se pudieron cargar los detalles del incidente');
        } finally {
            setLoading(false);
        }
    };

    // Actualizar estado del incidente
    const actualizarEstado = async (detalleModificado, nuevasEvidencias = []) => {
        const usuarioId = session?.user?.id;
        if (!usuarioId) {
            Toast.error('Error', 'No hay sesión de usuario válida');
            return;
        }

        try {
            setLoading(true);
            
            // Subir nuevas evidencias si existen
            let evidenciasIds = [];
            if (nuevasEvidencias.length > 0) {
                const { subirEvidencias } = await import('../services/evidenciaService');
                // Tipo 2 = evidencias agregadas después de crear el incidente
                const resultadoUpload = await subirEvidencias(nuevasEvidencias, 2);
                
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
                usuarioModificador: usuarioId,
                evidenciasIds: evidenciasIds,
                idSancion: sancionSeleccionada
            });

            Toast.success('Éxito', 'Incidente actualizado correctamente');
            await cargarDetalles(); // Recargar detalles
        } catch (error) {
            Toast.error('Error', 'No se pudo actualizar el incidente');
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

    // Función para verificar permisos de edición
    const verificarPermisos = () => {
        // Si está cargando, no permitir edición
        if (!session?.user) {
            return { puedeEditar: false, mensaje: 'Verificando permisos...' };
        }

        // Verificar que sea profesor
        if (session.user.role !== ROLES.PROFESOR) {
            return { puedeEditar: false, mensaje: 'Solo los profesores pueden actualizar el estado de los incidentes' };
        }

        // Verificar que tenga especialidad
        if (!session.user.idEspecialidad) {
            return { puedeEditar: false, mensaje: 'El usuario no tiene una especialidad asignada' };
        }

        // Verificar que el incidente tenga un casillero con armario
        const especialidadCasillero = detalles?.casillero?.armario?.idEspecialidad;
        if (!especialidadCasillero) {
            return { puedeEditar: false, mensaje: 'El incidente no tiene un casillero válido asignado' };
        }

        // Verificar que las especialidades coincidan
        if (especialidadCasillero !== session.user.idEspecialidad) {
            return { 
                puedeEditar: false, 
                mensaje: 'No puede revisar este incidente porque pertenece a otra especialidad' 
            };
        }
        return { puedeEditar: true, mensaje: '' };
    };

    return {
        loading,
        detalles,
        historial,
        solucion,
        setSolucion,
        estadoSeleccionado,
        setEstadoSeleccionado,
        sancionSeleccionada,
        setSancionSeleccionada,
        observaciones,
        setObservaciones,
        actualizarEstado,
        verificarPermisos
    };
};