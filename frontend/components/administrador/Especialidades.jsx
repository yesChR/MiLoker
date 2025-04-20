import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt, BiUnderline } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";

const Especialidades = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);//aqui almacena el elemento seleccionado del editable
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Editar" o "Crear"

    const columnasPrueba = [
        { name: "#", uid: "numero" },
        { name: "Nombre", uid: "nombre" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        {
            id: 1,
            numero: 1,
            nombre: "Autenticación",
            estado: "Activo",
        },
        {
            id: 2,
            numero: 2,
            nombre: "Carga de datos",
            estado: "Inactivo",
        },
        {
            id: 3,
            numero: 3,
            nombre: "Interfaz de usuario",
            estado: "Activo",
        },
    ];

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem(null);
        onOpen();

        setTimeout(() => {
            const data = {
                id: item.id,
                nombre: item.nombre,
                estado: item.estado,
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
                    title="Especialidades"
                    breadcrumb="Inicio • Especialidades"
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
                    titulo={accion === 1 ? "Editar Especialidad" : "Agregar Especialidad"}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                >
                    <Input
                        placeholder="Nombre"
                        value={accion === 1 && selectedItem ? selectedItem.nombre : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                nombre: e.target.value, // Actualiza el campo "nombre"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Select
                        placeholder="Estado"
                        value={accion === 1 && selectedItem ? selectedItem.estado : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                estado: e.target.value, // Actualiza el campo "estado"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Especialidades;