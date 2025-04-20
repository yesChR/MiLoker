import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { Button } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import { ChevronIcon } from "../icons/ChevronIcon";
import { usePagination, PaginationItemType } from "@heroui/react";
import cn from "classnames";
import CustomAlert from "../CustomAlert";
import { LuSendHorizontal } from "react-icons/lu";

const SolicitudCasillero = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedCasilleros, setSelectedCasilleros] = useState([]); // Almacena las opciones seleccionadas
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(1); // Especialidad del usuario (ID)
    const [showAlert, setShowAlert] = useState(false); // Estado para mostrar la alerta

    // Simulación de datos obtenidos de un fetch
    const armariosData = [
        {
            id: "A",
            filas: 4,
            columnas: 3,
            especialidadId: 1, // ID de la especialidad
            casilleros: Array.from({ length: 12 }).map((_, index) => ({
                id: index + 1,
                estado: 1, // 1 = Disponible, 2 = Ocupado
                descripcion: "",
            })),
        },
        {
            id: "B",
            filas: 4,
            columnas: 3,
            especialidadId: 1, // ID de la especialidad
            casilleros: Array.from({ length: 12 }).map((_, index) => ({
                id: index + 1,
                estado: index % 2 === 0 ? 1 : 2,
                descripcion: index % 2 === 0 ? "" : `Casillero ${index + 1} ocupado.`,
            })),
        },
    ];

    const [currentPage, setCurrentPage] = useState(1);

    // Filtrar armarios por especialidad del usuario
    const armariosFiltrados = armariosData.filter(
        (armario) => armario.especialidadId === especialidadSeleccionada
    );

    // Configuración de la paginación
    const { range, onNext, onPrevious, setPage } = usePagination({
        total: armariosFiltrados.length, // Total de páginas
        page: currentPage, // Página actual
        siblings: 1, // Número de páginas visibles a los lados
        onChange: (page) => setCurrentPage(page), // Actualiza la página actual
    });

    // Manejar el caso en el que no haya armarios filtrados
    const armarioActual = armariosFiltrados.length > 0 ? armariosFiltrados[currentPage - 1] : null;

    // Función para manejar la selección de casilleros
    const handleCasilleroClick = (casillero) => {
        if (casillero.estado !== 1) return; // Solo se pueden seleccionar casilleros disponibles

        // Si ya está seleccionado, lo deseleccionamos
        if (selectedCasilleros.some((item) => item.id === casillero.id && item.armarioId === armarioActual.id)) {
            setSelectedCasilleros((prev) =>
                prev.filter((item) => !(item.id === casillero.id && item.armarioId === armarioActual.id))
            );
        } else {
            // Si no está seleccionado, lo agregamos (máximo 2)
            if (selectedCasilleros.length < 2) {
                setSelectedCasilleros((prev) => [
                    ...prev,
                    { ...casillero, armarioId: armarioActual.id }, // Agregar el ID del armario
                ]);
            }
        }
    };

    // Función para manejar el envío de la solicitud
    const handleEnviarSolicitud = () => {
        setShowAlert(true); // Mostrar la alerta
    };

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Solicitud Casillero"
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
                                            {armariosFiltrados[page - 1]?.id}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col flex-grow space-y-4 w-3/4 md:w-full lg:w-full xl:w-full">
                    {armarioActual ? (
                        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
                            <div className="bg-primary text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
                                Armario {armarioActual.id}
                            </div>
                            <div className={`grid grid-cols-${armarioActual.columnas} gap-3`}>
                                {armarioActual.casilleros.map((casillero) => {
                                    const isSelected = selectedCasilleros.some(
                                        (item) => item.id === casillero.id && item.armarioId === armarioActual.id
                                    );
                                    const selectedIndex = selectedCasilleros.findIndex(
                                        (item) => item.id === casillero.id && item.armarioId === armarioActual.id
                                    );

                                    return (
                                        <Button
                                            key={casillero.id}
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
                                            onPress={() => handleCasilleroClick(casillero)}
                                        >
                                            {casillero.id}
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
                    ) : (
                        <div className="text-center text-gray-500 text-lg mt-10">
                            No hay armarios disponibles para esta especialidad.
                        </div>
                    )}
                </div>
            </div>

            {/* Botón para enviar solicitud */}
            <div className="flex w-full max-w-2xl mx-auto justify-end mt-6">
                <Button
                    className="bg-primario text-white rounded-md flex items-center space-x-2"
                    disabled={selectedCasilleros.length !== 2} // Solo habilitado si hay 2 casilleros seleccionados
                    onPress={handleEnviarSolicitud}
                >
                    <span>Enviar solicitud</span>
                    <LuSendHorizontal className="w-5 h-5" /> {/* Ícono de envío */}
                </Button>
            </div>

            {/* Alerta personalizada */}
            {showAlert && (
                <div className="fixed top-10 right-10 z-50">
                    <CustomAlert
                        color="success"
                        variant="bordered"
                        aria-labelledby="alert-title"
                        size="sm"
                        className="max-w-lg"
                        title="Solicitud de Casillero"
                    >
                        <p className="text-sm text-gray-700">
                            Su solicitud es la siguiente:
                        </p>
                        <ul className="mt-2">
                            {selectedCasilleros.map((casillero, index) => (
                                <li
                                    key={`${casillero.armarioId}-${casillero.id}`}
                                    className={cn(
                                        "flex items-center space-x-2 text-sm",
                                        index === 0 ? "text-green-500" : "text-pink-500"
                                    )}
                                >
                                    <span>
                                        {index === 0 ? "Opción 1:" : "Opción 2:"}
                                    </span>
                                    <span>
                                        {`${casillero.armarioId}-${casillero.id}`} {/* Mostrar el ID del armario dinámicamente */}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-2 text-sm text-gray-700">
                            Por favor, confirme su solicitud.
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                            <Button
                                className="bg-transparent text-danger"
                                size="sm"
                                onPress={() => {
                                    setShowAlert(false); // Cerrar la alerta
                                    console.log("Solicitud enviada:", selectedCasilleros);
                                }}
                            >
                                Confirmar
                            </Button>
                            <Button
                                className="bg-transparent text-black"
                                size="sm"
                                onPress={() => setShowAlert(false)} // Cerrar la alerta
                            >
                                Cancelar
                            </Button>
                        </div>
                    </CustomAlert>
                </div>
            )}
        </div>
    );
};

export default SolicitudCasillero;