import React from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";

const RenunciarCasillero = () => {
    const datos = {
        nombreEstudiante: "Juan Pérez",
        numeroCasillero: 3,
        armario: "A",
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Renunciar al casillero"
                    breadcrumb="Inicio • Renunciar casillero"
                />
            </div>
            <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div>
                    <h2 className="text-lg font-bold text-danger">Leer cuidadosamente...</h2>
                    <p className="mt-4">
                        ¿{datos.nombreEstudiante}, estás seguro de que deseas renunciar a tu casillero?
                    </p>
                    <p className="mt-1">Esta acción es irreversible.</p>
                    <ul className="mt-4 list-disc list-inside">
                        <li>
                            <strong className="text-black">Número de Casillero:</strong> {datos.numeroCasillero}
                        </li>
                        <li>
                            <strong className="text-black">Armario:</strong> {datos.armario}
                        </li>
                    </ul>
                    <p className="mt-4">Si confirmas, tu casillero quedará disponible para otro estudiante.</p>
                    <p>Si fue un error, puedes cancelar esta acción.</p>
                    <p className="mt-4">
                        <strong className="text-danger">Recuerda:</strong> Antes de renunciar, asegúrate de retirar todas tus pertenencias.
                    </p>
                </div>
                <div className="flex justify-end mt-6 space-x-4 mr-8">
                    <button className="text-gray-500 font-bold rounded-lg hover:text-rose-600">
                        Aceptar
                    </button>
                    <button className="text-danger font-bold rounded-lg hover:text-gray-300">
                        Cancelar
                    </button>
                </div>
            </div>
        </div >
    );
};

export default RenunciarCasillero;
