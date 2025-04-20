import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { Button, Input, Select } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { PlusIcon } from "../icons/PlusIcon";
import { useDisclosure } from "@heroui/react";
import { ChevronIcon } from "../icons/ChevronIcon";
import { usePagination, PaginationItemType } from "@heroui/react";
import cn from "classnames";
import PeriodoSolicitud from "../administrador/PeriodoSolicitud";

const Armario = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedCasillero, setSelectedCasillero] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const armarios = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const [currentPage, setCurrentPage] = useState(1);

    // Configuración de la paginación
    const { range, onNext, onPrevious, setPage } = usePagination({
        total: armarios.length, // Total de páginas
        page: currentPage, // Página actual
        siblings: 1, // Número de páginas visibles a los lados
        onChange: (page) => setCurrentPage(page), // Actualiza la página actual
    });

    const abrirDrawer = (casillero = null) => {
        if (casillero !== null) {
            setIsEditing(true);
            setSelectedCasillero(casillero);
        } else {
            setIsEditing(false);
            setSelectedCasillero(null);
        }
        onOpen();
    };

    const armarioActual = armarios[currentPage - 1] || "A";

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Casilleros"
                />
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex w-full max-w-2xl mx-auto space-x-6">
                {/* Paginación lateral vertical */}
                <div className="flex flex-col items-center justify-center">
                    <div className="pagination-text">
                        <ul className="flex flex-col gap-2 items-center">
                            {range.map((page) => {
                                if (page === PaginationItemType.NEXT) {
                                    return (
                                        <li key={page} aria-label="next page" className="w-8 h-8">
                                            <button
                                                className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:scale-105"
                                                onClick={onNext}
                                            >
                                                <ChevronIcon className="rotate-180" />
                                            </button>
                                        </li>
                                    );
                                }

                                if (page === PaginationItemType.PREV) {
                                    return (
                                        <li key={page} aria-label="previous page" className="w-8 h-8">
                                            <button
                                                className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105"
                                                onClick={onPrevious}
                                            >
                                                <ChevronIcon />
                                            </button>
                                        </li>
                                    );
                                }

                                if (page === PaginationItemType.DOTS) {
                                    return (
                                        <li key={page} className="w-8 h-8 flex items-center justify-center">
                                            ...
                                        </li>
                                    );
                                }

                                return (
                                    <li key={page} aria-label={`page ${page}`} className="w-8 h-8">
                                        <button
                                            className={cn(
                                                "w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105",
                                                currentPage === page && "bg-primario text-white"
                                            )}
                                            onClick={() => setPage(page)}
                                        >
                                            {armarios[page - 1]}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                {/* CONTENIDO PRINCIPAL */}
                <div className="flex flex-col flex-grow space-y-4 w-3/4 md:w-full lg:w-full xl:w-full">
                    <div className="flex justify-between mb-2">
                        <Select className="w-[300px] rounded-md" placeholder="Especialidad" />
                        <Button
                            className="bg-primario text-white flex items-center"
                            onPress={() => abrirDrawer()}
                            endContent={<PlusIcon />}
                        >
                            Agregar
                        </Button>
                    </div>

                    <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
                        <div className="bg-primary text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
                            Armario {armarioActual}
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {Array.from({ length: 12 }).map((_, index) => {
                                const casilleroNumber = index + 1;
                                return (
                                    <Button
                                        key={casilleroNumber}
                                        className="bg-celeste text-white w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105"
                                        onPress={() => abrirDrawer(casilleroNumber)}
                                    >
                                        {casilleroNumber}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Drawer */}
            <DrawerGeneral
                titulo={isEditing ? "Editar Armario" : "Agregar Armario"}
                size={"xs"} 
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                textoBotonPrimario={isEditing ? "Editar" : "Agregar"}
            >
                {isEditing ? (
                    <>
                        <Input
                            label="Num. Casillero"
                            labelPlacement="outside"
                            value={selectedCasillero}
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
                        />
                        <label className="text-gray-500 text-sm mb-0 mt-0">Descripción</label>
                        <textarea
                            placeholder="Escriba aquí..."
                            className="border-2 rounded-2xl p-2 w-full h-32 resize-none placeholder:text-sm text-gray-900"
                            color="black"
                        />
                    </>
                ) : (
                    <>
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