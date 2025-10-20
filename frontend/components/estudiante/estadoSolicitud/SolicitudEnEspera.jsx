import React from "react";

const SolicitudEnEspera = ({ estudiante }) => {
    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 text-xl">⏳</span>
                </div>
                <h2 className="text-lg font-bold text-orange-600">En Lista de Espera</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-blue-800 font-medium">
                    Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong>,
                </p>
                <p className="text-blue-700 mt-2">
                    Tu solicitud ha sido recibida y está <strong className="text-orange-600">en proceso de revisión</strong> por parte de los docentes.
                </p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded-r border border-orange-300">
                <div className="flex items-start">
                    <span className="text-orange-600 text-lg mr-2 mt-0.5">📋</span>
                    <div className="text-sm">
                        <p className="text-orange-800 font-semibold mb-1">Estado actual:</p>
                        <p className="text-orange-700">
                            Tu solicitud está siendo evaluada por los docentes. Dependiendo de la disponibilidad 
                            de casilleros, recibirás una respuesta cuando se complete el proceso de revisión.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r border border-blue-300 mt-3">
                <div className="flex items-center">
                    <span className="text-blue-600 text-lg mr-2">💡</span>
                    <p className="text-sm">
                        <strong className="text-blue-800">Recuerda:</strong> 
                        <span className="text-blue-700 ml-1">Puedes consultar el estado de tu solicitud en cualquier momento desde esta sección.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SolicitudEnEspera;
