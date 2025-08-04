import React from "react";

const SolicitudAceptada = ({ estudiante, casilleroAsignado }) => {
    return (
        <div>
            <h2 className="text-lg font-bold text-rose-500">¡Felicitaciones! 🎉</h2>
            <p className="mt-4">
                Hola <strong>{`${estudiante.nombre} ${estudiante.apellidoUno}`}</strong>,
            </p>
            <p className="mt-2">
                Te informamos que tu solicitud ha sido <strong className="text-green-600">aceptada</strong> y se te ha asignado un casillero.
            </p>
            {casilleroAsignado && (
                <>
                    <p className="mt-4">Aquí están los detalles:</p>
                    <ul className="mt-2 list-disc list-inside">
                        <li>
                            🔢 Número de Casillero: <strong>{casilleroAsignado.numCasillero}</strong>
                        </li>
                        {casilleroAsignado.armario && (
                            <li>
                                📍 Armario: <strong>{casilleroAsignado.armario.idArmario}</strong>
                            </li>
                        )}
                        {casilleroAsignado.detalle && (
                            <li>
                                📝 Ubicación: <strong>{casilleroAsignado.detalle}</strong>
                            </li>
                        )}
                        {casilleroAsignado.detalleSolicitud && (
                            <li>
                                📋 Opción asignada: <strong>{casilleroAsignado.detalleSolicitud}</strong>
                            </li>
                        )}
                    </ul>
                </>
            )}
            <p className="mt-4">
                Este casillero es de uso personal. Recuerda mantenerlo en buen estado y respetar las normas de uso. 😉✌️
            </p>
        </div>
    );
};

export default SolicitudAceptada;
