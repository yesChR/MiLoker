import React, { useState, useEffect } from "react";
import CabezeraDinamica from "../Layout/CabeceraDinamica";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import DrawerGeneral from "../DrawerGeneral";
import { PlusIcon } from "../icons/PlusIcon";
import { useDisclosure } from "@heroui/react";
import { ChevronIcon } from "../icons/ChevronIcon";
import { usePagination, PaginationItemType } from "@heroui/react";
import cn from "classnames";
import { Toast } from "../CustomAlert";
import { obtenerTodosLosArmarios, obtenerArmariosPorEspecialidad, crearArmario, editarCasillero } from "../../services/armarioService";
import { getEspecialidades } from "../../services/especialidadService";
import { obtenerEstadosCasillero } from "../../services/estadoCasilleroService";

const Armario = () => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [selectedCasillero, setSelectedCasillero] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
    const [showErrors, setShowErrors] = useState(false);
    const [armariosData, setArmariosData] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [estadosCasillero, setEstadosCasillero] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        idArmario: '',
        numFilas: '',
        numColumnas: '',
        idEspecialidad: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    // Cargar especialidades y armarios
    const cargarDatosIniciales = async () => {
        setLoading(true);
        try {
            // Cargar especialidades
            const especialidadesResult = await getEspecialidades();
            
            if (especialidadesResult?.error) {
                Toast.error("Error", especialidadesResult.message);
                setEspecialidades([]);
            } else {
                setEspecialidades(especialidadesResult || []);
            }

            // Cargar estados de casillero
            const estadosResult = await obtenerEstadosCasillero();
            
            if (estadosResult?.error) {
                Toast.error("Error", estadosResult.message);
                setEstadosCasillero([]);
            } else {
                setEstadosCasillero(estadosResult || []);
            }

            // Cargar todos los armarios
            const armariosResult = await obtenerTodosLosArmarios();
            
            if (armariosResult?.error) {
                Toast.error("Error", armariosResult.message);
                setArmariosData([]);
            } else {
                const armariosTransformados = transformarDatosArmarios(armariosResult);
                setArmariosData(armariosTransformados);
            }
        } catch (error) {
            Toast.error("Error", 'Error al cargar los datos');
            console.error('Error en cargarDatosIniciales:', error);
        } finally {
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
                estadoNombre: casillero?.estadoCasillero?.nombre || ''
            }))
        }));
    };

    // Filtrar armarios cuando cambia la especialidad seleccionada
    useEffect(() => {
        if (especialidadSeleccionada) {
            cargarArmariosPorEspecialidad(especialidadSeleccionada);
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

    const [currentPage, setCurrentPage] = useState(1);

    // Los armarios ya están filtrados por el backend, no necesitamos filtrarlos localmente
    const armariosFiltrados = armariosData;

    // Configuración de la paginación
    const { range, onNext, onPrevious, setPage } = usePagination({
        total: armariosFiltrados.length, // Total de páginas
        page: currentPage, // Página actual
        siblings: 1, // Número de páginas visibles a los lados
        onChange: (page) => setCurrentPage(page), // Actualiza la página actual
    });

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
        setShowErrors(false);
        onOpen();
    };

    // Manejar cambios en el formulario de armario
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Manejar envío del formulario
    const handleSubmit = async () => {
        if (isEditing) {
            await handleEditarCasillero();
        } else {
            await handleCrearArmario();
        }
    };

    // Crear nuevo armario
    const handleCrearArmario = async () => {
        // Validar campos requeridos
        if (!formData.idArmario || !formData.numFilas || !formData.numColumnas) {
            setShowErrors(true);
            return;
        }

        // Validar que haya una especialidad seleccionada
        if (!formData.idEspecialidad || !formData.idEspecialidad.toString().trim()) {
            setShowErrors(true);
            return;
        }

        setSubmitting(true);
        try {
            const armarioData = {
                idArmario: formData.idArmario,
                numFilas: parseInt(formData.numFilas),
                numColumnas: parseInt(formData.numColumnas),
                idEspecialidad: parseInt(formData.idEspecialidad)
            };

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
                setShowErrors(false);
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
    const handleEditarCasillero = async () => {
        setSubmitting(true);
        try {
            const casilleroData = {
                detalle: selectedCasillero.descripcion || '',
                idEstadoCasillero: selectedCasillero.estado
            };

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

    // Manejar el caso en el que no haya armarios filtrados
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
                <div className="flex flex-col items-center justify-center">
                    <div className="pagination-text">
                        <ul className="flex flex-col gap-2 items-center">
                            {range.map((page) => {
                                if (page === PaginationItemType.NEXT) {
                                    return (
                                        <li key={page} aria-label="next page" className="w-8 h-8">
                                            <button
                                                className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:scale-105"
                                                onClick={onNext}
                                            >
                                                <ChevronIcon className="rotate-180" />
                                            </button>
                                        </li>
                                    );
                                }

                                if (page === PaginationItemType.PREV) {
                                    return (
                                        <li key={page} aria-label="previous page" className="w-8 h-8">
                                            <button
                                                className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105"
                                                onClick={onPrevious}
                                            >
                                                <ChevronIcon />
                                            </button>
                                        </li>
                                    );
                                }

                                if (page === PaginationItemType.DOTS) {
                                    return (
                                        <li key={page} className="w-8 h-8 flex items-center justify-center">
                                            ...
                                        </li>
                                    );
                                }

                                return (
                                    <li key={page} aria-label={`page ${page}`} className="w-8 h-8">
                                        <button
                                            className={cn(
                                                "w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105",
                                                currentPage === page && "bg-primario text-white"
                                            )}
                                            onClick={() => setPage(page)}
                                        >
                                            {armariosFiltrados[page - 1]?.id}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

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
                    ) : armarioActual ? (
                        <div className="border border-gray-300 p-4 rounded-lg shadow-lg bg-white">
                            <div className="bg-primary text-white p-4 text-xl rounded-md text-center font-bold shadow-lg mb-4">
                                Armario {armarioActual.id}
                            </div>
                            <div
                                className={`grid grid-cols-${armarioActual.columnas} gap-3`}
                            >
                                {armarioActual.casilleros && armarioActual.casilleros.length > 0 && armarioActual.casilleros.map((casillero) => (
                                    <Button
                                        key={casillero?.id || Math.random()}
                                        className={cn(
                                            `text-white w-sm h-[70px] flex items-center justify-center text-xl rounded-md shadow-md transition-transform duration-200 hover:scale-105`,
                                            casillero?.estado === 1
                                                ? "bg-celeste hover:bg-celeste-dark"
                                                : "bg-gray-400 hover:bg-gray-600"
                                        )}
                                        onPress={() => abrirDrawer(casillero)}
                                    >
                                        {casillero?.id || 'N/A'}
                                    </Button>
                                ))}
                            </div>

                            {/* Leyenda de colores */}
                            <div className="flex justify-center items-center mt-4 space-x-4">
                                {estadosCasillero.map((estado, index) => (
                                    <div key={estado.idEstadoCasillero} className="flex items-center space-x-2">
                                        <span className={`w-4 h-4 rounded-full ${
                                            estado.idEstadoCasillero === 1 
                                                ? "bg-celeste" 
                                                : "bg-gray-400"
                                        }`}></span>
                                        <span className="text-gray-600 text-xs sm:text-sm">{estado.nombre}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-lg mt-10">
                            No hay armarios disponibles para esta especialidad.
                        </div>
                    )}
                </div>
            </div>

            {/* Drawer */}
            <DrawerGeneral
                titulo={isEditing ? "Editar Casillero" : "Agregar Armario"}
                size={"xs"}
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
                    <>
                        <Input
                            label="ID Casillero"
                            value={selectedCasillero?.id?.toString() || ''}
                            disabled
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                            isRequired
                            errorMessage="El ID del casillero es obligatorio"
                        />
                        <Select
                            label="Estado"
                            placeholder="Seleccione..."
                            variant={"bordered"}
                            className="focus:border-primario"
                            color="primary"
                            selectedKeys={selectedCasillero?.estado ? [selectedCasillero.estado.toString()] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0];
                                setSelectedCasillero(prev => ({ 
                                    ...prev, 
                                    estado: selected ? parseInt(selected) : 1 
                                }));
                            }}
                            isDisabled={submitting}
                            isRequired
                            errorMessage="El estado es obligatorio"
                        >
                            {estadosCasillero.map((estado) => (
                                <SelectItem 
                                    key={estado.idEstadoCasillero} 
                                    value={estado.idEstadoCasillero.toString()}
                                >
                                    {estado.nombre}
                                </SelectItem>
                            ))}
                        </Select>
                        <div className="relative w-full">
                            <textarea
                                placeholder="Escriba aquí..."
                                className="border-2 rounded-2xl p-2 pt-7 pl-3 w-full h-32 resize-y placeholder:text-sm text-sm text-gray-800 focus:border-blue-500 focus:outline-none peer border-gray-300"
                                value={selectedCasillero?.descripcion || ''}
                                onChange={e => setSelectedCasillero(prev => ({ ...prev, descripcion: e.target.value }))}
                                disabled={submitting}
                            />
                            <label className="absolute left-3 top-2 text-base pointer-events-none transition-all duration-200 text-xs top-2 text-primario">
                                Detalle
                            </label>
                        </div>
                    </>
                ) : (
                    <>
                        <Input
                            label="ID Armario"
                            placeholder="A"
                            variant={"bordered"}
                            color="primary"
                            value={formData.idArmario}
                            onChange={(e) => handleFormChange('idArmario', e.target.value)}
                            className={showErrors && !formData.idArmario ? 'border-red-500' : ''}
                            isDisabled={submitting}
                            isRequired
                            errorMessage="El ID del armario es obligatorio"
                        />
                        {showErrors && !formData.idArmario && (
                            <div className="text-danger text-xs mt-1">El ID del armario es obligatorio</div>
                        )}
                        
                        <Select
                            isRequired
                            label="Especialidad"
                            placeholder="Seleccione especialidad"
                            selectedKeys={formData.idEspecialidad ? [formData.idEspecialidad.toString()] : []}
                            onSelectionChange={(keys) => {
                                const selectedValue = Array.from(keys)[0];
                                handleFormChange('idEspecialidad', selectedValue || '');
                            }}
                            variant="bordered"
                            className="focus:border-primario"
                            color="primary"
                            isInvalid={showErrors && (!formData.idEspecialidad || !formData.idEspecialidad.toString().trim())}
                            isDisabled={submitting}
                            
                        >
                            {especialidades.map((esp) => {
                                const nombreFormateado = esp.nombre
                                    ? esp.nombre.charAt(0).toUpperCase() + esp.nombre.slice(1).toLowerCase()
                                    : "";
                                return (
                                    <SelectItem
                                        key={esp.idEspecialidad}
                                        value={esp.idEspecialidad.toString()}
                                        textValue={nombreFormateado}
                                    >
                                        {nombreFormateado}
                                    </SelectItem>
                                );
                            })}
                        </Select>
                        {showErrors && (!formData.idEspecialidad || !formData.idEspecialidad.toString().trim()) && (
                            <div className="text-danger text-xs mt-1">La especialidad es obligatoria</div>
                        )}
                        
                        <Input
                            type="number"
                            label="Filas"
                            placeholder="4"
                            variant={"bordered"}
                            className={`focus:border-primario ${showErrors && !formData.numFilas ? 'border-red-500' : ''}`}
                            color="primary"
                            value={formData.numFilas}
                            onChange={(e) => handleFormChange('numFilas', e.target.value)}
                            isDisabled={submitting}
                            isRequired
                        />
                        {showErrors && !formData.numFilas && (
                            <div className="text-danger text-xs mt-1">El número de filas es obligatorio</div>
                        )}
                        <Input
                            type="number"
                            label="Columnas"
                            placeholder="3"
                            variant={"bordered"}
                            className={`focus:border-primario ${showErrors && !formData.numColumnas ? 'border-red-500' : ''}`}
                            color="primary"
                            value={formData.numColumnas}
                            onChange={(e) => handleFormChange('numColumnas', e.target.value)}
                            isDisabled={submitting}
                            isRequired
                        />
                        {showErrors && !formData.numColumnas && (
                            <div className="text-danger text-xs mt-1">El número de columnas es obligatorio</div>
                        )}
                    </>
                )}
            </DrawerGeneral>
        </div>
    );
};

export default Armario;