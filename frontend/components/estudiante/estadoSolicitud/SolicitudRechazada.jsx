import React from "react";

const SolicitudRechazada = ({ estudiante, justificacion }) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-rose-500">Solicitud Rechazada</h2>
            <p className="mt-4">
                Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong> 😓💔,
            </p>
            <p className="mt-2">
                Lamentamos informarte que tu solicitud de casillero ha sido <strong className="text-red-600">rechazada</strong>.
            </p>
            {justificacion && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                    <h3 className="text-sm font-semibold text-red-800 mb-2">Motivo del rechazo:</h3>
                    <p className="text-sm text-red-700">
                        {justificacion}
                    </p>
                </div>
            )}
            <p className="mt-4">
                Por favor, contacta con el administrador para más información sobre posibles alternativas o si tienes alguna pregunta.
            </p>
        </div>
    );
};

export default SolicitudRechazada;
