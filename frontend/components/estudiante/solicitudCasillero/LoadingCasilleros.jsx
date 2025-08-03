import React from "react";

const LoadingCasilleros = () => {
    return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-lg border border-gray-200 animate-fade-in-up">
            {/* Animación de casilleros cargando */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[...Array(12)].map((_, index) => (
                    <div
                        key={index}
                        className="w-16 h-16 bg-gradient-to-br from-celeste to-primario rounded-lg animate-pulse"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            animationDuration: '1.5s'
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
                    Cargando armarios...
                </h3>
                <p className="text-gray-500 text-sm">
                    Estamos preparando los casilleros disponibles para ti
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
    );
};

export default LoadingCasilleros;
