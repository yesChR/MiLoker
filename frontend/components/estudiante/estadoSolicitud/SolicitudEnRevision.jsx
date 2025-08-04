import React from "react";

const SolicitudEnRevision = ({ estudiante }) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-rose-500">Solicitud en Revisión</h2>
            <p className="mt-4">
                Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong> 👀📋,
            </p>
            <p className="mt-2">
                Tu solicitud de casillero está siendo <strong className="text-blue-600">revisada</strong> por nuestro equipo administrativo.
            </p>
            <p className="mt-4">
                Te notificaremos tan pronto como tengamos una respuesta. ¡Gracias por tu paciencia!
            </p>
        </div>
    );
};

export default SolicitudEnRevision;
