import React from "react";
import { Button } from "@heroui/react";
import cn from "classnames";

const VisualizadorArmario = ({ armario, onCasilleroClick, estadosCasillero }) => {
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
                            `text-white w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:scale-105`,
                            casillero?.estado === 1
                                ? "bg-celeste hover:bg-celeste-dark"
                                : "bg-gray-400 hover:bg-gray-600"
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
                        <span className={`w-4 h-4 rounded-full ${
                            estado.idEstadoCasillero === 1 
                                ? "bg-celeste" 
                                : "bg-gray-400"
                        }`}></span>
                        <span className="text-gray-600 text-xs sm:text-sm">{estado.nombre}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VisualizadorArmario;
