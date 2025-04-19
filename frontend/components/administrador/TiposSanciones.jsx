import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState } from "react";

const TiposSanciones = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);//aqui almacena el elemento seleccionado del editable
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Editar" o "Crear"

    const columnasPrueba = [
        { name: "#", uid: "numero" },
        { name: "Gravedad", uid: "gravedad" },
        { name: "Detalle", uid: "detalle" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        {
            id: 1,
            numero: 1,
            gravedad: "Alta",
            detalle: "Falla en el sistema de autenticación",
        },
        {
            id: 2,
            numero: 2,
            gravedad: "Media",
            detalle: "Error en la carga de datos de usuarios",
        },
        {
            id: 3,
            numero: 3,
            gravedad: "Baja",
            detalle: "Texto mal alineado en la interfaz de usuario",
        },
    ];

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem(null);
        onOpen();

        setTimeout(() => {
            const data = {
                id: item.id,
                numero: item.numero,
                gravedad: item.gravedad,
                detalle: item.detalle,
            };
            setSelectedItem(data);
        }
            , 500);
    };

    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
    ]

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        },
        {
            tooltip: <span className="text-danger">Eliminar</span>, // Aplica el color al texto del tooltip
            icon: <DeleteIcon className="text-danger" />,
            handler: (item) => console.log("Eliminar", item),
        },
    ];

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Sanciones"
                    breadcrumb="Inicio • Sanciones"
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnasPrueba}
                        data={datosPrueba}
                        acciones={accionesPrueba}
                        filterOptions={filterOptions}
                        onOpen={onOpen}
                        setAccion={setAccion}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Sanción" : "Agregar Sanciones"}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpen={onOpen}
                    onOpenChange={onOpenChange}>
                    <Input
                        placeholder="Gravedad"
                        value={accion === 1 && selectedItem ? selectedItem.gravedad : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                gravedad: e.target.value, // Actualiza el campo "gravedad"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <textarea
                        placeholder="Escribe el detalle aquí..."
                        value={accion === 1 && selectedItem ? selectedItem.detalle : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                detalle: e.target.value, // Actualiza el campo "detalle"
                            }))
                        }
                        className="border-2 border-gray-300 rounded-2xl p-2 w-full h-32 resize-none focus:border-blue-500 hover:border-gray-400 placeholder:text-sm text-gray-900"
                        color="primary"
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default TiposSanciones;