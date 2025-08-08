import React from "react";
import { FiUser } from "react-icons/fi";

const EstudianteAsignado = ({ casillerosXestudiantes }) => {
    // Función para capitalizar textos
    const capitalizarTexto = (texto) => {
        if (!texto) return '';
        return texto
            .toLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    };

    // Si no hay estudiantes asignados, no renderizar nada
    if (!casillerosXestudiantes || casillerosXestudiantes.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FiUser className="text-white text-sm" />
                </div>
                <h4 className="text-base font-bold text-blue-800">
                    Estudiante Asignado
                </h4>
            </div>

            {casillerosXestudiantes.map((asignacion, index) => {
                const nombreCompleto = [
                    asignacion.estudiante?.nombre,
                    asignacion.estudiante?.apellidoUno,
                    asignacion.estudiante?.apellidoDos,
                ]
                    .filter(Boolean)
                    .map(texto => capitalizarTexto(texto))
                    .join(' ');

                return (
                    <div key={index} className="bg-white rounded-xl p-5 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="space-y-4">
                            {/* Nombre completo */}
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className="flex-1">
                                    <span className="text-blue-700 font-semibold text-xs uppercase tracking-wide">Nombre Completo</span>
                                    <p className="text-gray-800 font-bold text-base mt-1">
                                        {nombreCompleto || 'No disponible'}
                                    </p>
                                </div>
                            </div>

                            {/* Grid para información adicional */}
                            <div className="grid grid-cols-1 gap-3">
                                {/* Cédula */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <span className="text-gray-600 font-medium text-xs uppercase tracking-wide">Cédula</span>
                                        <p className="text-gray-800 font-mono text-sm font-semibold mt-1">
                                            {asignacion.estudiante?.cedula || 'No disponible'}
                                        </p>
                                    </div>
                                </div>

                                {/* Sección */}
                                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                                    <div className="flex-1">
                                        <span className="text-yellow-700 font-medium text-xs uppercase tracking-wide">Sección</span>
                                        <p className="text-gray-800 font-bold text-sm mt-1">
                                            {asignacion.estudiante?.seccion || 'No disponible'}
                                        </p>
                                    </div>
                                </div>

                                {/* Teléfono */}
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                    <div className="flex-1">
                                        <span className="text-green-700 font-medium text-xs uppercase tracking-wide">Teléfono</span>
                                        <p className="text-gray-800 font-semibold text-sm mt-1">
                                            {asignacion.estudiante?.telefono ? (
                                                <a 
                                                    href={`tel:${asignacion.estudiante.telefono}`}
                                                    className="text-green-600 hover:text-green-800 hover:underline transition-colors"
                                                >
                                                    {asignacion.estudiante.telefono}
                                                </a>
                                            ) : (
                                                'No disponible'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Correo */}
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                                    <div className="flex-1">
                                        <span className="text-purple-700 font-medium text-xs uppercase tracking-wide">Correo Electrónico</span>
                                        <p className="text-gray-800 text-sm mt-1 break-all">
                                            {asignacion.estudiante?.correo ? (
                                                <a
                                                    href={`mailto:${asignacion.estudiante.correo}`}
                                                    className="text-purple-600 hover:text-purple-800 hover:underline transition-colors font-medium bg-white px-2 py-1 rounded border border-purple-200 inline-block"
                                                >
                                                    {asignacion.estudiante.correo}
                                                </a>
                                            ) : (
                                                'No disponible'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EstudianteAsignado;
