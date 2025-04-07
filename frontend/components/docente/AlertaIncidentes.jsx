import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";

const AlertaIncidentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null); // Estado para almacenar el elemento seleccionado
    

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
        { id: 3, casillero: "C-3", demandante: "Pedro Sanchez", responsable: "Laura Torres", detalle: "Fuga de electricidad", fechaReporte: "2023-10-03" },
        { id: 4, casillero: "D-4", demandante: "Sofia Ramirez", responsable: "Carlos Gomez", detalle: "Fuga de agua", fechaReporte: "2023-10-04" },
        { id: 5, casillero: "E-5", demandante: "Luis Fernandez", responsable: "Ana Morales", detalle: "Fuga de gas", fechaReporte: "2023-10-05" },

    ];

    const accionesPrueba = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill size={18} />,
            handler: (item) => {
                setSelectedItem(item);
                onOpen();
            },
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Alerta de incidentes"
                    breadcrumb="Inicio • Alerta de Incidentes"
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={datosPrueba}
                        acciones={accionesPrueba}
                        onOpen={onOpen}
                        ocultarAgregar={true}
                        mostrarAcciones={false}
                    />
                </div>
                <DrawerGeneral
                    titulo={"Revisión"}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={onOpenChange}
                    mostrarBotones={false}
                >
                    <Input
                        placeholder="Cédula"
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default AlertaIncidentes;