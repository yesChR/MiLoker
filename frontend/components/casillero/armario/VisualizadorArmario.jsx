import React from "react";
import { Button } from "@heroui/react";
import cn from "classnames";
import { ESTADOS_CASILLERO } from "../../common/estadoCasillero";

const VisualizadorArmario = ({ armario, onCasilleroClick, estadosCasillero }) => {
    // Función para obtener colores de los casilleros
    const getCasilleroColors = (estado) => {
        // Convertir a número para asegurar comparación correcta
        const estadoNum = parseInt(estado);
        switch (estadoNum) {
            case ESTADOS_CASILLERO.DISPONIBLE:
                return "bg-green-500 hover:bg-green-600 text-white"; // Celeste (mantenido)
            case ESTADOS_CASILLERO.OCUPADO:
                return "bg-pink-500 hover:bg-pink-600 text-white";
            case ESTADOS_CASILLERO.EN_MANTENIMIENTO:
                return "bg-yellow-500 hover:bg-yellow-600 text-white"; // Amarillo claro con texto oscuro
            case ESTADOS_CASILLERO.DAÑADO:
                return "bg-orange-500 hover:bg-orange-600 text-white"; // Gris (mantenido)
            // Rojo para dañado
            default:
                return "bg-gray-400 hover:bg-gray-500 text-white";
        }
    };

    // Función para obtener colores de la leyenda
    const getLegendColor = (estado) => {
        // Convertir a número para asegurar comparación correcta
        const estadoNum = parseInt(estado);
        switch (estadoNum) {
            case ESTADOS_CASILLERO.DISPONIBLE:
                return "bg-green-500"; // Celeste (mantenido)
            case ESTADOS_CASILLERO.OCUPADO:
                return "bg-pink-500"; // Rojo para dañado
            case ESTADOS_CASILLERO.EN_MANTENIMIENTO:
                return "bg-yellow-500"; // Amarillo claro
            case ESTADOS_CASILLERO.DAÑADO:
                return "bg-orange-500"; // Gris (mantenido)
            default:
                return "bg-gray-400";
        }
    };

    if (!armario) {
        return (
            <div className="text-center text-gray-500 text-lg mt-10">
                No hay armarios disponibles para esta especialidad.
            </div>
        );
    }

    return (
        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
            <div className="bg-primary text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
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
