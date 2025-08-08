import React, { useState, useEffect, useRef } from "react";
import CabezeraDinamica from "../../Layout/CabeceraDinamica";
import { Button, Select, SelectItem } from "@heroui/react";
import DrawerGeneral from "../../DrawerGeneral";
import { PlusIcon } from "../../icons/PlusIcon";
import { useDisclosure } from "@heroui/react";
import { Toast } from "../../CustomAlert";
import { obtenerTodosLosArmarios, obtenerArmariosPorEspecialidad, crearArmario, editarCasillero } from "../../../services/armarioService";
import { getEspecialidades } from "../../../services/especialidadService";
import { obtenerEstadosCasillero } from "../../../services/estadoCasilleroService";
import FormCrearArmario from "./FormCrearArmario";
import FormEditarCasillero from "./FormEditarCasillero";
import VisualizadorArmario from "./VisualizadorArmario";
import PaginacionArmarios from "./PaginacionArmarios";

const Armario = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedCasillero, setSelectedCasillero] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
    const [armariosData, setArmariosData] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [estadosCasillero, setEstadosCasillero] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({
        idArmario: '',
        numFilas: '',
        numColumnas: '',
        idEspecialidad: ''
    });

    const formCrearRef = useRef();
    const formEditarRef = useRef();

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Cargar especialidades y armarios
    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            // Cargar estados de casillero primero
            const estadosResult = await obtenerEstadosCasillero();
            
            if (estadosResult?.error) {
                Toast.error("Error", estadosResult.message);
                setEstadosCasillero([]);
            } else {
                setEstadosCasillero(estadosResult || []);
            }

            // Cargar especialidades
            const especialidadesResult = await getEspecialidades();
            
            if (especialidadesResult?.error) {
                Toast.error("Error", especialidadesResult.message);
                setEspecialidades([]);
                setLoading(false);
            } else {
                setEspecialidades(especialidadesResult || []);
                // Seleccionar automáticamente la primera especialidad si no hay ninguna seleccionada
                if (!especialidadSeleccionada && especialidadesResult && especialidadesResult.length > 0) {
                    const primeraEspecialidad = especialidadesResult[0].idEspecialidad.toString();
                    setEspecialidadSeleccionada(primeraEspecialidad);
                    // El useEffect se encargará de cargar los armarios de esta especialidad
                } else {
                    // Solo si no hay especialidades, cargar todos los armarios
                    if (especialidadesResult.length === 0) {
                        const armariosResult = await obtenerTodosLosArmarios();
                        
                        if (armariosResult?.error) {
                            Toast.error("Error", armariosResult.message);
                            setArmariosData([]);
                        } else {
                            const armariosTransformados = transformarDatosArmarios(armariosResult);
                            setArmariosData(armariosTransformados);
                        }
                    }
                }
                setLoading(false);
            }
        } catch (error) {
            Toast.error("Error", 'Error al cargar los datos');
            console.error('Error en cargarDatosIniciales:', error);
            setLoading(false);
        }
    };

    // Transformar datos del backend al formato esperado por el frontend
    const transformarDatosArmarios = (armariosBackend) => {
        if (!armariosBackend || !Array.isArray(armariosBackend)) {
            return [];
        }
        
        return armariosBackend.map(armario => ({
            id: armario?.idArmario || 'N/A',
            filas: armario?.numFilas || 0,
            columnas: armario?.numColumnas || 0,
            especialidadId: armario?.idEspecialidad || 0,
            casilleros: (armario?.casilleros || []).map(casillero => ({
                id: casillero?.numCasillero || 0,
                idCasillero: casillero?.idCasillero || 0,
                estado: casillero?.idEstadoCasillero || 1,
                descripcion: casillero?.detalle || '',
                estadoNombre: casillero?.estadoCasillero?.nombre || '',
                casillerosXestudiantes: casillero?.casillerosXestudiantes || []
            }))
        }));
    };

    // Filtrar armarios cuando cambia la especialidad seleccionada
    useEffect(() => {
        if (especialidadSeleccionada) {
            cargarArmariosPorEspecialidad(especialidadSeleccionada);
            setCurrentPage(1); // Resetear a la primera página cuando cambie la especialidad
        } else {
            // Si no hay especialidad seleccionada, mostrar todos los armarios
            if (armariosData.length === 0) {
                cargarDatosIniciales();
            }
        }
    }, [especialidadSeleccionada]);

    // Cargar armarios por especialidad
    const cargarArmariosPorEspecialidad = async (idEspecialidad) => {
        setLoading(true);
        try {
            const armariosResult = await obtenerArmariosPorEspecialidad(idEspecialidad);
            
            if (armariosResult?.error) {
                Toast.error("Error", armariosResult.message);
                setArmariosData([]);
            } else {
                const armariosTransformados = transformarDatosArmarios(armariosResult);
                setArmariosData(armariosTransformados);
            }
        } catch (error) {
            Toast.error("Error", 'Error al cargar armarios por especialidad');
            setArmariosData([]);
            console.error('Error en cargarArmariosPorEspecialidad:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirDrawer = (casillero = null) => {
        if (casillero !== null) {
            setIsEditing(true);
            setSelectedCasillero(casillero);
        } else {
            setIsEditing(false);
            setSelectedCasillero(null);
            setFormData({
                idArmario: '',
                numFilas: '',
                numColumnas: '',
                idEspecialidad: ''
            });
        }
        onOpen();
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            let success = false;
            
            if (isEditing) {
                success = formEditarRef.current?.validateAndSubmit();
            } else {
                success = formCrearRef.current?.validateAndSubmit();
            }
            
            if (!success) {
                setSubmitting(false);
            }
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            setSubmitting(false);
        }
    };

    // Crear nuevo armario
    const handleCrearArmario = async (armarioData) => {
        try {
            const result = await crearArmario(armarioData);
            
            if (result?.error) {
                Toast.error("Error", "Error al crear el armario");
            } else {
                Toast.success("¡Éxito!", 'Armario creado exitosamente');
                onOpenChange(false);
                setFormData({
                    idArmario: '',
                    numFilas: '',
                    numColumnas: '',
                    idEspecialidad: ''
                });
                // Recargar datos
                if (especialidadSeleccionada) {
                    cargarArmariosPorEspecialidad(especialidadSeleccionada);
                } else {
                    cargarDatosIniciales();
                }
            }
        } catch (error) {
            Toast.error("Error", 'Error al crear el armario');
            console.error('Error en handleCrearArmario:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Editar casillero
    const handleEditarCasillero = async (casilleroData) => {
        try {
            const result = await editarCasillero(selectedCasillero.idCasillero, casilleroData);
            if (result.error) {
                Toast.error("Error", result.message);
            } else {
                Toast.success("¡Éxito!", 'Casillero actualizado exitosamente');
                onOpenChange(false);
                // Recargar datos
                if (especialidadSeleccionada) {
                    cargarArmariosPorEspecialidad(especialidadSeleccionada);
                } else {
                    cargarDatosIniciales();
                }
            }
        } catch (error) {
            Toast.error("Error", 'Error al actualizar el casillero');
            console.error('Error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Los armarios ya están filtrados por el backend
    const armariosFiltrados = armariosData;
    const armarioActual = armariosFiltrados.length > 0 ? armariosFiltrados[currentPage - 1] : null;

    return (
        <div className="flex flex-col items-center w-full max-w-7xl mx-auto space-y-6">
            <div className="w-full">
                <CabezeraDinamica
                    title="Casilleros"
                    breadcrumb="Inicio • Casilleros"
                />
            </div>

            {/* CONTENEDOR PRINCIPAL */}
            <div className="flex w-full max-w-2xl mx-auto space-x-6">
                {/* Paginación lateral vertical */}
                <PaginacionArmarios 
                    armarios={armariosFiltrados}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                <div className="flex flex-col flex-grow space-y-4 w-3/4 md:w-full lg:w-full xl:w-full">
                    <div className="flex flex-row justify-between items-center gap-2 mb-2">
                        <Select
                            className="flex-1 max-w-[300px] min-w-[200px] rounded-md"
                            placeholder="Especialidad"
                            selectedKeys={especialidadSeleccionada ? [especialidadSeleccionada.toString()] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0];
                                setEspecialidadSeleccionada(selected || '');
                                setCurrentPage(1); // Resetear a la primera página
                            }}
                        >
                            {especialidades && especialidades.length > 0 && especialidades.map((especialidad) => {
                                const nombreFormateado = especialidad.nombre
                                    ? especialidad.nombre.charAt(0).toUpperCase() + especialidad.nombre.slice(1).toLowerCase()
                                    : "";
                                return (
                                    <SelectItem
                                        key={especialidad.idEspecialidad}
                                        value={especialidad.idEspecialidad.toString()}
                                        textValue={nombreFormateado}
                                    >
                                        {nombreFormateado}
                                    </SelectItem>
                                );
                            })}
                        </Select>
                        
                        <Button
                            className="bg-primario text-white flex items-center flex-shrink-0"
                            onPress={() => abrirDrawer()}
                            endContent={<PlusIcon />}
                        >
                            Agregar
                        </Button>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 text-lg mt-10">
                            Cargando armarios...
                        </div>
                    ) : (
                        <VisualizadorArmario 
                            armario={armarioActual}
                            onCasilleroClick={abrirDrawer}
                            estadosCasillero={estadosCasillero}
                        />
                    )}
                </div>
            </div>

            {/* Drawer */}
            <DrawerGeneral
                titulo={isEditing ? "Editar Casillero" : "Agregar Armario"}
                size={"sm"}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                textoBotonPrimario={isEditing ? "Editar" : "Agregar"}
                onBotonPrimario={handleSubmit}
                textoBotonSecundario="Cancelar"
                onBotonSecundario={() => onOpenChange(false)}
                loadingBotonPrimario={submitting}
                disableClose={submitting}
            >
                {isEditing ? (
                    <FormEditarCasillero
                        ref={formEditarRef}
                        selectedItem={selectedCasillero}
                        setSelectedItem={setSelectedCasillero}
                        onSubmit={handleEditarCasillero}
                        estadosCasillero={estadosCasillero}
                        loading={submitting}
                    />
                ) : (
                    <FormCrearArmario
                        ref={formCrearRef}
                        selectedItem={formData}
                        setSelectedItem={setFormData}
                        onSubmit={handleCrearArmario}
                        especialidades={especialidades}
                        loading={submitting}
                    />
                )}
            </DrawerGeneral>
        </div>
    );
};

export default Armario;
