import React from "react";
import { Button } from "@heroui/react";
import cn from "classnames";
import { ESTADOS_CASILLERO } from "../../common/estadoCasillero";

const GrillaCasilleros = ({ 
    armario, 
    selectedCasilleros, 
    onCasilleroClick, 
    loading 
}) => {
    // Función para obtener colores de los casilleros basada en el estado
    const getCasilleroColors = (estado, isSelected, selectedIndex) => {
        const estadoNum = parseInt(estado);
        
        // Si está seleccionado, usar colores de selección
        if (isSelected) {
            return selectedIndex === 0
                ? "bg-gradient-to-br from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700" // Opción 1: Morado
                : "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"; // Opción 2: Naranja
        }
        
        // Colores basados en el estado del casillero
        switch (estadoNum) {
            case ESTADOS_CASILLERO.DISPONIBLE:
                return "bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"; // Disponible - azul
            case ESTADOS_CASILLERO.OCUPADO:
            case ESTADOS_CASILLERO.EN_MANTENIMIENTO:
            case ESTADOS_CASILLERO.DAÑADO:
                return "bg-danger hover:bg-red-700"; // No disponibles - danger
            default:
                return "bg-danger hover:bg-red-700"; // Por defecto - danger
        }
    };

    if (!armario) {
        return (
            <div className="text-center text-gray-500 text-lg mt-10">
                No hay armarios disponibles para esta especialidad.
            </div>
        );
    }

    // Función para obtener la clase de grid correcta basada en el número de columnas
    const getGridCols = (columnas) => {
        const gridColsMap = {
            1: "grid-cols-1",
            2: "grid-cols-2", 
            3: "grid-cols-3",
            4: "grid-cols-4",
            5: "grid-cols-5",
            6: "grid-cols-6",
            7: "grid-cols-7",
            8: "grid-cols-8",
            9: "grid-cols-9",
            10: "grid-cols-10",
            11: "grid-cols-11",
            12: "grid-cols-12"
        };
        return gridColsMap[columnas] || "grid-cols-4"; // Default a 4 columnas
    };

    return (
        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
                Armario {armario.id}
            </div>
            
            <div className={`grid ${getGridCols(armario.columnas)} gap-3`}>
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
                            disabled={loading || casillero.estado !== ESTADOS_CASILLERO.DISPONIBLE}
                            className={cn(
                                `text-white w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:scale-105`,
                                getCasilleroColors(casillero.estado, isSelected, selectedIndex)
                            )}
                            onPress={() => onCasilleroClick(casillero)}
                        >
                            {casillero.numCasillero}
                        </Button>
                    );
                })}
            </div>

            {/* Leyenda de colores simplificada */}
            <div className="flex justify-center items-center mt-4 space-x-4">
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Disponible</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-danger rounded-full"></span>
                    <span className="text-gray-600 text-sm">No disponible</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Opción 1</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></span>
                    <span className="text-gray-600 text-sm">Opción 2</span>
                </div>
            </div>
        </div>
    );
};

export default GrillaCasilleros;
