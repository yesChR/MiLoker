import React from "react";

const SolicitudRechazada = ({ estudiante, justificacion }) => {
    return (
        <div>
            <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-danger text-xl">💔</span>
                </div>
                <h2 className="text-lg font-bold text-danger">Solicitud Rechazada</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
                <p className="text-blue-800 font-medium">
                    Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong>,
                </p>
                <p className="text-blue-700 mt-2">
                    Lamentamos informarte que tu solicitud de casillero ha sido <strong className="text-danger">rechazada</strong>.
                </p>
            </div>

            {justificacion && (
                <div className="bg-red-50 rounded-lg p-4 border border-red-200 mb-4">
                    <h3 className="font-semibold text-danger mb-2 flex items-center">
                        <span className="text-danger text-lg mr-2">📋</span>
                        Motivo del rechazo:
                    </h3>
                    <p className="text-danger ml-7">
                        {justificacion}
                    </p>
                </div>
            )}

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-r border border-blue-300">
                <div className="flex items-center">
                    <span className="text-blue-600 text-lg mr-2">💬</span>
                    <p className="text-sm">
                        <strong className="text-blue-800">Siguiente paso:</strong> 
                        <span className="text-blue-700 ml-1">Contacta con el administrador para más información sobre posibles alternativas o si tienes alguna pregunta.</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SolicitudRechazada;
