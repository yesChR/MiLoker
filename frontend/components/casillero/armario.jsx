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
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Casilleros"
                />
            </div>
            <div className="flex flex-row items-center justify-between rounded-lg w-full max-w-xl mx-auto mt-6">
                <Select className="w-[200px] rounded-md" placeholder="Especialidad" />
                <Button
                    className="bg-primario text-white flex items-center"
                    onPress={() => abrirDrawer()} // Para agregar un nuevo armario
                    endContent={<PlusIcon />}
                >
                    Agregar
                </Button>
            </div>
            <div className="border border-gray-300 p-2 rounded-lg w-full max-w-xl mx-auto h-[420px] mt-6">
                <div className="bg-primary text-white p-4 text-lg rounded-md text-center font-bold">Armario #</div>
                <div className="grid grid-cols-3 gap-5 mt-5">
                    {Array.from({ length: 12 }, (_, index) => (
                        <Button
                            key={index}
                            className="bg-celeste text-white w-full h-[65px] flex items-center justify-center text-lg rounded-md shadow-md transition-transform duration-200 hover:bg-celesteOscuro hover:scale-105"
                            onPress={() => abrirDrawer(index + 1)} // Seleccionamos el armario y abrimos el drawer
                        >
                            {index + 1}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Drawer para agregar o editar armarios */}
            <DrawerGeneral
                titulo={isEditing ? "Editar Armario" : "Agregar Armario"} // Título cambia según si estamos editando o creando
                size={"xs"}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                {/* Campos del Drawer basados en si es creación o edición */}
                {isEditing ? (
                    <>
                        <Input
                            label="ID"
                            value={selectedCasillero} // El ID del armario seleccionado
                            disabled
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        />
                        <Select
                            placeholder="Filas"
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        >
                         
                        </Select>
                        <Select
                            placeholder="Columnas"
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                        >
                           
                        </Select>
                        {/* Agrega más campos de edición si es necesario */}
                    </>
                ) : (
                    <>
                        {/* Formulario para crear un nuevo armario */}
                        <Input
                            label="ID otro"
                            placeholder="Nuevo ID"
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
