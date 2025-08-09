import React from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";

const LoadingSpinner = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estado de solicitudes"
                    breadcrumb="Inicio • Estado de solicitudes"
                />
            </div>
            <div className="w-full max-w-3xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div className="flex flex-col justify-center items-center py-12">
                    <div className="relative">
                       <div className="w-12 h-12 border-4 border-celeste border-t-primario rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-400 rounded-full animate-reverse"></div>
                    </div>
                    <div className="mt-6 text-center">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Cargando estado de solicitud</h3>
                        <p className="text-sm text-gray-500">Obteniendo información de tu solicitud...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
