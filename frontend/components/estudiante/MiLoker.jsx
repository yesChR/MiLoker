import React from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";

const MiLoker = () => {
    const datos = {
        nombreEstudiante: "Juan Pérez",
        numeroCasillero: 3,
        armario: "A",
    };

    const tarjetas = [
        {
            titulo: "Período solicitud",
            fechas: "20/feb/2025 a 01/mar/2025",
            color: "bg-gray-100",
        },
        {
            titulo: "Período asignación",
            fechas: "20/feb/2025 a 01/mar/2025",
            color: "bg-red-100",
        },
        {
            titulo: "Casillero asignado",
            detalles: `Armario: ${datos.armario} - Casillero: ${datos.numeroCasillero}`,
            color: "bg-yellow-100",
        },
        {
            titulo: "Estado Actual",
            detalles: "En espera",
            color: "bg-blue-50",
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estado de solicitudes"
                    breadcrumb="Inicio • Estado de solicitudes"
                />
            </div>

            {/* Tarjetas dinámicas */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
                {tarjetas.map((tarjeta, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg shadow-md border border-gray-200 ${tarjeta.color}`}
                    >
                        <h3 className="text-lg font-bold text-azulOscuro text-center">{tarjeta.titulo}</h3>
                        {tarjeta.fechas && (
                            <p className="text-sm text-gray-600 mt-2 text-center">{tarjeta.fechas}</p>
                        )}
                        {tarjeta.detalles && (
                            <p className="text-sm text-gray-600 mt-2 text-center">{tarjeta.detalles}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Normas del casillero */}
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div>
                    <h2 className="text-lg font-bold text-rose-500">Importante</h2>
                    <p className="mt-4">📢¡Recuerda las normas de tu casillero!🔑</p>
                    <p className="mt-4">
                        Hola <strong>{datos.nombreEstudiante}</strong>,
                    </p>
                    <p className="mt-4">
                        Para que todos podamos usar los casilleros de forma segura y ordenada, te
                        recordamos algunas reglas importantes:
                    </p>
                    <ul className="mt-2 ml-4">
                        <li>❌No prestes tu casillero a otras personas. Es de uso personal.</li>
                        <li>🔑La llave o combinación es tu responsabilidad, cuídala bien.</li>
                        <li>🍔No guardes alimentos perecederos para evitar malos olores y plagas.</li>
                        <li>
                            🚫Está prohibido almacenar sustancias ilegales, armas o cualquier objeto
                            peligroso.
                        </li>
                    </ul>
                    <p className="mt-4">
                        ¡Cuidemos juntos este espacio! Si tienes dudas, estamos aquí para ayudarte.😊
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MiLoker;