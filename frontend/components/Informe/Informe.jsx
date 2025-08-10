import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { useDisclosure } from "@heroui/react";
import { Button, Input, Divider } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Select, SelectItem } from "@heroui/react";
import { useEspecialidades } from "../../hooks/useEspecialidades";

const Informe = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [drawerContent, setDrawerContent] = useState(null); // Estado para determinar el contenido del Drawer
    const { especialidades, loading } = useEspecialidades(); // Hook para obtener especialidades

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto w-full max-w-4xl">
                {/* Card 1 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-blue-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">📊</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Informe general detallado</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Esta opción permite generar un informe detallado y de forma gráfica la información sobre el total de casilleros donde se reflejarán aquellos qué estén <span className="font-semibold text-blue-600">disponibles, asignados o dañados</span>. Ideal para obtener una visión general rápida y organizada.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105">
                            📈 Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-green-200 hover:border-green-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">🗂️</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Historial por casillero</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Aquí se podrá consultar el historial completo de cada casillero específico, incluyendo <span className="font-semibold text-green-600">registros de uso, fechas de asignación, así como incidentes</span> asociados. Útil para hacer un seguimiento detallado del uso que ha tenido cada casillero a lo largo del tiempo.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                            onPress={() => handleOpenDrawer("casillero")}
                        >
                            🗃️ Generar informe
                        </Button>
                    </div>
                </div>

                {/* Card 3 */}
                <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col justify-between border-2 border-purple-200 hover:border-purple-400 hover:shadow-xl transition-all duration-300">
                    <div>
                        <div className="flex items-center mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mr-3 shadow-sm">
                                <span className="text-white text-lg">👨‍🎓</span>
                            </div>
                            <h2 className="text-xl font-semibold text-azulOscuro">Historial por estudiante</h2>
                        </div>
                        <Divider className="my-4 bg-cabecera h-[2px]" />
                        <p className="text-gray-600 text-justify leading-relaxed">
                            Permite acceder a un informe completo del historial de uso de casilleros de un estudiante específico. Incluye información sobre <span className="font-semibold text-purple-600">detalles específicos del comportamiento</span> de cada usuario respecto al préstamo de casilleros.
                        </p>
                    </div>
                    <div className="mt-6">
                        <Button
                            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-md font-semibold shadow-lg rounded-xl transition-all duration-300 transform hover:scale-105"
                            onPress={() => handleOpenDrawer("estudiante")}
                        >
                            📋 Generar informe
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
                                isRequired
                                errorMessage="El ID del Casillero es requerido"
                            />
                            <Select
                                placeholder="Especialidad"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                isLoading={loading}
                                isRequired
                                errorMessage="La especialidad es requerida"
                            >
                                {especialidades.map((especialidad) => (
                                    <SelectItem key={especialidad.id} value={especialidad.id}>
                                        {especialidad.nombre}
                                    </SelectItem>
                                ))}
                            </Select>
                        </>
                    )}
                    {drawerContent === "estudiante" && (
                        <>
                            <Input
                                placeholder="Cédula del Estudiante"
                                variant={"bordered"}
                                className="focus:border-primario"
                                color="primary"
                                isRequired
                                errorMessage="La cédula del Estudiante es requerida"
                            />
                        </>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Informe;