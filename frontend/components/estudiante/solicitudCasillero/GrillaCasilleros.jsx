import React from "react";
import { Button } from "@heroui/react";
import cn from "classnames";

const GrillaCasilleros = ({ 
    armario, 
    selectedCasilleros, 
    onCasilleroClick, 
    loading 
}) => {
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
                {armario.casilleros.map((casillero) => {
                    const isSelected = selectedCasilleros.some(
                        (item) => item.id === casillero.id && item.armarioId === armario.idArmario
                    );
                    const selectedIndex = selectedCasilleros.findIndex(
                        (item) => item.id === casillero.id && item.armarioId === armario.idArmario
                    );

                    return (
                        <Button
                            key={casillero.id}
                            disabled={loading}
                            className={cn(
                                `text-white w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:scale-105`,
                                casillero.estado === 1
                                    ? isSelected
                                        ? selectedIndex === 0
                                            ? "bg-green-500 hover:bg-green-600" // Opción 1: Verde
                                            : "bg-pink-500 hover:bg-pink-600" // Opción 2: Rosa
                                        : "bg-celeste hover:bg-celeste-dark" // Disponible
                                    : "bg-gray-400 hover:bg-gray-600" // Ocupado
                            )}
                            onPress={() => onCasilleroClick(casillero)}
                        >
                            {casillero.numCasillero}
                        </Button>
                    );
                })}
            </div>

            {/* Leyenda de colores */}
            <div className="flex justify-center items-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-celeste rounded-full"></span>
                    <span className="text-gray-600 text-sm">Libre</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Ocupado</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Opción 1</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-pink-500 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Opción 2</span>
                </div>
            </div>
        </div>
    );
};

export default GrillaCasilleros;
