import React from "react";

const LoadingArmarios = () => {
    return (
        <div className="flex flex-col justify-center items-center py-12">
            {/* Animación de casilleros/armarios */}
            <div className="grid grid-cols-4 gap-2 mb-6">
                {[...Array(8)].map((_, index) => (
                    <div
                        key={index}
                        className="w-8 h-10 bg-gradient-to-br from-celeste to-primario rounded-md animate-pulse opacity-70"
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            animationDuration: '1.5s'
                        }}
                    ></div>
                ))}
            </div>

            {/* Spinner principal */}
            <div className="relative mb-4">
                <div className="w-8 h-8 border-3 border-celeste border-t-primario rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-3 border-transparent border-r-pink-300 rounded-full animate-reverse"></div>
            </div>

            {/* Texto de carga */}
            <div className="text-center">
                <h3 className="text-lg font-semibold text-azulOscuro mb-2">
                    Cargando armarios...
                </h3>
                <p className="text-gray-500 text-sm">
                    Obteniendo los casilleros disponibles
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
    );
};

export default LoadingArmarios;
