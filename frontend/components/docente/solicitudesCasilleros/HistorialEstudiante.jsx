import React from "react";
import { formatDateShort } from "../../../utils/dateUtils";
import { ESTADOS_SOLICITUD } from "../../common/estadosSolicutudes";

const getEstadoInfo = (estado) => {
    switch (estado) {
        case ESTADOS_SOLICITUD.ACEPTADA:
            return {
                texto: 'Aprobada',
                estilos: 'bg-green-100 text-green-700'
            };
        case ESTADOS_SOLICITUD.RECHAZADA:
            return {
                texto: 'Rechazada',
                estilos: 'bg-red-100 text-red-700'
            };
        case ESTADOS_SOLICITUD.EN_ESPERA:
        default:
            return {
                texto: 'En Espera',
                estilos: 'bg-yellow-100 text-yellow-700'
            };
    }
};

// Función para obtener información del tipo de involucramiento
const getTipoInvolucramientoInfo = (tipo) => {
    switch (tipo) {
        case 1: // Reportante
            return { texto: 'Reportante', estilos: 'bg-blue-100 text-blue-700 border-blue-300' };
        case 2: // Responsable
            return { texto: 'Responsable', estilos: 'bg-red-100 text-red-700 border-red-300' };
        case 3: // Testigo
            return { texto: 'Testigo', estilos: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
        case 4: // Afectado
            return { texto: 'Afectado', estilos: 'bg-orange-100 text-orange-700 border-orange-300' };
        default:
            return { texto: 'Sin definir', estilos: 'bg-gray-100 text-gray-700 border-gray-300' };
    }
};

const HistorialEstudiante = ({ historialEstudiante, cargandoHistorial }) => {
    if (cargandoHistorial) {
        return (
            <div className="flex flex-col mb-4">
                <label className="text-azulOscuro font-bold text-xl mb-4">Historial del Estudiante</label>
                <div className="text-center py-8">
                    <div className="relative inline-block">
                        <div className="w-8 h-8 border-3 border-celeste border-t-primario rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2">Cargando historial...</p>
                </div>
            </div>
        );
    }

    if (!historialEstudiante) {
        return (
            <div className="flex flex-col mb-4">
                <label className="text-azulOscuro font-bold text-xl mb-4">Historial del Estudiante</label>
                <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No se pudo cargar el historial del estudiante</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col mb-4">
            <label className="text-azulOscuro font-bold text-lg mb-3">Historial del Estudiante</label>

            <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-blue-600">
                        {historialEstudiante.estadisticas.totalCasilleros}
                    </div>
                    <div className="text-xs text-blue-700">Casilleros</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-purple-600">
                        {historialEstudiante.estadisticas.totalIncidentes}
                    </div>
                    <div className="text-xs text-purple-700">Incidentes</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-green-600">
                        {historialEstudiante.estadisticas.solicitudesAprobadas}
                    </div>
                    <div className="text-xs text-green-700">Aprobadas</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                    <div className="text-lg font-bold text-red-600">
                        {historialEstudiante.estadisticas.solicitudesRechazadas}
                    </div>
                    <div className="text-xs text-red-700">Rechazadas</div>
                </div>
            </div>

            <div className="mb-4">
                <h3 className="text-gray-600 font-semibold text-sm mb-2">Casilleros Históricos</h3>
                {historialEstudiante.casilleros && historialEstudiante.casilleros.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {historialEstudiante.casilleros.slice(0, 3).map((item, index) => (
                            <div key={index} className="bg-gray-50 border rounded p-3">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        <span className="font-bold text-lg text-blue-600">{item.casillero.numeroSecuencia}</span>
                                    </div>
                                    <div className="flex-1 text-xs text-gray-500 space-y-1">
                                        {item.fechaAsignacion && (
                                            <div>• Aprobado: {formatDateShort(item.fechaAsignacion)}</div>
                                        )}
                                        {item.periodo && (
                                            <div>• Período: {formatDateShort(item.periodo.fechaInicio)} - {formatDateShort(item.periodo.fechaFin)}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {historialEstudiante.casilleros.length > 3 && (
                            <div className="text-center text-xs text-gray-500">
                                ... y {historialEstudiante.casilleros.length - 3} más
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 border-dashed border-2 border-gray-200 rounded p-4 text-center">
                        <p className="text-gray-500 text-sm">Sin casilleros anteriores</p>
                    </div>
                )}
            </div>

            <div className="mb-4">
                <h3 className="text-gray-600 font-semibold text-sm mb-2">
                    Historial de Incidentes
                    {historialEstudiante.estadisticas.totalIncidentes > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                            ({historialEstudiante.estadisticas.incidentesResueltos}/{historialEstudiante.estadisticas.totalIncidentes} resueltos)
                        </span>
                    )}
                </h3>
                
                {/* Mostrar desglose por tipo de involucramiento si hay incidentes */}
                {historialEstudiante.estadisticas.incidentesPorTipo && historialEstudiante.estadisticas.totalIncidentes > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded">
                        <p className="text-xs text-gray-600 mb-1 font-medium">Involucramiento en Incidentes:</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                            {historialEstudiante.estadisticas.incidentesPorTipo.reportante > 0 && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded border border-blue-300">
                                    {historialEstudiante.estadisticas.incidentesPorTipo.reportante} como Reportante
                                </span>
                            )}
                            {historialEstudiante.estadisticas.incidentesPorTipo.responsable > 0 && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded border border-red-300 font-semibold">
                                    {historialEstudiante.estadisticas.incidentesPorTipo.responsable} como Responsable
                                </span>
                            )}
                            {historialEstudiante.estadisticas.incidentesPorTipo.testigo > 0 && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded border border-yellow-300">
                                    {historialEstudiante.estadisticas.incidentesPorTipo.testigo} como Testigo
                                </span>
                            )}
                            {historialEstudiante.estadisticas.incidentesPorTipo.afectado > 0 && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded border border-orange-300">
                                    {historialEstudiante.estadisticas.incidentesPorTipo.afectado} como Afectado
                                </span>
                            )}
                        </div>
                    </div>
                )}
                
                {historialEstudiante.incidentes && historialEstudiante.incidentes.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {historialEstudiante.incidentes.slice(0, 2).map((item, index) => {
                            console.log('Incidente:', item); // Debug
                            console.log('tipoInvolucramiento:', item.tipoInvolucramiento); // Debug
                            const tipoInfo = getTipoInvolucramientoInfo(item.tipoInvolucramiento);
                            console.log('tipoInfo:', tipoInfo); // Debug
                            return (
                                <div key={index} className={`border rounded p-2 ${
                                    item.tipoInvolucramiento === 2 
                                        ? 'bg-red-50 border-red-200' 
                                        : 'bg-gray-50 border-gray-200'
                                }`}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-medium px-2 py-0.5 rounded border ${tipoInfo.estilos}`}>
                                                    {tipoInfo.texto}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded ${
                                                    item.fechaResolucion 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {item.fechaResolucion ? 'Resuelto' : 'Pendiente'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-800 mb-1 line-clamp-2">{item.detalle}</p>
                                            <div className="text-xs text-gray-500">
                                                {item.casillero && `Casillero: ${item.casillero.numeroSecuencia} • `}
                                                Sección: {item.seccion} • {formatDateShort(item.fechaCreacion)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {historialEstudiante.incidentes.length > 2 && (
                            <div className="text-center text-xs text-gray-500">
                                ... y {historialEstudiante.incidentes.length - 2} más
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-green-50 border-dashed border-2 border-green-200 rounded p-4 text-center">
                        <p className="text-green-600 text-sm">Sin incidentes registrados</p>
                    </div>
                )}
            </div>

            {historialEstudiante.solicitudes && historialEstudiante.solicitudes.length > 1 && (
                <div className="mb-4">
                    <h3 className="text-gray-700 font-semibold text-sm mb-2">Historial de Solicitudes</h3>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                        {historialEstudiante.solicitudes.slice(1, 3).map((solicitud, index) => {
                            const estadoInfo = getEstadoInfo(solicitud.estado);
                            return (
                                <div key={index} className="bg-gray-50 border rounded p-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="flex items-center text-sm">
                                                <span className={`px-2 py-1 rounded text-xs mr-2 ${estadoInfo.estilos}`}>
                                                    {estadoInfo.texto}
                                                </span>
                                                <span className="text-gray-600">{formatDateShort(solicitud.fechaSolicitud)}</span>
                                            </div>
                                            {solicitud.especialidad && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {solicitud.especialidad.nombre}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {historialEstudiante.solicitudes.length > 3 && (
                            <div className="text-center text-xs text-gray-500">
                                ... y {historialEstudiante.solicitudes.length - 3} más
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistorialEstudiante;
