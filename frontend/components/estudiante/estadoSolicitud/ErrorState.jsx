import React from "react";
import { FaTimesCircle } from "react-icons/fa";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";

const ErrorState = ({ error }) => {
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estado de solicitudes"
                    breadcrumb="Inicio • Estado de solicitudes"
                />
            </div>
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div className="text-center py-8">
                    <FaTimesCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {error || "No se encontraron solicitudes"}
                    </h3>
                    <p className="text-gray-600">
                        {error ? "Intenta recargar la página o contacta con el administrador." 
                              : "Aún no has realizado ninguna solicitud de casillero."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ErrorState;
