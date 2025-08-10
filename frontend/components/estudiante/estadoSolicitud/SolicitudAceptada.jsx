import React from "react";

const SolicitudAceptada = ({ estudiante, casilleroAsignado }) => {
    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-danger text-xl">🎉</span>
                </div>
                <h2 className="text-lg font-bold text-danger">¡Felicitaciones!</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-blue-800 font-medium">
                    Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong>,
                </p>
                <p className="text-blue-700 mt-2">
                    Te informamos que tu solicitud ha sido <strong className="text-green-600">aceptada</strong> y se te ha asignado un casillero.
                </p>
            </div>

            {casilleroAsignado && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Detalles de tu casillero:</h3>
                    <div className="space-y-2">
                        <div className="flex items-center">
                            <span className="text-blue-500 text-lg mr-3">🔢</span>
                            <div>
                                <strong className="text-blue-800">Número de Casillero:</strong>
                                <span className="text-gray-700 ml-1">{casilleroAsignado.numCasillero}</span>
                            </div>
                        </div>

                        {casilleroAsignado.armario && (
                            <div className="flex items-center">
                                <span className="text-purple-500 text-lg mr-3">📍</span>
                                <div>
                                    <strong className="text-purple-800">Armario:</strong>
                                    <span className="text-gray-700 ml-1">{casilleroAsignado.armario.idArmario}</span>
                                </div>
                            </div>
                        )}

                        {casilleroAsignado.detalle && (
                            <div className="flex items-center">
                                <span className="text-orange-500 text-lg mr-3">📝</span>
                                <div>
                                    <strong className="text-orange-800">Ubicación:</strong>
                                    <span className="text-gray-700 ml-1">{casilleroAsignado.detalle}</span>
                                </div>
                            </div>
                        )}

                        {casilleroAsignado.detalleSolicitud && (
                            <div className="flex items-center">
                                <span className="text-indigo-500 text-lg mr-3">📋</span>
                                <div>
                                    <strong className="text-indigo-800">Opción asignada:</strong>
                                    <span className="text-gray-700 ml-1">{casilleroAsignado.detalleSolicitud}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r border border-yellow-300">
                <div className="flex items-center">
                    <span className="text-yellow-600 text-lg mr-2">😉</span>
                    <p className="text-sm">
                        <strong className="text-yellow-800">Recuerda:</strong> 
                        <span className="text-yellow-700 ml-1">Este casillero es de uso personal. Mantenerlo en buen estado y respetar las normas de uso.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SolicitudAceptada;
