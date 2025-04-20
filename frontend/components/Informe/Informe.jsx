import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { useDisclosure } from "@heroui/react";
import { Button, Input, Divider } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Select } from "@heroui/react";

const Informe = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [drawerContent, setDrawerContent] = useState(null); // Estado para determinar el contenido del Drawer

    const handleOpenDrawer = (contentType) => {
        setDrawerContent(contentType); // Define el contenido del Drawer
        onOpen(); // Abre el Drawer
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-10 px-4">
            <div className="w-full">
                <CabezeraDinamica
                    title="Informes"
                    breadcrumb="Inicio • Informes"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto w-full max-w-4xl h-50">
                {/* Card 1 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-1 border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-azulOscuro">Informe general</h2>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify">
                            Esta opción permite generar un informe detallado y de forma gráfica la información sobre el total de casilleros donde se reflejarán aquellos qué estén disponibles, asignados o dañados. Ideal para obtener una visión general rápida y organizada.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button className="w-full bg-cabecera text-md font-semibold shadow-lg text-azulOscuro">
                            Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-1 border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-azulOscuro">Historial por casillero</h2>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify">
                            Aquí se podrá consultar el historial completo de cada casillero específico, incluyendo registros de uso, fechas de asignación, así como incidentes asociados. Útil para hacer un seguimiento detallado del uso que ha tenido cada casillero a lo largo del tiempo.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button
                            className="w-full bg-cabecera text-md font-semibold shadow-lg text-azulOscuro"
                            onPress={() => handleOpenDrawer("casillero")} // Abre el Drawer para el ID del casillero
                        >
                            Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-1 border-gray-100">
                    <div>
                        <h2 className="text-xl font-semibold mb-2 text-azulOscuro">Historial por estudiante</h2>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify">
                            Permite acceder a un informe completo del historial de uso de casilleros de un estudiante específico. Incluye información sobre detalles específicos del comportamiento de cada usuario respecto al préstamo de casilleros.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Button
                            className="w-full bg-cabecera text-md font-semibold shadow-lg text-azulOscuro"
                            onPress={() => handleOpenDrawer("estudiante")} // Abre el Drawer para la cédula del estudiante
                        >
                            Generar informe
                        </Button>
                    </div>
                </div>

                {/* Drawer */}
                <DrawerGeneral
                    titulo={
                        drawerContent === "casillero"
                            ? "Historial por Casillero"
                            : drawerContent === "estudiante"
                                ? "Historial por Estudiante"
                                : ""
                    }
                    size={"xs"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario="Generar"
                >
                    {drawerContent === "casillero" && (
                        <>
                            <Input
                                placeholder="ID del Casillero"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                            />
                            <Select
                                placeholder="Especialidad"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                            />
                        </>
                    )}
                    {drawerContent === "estudiante" && (
                        <>
                            <Input
                                placeholder="Cédula del Estudiante"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                            />
                        </>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Informe;