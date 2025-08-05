import React from "react";
import { Button } from "@heroui/react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";

const ErrorSolicitudes = ({ error, onReintentar, estado }) => {
    const estados = {
        1: "En revisión",
        2: "Aprobadas", 
        3: "Rechazadas",
        4: "En espera",
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Solicitudes"
                    breadcrumb={`Inicio • Docente • Solicitudes • ${estados[estado] || 'Error'}`}
                />
            </div>
            <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg border border-red-200">
                <div className="flex flex-col justify-center items-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>

                    {/* Mensaje de error */}
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-semibold text-red-700 mb-2">
                            Error al cargar las solicitudes
                        </h3>
                        <p className="text-gray-500 text-xs">
                            Intenta recargar la página o contacta al administrador si el problema persiste.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ErrorSolicitudes;
