import React, { useState, useEffect } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import "react-multi-carousel/lib/styles.css";
import FormularioAlertaIncidente from "./FormularioAlertaIncidente";

const AlertaIncidentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(false);
    const [detalleEditable, setDetalleEditable] = useState(""); // Estado para el textarea


    const tipoSancion = [
        { id: 1, nombre: "Muy grave", descripcion: "Drogas, armas..." },
        { id: 2, nombre: "Grave", descripcion: "Deterioro..." },
        { id: 3, nombre: "Leve", descripcion: "Suciedad, prestamo sin aut..." },
    ]

    const [prioridad, setPrioridad] = useState(tipoSancion[0]?.nombre || ""); // Inicializa con el primer valor o vacío

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
            handler: async (item) => {
                setLoading(true);
                setSelectedItem(null);
                onOpen();

                setTimeout(() => {
                    const data = {
                        casillero: "A-1",
                        demandante: {
                            nombre: item.demandante,
                            seccion: "8-2",
                            telefono: "8888-8888",
                            correo: "martaR@gmail.com",
                        },
                        responsable: {
                            nombre: item.responsable,
                            seccion: "8-2",
                            telefono: "8888-3333",
                            correo: "alfredoF@gmail.com",
                        },
                        encargados: [
                            { parentesco: "Padre", nombre: "Alfredo Flores", telefono: "8888-3333" },
                            { parentesco: "Madre", nombre: "Flor Jimenez", telefono: "8888-3333" },
                        ],
                        detalle: "Se guindaron de la puerta de un casillero.",
                        evidencia: [
                            "/casillero_dañado.jpg",
                            "/casillero_dañado.jpg",
                            "/casillero_dañado.jpg",
                        ],
                    };
                    setSelectedItem(data);
                    setLoading(false);
                }, 500);
            },
        },
    ];


    useEffect(() => {
        if (selectedItem) {
            setDetalleEditable(selectedItem.detalle); // Inicializa el detalle editable con el valor actual
        }
    }, [selectedItem]);


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
                    titulo={
                        loading
                            ? "Cargando..."
                            : `Revisión de Incidente - Casillero  ${selectedItem?.casillero || "Sin casillero"}`
                    }
                    size={"3xl"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={onOpenChange}
                    mostrarBotones={true}
                >
                    <FormularioAlertaIncidente
                        loading={loading}
                        selectedItem={selectedItem}
                        prioridad={prioridad}
                        setPrioridad={setPrioridad}
                        tipoSancion={tipoSancion}
                        detalleEditable={detalleEditable}
                        setDetalleEditable={setDetalleEditable}
                    />

                </DrawerGeneral>
            </div>
        </div>
    );
};

export default AlertaIncidentes;