import React from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";

const LoadingSolicitudes = ({ estado }) => {
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
                    breadcrumb={`Inicio • Docente • Solicitudes • ${estados[estado] || 'Cargando...'}`}
                />
            </div>
            <div className="w-full max-w-4xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
                <div className="flex flex-col justify-center items-center py-12">
                    {/* Animación de documentos/solicitudes */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="w-12 h-16 bg-gradient-to-br from-celeste to-primario rounded-lg animate-pulse opacity-70"
                                style={{
                                    animationDelay: `${index * 0.15}s`,
                                    animationDuration: '1.8s'
                                }}
                            ></div>
                        ))}
                    </div>

                    {/* Spinner principal */}
                    <div className="relative mb-4">
                        <div className="w-12 h-12 border-4 border-celeste border-t-primario rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-pink-300 rounded-full animate-reverse"></div>
                    </div>

                    {/* Texto de carga */}
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            Cargando solicitudes...
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Obteniendo las solicitudes {estados[estado]?.toLowerCase() || 'del sistema'}
                        </p>
                    </div>

                    {/* Indicadores de progreso */}
                    <div className="flex space-x-1 mt-4">
                        {[...Array(3)].map((_, index) => (
                            <div
                                key={index}
                                className="w-2 h-2 bg-primario rounded-full animate-bounce-delay"
                                style={{
                                    animationDelay: `${index * 0.2}s`
                                }}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingSolicitudes;
