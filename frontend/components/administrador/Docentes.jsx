import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";

const Docentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);//aqui almacena el elemento seleccionado del editable
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Editar" o "Crear"


    const columnasPrueba = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombre" },
        { name: "Primer Apellido", uid: "primerApellido" },
        { name: "Segundo Apellido", uid: "segundoApellido" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    const datosPrueba = [
        {
            id: 1,
            cedula: "123456789",
            nombre: "Juan",
            primerApellido: "Pérez",
            segundoApellido: "Gómez",
            correo: "juan.perez@example.com",
            telefono: "88888888",
            estado: "Activo",
        },
        {
            id: 2,
            cedula: "987654321",
            nombre: "María",
            primerApellido: "Rodríguez",
            segundoApellido: "López",
            correo: "maria.rodriguez@example.com",
            telefono: "77777777",
            estado: "Inactivo",
        },
        {
            id: 3,
            cedula: "456789123",
            nombre: "Carlos",
            primerApellido: "Jiménez",
            segundoApellido: "Martínez",
            correo: "carlos.jimenez@example.com",
            telefono: "66666666",
            estado: "Activo",
        },
    ];

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem(null);
        onOpen();

        setTimeout(() => {
            const data = {
                cedula: item.cedula,
                nombre: item.nombre,
                primerApellido: item.primerApellido,
                segundoApellido: item.segundoApellido,
                correo: item.correo,
                telefono: item.telefono,
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
                    title="Docentes"
                    breadcrumb="Inicio • Docentes"
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
                    titulo={accion === 1 ? "Editar Docente" : "Agregar Docentes"}
                    size={"xs"}
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                >
                    <Input
                        placeholder="Cédula"
                        value={accion === 1 && selectedItem ? selectedItem.cedula : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                cedula: e.target.value, // Actualiza el campo "cedula"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
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
                    <Input
                        placeholder="Primer apellido"
                        value={accion === 1 && selectedItem ? selectedItem.primerApellido : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                primerApellido: e.target.value, // Actualiza el campo "primerApellido"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Segundo apellido"
                        value={accion === 1 && selectedItem ? selectedItem.segundoApellido : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                segundoApellido: e.target.value, // Actualiza el campo "segundoApellido"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Correo"
                        value={accion === 1 && selectedItem ? selectedItem.correo : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                correo: e.target.value, // Actualiza el campo "correo"
                            }))
                        }
                        variant={"bordered"}
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Input
                        placeholder="Teléfono"
                        value={accion === 1 && selectedItem ? selectedItem.telefono : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                telefono: e.target.value, // Actualiza el campo "telefono"
                            }))
                        }
                        variant={"bordered"}
                        type={"tel"}
                        pattern="^(?:\+506\s?)?[26-9]\d{3}-?\d{4}$"
                        className="focus:border-primario"
                        color="primary"
                    />
                    <Select
                        placeholder="Especialidad"
                        value={accion === 1 && selectedItem ? selectedItem.especialidad : ""}
                        onChange={(e) =>
                            setSelectedItem((prev) => ({
                                ...prev,
                                especialidad: e.target.value, // Actualiza el campo "especialidad"
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

export default Docentes;