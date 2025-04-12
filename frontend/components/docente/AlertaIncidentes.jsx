import React, { useState, useEffect } from "react";
import Image from "next/image";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { PiNotePencilFill } from "react-icons/pi";
import { useDisclosure, Spinner, Divider, RadioGroup, Radio } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

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

    const responsive = {
        superLargeDesktop: {
            breakpoint: { max: 4000, min: 1024 },
            items: 2,
        },
        desktop: {
            breakpoint: { max: 1024, min: 768 },
            items: 2,
        },
        tablet: {
            breakpoint: { max: 768, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        },
    };

    useEffect(() => {
        if (selectedItem) {
            setDetalleEditable(selectedItem.detalle); // Inicializa el detalle editable con el valor actual
        }
    }, [selectedItem]);

    const CustomDot = ({ onClick, active }) => {
        return (
            <li
                className={`w-3 h-3 rounded-full mx-1 cursor-pointer ${active ? "bg-blue-500" : "bg-gray-300"
                    }`}
                onClick={onClick}
            ></li>
        );
    };

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
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner size="lg" color="primary" />
                        </div>
                    ) : selectedItem ? (
                        <div className="space-y-4 px-10 pb-10">
                            <div className="grid grid-cols-2 gap-2 items-center">
                                <div>
                                    <h2 className="text-gray-700 font-bold text-sm mb-2">Demandante:</h2>
                                    <div className="text-gray-600 text-sm">
                                        <p>Nombre: {selectedItem.demandante.nombre}</p>
                                        <p>Sección: {selectedItem.demandante.seccion}</p>
                                        <p>Teléfono: {selectedItem.demandante.telefono}</p>
                                        <p>Correo: {selectedItem.demandante.correo}</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-gray-700 font-bold text-sm mb-2">Responsable:</h2>
                                    <div className="text-gray-600 text-sm">
                                        <p>Nombre: {selectedItem.responsable.nombre}</p>
                                        <p>Sección: {selectedItem.responsable.seccion}</p>
                                        <p>Teléfono: {selectedItem.responsable.telefono}</p>
                                        <p>Correo: {selectedItem.responsable.correo}</p>
                                    </div>
                                </div>
                            </div>
                            <Divider className="my-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h2 className="text-gray-700 font-bold text-sm mb-2">Encargados:</h2>
                                    {selectedItem.encargados.map((encargado, index) => (
                                        <div key={index} className="mb-2 text-gray-600 text-sm">
                                            <p className="font-semibold">{encargado.parentesco}: {encargado.nombre}</p>
                                            <p>Teléfono: {encargado.telefono}</p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <h2 className="text-gray-700 font-bold text-sm mb-2">Descripción del suceso:</h2>
                                    <div className="text-gray-600 text-sm">
                                        <textarea
                                            className="w-full border rounded-lg p-2 text-gray-600 text-sm"
                                            rows="4"
                                            value={detalleEditable}
                                            onChange={(e) => setDetalleEditable(e.target.value)}
                                            placeholder="Escribe la descripción del suceso..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <Divider className="my-4" />
                            <div className="w-full">
                                <h2 className="text-gray-700 font-bold text-sm mb-2">Evidencia:</h2>
                                <Carousel
                                    responsive={responsive}
                                    showDots={true}
                                    swipeable={true}
                                    customDot={<CustomDot />}
                                >
                                    {selectedItem.evidencia.map((src, index) => (
                                        <div key={index} className="p-2">
                                            <Image
                                                width={400}
                                                lazyBoundary="200px"
                                                height={400}
                                                src={src}
                                                alt={`Evidencia ${index + 1}`}
                                                className="w-full h-96 object-cover rounded-lg border shadow-md"
                                            />
                                        </div>
                                    ))}
                                </Carousel>
                            </div>
                            <Divider className="my-4" />
                            <div className="w-full gap-2">
                                <h2 className="text-gray-700 font-bold text-sm mb-2 text-center">Seleccione el tipo sanción:</h2>
                                <div className="flex justify-center items-center mt-6">
                                    <RadioGroup
                                        value={prioridad}
                                        onValueChange={(value) => {
                                            setPrioridad(value)
                                        }}
                                        color="primary"
                                        size="md"
                                        orientation="horizontal"
                                    >
                                        {tipoSancion.map((sancion) => (
                                            <Radio key={sancion.id} value={sancion.nombre} description={sancion.descripcion}>
                                                {sancion.nombre}
                                            </Radio>
                                        ))}
                                    </RadioGroup>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No hay datos seleccionados.</p>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default AlertaIncidentes;