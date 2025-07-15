import CabezeraDinamica from "../Layout/CabeceraDinamica";
import TablaDinamica from "../Tabla";
import { BiEditAlt, BiUnderline } from "react-icons/bi";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Drawer, Form, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { Input, SelectItem, Chip } from "@heroui/react";
import Toast from "../CustomAlert";
import React, { useState, useEffect } from "react";
import { ESTADOS } from "../common/estados";

const Especialidades = () => {
    const [showErrors, setShowErrors] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);
    // Función para recargar especialidades después de crear/editar/eliminar
    const recargarEspecialidades = async () => {
        try {
            const { getEspecialidades } = await import("../../services/especialidadService");
            const especialidades = await getEspecialidades();
            setEspecialidades(especialidades);
        } catch (error) {
            console.error("Error al recargar especialidades:", error);
        }
    };

    // Crear especialidad
    const handleCrearEspecialidad = async () => {
        if (!selectedItem?.nombre) {
            setShowErrors(true);
            return;
        }
        try {
            const { createEspecialidad } = await import("../../services/especialidadService");
            await createEspecialidad({ nombre: selectedItem.nombre, estado: ESTADOS.ACTIVO });
            Toast.success("Especialidad creada exitosamente");
            onOpenChange();
            setSelectedItem(null);
            setAccion("");
            await recargarEspecialidades();
        } catch (error) {
            Toast.error("Error al crear especialidad");
            console.error("Error al crear especialidad:", error);
        }
    };

    // Editar especialidad
    const handleEditarEspecialidad = async () => {
        if (!selectedItem?.nombre || !selectedItem?.estado) {
            setShowErrors(true);
            return;
        }
        try {
            const { updateEspecialidad } = await import("../../services/especialidadService");
            // Log para depuración
            console.log("Enviando a updateEspecialidad:", {
                id: selectedItem.id,
                nombre: selectedItem.nombre,
                estado: selectedItem.estado
            });
            await updateEspecialidad(selectedItem.id, {
                nombre: selectedItem.nombre,
                estado: selectedItem.estado
            });
            Toast.success("Especialidad editada exitosamente");
            onOpenChange();
            setSelectedItem(null);
            setAccion("");
            await recargarEspecialidades();
        } catch (error) {
            if (error?.response?.data?.message) {
                Toast.error(error.response.data.message);
                console.error("Error al editar especialidad:", error.response.data.message);
            } else {
                Toast.error("Error al editar especialidad");
                console.error("Error al editar especialidad:", error);
            }
        }
    };

    // Eliminar especialidad
    const handleEliminarEspecialidad = async (item) => {
        try {
            const { deleteEspecialidad } = await import("../../services/especialidadService");
            await deleteEspecialidad(item.id);
            await recargarEspecialidades();
        } catch (error) {
            console.error("Error al eliminar especialidad:", error);
        }
    };
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null); // Elemento seleccionado para editar/crear
    const [accion, setAccion] = useState(""); // "Editar" o "Crear"
    const [especialidades, setEspecialidades] = useState([]); // Datos reales del backend

    const columnasPrueba = [
        { name: "#", uid: "numero" },
        { name: "Nombre", uid: "nombre" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Función para capitalizar el nombre
    const capitalizar = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    useEffect(() => {
        const fetchEspecialidades = async () => {
            try {
                const { getEspecialidades } = await import("../../services/especialidadService");
                const especialidades = await getEspecialidades();
                setEspecialidades(especialidades);
            } catch (error) {
                console.error("Error al obtener especialidades:", error);
            }
        };
        fetchEspecialidades();
    }, []);

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem({
            id: item.idEspecialidad || item.id || item._id,
            nombre: item.nombre,
            estado: item.estado,
        });
        setShowErrors(false);
        onOpen();
    };

    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
    ]

    const accionesPrueba = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        }
    ];

    // Abrir drawer para crear especialidad y limpiar el formulario
    const handleAbrirCrear = () => {
        setAccion(0);
        setSelectedItem({ nombre: "" });
        setShowErrors(false);
        onOpen();
    };

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
                        data={especialidades.map((esp, idx) => ({
                            ...esp,
                            nombre: capitalizar(esp.nombre),
                            numero: idx + 1
                        }))}
                        acciones={accionesPrueba}
                        filterOptions={filterOptions}
                        onOpen={handleAbrirCrear}
                        setAccion={setAccion}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Especialidad" : "Agregar Especialidad"}
                    size={"sm"}
                    isOpen={isOpen}
                    // Evita que el Drawer se cierre por onOpenChange mientras está cargando
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (!drawerLoading) {
                            return accion === 1 ? handleEditarEspecialidad() : handleCrearEspecialidad();
                        }
                    }}
                    onBotonSecundario={async () => {
                        if (!drawerLoading) {
                            onOpenChange(false);
                        }
                    }}
                    loadingBotonPrimario={drawerLoading}
                    loadingBotonSecundario={drawerLoading}
                    disableClose={drawerLoading}
                >
                    {accion === 1 ? (
                        <Form>
                            <Input
                                placeholder="Nombre"
                                value={selectedItem ? selectedItem.nombre : ""}
                                onChange={(e) => {
                                    setSelectedItem((prev) => ({
                                        ...prev,
                                        nombre: e.target.value,
                                    }));
                                    if (showErrors) setShowErrors(false);
                                }}
                                variant={"bordered"}
                                className="focus:border-primario"
                                color={showErrors && !selectedItem?.nombre ? "danger" : "primary"}
                                isInvalid={showErrors && !selectedItem?.nombre}
                                errorMessage={showErrors && !selectedItem?.nombre ? "El nombre es obligatorio" : ""}
                            />
                            <Select
                                isRequired
                                label="Estado"
                                name="estado"
                                selectedKeys={selectedItem?.estado ? [selectedItem.estado.toString()] : []}
                                onSelectionChange={(keys) => {
                                    const selectedValue = Number(Array.from(keys)[0]);
                                    setSelectedItem((prev) => ({
                                        ...prev,
                                        estado: selectedValue,
                                    }));
                                }}
                                variant="bordered"
                                className="focus:border-primario"
                                color="primary"
                                isInvalid={showErrors && (!selectedItem?.estado && selectedItem?.estado !== 0)}
                                errorMessage="El estado es obligatorio"
                            >
                                <SelectItem key={ESTADOS.ACTIVO} value={ESTADOS.ACTIVO} textValue="Activo">
                                    <div className="flex items-center gap-2">
                                        <Chip color="success" variant="flat" size="sm">
                                            Activo
                                        </Chip>
                                    </div>
                                </SelectItem>
                                <SelectItem key={ESTADOS.INACTIVO} value={ESTADOS.INACTIVO} textValue="Inactivo">
                                    <div className="flex items-center gap-2">
                                        <Chip color="danger" variant="flat" size="sm">
                                            Inactivo
                                        </Chip>
                                    </div>
                                </SelectItem>
                            </Select>
                        </Form>
                    ) : (
                        <Form>
                            <Input
                                placeholder="Nombre"
                                value={selectedItem ? selectedItem.nombre : ""}
                                onChange={(e) => {
                                    setSelectedItem((prev) => ({
                                        ...prev,
                                        nombre: e.target.value,
                                    }));
                                    if (showErrors) setShowErrors(false);
                                }}
                                variant={"bordered"}
                                className="focus:border-primario"
                                color={showErrors && !selectedItem?.nombre ? "danger" : "primary"}
                                isInvalid={showErrors && !selectedItem?.nombre}
                                errorMessage={showErrors && !selectedItem?.nombre ? "El nombre es obligatorio" : ""}
                            />
                        </Form>
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Especialidades;