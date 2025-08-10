import React from "react";

const LoadingRenunciarCasillero = () => {
    return (
        <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex flex-col justify-center items-center py-12">
                {/* Spinner principal */}
                <div className="relative mb-4">
                    <div className="w-8 h-8 border-3 border-celeste border-t-primario rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-r-pink-300 rounded-full animate-reverse"></div>
                </div>

                {/* Texto de carga */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-azulOscuro mb-2">
                        Cargando información del casillero...
                    </h3>
                    <p className="text-gray-500 text-sm">
                        Verificando tu casillero asignado
                    </p>
                </div>

                {/* Indicadores de progreso */}
                <div className="flex space-x-1 mt-4">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className="w-2 h-2 bg-primario rounded-full animate-bounce"
                            style={{
                                animationDelay: `${index * 0.2}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LoadingRenunciarCasillero;
