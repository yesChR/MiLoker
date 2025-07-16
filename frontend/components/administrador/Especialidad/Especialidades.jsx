import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt, BiUnderline } from "react-icons/bi";
import { Drawer, Form, Select } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import Toast from "../../CustomAlert";
import React, { useState, useEffect } from "react";
import { ESTADOS } from "../../common/estados";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";

const Especialidades = () => {
    // Funciones de submit reales para los formularios
    const handleFormCrearSubmit = async (formData) => {
        await handleCrearEspecialidad(formData);
    };
    const handleFormEditarSubmit = async (formData) => {
        await handleEditarEspecialidad(formData);
    };
    const formCrearRef = React.useRef();
    const formEditarRef = React.useRef();
    const [showErrors, setShowErrors] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);

    // Función para recargar especialidades después de crear/editar/eliminar
    const recargarEspecialidades = async () => {
        try {
            const { getEspecialidades } = await import("../../../services/especialidadService");
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
        // Validar nombre duplicado
        const nombreNormalizado = selectedItem.nombre.trim().toLowerCase();
        const existe = especialidades.some(e => e.nombre.trim().toLowerCase() === nombreNormalizado);
        if (existe) {
            return;
        }
        setDrawerLoading(true);
        try {
            const { createEspecialidad } = await import("../../../services/especialidadService");
            await createEspecialidad({ nombre: selectedItem.nombre, estado: ESTADOS.ACTIVO });
            Toast.success("Especialidad creada exitosamente");
            onOpenChange();
            setSelectedItem(null);
            setAccion("");
            await recargarEspecialidades();
        } catch (error) {
            Toast.error("Error al crear especialidad");
            console.error("Error al crear especialidad:", error);
        } finally {
            setDrawerLoading(false);
        }
    };

    // Editar especialidad
    const handleEditarEspecialidad = async () => {
        if (!selectedItem?.nombre || !selectedItem?.estado) {
            setShowErrors(true);
            return;
        }
        // Validar nombre duplicado (ignorando el propio id)
        const nombreNormalizado = selectedItem.nombre.trim().toLowerCase();
        const existe = especialidades.some(e =>
            e.nombre.trim().toLowerCase() === nombreNormalizado &&
            (e.idEspecialidad || e.id || e._id) !== selectedItem.id
        );
        if (existe) {
            return;
        }
        setDrawerLoading(true);
        try {
            const { updateEspecialidad } = await import("../../../services/especialidadService");
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
        } finally {
            setDrawerLoading(false);
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
                const { getEspecialidades } = await import("../../../services/especialidadService");
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
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (drawerLoading) return;
                        if (accion === 1) {
                            // Editar
                            const valid = await formEditarRef.current?.validateAndSubmit?.();
                            if (valid) await handleEditarEspecialidad();
                        } else {
                            // Crear
                            const valid = await formCrearRef.current?.validateAndSubmit?.();
                            if (valid) await handleCrearEspecialidad();
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
                        <FormEditar
                            ref={formEditarRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            especialidades={especialidades}
                        />
                    ) : (
                        <FormCrear
                            ref={formCrearRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            especialidades={especialidades}
                        />
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Especialidades;