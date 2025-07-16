import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import TablaDinamica from "../../Tabla";
import { BiEditAlt } from "react-icons/bi";
import { useDisclosure, Spinner } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import FormCargarExcel from "./cargar-excel/FormCargarExcel"
import FormEditar from "./FormEditar";
import React, { useState, useEffect, useRef } from "react";
import { Toast } from "../../CustomAlert";
import { MdOutlinePassword } from "react-icons/md";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { getEstudiantes, cargarEstudiantesExcel, updateEstudiante, disableEstudiante } from "../../../services/estudianteService";
import { getEspecialidades } from "../../../services/especialidadService";

const Estudiante = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedItem, setSelectedItem] = useState(null);
    const [accion, setAccion] = useState("");
    const [estudiantes, setEstudiantes] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const formCargarRef = useRef();
    const formEditarRef = useRef();

    // Cargar datos al montar el componente
    useEffect(() => {
        loadEstudiantes();
        loadEspecialidades();
    }, []);

    const loadEstudiantes = async () => {
        try {
            setLoading(true);
            const data = await getEstudiantes();
            // Procesar datos para mostrar en la tabla
            const estudiantesProcessed = data.map(estudiante => ({
                ...estudiante,
                especialidadNombre: estudiante.especialidad?.nombre || 'No asignada',
                especialidadCorta: estudiante.especialidad?.nombre?.length > 15 
                    ? estudiante.especialidad.nombre.substring(0, 15) + '...' 
                    : estudiante.especialidad?.nombre || 'No asignada',
                estadoTexto: estudiante.estado === 1 ? 'Activo' : 'Inactivo'
            }));
            setEstudiantes(estudiantesProcessed);
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            Toast.error('Error', 'Error al cargar los datos iniciales');
        } finally {
            setLoading(false);
        }
    };

    const loadEspecialidades = async () => {
        try {
            const data = await getEspecialidades();
            setEspecialidades(data);
        } catch (error) {
            console.error('Error al cargar especialidades:', error);
            Toast.error('Error', 'Error al cargar especialidades');
        }
    };

    const handleCargarExcel = async () => {
        // Usar la referencia del formulario para validar y obtener datos
        if (!formCargarRef.current?.validateAndSubmit()) {
            return; // Si la validación falla, no continuar
        }
    };

    const handleFormCargarSubmit = async (files) => {
        setDrawerLoading(true);
        try {
            const result = await cargarEstudiantesExcel(files);
            await loadEstudiantes();
            setSelectedItem(null);
            
            // Mostrar resultado detallado
            if (result.errores > 0) {
                Toast.warning(
                    "Carga completada con errores", 
                    `Se cargaron ${result.exitosos} estudiantes exitosamente, pero ${result.errores} tuvieron errores.`
                );
            } else {
                Toast.success(
                    "Estudiantes cargados", 
                    `Se cargaron ${result.exitosos} estudiantes exitosamente desde ${result.totalArchivos || 1} archivo(s).`
                );
            }
            onOpenChange();
        } catch (error) {
            console.error('Error al cargar estudiantes:', error);
            Toast.error('Error al cargar estudiantes', error.message);
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleEditarSubmit = async () => {
        // Usar la referencia del formulario para validar y obtener datos
        if (!formEditarRef.current?.validateAndSubmit()) {
            return; // Si la validación falla, no continuar
        }
    };

    const handleFormEditarSubmit = async (formData) => {
        setDrawerLoading(true);
        try {
            const estudianteData = {
                nombre: formData.nombre,
                apellidoUno: formData.apellidoUno,
                apellidoDos: formData.apellidoDos,
                correo: formData.correo,
                telefono: formData.telefono,
                estado: formData.estado,
                seccion: formData.seccion,
                fechaNacimiento: formData.fechaNacimiento,
                idEspecialidad: formData.idEspecialidad,
                rol: formData.rol || 3 // Rol de estudiante por defecto
            };
            await updateEstudiante(formData.cedula, estudianteData);
            Toast.success("Estudiante editado", "El estudiante fue editado exitosamente.");
            await loadEstudiantes();
            setSelectedItem(null);
            onOpenChange();
        } catch (error) {
            console.error('Error al editar estudiante:', error);
            Toast.error('Error', error.message || 'Error al editar el estudiante');
        } finally {
            setDrawerLoading(false);
        }
    };

    const handleDeshabilitar = async (item) => {
        try {
            await disableEstudiante(item.cedula);
            Toast.success("Estudiante deshabilitado", "El estudiante fue deshabilitado exitosamente.");
            await loadEstudiantes();
        } catch (error) {
            console.error('Error al deshabilitar estudiante:', error);
            Toast.error('Error', error.message || 'Error al deshabilitar el estudiante');
        }
    };

    const columnas = [
        { name: "Cédula", uid: "cedula" },
        { name: "Nombre", uid: "nombreCompleto" },
        { name: "Correo", uid: "correo" },
        { name: "Sección", uid: "seccion" },
        { name: "Especialidad", uid: "especialidadCorta" },
        { name: "Estado", uid: "estadoTexto" },
        { name: "Acciones", uid: "acciones" },
    ];

    // Definir filterOptions
    const filterOptions = [
        { field: "estadoTexto", label: "Estado", values: ["Activo", "Inactivo"] },
        { field: "especialidadNombre", label: "Especialidad", values: especialidades.map(esp => esp.nombre) },
        { field: "seccion", label: "Sección", values: [...new Set(estudiantes.map(est => est.seccion).filter(Boolean))] },
    ];

    const handleEditar = (item) => {
        setAccion(1);
        setSelectedItem(null);
        onOpen();

        setTimeout(() => {
            const data = {
                cedula: item.cedula,
                nombre: item.nombre,
                apellidoUno: item.apellidoUno,
                apellidoDos: item.apellidoDos,
                correo: item.correo,
                telefono: item.telefono,
                estado: item.estado,
                seccion: item.seccion,
                fechaNacimiento: item.fechaNacimiento,
                idEspecialidad: item.idEspecialidad,
            };
            setSelectedItem(data);
        }, 500);
    };

    const acciones = [
        {
            tooltip: "Editar",
            icon: <BiEditAlt />,
            handler: handleEditar,
        },
        {
            tooltip: <span className="text-danger">Restablecer contraseña</span>,
            icon: <MdOutlinePassword className="text-danger" />,
            handler: (item) => console.log("Restablecer contraseña", item),
        },
        {
            tooltip: <span className="text-danger">Deshabilitar</span>,
            icon: <DeleteIcon className="text-danger" />,
            handler: handleDeshabilitar,
        }
    ];

    // Limpiar formulario cuando se abre para cargar Excel
    useEffect(() => {
        if (isOpen && accion !== 1) {
            setSelectedItem({});
        }
    }, [isOpen, accion]);

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-8">
            <div className="w-full">
                <CabezeraDinamica
                    title="Estudiantes"
                    breadcrumb="Inicio • Estudiantes"
                />
            </div>
            <div className="w-full max-w-4xl">
                <div className="flex justify-between mb-4" style={{ marginTop: "50px" }}>
                    <TablaDinamica
                        columns={columnas}
                        data={estudiantes}
                        acciones={acciones}
                        filterOptions={filterOptions}
                        onOpen={onOpen}
                        setAccion={setAccion}
                        loading={loading}
                    />
                </div>
                <DrawerGeneral
                    titulo={accion === 1 ? "Editar Estudiante" : "Cargar Estudiantes desde Excel"}
                    size={accion === 1 ? "sm" : "md"}
                    isOpen={isOpen}
                    // Evita que el Drawer se cierre por onOpenChange mientras está cargando
                    onOpenChange={(open) => {
                        if (!drawerLoading && open === false) onOpenChange(open);
                    }}
                    textoBotonPrimario={accion === 1 ? "Editar" : "Cargar"}
                    onBotonPrimario={async () => {
                        if (!drawerLoading) {
                            return accion === 1 ? handleEditarSubmit() : handleCargarExcel();
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
                            onSubmit={handleFormEditarSubmit}
                            especialidades={especialidades}
                        />
                    ) : (
                        <FormCargarExcel 
                            ref={formCargarRef}
                            selectedItem={selectedItem} 
                            setSelectedItem={setSelectedItem}
                            onSubmit={handleFormCargarSubmit}
                        />
                    )}
                </DrawerGeneral>
            </div>
        </div>
    );
};

export default Estudiante;
