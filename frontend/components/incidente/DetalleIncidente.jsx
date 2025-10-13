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
        <div className="space-y-6 pb-4">
            {/* Información General */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
                <div className="p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-md">
                            <FiAlertCircle className="text-2xl" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-800">Información General</h3>
                            <p className="text-sm text-gray-600">Incidente #{incidente.idIncidente}</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                    <FiMapPin className="text-base" />
                                    <span>Casillero</span>
                                </div>
                                <p className="text-gray-800 font-semibold pl-6">#{incidente.casillero?.numCasillero || 'N/A'}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                    <FiAlertCircle className="text-base" />
                                    <span>Estado Actual</span>
                                </div>
                                <div className="pl-6">
                                    <Chip
                                        color={obtenerColorEstado(incidente.idEstadoIncidente)}
                                        variant="flat"
                                        size="sm"
                                        className="font-semibold"
                                    >
                                        {obtenerTextoEstado(incidente.idEstadoIncidente)}
                                    </Chip>
                                </div>
                            </div>

                            {/* Sanción asignada */}
                            {incidente.sancion && (
                                <div className="space-y-1 col-span-2">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <span>Sanción Asignada</span>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <Chip
                                            color={
                                                incidente.sancion.gravedad === 'Muy Grave' ? 'danger' :
                                                incidente.sancion.gravedad === 'Grave' ? 'warning' :
                                                incidente.sancion.gravedad === 'Leve' ? 'primary' :
                                                'default'
                                            }
                                            variant="flat"
                                            size="sm"
                                            className="font-semibold"
                                        >
                                            {incidente.sancion.gravedad}
                                        </Chip>
                                        {incidente.sancion.detalle && (
                                            <p className="text-sm text-gray-600 mt-1">{incidente.sancion.detalle}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                    <FiCalendar className="text-base" />
                                    <span>Fecha de Creación</span>
                                </div>
                                <p className="text-gray-800 pl-6 text-sm">{formatearFecha(incidente.fechaCreacion)}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                                    <FiUser className="text-base" />
                                    <span>Reportado por</span>
                                </div>
                                <div className="pl-6">
                                    <p className="text-gray-800 font-medium">
                                        {incidente.creadorUsuario?.profesor 
                                            ? `${incidente.creadorUsuario.profesor.nombre} ${incidente.creadorUsuario.profesor.apellidoUno} ${incidente.creadorUsuario.profesor.apellidoDos || ''}`.trim()
                                            : incidente.creadorUsuario?.estudiante
                                            ? `${incidente.creadorUsuario.estudiante.nombre} ${incidente.creadorUsuario.estudiante.apellidoUno} ${incidente.creadorUsuario.estudiante.apellidoDos || ''}`.trim()
                                            : incidente.creadorUsuario?.nombreUsuario || 'Desconocido'
                                        }
                                    </p>
                                    {(incidente.creadorUsuario?.profesor || incidente.creadorUsuario?.estudiante) && (
                                        <p className="text-xs text-gray-500">{incidente.creadorUsuario?.nombreUsuario}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-600 font-medium mb-2 flex items-center gap-2">
                                <FiFileText className="text-base" />
                                Detalle del Incidente
                            </p>
                            <p className="text-sm text-gray-700 bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border border-gray-200">
                                {incidente.detalle || 'Sin detalles'}
                            </p>
                        </div>

                        {incidente.solucionPlanteada && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <MdCheckCircle className="text-white text-sm" />
                                    </div>
                                    <p className="text-sm text-gray-700 font-medium">Solución Planteada</p>
                                </div>
                                <p className="text-sm text-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                                    {incidente.solucionPlanteada}
                                </p>
                            </div>
                        )}

                        {incidente.fechaResolucion && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <FiCalendar className="text-white text-xs" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Fecha de Resolución</p>
                                        <p className="text-green-600 text-sm font-semibold">{formatearFecha(incidente.fechaResolucion)}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Estudiantes Involucrados */}
            {incidente.estudianteXincidentes && incidente.estudianteXincidentes.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-lg shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <FiUser className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">Estudiantes Involucrados</h3>
                                <p className="text-sm text-gray-600">{incidente.estudianteXincidentes.length} {incidente.estudianteXincidentes.length === 1 ? 'estudiante' : 'estudiantes'}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3">
                            {incidente.estudianteXincidentes.map((rel, index) => (
                                <div key={index} className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg p-4 border-l-4 border-purple-300 hover:border-purple-500 transition-all group">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                            {rel.estudiante?.nombre?.charAt(0) || '?'}{rel.estudiante?.apellidoUno?.charAt(0) || ''}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-base font-semibold text-gray-800">
                                                {rel.estudiante?.nombre} {rel.estudiante?.apellidoUno} {rel.estudiante?.apellidoDos}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                                <div>
                                                    <p className="text-xs text-gray-500">Cédula</p>
                                                    <p className="text-gray-700 font-medium">{rel.estudiante?.cedula}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Sección</p>
                                                    <p className="text-gray-700 font-medium">{rel.seccion || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <Chip
                                                    color={
                                                        rel.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.REPORTANTE ? "primary" :
                                                        rel.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.RESPONSABLE ? "danger" :
                                                        rel.tipoInvolucramiento === TIPOS_INVOLUCRAMIENTO.AFECTADO ? "warning" :
                                                        "default"
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                    className="font-semibold"
                                                >
                                                    {obtenerTextoTipo(rel.tipoInvolucramiento)}
                                                </Chip>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Evidencias */}
            {incidente.incidentesXevidencia && incidente.incidentesXevidencia.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-500 rounded-lg shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <FiFileText className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">Evidencias</h3>
                                <p className="text-sm text-gray-600">{incidente.incidentesXevidencia.length} {incidente.incidentesXevidencia.length === 1 ? 'archivo' : 'archivos'}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="grid grid-cols-2 gap-3">
                                {incidente.incidentesXevidencia.map((relEv, index) => {
                                    return (
                                        <div key={index} className="group relative">
                                            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all cursor-pointer">
                                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <FiFileText className="text-white text-lg" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-700 truncate group-hover:text-orange-700">
                                                        {relEv.evidencia?.nombreArchivo || `Evidencia ${index + 1}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Archivo #{index + 1}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDescargarEvidencia(relEv.evidencia)}
                                                    className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-orange-600 hover:bg-orange-100 hover:text-orange-700 transition-all shadow-sm hover:shadow-md flex-shrink-0"
                                                    title="Descargar evidencia"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Historial de Cambios */}
            {incidente.HistorialIncidentes && incidente.HistorialIncidentes.length > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-md">
                                <MdHistory className="text-2xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800">Historial de Cambios</h3>
                                <p className="text-sm text-gray-600">{incidente.HistorialIncidentes.length} {incidente.HistorialIncidentes.length === 1 ? 'cambio registrado' : 'cambios registrados'}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="space-y-4">
                                {incidente.HistorialIncidentes.map((hist, index) => (
                                    <div key={hist.idHistorial} className="relative pl-10">
                                        {/* Línea vertical del timeline */}
                                        {index < incidente.HistorialIncidentes.length - 1 && (
                                            <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gradient-to-b from-green-300 to-transparent"></div>
                                        )}
                                        
                                        {/* Punto del timeline mejorado */}
                                        <div className="absolute left-0 top-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                                hist.estadoAnterior === null 
                                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                                    : hist.estadoNuevo === 5 
                                                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                                    : hist.estadoNuevo === 6 
                                                    ? 'bg-gradient-to-br from-gray-500 to-gray-600' 
                                                    : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                            }`}>
                                                <FiClock className="text-white text-sm" />
                                            </div>
                                        </div>

                                        {/* Contenido del cambio mejorado */}
                                        <div className="bg-gradient-to-br from-gray-50 to-green-50 border-2 border-green-200 rounded-lg p-4 hover:border-green-400 transition-all hover:shadow-md">
                                            <div className="mb-3">
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    {hist.estadoAnterior === null ? (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            <span className="text-blue-600 font-semibold">Cambio de estado</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                                            <span>Cambio de estado</span>
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                    {hist.estadoAnterior === hist.estadoNuevo ? (
                                                        // Si ambos estados son iguales, mostrar solo uno
                                                        <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoNuevo)} className="font-semibold">
                                                            {obtenerTextoEstado(hist.estadoNuevo)}
                                                        </Chip>
                                                    ) : (
                                                        // Si son diferentes, mostrar transición con flecha
                                                        <>
                                                            {hist.estadoAnterior !== null && (
                                                                <>
                                                                    <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoAnterior)} className="font-semibold">
                                                                        {obtenerTextoEstado(hist.estadoAnterior)}
                                                                    </Chip>
                                                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                                    </svg>
                                                                </>
                                                            )}
                                                            <Chip size="sm" variant="flat" color={obtenerColorEstado(hist.estadoNuevo)} className="font-semibold">
                                                                {obtenerTextoEstado(hist.estadoNuevo)}
                                                            </Chip>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 bg-white rounded-lg p-2">
                                                <FiCalendar className="text-sm text-green-600" />
                                                <span className="font-medium">{formatearFecha(hist.fechaCambio)}</span>
                                            </div>

                                            <div className="flex items-center gap-3 py-3 px-3 bg-white rounded-lg border border-green-200">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                                                    {hist.usuario?.profesor 
                                                        ? `${hist.usuario.profesor.nombre?.charAt(0) || ''}${hist.usuario.profesor.apellidoUno?.charAt(0) || ''}`
                                                        : hist.usuario?.estudiante
                                                        ? `${hist.usuario.estudiante.nombre?.charAt(0) || ''}${hist.usuario.estudiante.apellidoUno?.charAt(0) || ''}`
                                                        : hist.usuario?.nombreUsuario?.charAt(0) || '?'
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-700">
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
                                                <div className="mt-3 pt-3 border-t-2 border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                            <FiFileText className="text-white text-xs" />
                                                        </div>
                                                        <p className="text-sm text-gray-700 font-medium">Observaciones</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                                                        {hist.observaciones}
                                                    </p>
                                                </div>
                                            )}

                                            {hist.solucion && (
                                                <div className="mt-3 pt-3 border-t-2 border-green-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                            <MdCheckCircle className="text-white text-xs" />
                                                        </div>
                                                        <p className="text-sm text-green-700 font-medium">Solución aplicada</p>
                                                    </div>
                                                    <p className="text-sm text-green-700 bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-300 font-medium">
                                                        {hist.solucion}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetalleIncidente;
