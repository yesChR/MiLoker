import React from "react";
import { FiUser, FiPhone, FiMail, FiBookOpen, FiHash, FiCalendar } from "react-icons/fi";
import { ESTADOS } from "../../common/estados";

const EstudianteAsignado = ({ estudianteAsignado, solicitudInfo }) => {
    console.log("🎯 EstudianteAsignado - datos recibidos:", { estudianteAsignado, solicitudInfo });
    
    // Función para capitalizar textos
    const capitalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    // Si no hay estudiante asignado, no renderizar nada
    if (!estudianteAsignado) {
        console.log("❌ No hay estudiante asignado");
        return null;
    }

    const nombreCompleto = [
        estudianteAsignado.nombre,
        estudianteAsignado.apellidoUno,
        estudianteAsignado.apellidoDos,
    ]
        .filter(Boolean)
        .map(texto => capitalizarTexto(texto))
        .join(' ');

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm mt-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                </div>
                <h4 className="text-base font-bold text-blue-800">
                    Casillero Ocupado por:
                </h4>
            </div>

            <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                {/* Header del estudiante */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg mb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-base font-bold mb-2 break-words leading-tight">
                                {nombreCompleto || 'Nombre no disponible'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                                    <FiHash className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{estudianteAsignado.cedula || 'N/A'}</span>
                                </span>
                                <span className="bg-white bg-opacity-20 px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap">
                                    <FiBookOpen className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{estudianteAsignado.seccion || 'N/A'}</span>
                                </span>
                                {estudianteAsignado.estado === ESTADOS.ACTIVO ? (
                                    <span className="bg-green-500 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                                        ✓ Activo
                                    </span>
                                ) : (
                                    <span className="bg-red-500 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                                        ✗ Inactivo
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
                            <FiUser className="text-lg" />
                        </div>
                    </div>
                </div>

                {/* Información de contacto */}
                <div className="grid grid-cols-1 gap-3 mb-3">
                    {/* Teléfono */}
                    {estudianteAsignado.telefono && (
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <FiPhone className="text-green-600 w-4 h-4 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                                <span className="text-green-700 font-medium text-xs uppercase tracking-wide block">Teléfono</span>
                                <p className="text-gray-800 font-semibold text-sm mt-1">
                                    <a 
                                        href={`tel:${estudianteAsignado.telefono}`}
                                        className="text-green-600 hover:text-green-800 hover:underline transition-colors break-all"
                                    >
                                        {estudianteAsignado.telefono}
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Correo */}
                    {estudianteAsignado.correo && (
                        <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <FiMail className="text-purple-600 w-4 h-4 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                                <span className="text-purple-700 font-medium text-xs uppercase tracking-wide block">Correo</span>
                                <p className="text-gray-800 text-sm mt-1">
                                    <a
                                        href={`mailto:${estudianteAsignado.correo}`}
                                        className="text-purple-600 hover:text-purple-800 hover:underline transition-colors break-all"
                                    >
                                        {estudianteAsignado.correo}
                                    </a>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 gap-3 mb-3">
                    {/* Especialidad */}
                    {estudianteAsignado.especialidad && (
                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                                <span className="text-indigo-700 font-medium text-xs uppercase tracking-wide block">Especialidad</span>
                                <p className="text-gray-800 font-bold text-sm mt-1 break-words">
                                    {estudianteAsignado.especialidad.nombre}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Fecha de nacimiento */}
                    {estudianteAsignado.fechaNacimiento && (
                        <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
                            <FiCalendar className="text-pink-600 w-4 h-4 flex-shrink-0 mt-1" />
                            <div className="flex-1 min-w-0">
                                <span className="text-pink-700 font-medium text-xs uppercase tracking-wide block">Fecha de Nacimiento</span>
                                <p className="text-gray-800 font-semibold text-sm mt-1">
                                    {(() => {
                                        let fecha = estudianteAsignado.fechaNacimiento;
                                        let dateObj;
                                        // Si es string y solo tiene formato YYYY-MM-DD
                                        if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                                            dateObj = new Date(fecha + 'T00:00:00Z');
                                        } else {
                                            dateObj = new Date(fecha);
                                        }
                                        return isNaN(dateObj.getTime())
                                            ? 'Fecha inválida'
                                            : dateObj.toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                timeZone: 'UTC'
                                            });
                                    })()}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Información de la solicitud */}
                {solicitudInfo && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <h5 className="text-amber-800 font-semibold text-sm mb-2">📋 Información de Asignación</h5>
                        <div className="grid grid-cols-1 gap-2 text-xs">
                            <div className="flex justify-between items-center">
                                <strong className="text-amber-700">Solicitud ID:</strong> 
                                <span className="text-gray-700">{solicitudInfo.idSolicitud}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <strong className="text-amber-700">Fecha Solicitud:</strong> 
                                <span className="text-gray-700">{new Date(solicitudInfo.fechaSolicitud).toLocaleDateString('es-ES')}</span>
                            </div>
                            {solicitudInfo.fechaRevision && (
                                <div className="flex justify-between items-center">
                                    <strong className="text-amber-700">Fecha Aprobación:</strong> 
                                    <span className="text-gray-700">{new Date(solicitudInfo.fechaRevision).toLocaleDateString('es-ES')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EstudianteAsignado;
