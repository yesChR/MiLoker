import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { Button, Input, Select } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { PlusIcon } from "../icons/PlusIcon";
import { useDisclosure } from "@heroui/react";

const Armario = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedCasillero, setSelectedCasillero] = useState(null); // Para almacenar el armario seleccionado
    const [isEditing, setIsEditing] = useState(false); // Para saber si estamos en modo edición

    // Función para abrir el drawer en modo edición o creación
    const abrirDrawer = (casillero = null) => {
        if (casillero !== null) {
            // Si se selecciona un armario, configuramos el modo edición
            setIsEditing(true);
            setSelectedCasillero(casillero);
        } else {
            // Si no hay armario seleccionado, es para agregar
            setIsEditing(false);
            setSelectedCasillero(null);
        }
        onOpen(); // Abre el Drawer
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Casilleros"
                />
            </div>
            <div className="rounded-lg w-full max-w-3xl mx-auto p-4 bg-white space-y-0">
                <div className="flex flex-row items-center justify-between rounded-lg w-full max-w-2xl mx-auto bg-white mb-4">
                    <Select className="w-[300px] rounded-md" placeholder="Especialidad" />
                    <Button
                        className="bg-primario text-white flex items-center"
                        onPress={() => abrirDrawer()} // Para agregar un nuevo armario
                        endContent={<PlusIcon />}
                    >
                        Agregar
                    </Button>
                </div>
                <div className="border border-gray-300 p-6 rounded-lg w-full max-w-2xl mx-auto h-full max-h-[1200px] shadow-lg ">
                    <div className="bg-primary text-white p-4 text-xl rounded-md text-center font-bold shadow-lg w-md">Armario #</div>
                    <div className="grid grid-cols-3 gap-5 mt-5">
                        {Array.from({ length: 4 }).map((_, rowIndex) => (
                            Array.from({ length: 3 }).map((_, colIndex) => {
                                const casilleroNumber = rowIndex * 3 + colIndex + 1; // Calcula el número del casillero
                                return (
                                    <Button
                                        key={casilleroNumber}
                                        className="bg-celeste text-white w-md h-[80px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:bg-celesteOscuro hover:scale-105"
                                        onPress={() => abrirDrawer(casilleroNumber)} // Seleccionamos el armario y abrimos el drawer
                                    >
                                        {casilleroNumber}
                                    </Button>
                                );
                            })
                        ))}
                    </div>
                </div>
            </div>
            {/* Drawer para agregar o editar armarios */}
            <DrawerGeneral
                titulo={isEditing ? "Editar Armario" : "Agregar Armario"}
                size={"xs"}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                {/* Campos del Drawer basados en si es creación o edición */}
                {isEditing ? (
                    <>
                        <Input
                            label="Num. Casillero"
                            labelPlacement="outside"
                            value={selectedCasillero} // El ID del armario seleccionado
                            disabled
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="Black"

                        />
                        <Select
                            label="Estado"
                            labelPlacement="outside"
                            placeholder="Seleccione..."
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="Black"
                        >
                        </Select>
                        <label className="text-gray-500 text-sm mb-0 mt-0">Descripción</label>
                        <textarea
                            placeholder="Escriba aquí..."
                            className="border-2 rounded-2xl p-2 w-full h-32 resize-none placeholder:text-sm text-gray-900"
                            color="black"
                        />

                    </>
                ) : (
                    <>
                        {/* Formulario para crear un nuevo armario */}
                        <Input
                            placeholder="ID"
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        />
                        <Input
                            type="number"
                            placeholder="Filas"
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        />
                        <Input
                            type="number"
                            placeholder="Columnas"
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        />

                    </>
                )}
            </DrawerGeneral>
        </div>
    );
};

export default Armario;
