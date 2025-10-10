import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { useDisclosure } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import ConfirmModal from "../../ConfirmModal";
import React, { useState, useEffect, useCallback } from "react";
import { getDocentes, createDocente, updateDocente } from "../../../services/docenteService";
import { getEspecialidades } from "../../../services/especialidadService";
import { restablecerContraseñaService } from "../../../services/authService";
import { MdOutlinePassword } from "react-icons/md";
import { ESTADOS } from "../../common/estados";
import { ROLES } from "../../common/roles";
import { Toast } from "../../CustomAlert";
import FormCrear from "./FormCrear";
import FormEditar from "./FormEditar";

const Docentes = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [drawerLoading, setDrawerLoading] = useState(false);
    const formCrearRef = React.useRef(null);
    const formEditarRef = React.useRef(null);
    const [selectedItem, setSelectedItem] = useState({});
    const [especialidad, setEspecialidad] = useState("");
    const [especialidades, setEspecialidades] = useState([]);
    const [accion, setAccion] = useState("");
    const [datosDocentes, setDatosDocentes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemToReset, setItemToReset] = useState(null);
    const [resetLoading, setResetLoading] = useState(false);

    // Placeholder para evitar ReferenceError
    const handleFormCrearSubmit = () => {
        // Implementa aquí la lógica de creación si es necesario
    };

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
            await loadDocentes();
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

    const columnas = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombreCompleto" },
        { name: "Correo", uid: "correo" },
        { name: "Teléfono", uid: "telefono" },
        { name: "Especialidad", uid: "especialidadCorta" },
        { name: "Estado", uid: "estadoTexto" },
        { name: "Acciones", uid: "acciones" },
    ];

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            const data = await getEspecialidades();
            if (data && data.error) {
                setEspecialidades([]);
                Toast.error("Error", data.message || "Error al cargar especialidades");
                setLoading(false);
            } else {
                setEspecialidades(data);
            }
        };
        cargarDatos();
    }, []);

    const loadDocentes = React.useCallback(async (search = '', filters = {}) => {
        setLoading(true);
        try {
            const data = await getDocentes(search, filters);
            if (data && data.error) {
                setDatosDocentes([]);
                Toast.error("Error", data.message || "Error al cargar docentes");
            } else if (Array.isArray(data)) {
                const docentesProcessed = data.map(docente => {
                    const especialidadObj = especialidades.find(e => e.idEspecialidad?.toString() === docente.idEspecialidad?.toString());
                    return {
                        ...docente,
                        especialidadNombre: especialidadObj ? especialidadObj.nombre : "Sin especialidad",
                        especialidadCorta: especialidadObj && especialidadObj.nombre?.length > 15
                            ? especialidadObj.nombre.substring(0, 15) + '...'
                            : (especialidadObj ? especialidadObj.nombre : "Sin especialidad"),
                        estadoTexto: docente.estado === ESTADOS.ACTIVO ? 'Activo' : 'Inactivo'
                    };
                });
                setDatosDocentes(docentesProcessed);
            } else {
                setDatosDocentes([]);
            }
        } finally {
            setLoading(false);
        }
    }, [especialidades]);

    useEffect(() => {
        if (especialidades.length > 0) {
            loadDocentes();
        }
    }, [especialidades, loadDocentes]);

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

    const handleRestablecerContraseña = async (item) => {
        setItemToReset(item);
        onConfirmOpen();
    };

    const confirmarRestablecimiento = async () => {
        if (!itemToReset) return;

        setResetLoading(true);
        try {
            const result = await restablecerContraseñaService(itemToReset.cedula);

            if (result && result.error) {
                Toast.error('Error', result.message || 'Error al restablecer contraseña');
            } else {
                Toast.success(
                    "¡Contraseña restablecida!", 
                    `Nueva contraseña enviada a: ${result.data?.correoEnviado || itemToReset.correo}`
                );
                onConfirmClose();
            }
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            Toast.error('Error', 'Error al restablecer contraseña');
        } finally {
            setResetLoading(false);
            setItemToReset(null);
        }
    };

    // Función simple para filtros remotos
    const handleRemoteFilter = useCallback((search, filters) => {
        // Si es filtro de especialidad por nombre, convertir a ID
        if (filters?.especialidadNombre) {
            const esp = especialidades.find(e => e.nombre === filters.especialidadNombre);
            if (esp) {
                filters = { ...filters, idEspecialidad: esp.idEspecialidad };
                delete filters.especialidadNombre;
            }
        }
        loadDocentes(search, filters);
    }, [especialidades, loadDocentes]);

    useEffect(() => {
        if (isOpen && accion !== 1) {
            setSelectedItem({ idEspecialidad: "" });
            setEspecialidad("");
        }
    }, [isOpen, accion]);

    const handleCrearDocente = async () => {
        if (!formCrearRef.current?.validateAndSubmit()) {
            setDrawerLoading(false);
            return;
        }
        setDrawerLoading(true);
        const docenteData = {
            cedula: selectedItem?.cedula,
            nombre: selectedItem?.nombre,
            apellidoUno: selectedItem?.apellidoUno,
            apellidoDos: selectedItem?.apellidoDos,
            correo: selectedItem?.correo,
            telefono: selectedItem?.telefono,
            estado: ESTADOS.ACTIVO,
            rol: ROLES.PROFESOR,
            idEspecialidad: especialidad ? Number(especialidad) : null
        };
        const result = await createDocente(docenteData);
        if (result && result.error) {
            if (result.message && result.message.includes('ya existe')) {
                Toast.error('Docente ya existe', result.message);
            } else {
                Toast.error('Error', result.message || 'Error al crear docente');
            }
        } else {
            await loadDocentes();
            setSelectedItem({ idEspecialidad: "" });
            setEspecialidad("");
            Toast.success("Docente creado", "El docente fue creado exitosamente.");
            onOpenChange();
        }
        setDrawerLoading(false);
    };

    const handleEditarDocente = async () => {
        if (!formEditarRef.current?.validateAndSubmit()) {
            setDrawerLoading(false);
            return;
        }
        setDrawerLoading(true);
        const docenteData = {
            nombre: selectedItem?.nombre,
            apellidoUno: selectedItem?.apellidoUno,
            apellidoDos: selectedItem?.apellidoDos,
            correo: selectedItem?.correo,
            telefono: selectedItem?.telefono,
            estado: selectedItem?.estado,
            idEspecialidad: especialidad ? Number(especialidad) : null
        };
        const result = await updateDocente(selectedItem.cedula, docenteData);
        if (result && result.error) {
            Toast.error('Error', result.message || 'Error al editar docente');
        } else {
            Toast.success("Docente editado", "El docente fue editado exitosamente.");
            await loadDocentes();
            setSelectedItem(null);
            setEspecialidad("");
            onOpenChange();
        }
        setDrawerLoading(false);
    };

    const filterOptions = [
        { field: "estadoTexto", label: "Estado", values: ["Activo", "Inactivo"] },
        {
            field: "especialidadNombre",
            label: "Especialidad",
            values: [...new Set(datosDocentes.map(doc => doc.especialidadNombre).filter(Boolean))]
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
            handler: handleRestablecerContraseña,
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
                        data={datosDocentes}
                        acciones={acciones}
                        filterOptions={filterOptions}
                        onOpen={onOpen}
                        setAccion={setAccion}
                        loading={loading}
                        onRemoteFilter={handleRemoteFilter}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Docente" : "Agregar Docente"}
                    size={"sm"}
                    isOpen={isOpen}
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Agregar"}
                    onBotonPrimario={async () => {
                        if (!drawerLoading) {
                            return accion === 1 ? handleEditarDocente() : handleCrearDocente();
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

                <ConfirmModal
                    isOpen={isConfirmOpen}
                    onClose={onConfirmClose}
                    title="Restablecer contraseña"
                    confirmText="Restablecer"
                    cancelText="Cancelar"
                    confirmColor="warning"
                    onConfirm={confirmarRestablecimiento}
                    size="md"
                    customContent={itemToReset && (
                        <div className="space-y-2">
                            <div className="text-center">
                                <p className="text-gray-700 mb-2">
                                    ¿Está seguro de restablecer la contraseña?
                                </p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-blue-600 font-bold text-xl">
                                        {itemToReset.nombre?.charAt(0)}{itemToReset.apellidoUno?.charAt(0)}
                                    </span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-800">
                                    {itemToReset.nombre} {itemToReset.apellidoUno}
                                </h4>
                                <p className="text-sm text-gray-600">{itemToReset.correo}</p>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-gray-500">
                                    Se enviará una nueva contraseña temporal por correo electrónico
                                </p>
                            </div>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

export default Docentes;