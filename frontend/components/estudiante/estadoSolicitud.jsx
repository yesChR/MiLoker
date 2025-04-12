import CabezeraDinamica from "../Layout/CabeceraDinamica";
import React, { useState } from "react";
import RowSteps from "./row-steps";

const EstadoSolicitud = () => {
    const [estado, setEstado] = useState("aceptada");
    const datos = {
        nombreEstudiante: "Juan Pérez",
        numeroCasillero: 3,
        armario: "A",
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estado de solicitudes"
                    breadcrumb="Inicio • Estado de solicitudes"
                />
            </div>

            <RowSteps
                className="w-full max-w-3xl flex justify-center items-center mt-6 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
                defaultStep={estado === "aceptada" ? 2 : estado === "rechazada" ? 1 : 0}
                steps={[
                    {
                        title: "Enviada",
                    },
                    {
                        title: "Revisión",
                    },
                    {
                        title: "Aceptada",
                    },
                ]}
            />

            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                {estado === "aceptada" && (
                    <div>
                        <h2 className="text-lg font-bold text-rose-500">Importante</h2>
                        <p className="mt-4">
                            Hola <strong>{datos.nombreEstudiante}</strong>,
                        </p>
                        <p className="mt-2">
                            Te informamos que se te ha asignado un casillero.
                        </p>
                        <p className="mt-4">
                            Aquí están los detalles:
                        </p>
                        <ul className="mt-2 list-disc list-inside">
                            <li>📍 Armario: <strong>{datos.armario}</strong></li>
                            <li>🔢 Número de Casillero: <strong>{datos.numeroCasillero}</strong></li>
                        </ul>
                        <p className="mt-4">
                            Este casillero es de uso personal. Recuerda mantenerlo en buen estado y respetar las normas de uso. 😉✌️
                        </p>
                    </div>
                )}
                {estado === "rechazada" && (
                    <div>
                        <h2 className="text-lg font-bold text-rose-500">Importante</h2>
                        <p className="mt-4">
                            Hola <strong>{datos.nombreEstudiante}</strong>,
                        </p>
                        <p className="mt-2">
                            Lamentamos informarte que tu solicitud ha sido rechazada. Por favor, contacta con el administrador para más información.
                        </p>
                    </div>
                )}
                {estado === "espera" && (
                    <div>
                        <h2 className="text-lg font-bold text-rose-500">Importante</h2>
                        <p className="mt-4">
                            Hola <strong>{datos.nombreEstudiante}</strong> 😥⌛,
                        </p>
                        <p className="mt-2">
                            Queremos informarte que actualmente todos los casilleros han sido asignados, pero te hemos añadido a nuestra lista de espera.
                        </p>
                        <p className="mt-4">
                            Si se libera un casillero, te notificaremos lo antes posible para asignarte uno.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EstadoSolicitud;