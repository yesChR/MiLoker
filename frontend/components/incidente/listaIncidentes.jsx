import React, { useState, useEffect } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import DrawerGeneral from "../DrawerGeneral";
import { useDisclosure, Input } from "@heroui/react";
import { Select } from "@heroui/react";
import { PiNotePencilFill } from "react-icons/pi";
import "react-multi-carousel/lib/styles.css";
import FormularioRevision from "./FormularioRevision";
import FormularioCreacion from "./FormularioCreacion";

const ListaIncidentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Revisar" o "Crear"
    const [loading, setLoading] = useState(false); //
    const [detalleEditable, setDetalleEditable] = useState(""); // Estado para el textarea

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
                    titulo={accion === 1 ? "Revisión de Incidente" : "Registrar Incidente"}
                    size={accion === 1 ? "3xl" : "sm"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario={accion === 1 ? "Actualizar" : "Enviar"}
                >
                    {accion === 1 ? (
                        selectedItem ? (
                            <FormularioRevision
                                loading={loading}
                                selectedItem={selectedItem}
                                detalleEditable={detalleEditable}
                                setDetalleEditable={setDetalleEditable}
                            />

                        ) : (
                            <p>No hay datos seleccionados.</p>
                        )
                    ) : (
                        <div>
                            <FormularioCreacion />
                        </div>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default ListaIncidentes;