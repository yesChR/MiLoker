import React, { useState, useEffect, useCallback } from "react";
import { Spinner, Chip, Avatar } from "@heroui/react";
import { obtenerTextoEstado, obtenerColorEstado, TIPOS_INVOLUCRAMIENTO, obtenerTextoTipo } from "../../utils/incidenteConstants";
import { FiClock, FiUser, FiFileText, FiAlertCircle, FiMapPin, FiCalendar } from "react-icons/fi";
import { MdHistory, MdCheckCircle } from "react-icons/md";
import { incidenteService } from "../../services/incidenteService";
import { descargarEvidencia } from "../../services/evidenciaService";
import { Toast } from "../CustomAlert";

const DetalleIncidente = ({ incidenteId }) => {
    const [incidente, setIncidente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarDetalles = useCallback(async () => {
        try {
            setLoading(true);
            const data = await incidenteService.obtenerDetalles(incidenteId);
            setIncidente(data);
        } catch (error) {
            Toast.error('Error', 'No se pudieron cargar los detalles del incidente');
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, [incidenteId]);

    useEffect(() => {
        if (incidenteId) {
            cargarDetalles();
        }
    }, [incidenteId, cargarDetalles]);

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDescargarEvidencia = async (evidencia) => {
        const resultado = await descargarEvidencia(evidencia);
        if (resultado.error) {
            Toast.error('Error', resultado.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full min-h-[400px]">
                <Spinner size="lg" label="Cargando detalles..." color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 className="text-lg text-gray-800 mb-2">No se pudo cargar el incidente</h3>
                <p className="text-sm text-gray-500">Intenta cerrar y abrir el detalle nuevamente</p>
            </div>
        );
    }

    if (!incidente) {
        return (
            <div className="text-center text-gray-500 py-8">
                No se encontraron detalles del incidente
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-4">
            {/* Información General */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <FiAlertCircle className="text-xl text-blue-600" />
                    <h3 className="text-lg text-gray-800">Información General</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">Detalles del incidente #{incidente.idIncidente}</p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiMapPin className="text-base" />
                            <span>Casillero</span>
                        </div>
                        <p className="text-gray-800 pl-6">#{incidente.casillero?.numCasillero || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiAlertCircle className="text-base" />
                            <span>Estado Actual</span>
                        </div>
                        <div className="pl-6">
                            <Chip
                                color={obtenerColorEstado(incidente.idEstadoIncidente)}
                                variant="flat"
                                size="sm"
                            >
                                {obtenerTextoEstado(incidente.idEstadoIncidente)}
                            </Chip>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiCalendar className="text-base" />
                            <span>Fecha de Creación</span>
                        </div>
                        <p className="text-gray-800 pl-6 text-sm">{formatearFecha(incidente.fechaCreacion)}</p>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiUser className="text-base" />
                            <span>Reportado por</span>
                        </div>
                        <p className="text-gray-800 pl-6">
                            {incidente.creadorUsuario?.profesor 
                                ? `${incidente.creadorUsuario.profesor.nombre} ${incidente.creadorUsuario.profesor.apellidoUno} ${incidente.creadorUsuario.profesor.apellidoDos || ''}`.trim()
                                : incidente.creadorUsuario?.estudiante
                                ? `${incidente.creadorUsuario.estudiante.nombre} ${incidente.creadorUsuario.estudiante.apellidoUno} ${incidente.creadorUsuario.estudiante.apellidoDos || ''}`.trim()
                                : incidente.creadorUsuario?.nombreUsuario || 'Desconocido'
                            }
                        </p>
                        {(incidente.creadorUsuario?.profesor || incidente.creadorUsuario?.estudiante) && (
                            <p className="text-xs text-gray-500 pl-6">{incidente.creadorUsuario?.nombreUsuario}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Detalle del Incidente</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
                        {incidente.detalle || 'Sin detalles'}
                    </p>
                </div>

                {incidente.solucionPlanteada && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                            <MdCheckCircle className="text-green-600" />
                            <p className="text-sm text-gray-700">Solución Planteada</p>
                        </div>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                            {incidente.solucionPlanteada}
                        </p>
                    </div>
                )}

                {incidente.fechaResolucion && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <FiCalendar className="text-base" />
                            <span>Fecha de Resolución</span>
                        </div>
                        <p className="text-green-600 pl-6 text-sm mt-1">{formatearFecha(incidente.fechaResolucion)}</p>
                    </div>
                )}
            </div>

            {/* Estudiantes Involucrados */}
            {incidente.estudianteXincidentes && incidente.estudianteXincidentes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FiUser className="text-xl text-blue-600" />
                        <h3 className="text-lg text-gray-800">Estudiantes Involucrados</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{incidente.estudianteXincidentes.length} estudiante(s)</p>

                    <div className="space-y-3">
                        {incidente.estudianteXincidentes.map((rel, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <Avatar
                                    name={rel.estudiante?.nombre?.charAt(0) || '?'}
                                    size="sm"
                                    className="flex-shrink-0"
                                    color="primary"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate">
                                        {rel.estudiante?.nombre} {rel.estudiante?.apellidoUno} {rel.estudiante?.apellidoDos}
                                    </p>
                                    <p className="text-xs text-gray-500">Cédula: {rel.estudiante?.cedula}</p>
                                    <p className="text-xs text-gray-500">Sección: {rel.seccion}</p>
                                    <div className="mt-1">
                                        <Chip
                                            color={rel.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.RESPONSABLE ? "danger" : "default"}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {obtenerTextoTipo(rel.tipoInvolucramiento)}
                                        </Chip>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Evidencias */}
            {incidente.incidentesXevidencia && incidente.incidentesXevidencia.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <FiFileText className="text-xl text-blue-600" />
                        <h3 className="text-lg text-gray-800">Evidencias</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{incidente.incidentesXevidencia.length} archivo(s)</p>

                    <div className="grid grid-cols-2 gap-3">
                        {incidente.incidentesXevidencia.map((relEv, index) => {
                            return (
                                <div key={index} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                    <FiFileText className="text-blue-600 flex-shrink-0 group-hover:text-blue-700" />
                                    <span className="text-sm truncate text-gray-700 group-hover:text-blue-700 flex-1">
                                        {relEv.evidencia?.nombreArchivo || 'Evidencia'}
                                    </span>
                                    <button
                                        onClick={() => handleDescargarEvidencia(relEv.evidencia)}
                                        className="text-blue-600 hover:text-blue-700 p-1 flex-shrink-0"
                                        title="Descargar evidencia"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Historial de Cambios */}
            {incidente.HistorialIncidentes && incidente.HistorialIncidentes.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <MdHistory className="text-xl text-blue-600" />
                        <h3 className="text-lg text-gray-800">Historial de Cambios</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{incidente.HistorialIncidentes.length} cambio(s) registrado(s)</p>

                    <div className="space-y-4">
                        {incidente.HistorialIncidentes.map((hist, index) => (
                            <div key={hist.idHistorial} className="relative pl-8">
                                {/* Línea vertical del timeline */}
                                {index < incidente.HistorialIncidentes.length - 1 && (
                                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                )}
                                
                                {/* Punto del timeline */}
                                <div className="absolute left-0 top-0">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        hist.estadoAnterior === null 
                                            ? 'bg-blue-500' 
                                            : hist.estadoNuevo === 5 
                                            ? 'bg-green-500' 
                                            : hist.estadoNuevo === 6 
                                            ? 'bg-gray-500' 
                                            : 'bg-orange-500'
                                    }`}>
                                        <FiClock className="text-white text-xs" />
                                    </div>
                                </div>

                                {/* Contenido del cambio */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                                    <div className="mb-2">
                                        <p className="text-sm text-gray-800">
                                            {hist.estadoAnterior === null ? (
                                                <span className="text-blue-600">Cambio de estado:</span>
                                            ) : (
                                                <span>Cambio de estado:</span>
                                            )}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {hist.estadoAnterior === hist.estadoNuevo ? (
                                                // Si ambos estados son iguales, mostrar solo uno
                                                <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoNuevo)}>
                                                    {obtenerTextoEstado(hist.estadoNuevo)}
                                                </Chip>
                                            ) : (
                                                // Si son diferentes, mostrar transición con flecha
                                                <>
                                                    {hist.estadoAnterior !== null && (
                                                        <>
                                                            <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoAnterior)}>
                                                                {obtenerTextoEstado(hist.estadoAnterior)}
                                                            </Chip>
                                                            <span className="text-gray-400">→</span>
                                                        </>
                                                    )}
                                                    <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoNuevo)}>
                                                        {obtenerTextoEstado(hist.estadoNuevo)}
                                                    </Chip>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                        <FiCalendar className="text-xs" />
                                        {formatearFecha(hist.fechaCambio)}
                                    </p>

                                    <div className="flex items-center gap-2 py-2 border-t border-gray-200">
                                        <Avatar
                                            name={
                                                hist.usuario?.profesor 
                                                    ? `${hist.usuario.profesor.nombre?.charAt(0) || ''}${hist.usuario.profesor.apellidoUno?.charAt(0) || ''}`
                                                    : hist.usuario?.estudiante
                                                    ? `${hist.usuario.estudiante.nombre?.charAt(0) || ''}${hist.usuario.estudiante.apellidoUno?.charAt(0) || ''}`
                                                    : hist.usuario?.nombreUsuario?.charAt(0) || '?'
                                            }
                                            size="sm"
                                            color="secondary"
                                        />
                                        <div>
                                            <p className="text-xs text-gray-700">
                                                {hist.usuario?.profesor 
                                                    ? `${hist.usuario.profesor.nombre} ${hist.usuario.profesor.apellidoUno} ${hist.usuario.profesor.apellidoDos || ''}`.trim()
                                                    : hist.usuario?.estudiante
                                                    ? `${hist.usuario.estudiante.nombre} ${hist.usuario.estudiante.apellidoUno} ${hist.usuario.estudiante.apellidoDos || ''}`.trim()
                                                    : hist.usuario?.nombreUsuario || 'Usuario desconocido'
                                                }
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {hist.usuario?.nombreUsuario && (hist.usuario?.profesor || hist.usuario?.estudiante) 
                                                    ? hist.usuario.nombreUsuario 
                                                    : 'Modificador'
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {hist.observaciones && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Observaciones:</p>
                                            <p className="text-sm text-gray-700">{hist.observaciones}</p>
                                        </div>
                                    )}

                                    {hist.solucion && (
                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 mb-1">Solución aplicada:</p>
                                            <p className="text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                                {hist.solucion}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetalleIncidente;
