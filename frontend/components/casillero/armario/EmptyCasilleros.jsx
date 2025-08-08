import React from "react";
import { FiInbox, FiRefreshCw } from "react-icons/fi";
import { Button } from "@heroui/react";

const EmptyCasilleros = ({ onReload, especialidad = "esta especialidad" }) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-lg border border-gray-200 min-h-[400px] animate-fade-in-up">
            {/* Ícono principal */}
            <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <FiInbox className="w-12 h-12 text-gray-400" />
                </div>
                {/* Círculos decorativos */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-celeste rounded-full opacity-20 animate-ping"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primario rounded-full opacity-30 animate-pulse-soft"></div>
            </div>

            {/* Mensaje principal */}
            <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    No hay armarios disponibles
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                    No se encontraron armarios para <span className="font-medium text-primario">{especialidad}</span>
                </p>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border-l-4 border-celeste">
                <p className="text-sm text-gray-600">
                    <strong>Posibles causas:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    <li>• No hay armarios configurados para esta especialidad</li>
                    <li>• Todos los casilleros están ocupados</li>
                    <li>• Los armarios están en mantenimiento</li>
                </ul>
            </div>

            {/* Botón de recarga */}
            <Button
                className="bg-primario text-white rounded-lg flex items-center space-x-2 px-6 py-2 hover:bg-primario-dark transition-colors duration-200 hover:scale-105 transform"
                onPress={onReload}
            >
                <FiRefreshCw className="w-4 h-4" />
                <span>Buscar armarios</span>
            </Button>

            {/* Decoración inferior */}
            <div className="flex space-x-2 mt-8">
                <div className="w-3 h-3 bg-celeste rounded-full opacity-40 animate-pulse-soft"></div>
                <div className="w-3 h-3 bg-primario rounded-full opacity-60 animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-3 h-3 bg-pink-300 rounded-full opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
            </div>
        </div>
    );
};

export default EmptyCasilleros;
