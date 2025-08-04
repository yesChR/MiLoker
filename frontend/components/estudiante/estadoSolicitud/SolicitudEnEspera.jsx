import React from "react";

const SolicitudEnEspera = ({ estudiante }) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-rose-500">En Lista de Espera</h2>
            <p className="mt-4">
                Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong> 😥⌛,
            </p>
            <p className="mt-2">
                Tu solicitud ha sido procesada, pero actualmente todos los casilleros han sido asignados. 
                Te hemos añadido a nuestra <strong className="text-yellow-600">lista de espera</strong>.
            </p>
            <p className="mt-4">
                Si se libera un casillero, te notificaremos lo antes posible para asignarte uno.
            </p>
        </div>
    );
};

export default SolicitudEnEspera;
