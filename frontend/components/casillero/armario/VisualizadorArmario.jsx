import React from "react";
import { Button } from "@heroui/react";
import cn from "classnames";
import { ESTADOS_CASILLERO } from "../../common/estadoCasillero";
import EmptyCasilleros from "./EmptyCasilleros";

const VisualizadorArmario = ({ armario, onCasilleroClick, estadosCasillero }) => {
    // Función para obtener colores de los casilleros
    const getCasilleroColors = (estado) => {
        // Convertir a número para asegurar comparación correcta
        const estadoNum = parseInt(estado);
        switch (estadoNum) {
            case ESTADOS_CASILLERO.DISPONIBLE:
                return "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white"; 
            case ESTADOS_CASILLERO.OCUPADO:
                return "bg-danger hover:bg-red-700 text-white";
            case ESTADOS_CASILLERO.EN_MANTENIMIENTO:
                return "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"; 
            case ESTADOS_CASILLERO.DAÑADO:
                return "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"; 
            default:
                return "bg-gradient-to-br from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white";
        }
    };

    // Función para obtener colores de la leyenda
    const getLegendColor = (estado) => {
        // Convertir a número para asegurar comparación correcta
        const estadoNum = parseInt(estado);
        switch (estadoNum) {
            case ESTADOS_CASILLERO.DISPONIBLE:
                return "bg-gradient-to-br from-blue-400 to-blue-600"; 
            case ESTADOS_CASILLERO.OCUPADO:
                return "bg-danger"; 
            case ESTADOS_CASILLERO.EN_MANTENIMIENTO:
                return "bg-gradient-to-br from-yellow-400 to-orange-500"; 
            case ESTADOS_CASILLERO.DAÑADO:
                return "bg-gradient-to-br from-purple-400 to-purple-600"; 
            default:
                return "bg-gradient-to-br from-gray-400 to-gray-600";
        }
    };

    if (!armario) {
        return (
            <EmptyCasilleros />
        );
    }

    return (
        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
                Armario {armario.id}
            </div>

            <div className={`grid grid-cols-${armario.columnas} gap-3`}>
                {armario.casilleros && armario.casilleros.length > 0 && armario.casilleros.map((casillero) => (
                    <Button
                        key={casillero?.id || Math.random()}
                        className={cn(
                            `w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:scale-105`,
                            getCasilleroColors(casillero?.estado)
                        )}
                        onPress={() => onCasilleroClick(casillero)}
                    >
                        {casillero?.id || 'N/A'}
                    </Button>
                ))}
            </div>

            {/* Leyenda de colores */}
            <div className="flex justify-center items-center mt-4 space-x-4">
                {estadosCasillero.map((estado, index) => (
                    <div key={estado.idEstadoCasillero} className="flex items-center space-x-2">
                        <span className={`w-4 h-4 rounded-full ${getLegendColor(estado.idEstadoCasillero)}`}></span>
                        <span className="text-gray-600 text-xs sm:text-sm">{estado.nombre}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualizadorArmario;
