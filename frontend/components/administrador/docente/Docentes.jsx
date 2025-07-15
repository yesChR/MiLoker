import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { Select, SelectItem, Chip } from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import { Input } from "@heroui/react";
import React, { useState, useEffect } from "react";
import { getDocentes, createDocente, updateDocente } from "../../../services/docenteService";
import { getEspecialidades } from "../../../services/especialidadService";
import { MdOutlinePassword } from "react-icons/md";
import { ESTADOS } from "../../common/estados";
import { ROLES } from "../../common/roles";
import { Toast } from "../../CustomAlert";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";

const Docentes = () => {
    // Placeholder para evitar ReferenceError
    const handleFormCrearSubmit = () => {
        // Implementa aquí la lógica de creación si es necesario
    };

    // --- AGREGADO siguiendo Admin ---
    const handleFormEditarSubmit = async (formData) => {
        setDrawerLoading(true);
        try {
            const docenteData = {
                nombre: formData.nombre,
                apellidoUno: formData.apellidoUno,
                apellidoDos: formData.apellidoDos,
                correo: formData.correo,
                telefono: formData.telefono,
                estado: formData.estado,
                idEspecialidad: especialidad ? Number(especialidad) : null
            };
            await updateDocente(formData.cedula, docenteData);
            Toast.success("Docente editado", "El docente fue editado exitosamente.");
            await cargarDocentes();
            setSelectedItem(null);
            setEspecialidad("");
            onOpenChange();
        } catch (error) {
            console.error("Error al editar docente:", error);
            Toast.error("Error", error.message || "Error al editar docente");
        } finally {
            setDrawerLoading(false);
        }
    };
    const formCrearRef = React.useRef(null);
    const formEditarRef = React.useRef(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState({});//aqui almacena el elemento seleccionado del editable
    const [especialidad, setEspecialidad] = useState("");
    const [especialidades, setEspecialidades] = useState([]);
    const [accion, setAccion] = useState(""); // Estado para determinar si es "Editar" o "Crear"

    // QUITADO columna especialidad
    const columnas = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre completo", uid: "nombreCompleto" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Estado", uid: "estado" },
        { name: "Acciones", uid: "acciones" },
    ];

    const [datosDocentes, setDatosDocentes] = useState([]);
    const [loading, setLoading] = useState(true); // AGREGADO siguiendo Admin
    const [drawerLoading, setDrawerLoading] = useState(false); // AGREGADO siguiendo Admin

    useEffect(() => {
        cargarDocentes();
        cargarEspecialidades();
    }, []);

    // AGREGADO siguiendo Admin
    const cargarEspecialidades = async () => {
        try {
            const data = await getEspecialidades();
            setEspecialidades(data);
        } catch (error) {
            console.error("Error al cargar especialidades:", error);
            Toast.error("Error", "Error al cargar especialidades");
        }
    };

    // AGREGADO siguiendo Admin
    const cargarDocentes = async () => {
        try {
            setLoading(true);
            const data = await getDocentes();
            setDatosDocentes(data);
        } catch (error) {
            console.error("Error al cargar docentes:", error);
            Toast.error("Error", "Error al cargar docentes");
        } finally {
            setLoading(false);
        }
    };

    // AGREGADO siguiendo Admin
    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem({
            cedula: item.cedula || "",
            nombre: item.nombre || "",
            apellidoUno: item.apellidoUno || item.primerApellido || "",
            apellidoDos: item.apellidoDos || item.segundoApellido || "",
            correo: item.correo || "",
            telefono: item.telefono || "",
            estado: item.estado || ESTADOS.ACTIVO,
            idEspecialidad: item.idEspecialidad ? String(item.idEspecialidad) : ""
        });
        setEspecialidad(item.idEspecialidad ? String(item.idEspecialidad) : "");
        onOpen();
    };

    // AGREGADO siguiendo Admin
    useEffect(() => {
        if (isOpen && accion !== 1) {
            setSelectedItem({ idEspecialidad: "" });
            setEspecialidad("");
        }
    }, [isOpen, accion]);

    // AGREGADO siguiendo Admin
    const handleCrearDocente = async () => {
        setDrawerLoading(true);
        try {
            const docenteData = {
                cedula: selectedItem?.cedula,
                nombre: selectedItem?.nombre,
                apellidoUno: selectedItem?.apellidoUno,
                apellidoDos: selectedItem?.apellidoDos,
                correo: selectedItem?.correo,
                telefono: selectedItem?.telefono,
                estado: selectedItem?.estado ?? ESTADOS.ACTIVO,
                rol: ROLES.PROFESOR,
                idEspecialidad: especialidad ? Number(especialidad) : null
            };
            await createDocente(docenteData);
            await cargarDocentes();
            // No limpiar selectedItem ni especialidad aquí, solo mostrar el toast
            Toast.success("Docente creado", "El docente fue creado exitosamente.");
            // Si quieres limpiar los campos solo al cerrar el drawer, hazlo en el efecto de cierre
            // onOpenChange();
        } catch (error) {
            console.error("Error al crear docente:", error);
            Toast.error("Error", error.message || "Error al crear docente");
        } finally {
            setDrawerLoading(false);
        }
    };

    // AGREGADO siguiendo Admin
    const handleEditarDocente = async () => {
        setDrawerLoading(true);
        try {
            const docenteData = {
                nombre: selectedItem?.nombre,
                apellidoUno: selectedItem?.apellidoUno,
                apellidoDos: selectedItem?.apellidoDos,
                correo: selectedItem?.correo,
                telefono: selectedItem?.telefono,
                estado: selectedItem?.estado,
                idEspecialidad: especialidad ? Number(especialidad) : null
            };
            await updateDocente(selectedItem.cedula, docenteData);
            Toast.success("Docente editado", "El docente fue editado exitosamente.");
            await cargarDocentes();
            setSelectedItem(null);
            setEspecialidad("");
            onOpenChange();
        } catch (error) {
            console.error("Error al editar docente:", error);
            Toast.error("Error", error.message || "Error al editar docente");
        } finally {
            setDrawerLoading(false);
        }
    };

    // CORREGIDO filtro por especialidad (solo ids como value, opcional labels)
    const filterOptions = [
        { field: "estado", label: "Estado", values: ["Activo", "Inactivo"] },
        {
            field: "idEspecialidad",
            label: "Especialidad",
            values: especialidades.map(e => e.idEspecialidad?.toString()),
            labels: especialidades.reduce((acc, e) => {
                const nombreFormateado = e.nombre
                    ? e.nombre.charAt(0).toUpperCase() + e.nombre.slice(1).toLowerCase()
                    : "";
                acc[e.idEspecialidad?.toString()] = nombreFormateado;
                return acc;
            }, {})
        }
    ];

    const acciones = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        },
        {
            tooltip: <span className="text-danger">Restablecer contraseña</span>,
            icon: <MdOutlinePassword className="text-danger" />,
            handler: (item) => console.log("Eliminar", item),
        }
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
                        columns={columnas}
                        data={datosDocentes.map((doc) => {
                            const especialidadObj = especialidades.find(e => e.idEspecialidad?.toString() === doc.idEspecialidad?.toString());
                            return {
                                ...doc,
                                nombreCompleto: `${doc.nombre || ""} ${doc.apellidoUno || doc.primerApellido || ""} ${doc.apellidoDos || doc.segundoApellido || ""}`.trim(),
                                especialidadNombre: especialidadObj ? especialidadObj.nombre : "Sin especialidad"
                            };
                        })}
                        acciones={acciones}
                        filterOptions={filterOptions}
                        onOpen={onOpen}
                        setAccion={setAccion}
                        loading={loading} // AGREGADO siguiendo Admin
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Docente" : "Agregar Docente"}
                    size={"sm"}
                    isOpen={isOpen}
                    // AGREGADO siguiendo Admin: Evita que el Drawer se cierre por onOpenChange mientras está cargando
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (!drawerLoading) {
                            return accion === 1 ? handleEditarDocente() : handleCrearDocente(); // AGREGADO siguiendo Admin
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
                            setEspecialidad={setEspecialidad}
                            onSubmit={handleFormEditarSubmit}
                        />
                    ) : (
                        <FormCrear
                            ref={formCrearRef}
                            selectedItem={selectedItem}
                            setSelectedItem={setSelectedItem}
                            especialidades={especialidades}
                            setEspecialidad={setEspecialidad}
                            onSubmit={handleFormCrearSubmit}
                        />
                    )}

                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Docentes;