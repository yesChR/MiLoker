import React, { useState, useEffect } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import DrawerGeneral from "../DrawerGeneral";
import { useDisclosure, Input } from "@heroui/react";

import { PiNotePencilFill } from "react-icons/pi";
import "react-multi-carousel/lib/styles.css";

const ListaIncidentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Revisar" o "Crear"

    const columnasPrueba = [
        { name: "Id", uid: "id" },
        { name: "Casillero", uid: "casillero" },
        { name: "Demandante", uid: "demandante" },
        { name: "Responsable", uid: "responsable" },
        { name: "Detalle", uid: "detalle" },
        { name: "Fecha Reporte", uid: "fechaReporte" },
        { name: "Revisión", uid: "acciones" },
    ];

    const datosPrueba = [
        { id: 1, casillero: "A-1", demandante: "Juan Perez", responsable: "Maria Lopez", detalle: "Fuga de agua", fechaReporte: "2023-10-01" },
        { id: 2, casillero: "B-2", demandante: "Ana Garcia", responsable: "Luis Martinez", detalle: "Fuga de gas", fechaReporte: "2023-10-02" },
    ];

    const handleRevisar = (item) => {
        setAccion(1);
        setSelectedItem(item);
        onOpen();
    };

    const accionesPrueba = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: handleRevisar,
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Lista de incidentes"
                    breadcrumb="Inicio • Lista de Incidentes"
                />
            </div>
            <div className="w-full max-w-4xl">
                <TablaDinamica
                    columns={columnasPrueba}
                    data={datosPrueba}
                    acciones={accionesPrueba}           
                    mostrarAcciones={false}
                    onOpen={onOpen}
                    setAccion={setAccion}
                />
                <DrawerGeneral
                    titulo={accion === 1 ? "Revisión de Incidente" : "Crear Incidente"}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                >
                    {accion === 1 ? (
                        selectedItem ? (
                            <div>
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Detalles del incidente</h2>
                                <p>Casillero: {selectedItem.casillero}</p>
                                <p>Demandante: {selectedItem.demandante}</p>
                                <p>Responsable: {selectedItem.responsable}</p>
                                <p>Detalle: {selectedItem.detalle}</p>
                                <p>Fecha Reporte: {selectedItem.fechaReporte}</p>
                            </div>
                        ) : (
                            <p>No hay datos seleccionados.</p>
                        )
                    ) : (
                        <div>
                            <h2 className="text-gray-700 font-bold text-sm mb-2">Crear Incidente</h2>
                            <Input
                                placeholder="Número de Armario"
                                variant={"bordered"}
                                className="mb-4"
                            />
                            <Input
                                placeholder="Número de Casillero"
                                variant={"bordered"}
                                className="mb-4"
                            />
                        </div>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default ListaIncidentes;