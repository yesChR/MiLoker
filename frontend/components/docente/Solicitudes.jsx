import React, { useState } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Divider } from "@heroui/react";
import { Button } from "@heroui/react";
import { LuSendHorizontal } from "react-icons/lu";

const Solicitudes = ({ estado }) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null); // Estado para almacenar el elemento seleccionado

    const estados = {
        1: "En espera",
        2: "Aprobadas",
        3: "Rechazadas",
    };

    const columnasPrueba = [
        { name: "Id", uid: "id" },
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Sección", uid: "seccion" },
        { name: "Opción 1", uid: "opcion1" },
        { name: "Opción 2", uid: "opcion2" },
        { name: "Fecha solicitud", uid: "fechaSolicitud" },
        { name: "Revisión", uid: "acciones" },
    ];


    const datosPrueba = [
        { id: 1, cedula: "123456789", nombre: "Juan Pérez", seccion: "A", opcion1: "Matemáticas", opcion2: "Física", fechaSolicitud: "2023-10-01", estado: 1 },
        { id: 2, cedula: "987654321", nombre: "María Gómez", seccion: "B", opcion1: "Química", opcion2: "Biología", fechaSolicitud: "2023-10-02", estado: 2 },
        { id: 3, cedula: "456789123", nombre: "Carlos López", seccion: "C", opcion1: "Historia", opcion2: "Geografía", fechaSolicitud: "2023-10-03", estado: 3 },
        { id: 4, cedula: "321654987", nombre: "Ana Torres", seccion: "D", opcion1: "Literatura", opcion2: "Arte", fechaSolicitud: "2023-10-04", estado: 1 },
    ];

    const casillerosAnteriores = [
        { casillero: "A - 1" },
        { casillero: "A - 2" },
        { casillero: "A - 3" },
        { casillero: "A - 4" },
        { casillero: "A - 5" },
        { casillero: "A - 6" },
    ];

    const incidentesRelacionados = [
        { incidente: " El casillero presentaba daños severos" },
    ];

    // Filtrar los datos según el parámetro "estado"
    const datosFiltrados = datosPrueba.filter((item) => item.estado === estado);

    const accionesPrueba = [
        {
            tooltip: "Revisar",
            icon: <PiNotePencilFill  size={18} />,
            handler: (item) => {
                setSelectedItem(item); // Guarda el elemento seleccionado
                onOpen(); // Abre el Drawer
            }, 
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Solicitudes"
                    breadcrumb={`Inicio • Docente • Solicitudes • ${estados[estado]}`}
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={datosFiltrados}
                        acciones={accionesPrueba}
                        onOpen={onOpen}
                        ocultarAgregar={true}
                        mostrarAcciones={false}
                    />
                </div>
                <DrawerGeneral
                    titulo={`Revisión - ${selectedItem?.nombre || ""}`}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={onOpenChange}
                    mostrarBotones={false}
                >
                    <div className="flex flex-col mb-4">
                        <Select
                            placeholder="Elegir opción"
                            variant={"bordered"}
                            className="focus:border-primario mb-4"
                            color="primary"
                        />
                        {/* Contenedor para el botón al final */}
                        <div className="flex justify-end">
                            <Button color="primary" flex endContent={<LuSendHorizontal />}>
                                Enviar
                            </Button>
                        </div>
                        <Divider className="mt-4" />
                    </div>
                    <div className="flex flex-col mb-4">
                        <label className="text-azulOscuro font-bold text-xl">Historial</label>
                        {/* Sección de Casilleros Anteriores */}
                        {casillerosAnteriores.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Casilleros anteriores:</h2>
                                <ul className="list-disc list-inside">
                                    {casillerosAnteriores.map((casillero, index) => (
                                        <li key={index} className="text-gray-600 text-sm">
                                            {casillero.casillero}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Sección de Incidentes Relacionados */}
                        {incidentesRelacionados.length > 0 && (
                            <div className="mt-4">
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Incidentes relacionados:</h2>
                                <ul className="list-disc list-inside">
                                    {incidentesRelacionados.map((incidente, index) => (
                                        <li key={index} className="text-gray-600 text-sm">
                                            {incidente.incidente}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Solicitudes;